import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, currentPrice, category, seasonality, demandHistory } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    // Get market data from database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { data: marketData } = await supabaseClient
      .from('products')
      .select('price_per_kg, market_average, category')
      .eq('category', category)
      .limit(20);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are an AI pricing strategist for agricultural products. Analyze market data and provide intelligent pricing recommendations.

Consider these factors:
- Current market prices and trends
- Seasonal variations
- Demand history and patterns
- Competition analysis
- Supply chain costs
- Profit optimization

Respond with a JSON object containing:
- recommendedPrice: suggested price per kg
- priceRange: {min, max} price range
- confidence: confidence score (0-1)
- reasoning: explanation for the recommendation
- marketPosition: competitive position (premium/competitive/value)
- demandForecast: predicted demand trend
- actions: array of recommended actions`
          },
          {
            role: 'user',
            content: `Current Price: $${currentPrice}/kg
Category: ${category}
Market Data: ${JSON.stringify(marketData)}
Seasonality: ${seasonality}
Recent Demand: ${JSON.stringify(demandHistory)}`
          }
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);

    // Store pricing recommendation in analytics
    await supabaseClient.from('analytics').insert({
      event_type: 'smart_pricing_recommendation',
      event_data: {
        product_id: productId,
        current_price: currentPrice,
        recommended_price: aiResponse.recommendedPrice,
        confidence: aiResponse.confidence
      },
      metadata: {
        category,
        market_data_points: marketData?.length || 0
      }
    });

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in smart pricing:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate pricing recommendation' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
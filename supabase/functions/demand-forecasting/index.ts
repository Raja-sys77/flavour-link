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
    const { productId, category, timeframe = '30', includeSeasonality = true } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get historical order data
    const { data: orderHistory } = await supabaseClient
      .from('orders')
      .select(`
        created_at,
        status,
        total_price,
        order_items (
          quantity,
          price_per_kg,
          product_id
        )
      `)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    // Get product-specific data
    const { data: productData } = await supabaseClient
      .from('products')
      .select('name, category, stock_available, price_per_kg')
      .eq('id', productId)
      .single();

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
            content: `You are an AI demand forecasting expert for agricultural products. Analyze historical data and market patterns to predict future demand.

Consider these factors:
- Historical order patterns
- Seasonal variations
- Market trends
- Product lifecycle
- Economic indicators
- Supply chain factors

Respond with a JSON object containing:
- forecast: array of predicted demand for next ${timeframe} days
- confidence: overall confidence score (0-1)
- trendDirection: up/down/stable
- seasonalFactors: identified seasonal patterns
- riskFactors: potential risks to forecast accuracy
- recommendations: inventory and procurement suggestions
- keyInsights: important findings from the analysis`
          },
          {
            role: 'user',
            content: `Product: ${productData?.name}
Category: ${category}
Historical Orders: ${JSON.stringify(orderHistory?.slice(-50))}
Current Stock: ${productData?.stock_available}
Timeframe: ${timeframe} days
Include Seasonality: ${includeSeasonality}`
          }
        ],
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);

    // Store forecast in analytics
    await supabaseClient.from('analytics').insert({
      event_type: 'demand_forecast_generated',
      event_data: {
        product_id: productId,
        forecast_period: timeframe,
        confidence: aiResponse.confidence,
        trend: aiResponse.trendDirection
      },
      metadata: {
        category,
        historical_data_points: orderHistory?.length || 0,
        seasonality_included: includeSeasonality
      }
    });

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in demand forecasting:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate demand forecast' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
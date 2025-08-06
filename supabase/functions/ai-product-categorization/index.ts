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
    const { productName, description, existingCategories } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
            content: `You are an AI expert in product categorization for agricultural and food products. Analyze product information and suggest appropriate categories and tags.

Available categories: ${existingCategories?.join(', ') || 'Grains, Vegetables, Fruits, Dairy, Meat, Spices, Beverages, Oils, Pulses, Nuts'}

Respond with a JSON object containing:
- category: primary category
- subcategory: more specific subcategory
- tags: array of relevant tags (max 5)
- confidence: confidence score (0-1)
- suggestions: array of improvement suggestions for better categorization`
          },
          {
            role: 'user',
            content: `Product Name: ${productName}\nDescription: ${description}`
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify(aiResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI categorization:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to categorize product',
      fallback: {
        category: 'General',
        subcategory: 'Unclassified',
        tags: ['new-product'],
        confidence: 0.1,
        suggestions: ['Add more detailed product description for better categorization']
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
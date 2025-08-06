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
    const { message, userId, context = '', conversationHistory = [] } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get user profile and recent orders for context
    const { data: userProfile } = await supabaseClient
      .from('profiles')
      .select('full_name, role')
      .eq('user_id', userId)
      .single();

    const { data: recentOrders } = await supabaseClient
      .from('orders')
      .select(`
        id,
        status,
        created_at,
        total_price,
        order_items (
          quantity,
          products (name, category)
        )
      `)
      .eq('vendor_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: products } = await supabaseClient
      .from('products')
      .select('name, category, price_per_kg, stock_available')
      .gt('stock_available', 0)
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
            content: `You are VendorAI, an intelligent assistant for Vendora, an agricultural marketplace platform. You help vendors and suppliers with:

- Product recommendations and availability
- Order assistance and tracking
- Pricing information and market insights
- Platform navigation and features
- Business advice and optimization tips

User Context:
- Name: ${userProfile?.full_name || 'User'}
- Role: ${userProfile?.role || 'vendor'}
- Recent Orders: ${JSON.stringify(recentOrders)}

Available Products (sample): ${JSON.stringify(products?.slice(0, 10))}

Guidelines:
- Be helpful, professional, and knowledgeable
- Provide specific product information when available
- Suggest alternatives if requested items aren't available
- Keep responses concise but informative
- Use the user's name when appropriate
- If you can't help with something, explain what they can do instead

Respond in a conversational, helpful tone. Always try to be actionable in your responses.`
          },
          ...conversationHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user',
            content: `${context ? `Context: ${context}\n\n` : ''}${message}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Log conversation for improvement
    await supabaseClient.from('analytics').insert({
      event_type: 'chatbot_interaction',
      event_data: {
        user_message: message,
        ai_response: aiResponse,
        context,
        user_id: userId
      },
      metadata: {
        response_tokens: data.usage?.completion_tokens,
        conversation_length: conversationHistory.length
      }
    });

    return new Response(JSON.stringify({ 
      response: aiResponse,
      suggestions: [
        "Show me available products",
        "Track my recent orders",
        "What are today's best deals?",
        "Help me find suppliers"
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI chatbot:', error);
    return new Response(JSON.stringify({ 
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again or contact support if the issue persists.",
      error: 'Chatbot service unavailable'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
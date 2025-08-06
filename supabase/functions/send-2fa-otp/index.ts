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
    const { phoneNumber, userId } = await req.json();
    
    if (!phoneNumber || !userId) {
      throw new Error('Phone number and user ID are required');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store OTP in database
    const { error: insertError } = await supabaseClient
      .from('two_factor_auth')
      .upsert({
        user_id: userId,
        phone_number: phoneNumber,
        otp_code: otp,
        expires_at: expiryTime.toISOString(),
        verified: false,
        attempts: 0
      });

    if (insertError) throw insertError;

    // TODO: Send SMS using your preferred SMS provider (Twilio, AWS SNS, etc.)
    // For demo purposes, we'll just log the OTP
    console.log(`SMS OTP for ${phoneNumber}: ${otp}`);

    // In production, you would use a service like Twilio:
    /*
    const twilioSid = Deno.env.get('TWILIO_SID');
    const twilioToken = Deno.env.get('TWILIO_TOKEN');
    const twilioNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (twilioSid && twilioToken && twilioNumber) {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioNumber,
          To: phoneNumber,
          Body: `Your Vendora verification code is: ${otp}. Valid for 10 minutes.`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }
    }
    */

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'OTP sent successfully',
      // Remove this in production - only for testing
      debug_otp: otp 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send OTP',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
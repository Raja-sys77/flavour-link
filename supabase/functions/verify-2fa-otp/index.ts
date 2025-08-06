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
    const { phoneNumber, otp, userId } = await req.json();
    
    if (!phoneNumber || !otp || !userId) {
      throw new Error('Phone number, OTP, and user ID are required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get stored OTP data
    const { data: otpData, error: fetchError } = await supabaseClient
      .from('two_factor_auth')
      .select('*')
      .eq('user_id', userId)
      .eq('phone_number', phoneNumber)
      .eq('verified', false)
      .single();

    if (fetchError || !otpData) {
      throw new Error('Invalid or expired OTP');
    }

    // Check if OTP has expired
    const now = new Date();
    const expiryTime = new Date(otpData.expires_at);
    
    if (now > expiryTime) {
      throw new Error('OTP has expired');
    }

    // Check attempt limit
    if (otpData.attempts >= 3) {
      throw new Error('Too many failed attempts. Please request a new OTP.');
    }

    // Verify OTP
    if (otpData.otp_code !== otp) {
      // Increment attempts
      await supabaseClient
        .from('two_factor_auth')
        .update({ attempts: otpData.attempts + 1 })
        .eq('id', otpData.id);

      throw new Error('Invalid OTP');
    }

    // Mark as verified
    const { error: updateError } = await supabaseClient
      .from('two_factor_auth')
      .update({ 
        verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', otpData.id);

    if (updateError) throw updateError;

    // Update user profile to mark 2FA as enabled
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ two_factor_enabled: true })
      .eq('user_id', userId);

    if (profileError) throw profileError;

    // Log security event
    await supabaseClient.from('security_logs').insert({
      user_id: userId,
      event_type: '2fa_enabled',
      event_data: {
        phone_number: phoneNumber,
        verification_method: 'sms'
      },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Two-factor authentication enabled successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to verify OTP',
      message: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
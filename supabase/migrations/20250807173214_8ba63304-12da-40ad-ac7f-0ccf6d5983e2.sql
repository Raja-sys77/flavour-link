-- Create two_factor_auth table for 2FA functionality
CREATE TABLE IF NOT EXISTS public.two_factor_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT,
  email TEXT,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.security_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  location_data JSONB,
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_tokens table for secure session management
CREATE TABLE IF NOT EXISTS public.session_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  device_info JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add two_factor_enabled column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;

-- Add security-related columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for two_factor_auth
CREATE POLICY "Users can manage their own 2FA settings" 
ON public.two_factor_auth 
FOR ALL 
USING (auth.uid() = user_id);

-- Create RLS policies for security_logs
CREATE POLICY "Users can view their own security logs" 
ON public.security_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create security logs" 
ON public.security_logs 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for session_tokens
CREATE POLICY "Users can view their own session tokens" 
ON public.session_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage session tokens" 
ON public.session_tokens 
FOR ALL 
USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON public.two_factor_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_expires_at ON public.two_factor_auth(expires_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_session_tokens_user_id ON public.session_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_session_tokens_token_hash ON public.session_tokens(token_hash);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for two_factor_auth updated_at
CREATE TRIGGER update_two_factor_auth_updated_at
    BEFORE UPDATE ON public.two_factor_auth
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM public.two_factor_auth 
    WHERE expires_at < now() AND verified = false;
END;
$$ LANGUAGE plpgsql;
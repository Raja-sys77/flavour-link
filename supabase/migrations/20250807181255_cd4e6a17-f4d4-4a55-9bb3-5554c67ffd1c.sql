-- Fix function search path issues by setting explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM public.two_factor_auth 
    WHERE expires_at < now() AND verified = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
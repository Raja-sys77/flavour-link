-- Fix the function search path security issue
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  year_part TEXT;
  random_part TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::TEXT;
  random_part := LPAD(floor(random() * 1000000)::TEXT, 6, '0');
  RETURN 'VEN-' || year_part || '-' || random_part;
END;
$$;
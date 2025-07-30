-- Fix function search path security warning
ALTER FUNCTION create_order_notification() SET search_path = public;
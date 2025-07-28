-- Add language preference to profiles table
ALTER TABLE public.profiles ADD COLUMN language_preference TEXT DEFAULT 'en';

-- Add delivery fields to orders table
ALTER TABLE public.orders ADD COLUMN delivery_date DATE;
ALTER TABLE public.orders ADD COLUMN preferred_time_slot TEXT CHECK (preferred_time_slot IN ('morning', 'afternoon', 'evening'));
ALTER TABLE public.orders ADD COLUMN delivery_instructions TEXT;

-- Create shipments table for tracking
CREATE TABLE public.shipments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tracking_number TEXT NOT NULL UNIQUE,
  current_location TEXT NOT NULL DEFAULT 'Order Confirmed',
  status TEXT NOT NULL DEFAULT 'order_confirmed' CHECK (status IN ('order_confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered')),
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on shipments table
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Create policies for shipments table
CREATE POLICY "Users can view shipments for own orders" 
ON public.shipments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = shipments.order_id 
  AND (orders.vendor_id = auth.uid() OR orders.supplier_id = auth.uid())
));

CREATE POLICY "Suppliers can update shipments for own orders" 
ON public.shipments 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = shipments.order_id 
  AND orders.supplier_id = auth.uid()
));

CREATE POLICY "Suppliers can insert shipments for own orders" 
ON public.shipments 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = shipments.order_id 
  AND orders.supplier_id = auth.uid()
));

-- Create trigger for automatic timestamp updates on shipments
CREATE TRIGGER update_shipments_updated_at
BEFORE UPDATE ON public.shipments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate tracking numbers
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  random_part TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::TEXT;
  random_part := LPAD(floor(random() * 1000000)::TEXT, 6, '0');
  RETURN 'VEN-' || year_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;
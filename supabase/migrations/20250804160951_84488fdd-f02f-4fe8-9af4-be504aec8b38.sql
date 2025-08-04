-- Create payment methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('upi', 'card', 'netbanking', 'wallet')),
  provider TEXT NOT NULL,
  account_details JSONB NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_terms TEXT NOT NULL DEFAULT 'NET_30',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL,
  payment_method_id UUID,
  amount NUMERIC(10,2) NOT NULL,
  transaction_id TEXT,
  gateway_response JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create credit limits table
CREATE TABLE public.credit_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL UNIQUE,
  credit_limit NUMERIC(10,2) NOT NULL DEFAULT 0,
  used_credit NUMERIC(10,2) NOT NULL DEFAULT 0,
  available_credit NUMERIC(10,2) GENERATED ALWAYS AS (credit_limit - used_credit) STORED,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial transactions table
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('debit', 'credit')),
  category TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tax configurations table
CREATE TABLE public.tax_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tax_type TEXT NOT NULL CHECK (tax_type IN ('GST', 'CGST', 'SGST', 'IGST')),
  rate NUMERIC(5,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_methods
CREATE POLICY "Users can manage their own payment methods" ON public.payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for invoices
CREATE POLICY "Users can view invoices related to their orders" ON public.invoices
  FOR SELECT USING (auth.uid() = vendor_id OR auth.uid() = supplier_id);

CREATE POLICY "Suppliers can create invoices for their orders" ON public.invoices
  FOR INSERT WITH CHECK (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can update their own invoices" ON public.invoices
  FOR UPDATE USING (auth.uid() = supplier_id);

-- RLS Policies for payments
CREATE POLICY "Users can view payments for their invoices" ON public.payments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = payments.invoice_id 
    AND (invoices.vendor_id = auth.uid() OR invoices.supplier_id = auth.uid())
  ));

CREATE POLICY "Vendors can create payments for their invoices" ON public.payments
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.invoices 
    WHERE invoices.id = payments.invoice_id 
    AND invoices.vendor_id = auth.uid()
  ));

-- RLS Policies for credit_limits
CREATE POLICY "Vendors can view their own credit limits" ON public.credit_limits
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "System can manage credit limits" ON public.credit_limits
  FOR ALL USING (true);

-- RLS Policies for financial_transactions
CREATE POLICY "Users can view their own transactions" ON public.financial_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" ON public.financial_transactions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for tax_configurations
CREATE POLICY "Users can manage their own tax configurations" ON public.tax_configurations
  FOR ALL USING (auth.uid() = user_id);

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  invoice_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-' || year_part || '-(\d+)') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || year_part || '-%';
  
  invoice_num := 'INV-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_financial_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_financial_updated_at();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_financial_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_financial_updated_at();

-- Trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := public.generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number_trigger
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_invoice_number();
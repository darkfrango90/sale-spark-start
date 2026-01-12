-- Create company_settings table
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  cnpj TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Disable RLS for company settings (single company, accessed by all users)
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read company settings
CREATE POLICY "Anyone can read company settings" 
ON public.company_settings 
FOR SELECT 
USING (true);

-- Allow all authenticated users to insert/update company settings
CREATE POLICY "Anyone can insert company settings" 
ON public.company_settings 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update company settings" 
ON public.company_settings 
FOR UPDATE 
USING (true);

-- Create sales_deletions table
CREATE TABLE public.sales_deletions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID,
  sale_number TEXT NOT NULL,
  sale_type TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  reason TEXT NOT NULL,
  deleted_by TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Disable RLS for sales_deletions
ALTER TABLE public.sales_deletions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read and insert deletions
CREATE POLICY "Anyone can read sales deletions" 
ON public.sales_deletions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert sales deletions" 
ON public.sales_deletions 
FOR INSERT 
WITH CHECK (true);

-- Create trigger for updating company_settings updated_at
CREATE TRIGGER update_company_settings_updated_at
BEFORE UPDATE ON public.company_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
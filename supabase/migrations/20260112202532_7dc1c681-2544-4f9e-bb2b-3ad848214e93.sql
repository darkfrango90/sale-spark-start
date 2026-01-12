-- Add customer address and phone columns to sales table
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_address text;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_neighborhood text;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_city text;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_state text;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS customer_zip_code text;
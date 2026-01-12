-- Add missing address columns to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS trade_name text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS rg_ie text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS cellphone text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS zip_code text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS street text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS number text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS complement text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS neighborhood text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS birth_date text;
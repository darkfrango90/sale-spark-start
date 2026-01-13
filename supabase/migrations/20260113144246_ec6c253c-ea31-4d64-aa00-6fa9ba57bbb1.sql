-- Add payment_type column to sales table
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS payment_type TEXT;
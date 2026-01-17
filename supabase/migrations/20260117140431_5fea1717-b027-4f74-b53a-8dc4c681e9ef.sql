-- Add barter columns to customers table
ALTER TABLE public.customers
ADD COLUMN has_barter boolean DEFAULT false,
ADD COLUMN barter_credit numeric DEFAULT 0,
ADD COLUMN barter_limit numeric DEFAULT 0,
ADD COLUMN barter_notes text;
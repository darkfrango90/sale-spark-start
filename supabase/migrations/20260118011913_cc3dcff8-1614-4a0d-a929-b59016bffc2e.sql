-- Create order_loadings table to track loaded orders
CREATE TABLE public.order_loadings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  sale_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  operator_id TEXT NOT NULL,
  operator_name TEXT NOT NULL,
  loaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.order_loadings ENABLE ROW LEVEL SECURITY;

-- Create policies for order_loadings
CREATE POLICY "Anyone can view order loadings" 
ON public.order_loadings 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert order loadings" 
ON public.order_loadings 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_order_loadings_sale_id ON public.order_loadings(sale_id);
CREATE INDEX idx_order_loadings_loaded_at ON public.order_loadings(loaded_at);
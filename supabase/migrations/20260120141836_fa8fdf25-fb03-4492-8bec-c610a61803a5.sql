-- Create driver_expenses table
CREATE TABLE public.driver_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  vehicle_plate TEXT NOT NULL,
  location_equipment TEXT NOT NULL,
  description TEXT,
  receipt_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.driver_expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for all access (matching existing driver tables pattern)
CREATE POLICY "Allow all access to driver_expenses"
ON public.driver_expenses
FOR ALL
USING (true)
WITH CHECK (true);

-- Create storage bucket for expense receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-receipts', 'expense-receipts', true);

-- Storage policies for expense receipts
CREATE POLICY "Anyone can view expense receipts"
ON storage.objects
FOR SELECT
USING (bucket_id = 'expense-receipts');

CREATE POLICY "Anyone can upload expense receipts"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'expense-receipts');

CREATE POLICY "Anyone can delete expense receipts"
ON storage.objects
FOR DELETE
USING (bucket_id = 'expense-receipts');
-- Add new columns to order_loadings table for ticket verification
ALTER TABLE public.order_loadings 
ADD COLUMN IF NOT EXISTS ticket_image_url text,
ADD COLUMN IF NOT EXISTS ticket_weight_kg numeric,
ADD COLUMN IF NOT EXISTS expected_weight_kg numeric,
ADD COLUMN IF NOT EXISTS weight_difference_percent numeric,
ADD COLUMN IF NOT EXISTS weight_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_response jsonb;

-- Create storage bucket for ticket images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-images', 'ticket-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policy for authenticated users to upload ticket images
CREATE POLICY "Authenticated users can upload ticket images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-images');

-- Create RLS policy for public access to view ticket images
CREATE POLICY "Public can view ticket images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ticket-images');

-- Create RLS policy for authenticated users to delete their ticket images
CREATE POLICY "Authenticated users can delete ticket images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ticket-images');
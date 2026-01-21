-- Adicionar coluna para URL do comprovante na tabela fuel_entries
ALTER TABLE public.fuel_entries 
ADD COLUMN receipt_url TEXT;

-- Criar bucket para comprovantes de abastecimento
INSERT INTO storage.buckets (id, name, public)
VALUES ('fuel-receipts', 'fuel-receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Política para visualização pública
CREATE POLICY "Fuel receipts are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'fuel-receipts');

-- Política para upload de comprovantes
CREATE POLICY "Anyone can upload fuel receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'fuel-receipts');

-- Política para deletar comprovantes
CREATE POLICY "Anyone can delete fuel receipts"
ON storage.objects FOR DELETE
USING (bucket_id = 'fuel-receipts');
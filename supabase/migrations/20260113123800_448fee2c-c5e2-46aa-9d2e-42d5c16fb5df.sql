-- Criar tabela de contas de recebimento
CREATE TABLE public.receiving_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.receiving_accounts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para receiving_accounts
CREATE POLICY "Allow authenticated read receiving_accounts"
ON public.receiving_accounts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert receiving_accounts"
ON public.receiving_accounts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update receiving_accounts"
ON public.receiving_accounts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete receiving_accounts"
ON public.receiving_accounts FOR DELETE
TO authenticated
USING (true);

-- Criar tabela de contas a receber
CREATE TABLE public.accounts_receivable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  original_amount NUMERIC NOT NULL,
  interest_penalty NUMERIC DEFAULT 0,
  final_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pendente',
  receiving_account_id UUID REFERENCES public.receiving_accounts(id),
  receipt_date DATE,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para accounts_receivable
CREATE POLICY "Allow authenticated read accounts_receivable"
ON public.accounts_receivable FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert accounts_receivable"
ON public.accounts_receivable FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update accounts_receivable"
ON public.accounts_receivable FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated delete accounts_receivable"
ON public.accounts_receivable FOR DELETE
TO authenticated
USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_accounts_receivable_updated_at
BEFORE UPDATE ON public.accounts_receivable
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket para comprovantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true);

-- Políticas de storage para comprovantes
CREATE POLICY "Allow authenticated uploads receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow public read receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'receipts');

CREATE POLICY "Allow authenticated delete receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'receipts');

-- Habilitar realtime para accounts_receivable
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts_receivable;
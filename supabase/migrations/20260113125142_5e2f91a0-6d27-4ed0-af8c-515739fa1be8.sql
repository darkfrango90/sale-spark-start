-- Fix RLS policies for receiving_accounts (remove authenticated, use public)
DROP POLICY IF EXISTS "Allow authenticated read receiving_accounts" ON public.receiving_accounts;
DROP POLICY IF EXISTS "Allow authenticated insert receiving_accounts" ON public.receiving_accounts;
DROP POLICY IF EXISTS "Allow authenticated update receiving_accounts" ON public.receiving_accounts;
DROP POLICY IF EXISTS "Allow authenticated delete receiving_accounts" ON public.receiving_accounts;

CREATE POLICY "Allow all access to receiving_accounts"
ON public.receiving_accounts FOR ALL
USING (true)
WITH CHECK (true);

-- Fix RLS policies for accounts_receivable (remove authenticated, use public)
DROP POLICY IF EXISTS "Allow authenticated read accounts_receivable" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Allow authenticated insert accounts_receivable" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Allow authenticated update accounts_receivable" ON public.accounts_receivable;
DROP POLICY IF EXISTS "Allow authenticated delete accounts_receivable" ON public.accounts_receivable;

CREATE POLICY "Allow all access to accounts_receivable"
ON public.accounts_receivable FOR ALL
USING (true)
WITH CHECK (true);

-- Fix storage policies for receipts bucket
DROP POLICY IF EXISTS "Allow authenticated uploads receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete receipts" ON storage.objects;

CREATE POLICY "Allow all uploads to receipts bucket"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow public read from receipts bucket"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'receipts');

CREATE POLICY "Allow all delete from receipts bucket"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'receipts');
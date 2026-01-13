-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  trade_name TEXT,
  type TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  rg_ie TEXT,
  phone TEXT,
  cellphone TEXT,
  email TEXT,
  zip_code TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  birth_date TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create policy for suppliers
CREATE POLICY "Allow all access to suppliers" ON public.suppliers FOR ALL TO public USING (true) WITH CHECK (true);

-- Create accounts_payable table
CREATE TABLE public.accounts_payable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  supplier_code TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  competence_date DATE NOT NULL,
  payment_type TEXT NOT NULL,
  invoice_number TEXT,
  original_amount NUMERIC NOT NULL,
  interest_penalty NUMERIC DEFAULT 0,
  final_amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  installment_number INTEGER DEFAULT 1,
  total_installments INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pendente',
  payment_date DATE,
  paying_account_id UUID REFERENCES public.receiving_accounts(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for accounts_payable
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;

-- Create policy for accounts_payable
CREATE POLICY "Allow all access to accounts_payable" ON public.accounts_payable FOR ALL TO public USING (true) WITH CHECK (true);
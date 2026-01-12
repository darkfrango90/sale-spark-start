-- Tabela de Clientes
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fisica', 'juridica')),
  cpf_cnpj TEXT NOT NULL UNIQUE,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Produtos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit TEXT NOT NULL DEFAULT 'UN',
  density NUMERIC,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  sale_price NUMERIC NOT NULL DEFAULT 0,
  stock NUMERIC NOT NULL DEFAULT 0,
  min_stock NUMERIC NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Condições de Pagamento
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Vendas/Orçamentos
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('pedido', 'orcamento')),
  number TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  customer_code TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_cpf_cnpj TEXT NOT NULL,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  payment_method_name TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  total_weight NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'finalizado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de Itens da Venda
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  density NUMERIC,
  weight NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir condições de pagamento padrão
INSERT INTO public.payment_methods (name, active) VALUES 
  ('À Vista', true),
  ('Pix', true),
  ('Cartão de Crédito', true),
  ('Cartão de Débito', true),
  ('Boleto', true),
  ('30 dias', true),
  ('30/60 dias', true),
  ('30/60/90 dias', true);

-- Habilitar RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (sem autenticação por enquanto - para permitir acesso livre)
CREATE POLICY "Allow all access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to payment_methods" ON public.payment_methods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sale_items" ON public.sale_items FOR ALL USING (true) WITH CHECK (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

# Guia Completo: Criar Novo Projeto com Supabase Externo

## Resumo

Este guia contém tudo que você precisa para criar um **novo projeto Lovable** conectado a um **Supabase externo** (sua própria conta), replicando todas as funcionalidades do projeto atual.

---

## Passo 1: Criar Conta no Supabase

1. Acesse **supabase.com** e crie uma conta gratuita
2. Crie um novo projeto (anote a senha do banco de dados)
3. Aguarde o projeto ser provisionado (~2 minutos)
4. Copie as credenciais:
   - **Project URL**: `https://[seu-projeto].supabase.co`
   - **Anon Key**: Na aba Settings → API

---

## Passo 2: Criar Novo Projeto Lovable

1. Acesse **lovable.dev** e crie um **NOVO PROJETO**
2. **IMPORTANTE**: NÃO ative o Lovable Cloud
3. Conecte seu Supabase externo usando o conector disponível

---

## Passo 3: Executar Scripts SQL

No **SQL Editor** do Supabase Dashboard, execute os scripts abaixo **NA ORDEM**:

### Script 1: Estrutura Base (Clientes, Produtos, Vendas)

```sql
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela de Clientes
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  trade_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('fisica', 'juridica')),
  cpf_cnpj TEXT NOT NULL UNIQUE,
  rg_ie TEXT,
  phone TEXT,
  cellphone TEXT,
  email TEXT,
  address TEXT,
  zip_code TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  birth_date TEXT,
  notes TEXT,
  has_barter BOOLEAN DEFAULT false,
  barter_credit NUMERIC DEFAULT 0,
  barter_limit NUMERIC DEFAULT 0,
  barter_notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de Condições de Pagamento
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  customer_phone TEXT,
  customer_address TEXT,
  customer_neighborhood TEXT,
  customer_city TEXT,
  customer_state TEXT,
  customer_zip_code TEXT,
  payment_method_id UUID REFERENCES public.payment_methods(id),
  payment_method_name TEXT,
  payment_type TEXT,
  seller_name TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  total_weight NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'finalizado', 'cancelado', 'excluido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dados iniciais de pagamento
INSERT INTO public.payment_methods (name, active) VALUES 
  ('À Vista', true),
  ('Pix', true),
  ('Cartão de Crédito', true),
  ('Cartão de Débito', true),
  ('Boleto', true),
  ('30 dias', true),
  ('30/60 dias', true),
  ('30/60/90 dias', true);

-- Triggers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### Script 2: Empresa, Fornecedores e Financeiro

```sql
-- Configurações da Empresa
CREATE TABLE public.company_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  cnpj TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exclusões de Vendas
CREATE TABLE public.sales_deletions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID,
  sale_number TEXT NOT NULL,
  sale_type TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  reason TEXT NOT NULL,
  deleted_by TEXT,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fornecedores
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

-- Contas de Recebimento
CREATE TABLE public.receiving_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contas a Receber
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
  confirmed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contas a Pagar
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

-- Triggers
CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON public.company_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_receivable_updated_at
  BEFORE UPDATE ON public.accounts_receivable
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### Script 3: Veículos e Operação

```sql
-- Veículos
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  plate TEXT,
  type TEXT NOT NULL CHECK (type IN ('caminhao', 'carro', 'maquinario')),
  fuel_type TEXT NOT NULL DEFAULT 'diesel' CHECK (fuel_type IN ('gasolina', 'diesel', 'etanol')),
  tank_capacity NUMERIC,
  uses_odometer BOOLEAN NOT NULL DEFAULT true,
  brand TEXT,
  model TEXT,
  year INTEGER,
  year_model INTEGER,
  current_km NUMERIC DEFAULT 0,
  renavam_serial TEXT,
  color TEXT,
  ownership TEXT DEFAULT 'proprio',
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Abastecimentos
CREATE TABLE public.fuel_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  odometer_value NUMERIC NOT NULL,
  liters NUMERIC NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('gasolina', 'diesel', 'etanol')),
  price_per_liter NUMERIC,
  total_cost NUMERIC,
  operator_name TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Carregamentos de Pedidos
CREATE TABLE public.order_loadings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  sale_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  operator_id TEXT NOT NULL,
  operator_name TEXT NOT NULL,
  ticket_image_url TEXT,
  ticket_weight_kg NUMERIC,
  expected_weight_kg NUMERIC,
  weight_difference_percent NUMERIC,
  weight_verified BOOLEAN DEFAULT false,
  ai_response JSONB,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX idx_fuel_entries_vehicle_id ON public.fuel_entries(vehicle_id);
CREATE INDEX idx_fuel_entries_date ON public.fuel_entries(date DESC);
CREATE INDEX idx_vehicles_active ON public.vehicles(active) WHERE active = true;
CREATE INDEX idx_order_loadings_sale_id ON public.order_loadings(sale_id);
CREATE INDEX idx_order_loadings_loaded_at ON public.order_loadings(loaded_at);
```

### Script 4: Motorista

```sql
-- Partes Diárias
CREATE TABLE public.daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  order_number TEXT NOT NULL,
  km_initial NUMERIC NOT NULL,
  km_final NUMERIC NOT NULL,
  freight_value NUMERIC NOT NULL DEFAULT 0,
  observation TEXT,
  signature TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Checklists de Segurança (Motoristas)
CREATE TABLE public.safety_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  agua_radiador TEXT NOT NULL DEFAULT 'não se aplica',
  oleo_motor TEXT NOT NULL DEFAULT 'não se aplica',
  oleo_hidraulico TEXT NOT NULL DEFAULT 'não se aplica',
  fluido_freio TEXT NOT NULL DEFAULT 'não se aplica',
  pneus_calibrados TEXT NOT NULL DEFAULT 'não se aplica',
  pneus_estado TEXT NOT NULL DEFAULT 'não se aplica',
  farois_funcionando TEXT NOT NULL DEFAULT 'não se aplica',
  lanternas_funcionando TEXT NOT NULL DEFAULT 'não se aplica',
  setas_funcionando TEXT NOT NULL DEFAULT 'não se aplica',
  freio_servico TEXT NOT NULL DEFAULT 'não se aplica',
  freio_estacionamento TEXT NOT NULL DEFAULT 'não se aplica',
  limpador_parabrisa TEXT NOT NULL DEFAULT 'não se aplica',
  buzina TEXT NOT NULL DEFAULT 'não se aplica',
  espelhos_retrovisores TEXT NOT NULL DEFAULT 'não se aplica',
  cinto_seguranca TEXT NOT NULL DEFAULT 'não se aplica',
  extintor_incendio TEXT NOT NULL DEFAULT 'não se aplica',
  triangulo_sinalizacao TEXT NOT NULL DEFAULT 'não se aplica',
  macaco_chave_roda TEXT NOT NULL DEFAULT 'não se aplica',
  documentos_veiculo TEXT NOT NULL DEFAULT 'não se aplica',
  estepe_estado TEXT NOT NULL DEFAULT 'não se aplica',
  limpeza_geral TEXT NOT NULL DEFAULT 'não se aplica',
  has_repairs_needed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Relatórios de Manutenção
CREATE TABLE public.maintenance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  problem_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  resolution_date DATE,
  resolved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Despesas de Motoristas
CREATE TABLE public.driver_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  vehicle_plate TEXT NOT NULL,
  location_equipment TEXT NOT NULL,
  description TEXT,
  receipt_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Checklists de Operadores (Pá Carregadeira)
CREATE TABLE public.operator_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  equipment_id TEXT NOT NULL,
  nivel_oleo_motor TEXT NOT NULL DEFAULT 'não se aplica',
  nivel_oleo_hidraulico TEXT NOT NULL DEFAULT 'não se aplica',
  nivel_liquido_arrefecimento TEXT NOT NULL DEFAULT 'não se aplica',
  filtro_ar_limpo TEXT NOT NULL DEFAULT 'não se aplica',
  vazamentos_hidraulicos TEXT NOT NULL DEFAULT 'não se aplica',
  mangueiras_hidraulicas TEXT NOT NULL DEFAULT 'não se aplica',
  cilindros_hidraulicos TEXT NOT NULL DEFAULT 'não se aplica',
  cacamba_estado TEXT NOT NULL DEFAULT 'não se aplica',
  dentes_cacamba TEXT NOT NULL DEFAULT 'não se aplica',
  articulacao_central TEXT NOT NULL DEFAULT 'não se aplica',
  pinos_buchas TEXT NOT NULL DEFAULT 'não se aplica',
  pneus_estado TEXT NOT NULL DEFAULT 'não se aplica',
  pneus_calibragem TEXT NOT NULL DEFAULT 'não se aplica',
  parafusos_rodas TEXT NOT NULL DEFAULT 'não se aplica',
  display_balanca TEXT NOT NULL DEFAULT 'não se aplica',
  calibracao_balanca TEXT NOT NULL DEFAULT 'não se aplica',
  sensores_balanca TEXT NOT NULL DEFAULT 'não se aplica',
  cabo_conexao_balanca TEXT NOT NULL DEFAULT 'não se aplica',
  cintos_seguranca TEXT NOT NULL DEFAULT 'não se aplica',
  extintor TEXT NOT NULL DEFAULT 'não se aplica',
  espelhos_retrovisores TEXT NOT NULL DEFAULT 'não se aplica',
  luzes_funcionando TEXT NOT NULL DEFAULT 'não se aplica',
  alarme_re TEXT NOT NULL DEFAULT 'não se aplica',
  limpador_parabrisa TEXT NOT NULL DEFAULT 'não se aplica',
  ar_condicionado TEXT NOT NULL DEFAULT 'não se aplica',
  comandos_operacionais TEXT NOT NULL DEFAULT 'não se aplica',
  freios TEXT NOT NULL DEFAULT 'não se aplica',
  buzina TEXT NOT NULL DEFAULT 'não se aplica',
  has_repairs_needed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger de manutenção
CREATE OR REPLACE FUNCTION public.update_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_maintenance_reports_updated_at
  BEFORE UPDATE ON public.maintenance_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_maintenance_updated_at();

-- Índices
CREATE INDEX idx_daily_reports_user_id ON public.daily_reports(user_id);
CREATE INDEX idx_daily_reports_created_at ON public.daily_reports(created_at DESC);
CREATE INDEX idx_safety_checklists_user_id ON public.safety_checklists(user_id);
CREATE INDEX idx_safety_checklists_created_at ON public.safety_checklists(created_at DESC);
CREATE INDEX idx_maintenance_reports_user_id ON public.maintenance_reports(user_id);
CREATE INDEX idx_maintenance_reports_status ON public.maintenance_reports(status);
CREATE INDEX idx_maintenance_reports_created_at ON public.maintenance_reports(created_at DESC);
```

### Script 5: Usuários e Autenticação

```sql
-- Enum de roles
CREATE TYPE public.app_role AS ENUM (
  'diretor', 'gerente', 'vendedor', 'caixa', 
  'administrativo', 'motorista', 'operador'
);

-- Usuários do App
CREATE TABLE public.app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Roles de Usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Permissões de Usuários
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE NOT NULL,
  module TEXT NOT NULL,
  actions TEXT[] NOT NULL,
  UNIQUE(user_id, module)
);

-- Função para verificar role (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Função para obter role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Trigger updated_at
CREATE TRIGGER update_app_users_updated_at
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Usuário padrão Diretor (senha: admin123)
INSERT INTO public.app_users (access_code, name, cpf, password_hash)
VALUES ('001', 'Diretor', '000.000.000-00', 'admin123');

-- Atribuir role diretor
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'diretor' FROM public.app_users WHERE access_code = '001';

-- Permissões completas para Diretor
INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'cadastro', ARRAY['Clientes', 'Produtos', 'Fornecedores']
FROM public.app_users WHERE access_code = '001';

INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'vendas', ARRAY['Nova Venda', 'Orçamentos', 'Pedidos']
FROM public.app_users WHERE access_code = '001';

INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'operacao', ARRAY['Operador', 'Carregados', 'Abastecimento', 'Veículos']
FROM public.app_users WHERE access_code = '001';

INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'motorista', ARRAY['Parte Diária', 'CheckList', 'Manutenção']
FROM public.app_users WHERE access_code = '001';

INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'financeiro', ARRAY['Contas a Pagar', 'Contas a Receber']
FROM public.app_users WHERE access_code = '001';

INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'relatorios', ARRAY['Vendas', 'Produtos', 'Financeiro', 'Clientes', 'Fornecedores', 'Permuta', 'Ticagem', 'Partes Diárias', 'Checklists', 'Manutenções']
FROM public.app_users WHERE access_code = '001';

INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'configuracao', ARRAY['Empresa', 'Sistema', 'Contas de Recebimento']
FROM public.app_users WHERE access_code = '001';
```

### Script 6: RLS Policies

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_deletions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receiving_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_loadings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (ajuste conforme necessário para produção)
CREATE POLICY "Allow all access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to payment_methods" ON public.payment_methods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sale_items" ON public.sale_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can read company settings" ON public.company_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert company settings" ON public.company_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update company settings" ON public.company_settings FOR UPDATE USING (true);
CREATE POLICY "Anyone can read sales deletions" ON public.sales_deletions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sales deletions" ON public.sales_deletions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all access to suppliers" ON public.suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to receiving_accounts" ON public.receiving_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to accounts_receivable" ON public.accounts_receivable FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to accounts_payable" ON public.accounts_payable FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to fuel_entries" ON public.fuel_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can view order loadings" ON public.order_loadings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert order loadings" ON public.order_loadings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all access to daily_reports" ON public.daily_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to safety_checklists" ON public.safety_checklists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to maintenance_reports" ON public.maintenance_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to driver_expenses" ON public.driver_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to operator_checklists" ON public.operator_checklists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to app_users" ON public.app_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to user_roles" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to user_permissions" ON public.user_permissions FOR ALL USING (true) WITH CHECK (true);

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts_receivable;
```

### Script 7: Storage Buckets

```sql
-- Buckets de armazenamento
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('receipts', 'receipts', true),
  ('ticket-images', 'ticket-images', true),
  ('expense-receipts', 'expense-receipts', true),
  ('fuel-receipts', 'fuel-receipts', true);

-- Políticas de storage
CREATE POLICY "Allow all uploads to receipts bucket" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'receipts');
CREATE POLICY "Allow public read from receipts bucket" ON storage.objects FOR SELECT TO public USING (bucket_id = 'receipts');
CREATE POLICY "Allow all delete from receipts bucket" ON storage.objects FOR DELETE TO public USING (bucket_id = 'receipts');

CREATE POLICY "Public can view ticket images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'ticket-images');
CREATE POLICY "Anyone can upload ticket images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ticket-images');
CREATE POLICY "Anyone can delete ticket images" ON storage.objects FOR DELETE USING (bucket_id = 'ticket-images');

CREATE POLICY "Anyone can view expense receipts" ON storage.objects FOR SELECT USING (bucket_id = 'expense-receipts');
CREATE POLICY "Anyone can upload expense receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'expense-receipts');
CREATE POLICY "Anyone can delete expense receipts" ON storage.objects FOR DELETE USING (bucket_id = 'expense-receipts');

CREATE POLICY "Fuel receipts are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'fuel-receipts');
CREATE POLICY "Anyone can upload fuel receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fuel-receipts');
CREATE POLICY "Anyone can delete fuel receipts" ON storage.objects FOR DELETE USING (bucket_id = 'fuel-receipts');
```

---

## Passo 4: Criar Edge Functions no Novo Supabase

Você precisará recriar as **8 Edge Functions** no novo projeto. As principais são:

| Função | Descrição |
|--------|-----------|
| `auth-login` | Autenticação de usuários |
| `auth-verify` | Verificação de tokens |
| `auth-hash-password` | Hash de senhas PBKDF2 |
| `business-chat` | Assistente IA |
| `analyze-ticket` | Análise de tickets de pesagem |
| `analyze-receipt` | Análise de comprovantes |
| `analyze-import` | Importação de dados |
| `analyze-sales-pdf` | Análise de PDFs de vendas |

---

## Passo 5: Copiar Código do Projeto

1. No projeto atual, baixe o código-fonte (ou use o repositório Git)
2. Copie para o novo projeto Lovable
3. Atualize as variáveis de ambiente no `.env`:

```
VITE_SUPABASE_URL=https://[seu-projeto].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[sua-anon-key]
VITE_SUPABASE_PROJECT_ID=[seu-project-id]
```

---

## Resumo das Tabelas (18 tabelas)

| Tabela | Descrição |
|--------|-----------|
| `customers` | Clientes |
| `products` | Produtos |
| `payment_methods` | Formas de pagamento |
| `sales` | Vendas/Orçamentos |
| `sale_items` | Itens das vendas |
| `company_settings` | Configurações da empresa |
| `sales_deletions` | Log de exclusões |
| `suppliers` | Fornecedores |
| `receiving_accounts` | Contas de recebimento |
| `accounts_receivable` | Contas a receber |
| `accounts_payable` | Contas a pagar |
| `vehicles` | Veículos |
| `fuel_entries` | Abastecimentos |
| `order_loadings` | Carregamentos |
| `daily_reports` | Partes diárias |
| `safety_checklists` | Checklists motoristas |
| `maintenance_reports` | Manutenções |
| `driver_expenses` | Despesas motoristas |
| `operator_checklists` | Checklists operadores |
| `app_users` | Usuários do sistema |
| `user_roles` | Roles dos usuários |
| `user_permissions` | Permissões |

---

## Credenciais Padrão

- **Código de Acesso**: `001`
- **Senha**: `admin123`
- **Role**: Diretor (acesso total)

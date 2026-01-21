
-- Create enum for roles (if not exists, drop and recreate)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM (
      'diretor', 'gerente', 'vendedor', 'caixa', 
      'administrativo', 'motorista', 'operador'
    );
  END IF;
END $$;

-- Create app_users table
CREATE TABLE IF NOT EXISTS public.app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.app_users(id) ON DELETE CASCADE NOT NULL,
  module TEXT NOT NULL,
  actions TEXT[] NOT NULL,
  UNIQUE(user_id, module)
);

-- Enable RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for app_users
DROP POLICY IF EXISTS "Allow all access to app_users" ON public.app_users;
CREATE POLICY "Allow all access to app_users"
  ON public.app_users FOR ALL
  USING (true) WITH CHECK (true);

-- RLS Policies for user_roles
DROP POLICY IF EXISTS "Allow all access to user_roles" ON public.user_roles;
CREATE POLICY "Allow all access to user_roles"
  ON public.user_roles FOR ALL
  USING (true) WITH CHECK (true);

-- RLS Policies for user_permissions
DROP POLICY IF EXISTS "Allow all access to user_permissions" ON public.user_permissions;
CREATE POLICY "Allow all access to user_permissions"
  ON public.user_permissions FOR ALL
  USING (true) WITH CHECK (true);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_app_users_updated_at ON public.app_users;
CREATE TRIGGER update_app_users_updated_at
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if user has role (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Insert default diretor user (only if not exists)
INSERT INTO public.app_users (access_code, name, cpf, password_hash)
SELECT '001', 'Diretor', '000.000.000-00', 'admin123'
WHERE NOT EXISTS (SELECT 1 FROM public.app_users WHERE access_code = '001');

-- Assign diretor role (only if not exists)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'diretor' FROM public.app_users WHERE access_code = '001'
AND NOT EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.app_users au ON ur.user_id = au.id WHERE au.access_code = '001');

-- Give all permissions to diretor (only if not exists)
INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'cadastro', ARRAY['Clientes', 'Produtos', 'Fornecedores']
FROM public.app_users WHERE access_code = '001'
AND NOT EXISTS (SELECT 1 FROM public.user_permissions up JOIN public.app_users au ON up.user_id = au.id WHERE au.access_code = '001' AND up.module = 'cadastro');

INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'vendas', ARRAY['Nova Venda', 'Orçamentos', 'Pedidos']
FROM public.app_users WHERE access_code = '001'
AND NOT EXISTS (SELECT 1 FROM public.user_permissions up JOIN public.app_users au ON up.user_id = au.id WHERE au.access_code = '001' AND up.module = 'vendas');

INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'operacao', ARRAY['Operador', 'Carregados', 'Abastecimento', 'Veículos']
FROM public.app_users WHERE access_code = '001'
AND NOT EXISTS (SELECT 1 FROM public.user_permissions up JOIN public.app_users au ON up.user_id = au.id WHERE au.access_code = '001' AND up.module = 'operacao');

INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'motorista', ARRAY['Parte Diária', 'CheckList', 'Manutenção']
FROM public.app_users WHERE access_code = '001'
AND NOT EXISTS (SELECT 1 FROM public.user_permissions up JOIN public.app_users au ON up.user_id = au.id WHERE au.access_code = '001' AND up.module = 'motorista');

INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'financeiro', ARRAY['Contas a Pagar', 'Contas a Receber']
FROM public.app_users WHERE access_code = '001'
AND NOT EXISTS (SELECT 1 FROM public.user_permissions up JOIN public.app_users au ON up.user_id = au.id WHERE au.access_code = '001' AND up.module = 'financeiro');

INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'relatorios', ARRAY['Vendas', 'Produtos', 'Financeiro', 'Clientes', 'Fornecedores', 'Permuta', 'Ticagem', 'Partes Diárias', 'Checklists', 'Manutenções']
FROM public.app_users WHERE access_code = '001'
AND NOT EXISTS (SELECT 1 FROM public.user_permissions up JOIN public.app_users au ON up.user_id = au.id WHERE au.access_code = '001' AND up.module = 'relatorios');

INSERT INTO public.user_permissions (user_id, module, actions)
SELECT id, 'configuracao', ARRAY['Empresa', 'Sistema', 'Contas de Recebimento']
FROM public.app_users WHERE access_code = '001'
AND NOT EXISTS (SELECT 1 FROM public.user_permissions up JOIN public.app_users au ON up.user_id = au.id WHERE au.access_code = '001' AND up.module = 'configuracao');

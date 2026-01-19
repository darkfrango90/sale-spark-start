-- Create daily_reports table (Partes Diárias)
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

-- Enable RLS for daily_reports
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- Create policy for daily_reports
CREATE POLICY "Allow all access to daily_reports" ON public.daily_reports
  FOR ALL USING (true) WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_daily_reports_user_id ON public.daily_reports(user_id);
CREATE INDEX idx_daily_reports_created_at ON public.daily_reports(created_at DESC);

-- Create safety_checklists table (Checklists de Segurança)
CREATE TABLE public.safety_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  
  -- 21 questions (sim/não/não se aplica)
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

-- Enable RLS for safety_checklists
ALTER TABLE public.safety_checklists ENABLE ROW LEVEL SECURITY;

-- Create policy for safety_checklists
CREATE POLICY "Allow all access to safety_checklists" ON public.safety_checklists
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for safety_checklists
CREATE INDEX idx_safety_checklists_user_id ON public.safety_checklists(user_id);
CREATE INDEX idx_safety_checklists_created_at ON public.safety_checklists(created_at DESC);

-- Create maintenance_reports table (Relatórios de Manutenção)
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

-- Enable RLS for maintenance_reports
ALTER TABLE public.maintenance_reports ENABLE ROW LEVEL SECURITY;

-- Create policy for maintenance_reports
CREATE POLICY "Allow all access to maintenance_reports" ON public.maintenance_reports
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for maintenance_reports
CREATE INDEX idx_maintenance_reports_user_id ON public.maintenance_reports(user_id);
CREATE INDEX idx_maintenance_reports_status ON public.maintenance_reports(status);
CREATE INDEX idx_maintenance_reports_created_at ON public.maintenance_reports(created_at DESC);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for maintenance_reports
CREATE TRIGGER update_maintenance_reports_updated_at
  BEFORE UPDATE ON public.maintenance_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_maintenance_updated_at();
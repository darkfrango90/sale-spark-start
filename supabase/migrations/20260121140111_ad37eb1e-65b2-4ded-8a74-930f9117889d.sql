-- Create table for operator checklists (Pá Carregadeira with weighing scale)
CREATE TABLE public.operator_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  equipment_id TEXT NOT NULL,
  
  -- Motor e Fluidos (4)
  nivel_oleo_motor TEXT NOT NULL DEFAULT 'não se aplica',
  nivel_oleo_hidraulico TEXT NOT NULL DEFAULT 'não se aplica',
  nivel_liquido_arrefecimento TEXT NOT NULL DEFAULT 'não se aplica',
  filtro_ar_limpo TEXT NOT NULL DEFAULT 'não se aplica',
  
  -- Sistema Hidráulico (3)
  vazamentos_hidraulicos TEXT NOT NULL DEFAULT 'não se aplica',
  mangueiras_hidraulicas TEXT NOT NULL DEFAULT 'não se aplica',
  cilindros_hidraulicos TEXT NOT NULL DEFAULT 'não se aplica',
  
  -- Caçamba e Estrutura (4)
  cacamba_estado TEXT NOT NULL DEFAULT 'não se aplica',
  dentes_cacamba TEXT NOT NULL DEFAULT 'não se aplica',
  articulacao_central TEXT NOT NULL DEFAULT 'não se aplica',
  pinos_buchas TEXT NOT NULL DEFAULT 'não se aplica',
  
  -- Pneus e Rodas (3)
  pneus_estado TEXT NOT NULL DEFAULT 'não se aplica',
  pneus_calibragem TEXT NOT NULL DEFAULT 'não se aplica',
  parafusos_rodas TEXT NOT NULL DEFAULT 'não se aplica',
  
  -- Sistema de Pesagem/Balança (4)
  display_balanca TEXT NOT NULL DEFAULT 'não se aplica',
  calibracao_balanca TEXT NOT NULL DEFAULT 'não se aplica',
  sensores_balanca TEXT NOT NULL DEFAULT 'não se aplica',
  cabo_conexao_balanca TEXT NOT NULL DEFAULT 'não se aplica',
  
  -- Cabine e Segurança (7)
  cintos_seguranca TEXT NOT NULL DEFAULT 'não se aplica',
  extintor TEXT NOT NULL DEFAULT 'não se aplica',
  espelhos_retrovisores TEXT NOT NULL DEFAULT 'não se aplica',
  luzes_funcionando TEXT NOT NULL DEFAULT 'não se aplica',
  alarme_re TEXT NOT NULL DEFAULT 'não se aplica',
  limpador_parabrisa TEXT NOT NULL DEFAULT 'não se aplica',
  ar_condicionado TEXT NOT NULL DEFAULT 'não se aplica',
  
  -- Controles (3)
  comandos_operacionais TEXT NOT NULL DEFAULT 'não se aplica',
  freios TEXT NOT NULL DEFAULT 'não se aplica',
  buzina TEXT NOT NULL DEFAULT 'não se aplica',
  
  has_repairs_needed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.operator_checklists ENABLE ROW LEVEL SECURITY;

-- Policy for all access
CREATE POLICY "Allow all access to operator_checklists"
  ON public.operator_checklists FOR ALL USING (true) WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.operator_checklists IS 'Checklists diários para operadores de pá carregadeira com balança';
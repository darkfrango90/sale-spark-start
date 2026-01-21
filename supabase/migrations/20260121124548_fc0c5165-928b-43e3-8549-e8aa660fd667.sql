-- Adicionar coluna user_id na tabela fuel_entries para filtrar por usuário
ALTER TABLE public.fuel_entries 
ADD COLUMN user_id TEXT;

-- Preencher registros existentes com o operator_name como fallback
UPDATE public.fuel_entries 
SET user_id = operator_name WHERE user_id IS NULL;
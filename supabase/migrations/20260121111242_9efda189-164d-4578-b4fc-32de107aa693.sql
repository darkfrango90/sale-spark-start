-- Adicionar coluna confirmed_by na tabela accounts_receivable
ALTER TABLE accounts_receivable 
ADD COLUMN confirmed_by TEXT DEFAULT NULL;

-- Comentário para documentação
COMMENT ON COLUMN accounts_receivable.confirmed_by IS 'Quem confirmou o recebimento: manual = usuário, ia = inteligência artificial';
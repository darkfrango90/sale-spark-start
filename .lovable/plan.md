

# Plano: Atualizar Tipo de Pagamento nas Vendas Importadas

## Objetivo
Preencher o campo `payment_type` nas vendas existentes com base no método de pagamento.

---

## Regras de Mapeamento

| Método de Pagamento | Tipo de Pagamento |
|---------------------|-------------------|
| PIX | `vista` (A Vista) |
| Dinheiro | `vista` (A Vista) |
| Cartão Débito | `vista` (A Vista) |
| Carteira | `prazo` (A Prazo) |
| Vale | `prazo` (A Prazo) |
| Boleto | `prazo` (A Prazo) |
| Cartão de Crédito | `prazo` (A Prazo) |

---

## Etapa Única: Executar UPDATE no Banco de Dados

Executar duas queries SQL para atualizar os registros:

### Query 1: Pagamentos A Vista
```sql
UPDATE sales 
SET payment_type = 'vista' 
WHERE payment_method_name IN ('PIX', 'Dinheiro', 'Cartão Débito', 'DINHEIRO', 'pix', 'CARTÃO DEBITO')
  AND (payment_type IS NULL OR payment_type = '');
```

### Query 2: Pagamentos A Prazo
```sql
UPDATE sales 
SET payment_type = 'prazo' 
WHERE payment_method_name IN ('Carteira', 'Vale', 'Boleto', 'Cartão de Crédito', 'CARTEIRA', 'VALE', 'BOLETO', 'CARTÃO DE CREDITO', 'Cartão Crédito')
  AND (payment_type IS NULL OR payment_type = '');
```

---

## Resultado Esperado

- **35 vendas** serão marcadas como "A Vista" (PIX + Dinheiro + Cartão Débito)
- **117 vendas** serão marcadas como "A Prazo" (Carteira + Vale + Boleto)
- Dados existentes não serão alterados se já tiverem `payment_type` preenchido

---

## Verificação

Após a atualização, verificar se todos os registros foram atualizados corretamente com uma query de conferência.


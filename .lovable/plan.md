

# Plano: Vincular Vendas aos Vendedores Corretos

## Objetivo
Atualizar o campo `seller_name` nas vendas importadas para corresponder aos nomes dos usuários cadastrados no sistema.

---

## Dados Identificados

### Vendas no Sistema
| Nome Atual | Quantidade |
|------------|------------|
| ANNE STEFANE | 67 vendas |
| NAYSLLA | 85 vendas |

### Usuários Cadastrados
| Nome | Código | ID |
|------|--------|-----|
| Anne Stefany | 002 | 2ce348bd-543c-40ad-be5f-fff5d8982589 |
| Nayslla Adriana Fernando Tavares | 006 | 370835b3-834a-4487-8c27-abbd9d415b03 |

---

## Etapa Única: Executar UPDATE no Banco de Dados

### Query 1: Vincular vendas da Anne
```sql
UPDATE sales 
SET seller_name = 'Anne Stefany'
WHERE seller_name ILIKE '%ANNE%';
```

### Query 2: Vincular vendas da Nayslla
```sql
UPDATE sales 
SET seller_name = 'Nayslla Adriana Fernando Tavares'
WHERE seller_name ILIKE '%NAYSLLA%';
```

---

## Resultado Esperado

- **67 vendas** serão atualizadas para "Anne Stefany"
- **85 vendas** serão atualizadas para "Nayslla Adriana Fernando Tavares"
- Os nomes ficarão consistentes com os usuários cadastrados no sistema


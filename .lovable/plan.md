

# Plano de Correção: Código Completo para Novo Projeto

## Diagnóstico do Problema

Baseado nas screenshots que você enviou, o novo projeto foi criado com **placeholders vazios** em vez do código completo. As páginas mostram mensagens como:
- "Formulário de vendas será implementado na próxima fase"
- "Módulo financeiro será implementado na próxima fase"  
- "Módulo de operação será implementado na próxima fase"

Isso significa que o código-fonte não foi copiado corretamente. O banco de dados pode estar OK, mas os **arquivos de código** estão incompletos.

---

## Arquivos Críticos Faltando no Novo Projeto

Após análise completa, identifiquei **46 arquivos** que precisam ser copiados do projeto atual para o novo:

### 1. Types (5 arquivos)
| Arquivo | Descrição |
|---------|-----------|
| `src/types/user.ts` | User, Permission, ROLES, MODULES |
| `src/types/customer.ts` | Customer interface (com campos de permuta) |
| `src/types/product.ts` | Product interface (com densidade) |
| `src/types/sales.ts` | Sale, SaleItem, PaymentMethod |
| `src/types/financial.ts` | AccountReceivable, AccountPayable |
| `src/types/supplier.ts` | Supplier interface |
| `src/types/vehicle.ts` | Vehicle, FuelEntry, FuelType |
| `src/types/driver.ts` | DailyReport, SafetyChecklist, VEHICLE_PLATES |
| `src/types/operator.ts` | OperatorChecklist, EQUIPMENT_LIST, 28 questions |

### 2. Contexts (8 arquivos)
| Arquivo | Funções Principais |
|---------|-------------------|
| `src/contexts/AuthContext.tsx` | Login customizado, token JWT-like |
| `src/contexts/CustomerContext.tsx` | CRUD clientes + permuta |
| `src/contexts/ProductContext.tsx` | CRUD produtos + densidade |
| `src/contexts/SalesContext.tsx` | Vendas + orçamentos + numeração |
| `src/contexts/FinancialContext.tsx` | Contas a Pagar/Receber |
| `src/contexts/SupplierContext.tsx` | CRUD fornecedores |
| `src/contexts/SettingsContext.tsx` | Condições de pagamento |
| `src/contexts/CompanyContext.tsx` | Dados da empresa |

### 3. Pages - Vendas (3 arquivos)
| Arquivo | Linhas | Funcionalidade |
|---------|--------|----------------|
| `src/pages/sales/NewSale.tsx` | 922 | Formulário completo de venda |
| `src/pages/sales/SalesList.tsx` | ~400 | Lista de pedidos/orçamentos |
| `src/components/sales/SalePrintView.tsx` | ~200 | Impressão de venda |

### 4. Pages - Financeiro (2 arquivos)
| Arquivo | Linhas | Funcionalidade |
|---------|--------|----------------|
| `src/pages/financial/AccountsReceivable.tsx` | 442 | Contas a receber completo |
| `src/pages/financial/AccountsPayable.tsx` | 684 | Contas a pagar com parcelamento |

### 5. Pages - Produtos (1 arquivo)
| Arquivo | Linhas | Funcionalidade |
|---------|--------|----------------|
| `src/pages/products/ProductManagement.tsx` | 480 | Cadastro com DENSIDADE |

### 6. Pages - Operador (4 arquivos)
| Arquivo | Linhas | Funcionalidade |
|---------|--------|----------------|
| `src/pages/operations/OperatorPanel.tsx` | 239 | Dashboard do operador |
| `src/pages/operations/OperatorDashboard.tsx` | ~300 | Carregamento com foto |
| `src/pages/operations/OperatorChecklist.tsx` | 278 | Checklist 28 itens |
| `src/pages/operations/FuelEntry.tsx` | 647 | Abastecimento completo |

### 7. Pages - Motorista (5 arquivos)
| Arquivo | Linhas | Funcionalidade |
|---------|--------|----------------|
| `src/pages/driver/DriverDashboard.tsx` | 308 | Dashboard do motorista |
| `src/pages/driver/DailyReport.tsx` | 244 | Parte diária |
| `src/pages/driver/SafetyChecklist.tsx` | 215 | Checklist 21 itens |
| `src/pages/driver/MaintenanceReport.tsx` | ~150 | Relato de manutenção |
| `src/pages/driver/ExpenseEntry.tsx` | ~200 | Despesas com comprovante |

### 8. Pages - Relatórios (12 arquivos)
| Arquivo | Descrição |
|---------|-----------|
| `src/pages/reports/SalesReport.tsx` | Relatório de vendas |
| `src/pages/reports/ProductsReport.tsx` | Relatório de produtos |
| `src/pages/reports/CustomersReport.tsx` | Relatório de clientes |
| `src/pages/reports/FinancialReport.tsx` | Relatório financeiro |
| `src/pages/reports/SuppliersReport.tsx` | Relatório fornecedores |
| `src/pages/reports/TickingReport.tsx` | Relatório de ticagem |
| `src/pages/reports/CashRegisterReport.tsx` | Fechamento de caixa |
| `src/pages/reports/FuelReport.tsx` | Relatório abastecimento |
| `src/pages/reports/DailyReportsAdmin.tsx` | Admin partes diárias |
| `src/pages/reports/ChecklistsAdmin.tsx` | Admin checklists |
| `src/pages/reports/MaintenanceAdmin.tsx` | Admin manutenções |
| `src/pages/reports/AIAssistant.tsx` | Assistente IA |

### 9. Edge Functions (8 arquivos)
| Função | Caminho |
|--------|---------|
| auth-login | `supabase/functions/auth-login/index.ts` |
| auth-verify | `supabase/functions/auth-verify/index.ts` |
| auth-hash-password | `supabase/functions/auth-hash-password/index.ts` |
| business-chat | `supabase/functions/business-chat/index.ts` |
| analyze-ticket | `supabase/functions/analyze-ticket/index.ts` |
| analyze-receipt | `supabase/functions/analyze-receipt/index.ts` |
| analyze-import | `supabase/functions/analyze-import/index.ts` |
| analyze-sales-pdf | `supabase/functions/analyze-sales-pdf/index.ts` |

---

## Solução: Exportar Todo o Código

Para resolver isso, você tem 3 opções:

### Opção 1: Copiar Arquivos Manualmente
1. No projeto ATUAL (este), vá em cada arquivo
2. Copie o conteúdo completo
3. No projeto NOVO, crie os mesmos arquivos com o mesmo conteúdo

### Opção 2: Usar Git (Recomendado)
1. Exporte o projeto atual para GitHub/GitLab
2. Clone no novo projeto Lovable

### Opção 3: Criar Documento com Todo Código
Posso gerar um arquivo Markdown único contendo TODO o código para você copiar.

---

## Próximos Passos

Quando você aprovar este plano, eu posso:

1. **Gerar um arquivo `.lovable/full-code-export.md`** com todo o código organizado por arquivo
2. Listar os arquivos em ordem de prioridade para copiar
3. Fornecer instruções específicas de como atualizar cada arquivo no novo projeto

---

## Verificação de Rotas

O arquivo `src/App.tsx` deste projeto contém **35 rotas** configuradas corretamente. No novo projeto, verifique se todas estão presentes:

```text
/login
/
/configuracao/usuarios
/configuracao/pagamentos
/configuracao/empresa
/configuracao/contas-recebimento
/configuracao/importacao
/configuracao/veiculos
/cadastro/clientes
/cadastro/produtos
/cadastro/fornecedores
/vendas/nova
/vendas/pedidos
/vendas/orcamentos
/financeiro/contas-a-receber
/financeiro/contas-a-pagar
/relatorios/permuta
/relatorios
/relatorios/vendas
/relatorios/produtos
/relatorios/clientes
/relatorios/financeiro
/relatorios/fornecedores
/relatorios/ticagem
/relatorios/assistente
/relatorios/caixa
/relatorios/partes-diarias
/relatorios/checklists
/relatorios/manutencoes
/relatorios/abastecimento
/operador
/operador/carregamento
/operador/checklist
/operacao/carregados
/operacao/abastecimento
/motorista
/motorista/parte-diaria
/motorista/checklist
/motorista/manutencao
/motorista/despesas
```

---

## Detalhes Técnicos

### Campo Densidade no Produto
O arquivo `ProductManagement.tsx` (linhas 364-375) contém o campo de densidade:
```tsx
<div className="space-y-2">
  <Label htmlFor="density">Densidade (Kg/m³)</Label>
  <Input
    id="density"
    type="number"
    step="0.01"
    value={formData.density}
    onChange={(e) => setFormData(prev => ({ ...prev, density: e.target.value }))}
    placeholder="Ex: 750"
  />
</div>
```

### Menu de Relatórios Completo
O arquivo `TopMenu.tsx` contém todos os itens do menu Relatórios (linhas 68-81):
- Vendas, Caixa, Produtos, Financeiro
- Clientes, Fornecedores, Permuta, Ticagem
- Partes Diárias, Checklists, Manutenções
- Assistente IA


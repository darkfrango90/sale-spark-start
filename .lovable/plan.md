

# Plano: Importação Inteligente de Vendas via Excel

## Objetivo
Melhorar a função de importação de vendas via Excel para:
1. **Não alterar dados existentes** - apenas criar novos pedidos
2. **Correspondência inteligente de produtos** - entender variações de nomenclatura (ex: "SEIXO BRITADO N.1" → "SEIXO BRITADO Nº 1")
3. **Pré-cadastro automático de clientes** - criar cliente básico quando não existir (nome + CPF/CNPJ)

---

## Estrutura do Excel (baseada na imagem)

| Coluna | Campo do Sistema | Tratamento |
|--------|------------------|------------|
| Data | created_at | Extrair data (ex: 24/01/2026) |
| Cód. Cliente | (ignorar) | Código do sistema externo |
| Nome Cliente | customer_name | Buscar/criar cliente |
| CPF/CNPJ Cliente | customer_cpf_cnpj | Identificar/criar cliente |
| Vendedora | seller_name | Salvar na venda |
| Nome Produto | product_name | **Correspondência inteligente** |
| Quantidade | quantity | Usar diretamente |
| Valor Unit. | unit_price | Usar diretamente |
| Valor Total | total | Calcular (qty × price) |
| Tipo Pagamento | payment_method | Salvar na venda |

---

## Etapa 1: Atualizar Edge Function `analyze-import`

**Arquivo:** `supabase/functions/analyze-import/index.ts`

### 1.1 Adicionar Função de Normalização de Nomes de Produtos

Criar função que normaliza variações comuns de nomenclatura:

```typescript
const normalizeProductName = (name: string): string => {
  if (!name) return '';
  
  return name
    .toUpperCase()
    .trim()
    // Normalizar variações de "número"
    .replace(/\bN\.\s*/gi, 'Nº')     // "N. 1" → "Nº1"
    .replace(/\bN\s+/gi, 'Nº')       // "N 1" → "Nº1"  
    .replace(/\bNO\.\s*/gi, 'Nº')    // "NO. 1" → "Nº1"
    .replace(/\bNR\.\s*/gi, 'Nº')    // "NR. 1" → "Nº1"
    .replace(/\bNUM\.\s*/gi, 'Nº')   // "NUM. 1" → "Nº1"
    // Remover espaços extras antes de números
    .replace(/Nº\s+(\d)/g, 'Nº$1')   // "Nº 1" → "Nº1"
    // Normalizar espaços múltiplos
    .replace(/\s+/g, ' ')
    .trim();
};
```

### 1.2 Implementar Correspondência Inteligente de Produtos

Atualizar a lógica de busca para usar normalização + score de similaridade:

```typescript
const findMatchingProduct = (
  productName: string, 
  existingProducts: { name: string; code: string; id: string }[]
): { product: typeof existingProducts[0] | null; confidence: number } => {
  const normalizedInput = normalizeProductName(productName);
  
  // 1. Tentar correspondência exata (após normalização)
  for (const p of existingProducts) {
    if (normalizeProductName(p.name) === normalizedInput) {
      return { product: p, confidence: 1.0 };
    }
  }
  
  // 2. Tentar correspondência por inclusão (nome contém o outro)
  for (const p of existingProducts) {
    const normalizedExisting = normalizeProductName(p.name);
    if (normalizedExisting.includes(normalizedInput) || 
        normalizedInput.includes(normalizedExisting)) {
      return { product: p, confidence: 0.9 };
    }
  }
  
  // 3. Tentar correspondência por palavras-chave principais
  const inputWords = normalizedInput.split(' ').filter(w => w.length > 2);
  for (const p of existingProducts) {
    const existingWords = normalizeProductName(p.name).split(' ');
    const matchingWords = inputWords.filter(w => existingWords.includes(w));
    if (matchingWords.length >= 2 || matchingWords.length === inputWords.length) {
      return { product: p, confidence: 0.7 };
    }
  }
  
  return { product: null, confidence: 0 };
};
```

### 1.3 Atualizar Mapeamento de Colunas do Excel

Adicionar mapeamento para as novas colunas da estrutura do usuário:

```typescript
// Em systemPrompt para type === 'sales'
systemPrompt += `
MAPEAMENTO DE COLUNAS (estrutura do Excel):
- "Data" → sale_date (formato DD/MM/YYYY HH:MM:SS ou DD/MM/YYYY)
- "Nome Cliente" → customer_name
- "CPF / CNPJ Cliente", "CPF/CNPJ" → customer_cpf_cnpj
- "Vendedora", "Vendedor" → seller_name
- "Nome Produto", "Produto" → product_name
- "Quantidade", "Qtde", "Qtd" → quantity
- "Valor Unit.", "Vlr. Unit" → unit_price
- "Valor Total" → (calcular, não mapear)
- "Tipo Pagamento", "Cond.Pag", "Forma Pag" → payment_method

NORMALIZAÇÃO DE NOMES DE PRODUTOS:
Ao buscar correspondência de produtos, normalize variações:
- "SEIXO BRITADO N.1" = "SEIXO BRITADO Nº 1" = "SEIXO BRITADO N 1"
- "SEIXO ROLADO N. 0" = "SEIXO ROLADO Nº0" = "SEIXO ROLADO Nº 0"
- "AREIA MEDIA" = "AREIA MÉDIA"
- Ignorar acentos, espaços extras e variações de formatação de número

REGRA CRÍTICA:
- Apenas CRIAR novos pedidos
- NÃO alterar banco de dados existente (produtos, clientes existentes)
- Se cliente não existir pelo CPF/CNPJ → marcar needs_customer_creation: true
- Se produto não for encontrado mesmo com normalização → marcar como error
`;
```

---

## Etapa 2: Atualizar DataImport.tsx

**Arquivo:** `src/pages/settings/DataImport.tsx`

### 2.1 Atualizar Correspondência de Produtos no Frontend

Adicionar mesma função de normalização no frontend para consistência:

```typescript
const normalizeProductName = (name: string): string => {
  if (!name) return '';
  
  return name
    .toUpperCase()
    .trim()
    .replace(/\bN\.\s*/gi, 'Nº')
    .replace(/\bN\s+/gi, 'Nº')
    .replace(/\bNO\.\s*/gi, 'Nº')
    .replace(/Nº\s+(\d)/g, 'Nº$1')
    .replace(/\s+/g, ' ')
    // Remover acentos
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim();
};
```

### 2.2 Atualizar Busca de Produto em `importExcelData`

Modificar a lógica de busca para usar normalização:

```typescript
// Localizar: linhas ~722-726
// Substituir busca simples por correspondência inteligente

const normalizedProductName = normalizeProductName(
  item.matched_product_name || item.mappedData.product_name
);

const product = products.find(p => {
  const normalizedExisting = normalizeProductName(p.name);
  
  // Correspondência exata após normalização
  if (normalizedExisting === normalizedProductName) return true;
  
  // Correspondência por inclusão
  if (normalizedExisting.includes(normalizedProductName) ||
      normalizedProductName.includes(normalizedExisting)) return true;
  
  // Correspondência por palavras-chave
  const inputWords = normalizedProductName.split(' ').filter(w => w.length > 2);
  const existingWords = normalizedExisting.split(' ');
  const matches = inputWords.filter(w => existingWords.includes(w));
  
  return matches.length >= 2;
});
```

### 2.3 Garantir Apenas Criação de Novos Pedidos

A lógica atual já cria apenas novos pedidos. Adicionar verificação explícita:

```typescript
// No início de importExcelData para vendas
if (importType === 'sales') {
  toast.info('Modo de importação', { 
    description: 'Apenas novos pedidos serão criados. Dados existentes não serão alterados.' 
  });
}
```

### 2.4 Melhorar Pré-cadastro de Clientes

Atualizar a criação de clientes para incluir mais dados quando disponíveis:

```typescript
// Quando needs_customer_creation === true
if (!customer && item.needs_customer_creation) {
  const newCode = getNextCustomerCode();
  const customerType = cpfCnpjClean.length === 11 ? 'fisica' : 'juridica';
  
  await addCustomer({
    code: newCode,
    name: item.mappedData.customer_name || 'Cliente Importado',
    type: customerType,
    cpfCnpj: cpfCnpjClean,
    phone: '', // Será preenchido depois
    active: true,
    notes: `Cliente cadastrado automaticamente via importação em ${new Date().toLocaleDateString('pt-BR')}`
  });
  
  customersCreated++;
  // ... resto do código
}
```

---

## Etapa 3: Adicionar Data da Venda

### 3.1 Extrair e Usar Data do Excel

Atualizar para usar a coluna "Data" do Excel:

```typescript
// Na função importExcelData, ao criar a venda
const saleDate = item.mappedData.sale_date 
  ? parseDate(item.mappedData.sale_date) 
  : new Date();

await addSale({
  // ... campos existentes
  createdAt: saleDate, // Usar data do Excel se disponível
});

// Função helper para parsear datas
const parseDate = (dateStr: string): Date => {
  // Formatos: "24/01/2026 11:45:56" ou "24/01/2026"
  const parts = dateStr.split(' ')[0].split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return new Date();
};
```

---

## Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/analyze-import/index.ts` | Adicionar `normalizeProductName()` e melhorar correspondência de produtos |
| `supabase/functions/analyze-import/index.ts` | Atualizar prompts para mapear novas colunas do Excel |
| `src/pages/settings/DataImport.tsx` | Adicionar mesma normalização no frontend |
| `src/pages/settings/DataImport.tsx` | Melhorar busca de produtos com correspondência inteligente |
| `src/pages/settings/DataImport.tsx` | Usar data do Excel ao criar pedidos |

---

## Exemplos de Correspondência que Funcionarão

| Nome no Excel | Nome no Sistema | Resultado |
|---------------|-----------------|-----------|
| SEIXO BRITADO N.1 | SEIXO BRITADO Nº 1 | ✅ Correspondência |
| SEIXO ROLADO N. 0 | SEIXO ROLADO Nº0 | ✅ Correspondência |
| AREIA MEDIA | AREIA MÉDIA | ✅ Correspondência |
| AREIA FINA | AREIA FINA | ✅ Correspondência exata |
| FRETE | FRETE | ✅ Correspondência exata |
| BRITA N.2 | BRITA Nº 2 | ✅ Correspondência |
| PRODUTO XYZ | (não existe) | ❌ Erro - produto não encontrado |

---

## Resultado Esperado

1. **Usuário faz upload do Excel** com a estrutura mostrada na imagem
2. **IA analisa e mapeia colunas** automaticamente
3. **Produtos são correspondidos** mesmo com variações de nomenclatura
4. **Clientes não cadastrados** são pré-cadastrados com nome + CPF/CNPJ
5. **Novos pedidos são criados** com números sequenciais
6. **Banco de dados existente não é alterado** (apenas adições)


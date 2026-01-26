
# Plano: Adicionar Coluna Valor e Incluir Frete na Saída de Material

## Objetivo
1. Adicionar coluna "Valor" na tabela "Saída de Material do Dia" (conforme solicitado anteriormente)
2. Incluir "Frete" como um item na tabela, mesmo sem M³/Toneladas, para exibir seu valor total

---

## Mudanças Necessárias

### 1. Atualizar estrutura do `materialOutput` (useMemo)

Modificar o objeto para incluir `totalValue`:

```text
outputByProduct[item.productId] = {
  productId: string,
  productName: string,
  m3: number,
  tons: number,
  totalValue: number  // NOVO: valor total vendido
}
```

### 2. Incluir Frete na saída de material

Atualmente, o filtro `.filter(item => item.m3 > 0 || item.tons > 0)` exclui o frete. 

Mudança: `.filter(item => item.m3 > 0 || item.tons > 0 || item.totalValue > 0)`

Isso permite que itens de frete apareçam na tabela mesmo sem M³/Toneladas.

### 3. Atualizar `outputTotals`

Adicionar soma total dos valores:

```text
outputTotals = {
  totalM3: number,
  totalTons: number,
  totalValue: number  // NOVO
}
```

### 4. Atualizar Tabela na Tela

Adicionar coluna "Valor" no cabeçalho e corpo da tabela:
- Cabeçalho: `<TableHead className="text-right">Valor</TableHead>`
- Células: `{formatCurrency(item.totalValue)}`
- Linha de total: `{formatCurrency(outputTotals.totalValue)}`

### 5. Atualizar Layout de Impressão (handlePrint)

Incluir coluna "Valor" na tabela HTML de impressão.

---

## Estrutura Final da Tabela

| Produto | M³ | Toneladas | Valor |
|---------|-----|-----------|-------|
| AREIA GROSSA | 407.00 | 636.55 | R$ X.XXX,XX |
| AREIA FINA | 241.87 | 360.39 | R$ X.XXX,XX |
| FRETE | - | - | R$ X.XXX,XX |
| **TOTAL** | **1181.87** | **1796.29** | **R$ XX.XXX,XX** |

---

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/reports/CashRegisterReport.tsx` | Adicionar `totalValue`, ajustar filtro para incluir frete, atualizar tabela e impressão |

---

## Detalhes Técnicos

1. **materialOutput useMemo** (linhas 99-144):
   - Adicionar `totalValue: 0` na inicialização
   - Somar `item.total` para cada item
   - Mudar filtro para: `item.m3 > 0 || item.tons > 0 || item.totalValue > 0`

2. **outputTotals useMemo** (linhas 147-150):
   - Adicionar `totalValue: materialOutput.reduce((sum, item) => sum + item.totalValue, 0)`

3. **Tabela** (seção Saída de Material):
   - Adicionar `<TableHead>` para "Valor"
   - Adicionar `<TableCell>` com `formatCurrency(item.totalValue)`
   - Exibir "-" para M³ e Toneladas quando forem 0

4. **handlePrint**:
   - Adicionar coluna "Valor" na tabela HTML
   - Formatar valores com moeda brasileira

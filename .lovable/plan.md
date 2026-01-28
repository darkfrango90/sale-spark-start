

# Documentacao Completa: Analise de Comprovante por IA

Este documento detalha toda a logica de anexar comprovantes de pagamento nas vendas, incluindo regras de negocio, analise por IA e baixa automatica.

---

## Fluxo Visual

```text
+------------------+     +-------------------+     +------------------+
|   LISTA VENDAS   | --> | ANEXAR COMPROVANTE| --> |  ANALISE POR IA  |
|  (SalesList.tsx) |     |   (Dialog Modal)  |     | (Edge Function)  |
+------------------+     +-------------------+     +------------------+
                                                           |
                              +----------------------------+
                              v
         +------------------------------------------+
         |           VALIDACAO AUTOMATICA           |
         |  Valor confere? (tolerancia R$ 0.50)     |
         |  Confianca >= 80%?                       |
         +------------------------------------------+
                   |                      |
                  SIM                    NAO
                   v                      v
    +-------------------+      +---------------------+
    | BAIXA AUTOMATICA  |      | VERIFICACAO MANUAL  |
    | status: recebido  |      | Comprovante salvo   |
    | confirmed_by: ia  |      | status: pendente    |
    | Pedido finalizado |      | Alerta ao operador  |
    +-------------------+      +---------------------+
```

---

## 1. Quando o Botao de Anexar Aparece

### Arquivo: `src/pages/sales/SalesList.tsx`

```typescript
// Linha 102-107: Funcao que verifica se metodo aceita comprovante
const isReceiptPayment = (paymentMethodName: string | undefined) => {
  if (!paymentMethodName) return false;
  const methodLower = paymentMethodName.toLowerCase();
  return methodLower.includes('pix') || 
         methodLower.includes('deposito') || 
         methodLower.includes('depósito');
};
```

### Regras de Exibicao do Botao:

| Condicao | Valor |
|----------|-------|
| Tipo | `pedido` (nao aparece em orcamentos) |
| Status | `pendente` (nao aparece em finalizados/cancelados) |
| Pagamento | Contem "PIX" ou "Deposito" |

### Codigo do Botao (linhas 550-570 aproximadamente):

```typescript
{sale.type === 'pedido' && 
 sale.status === 'pendente' && 
 isReceiptPayment(sale.paymentMethodName) && (
  <Button
    variant="ghost"
    size="icon"
    title="Anexar Comprovante"
    onClick={() => {
      setSaleForReceipt(sale);
      setIsReceiptDialogOpen(true);
    }}
  >
    <Paperclip className="h-4 w-4" />
  </Button>
)}
```

---

## 2. Metodos de Pagamento

### A Vista (Comprovante Aceito):

| Metodo | Aceita Comprovante |
|--------|-------------------|
| PIX | SIM |
| Deposito | SIM |
| Dinheiro | NAO (pagamento fisico) |

### A Prazo (Sem Comprovante Imediato):

| Metodo | Observacao |
|--------|------------|
| Boleto | Baixa manual quando pago |
| Cartao de Credito | Baixa manual |
| Carteira | Debito na conta do cliente |
| Permuta | Sistema de troca |

---

## 3. Dialog de Anexar Comprovante

### Estado do Modal:

```typescript
// Linha 92-97: Estados do dialog
const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
const [saleForReceipt, setSaleForReceipt] = useState<Sale | null>(null);
const [receiptFile, setReceiptFile] = useState<File | null>(null);
const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
const [isAnalyzing, setIsAnalyzing] = useState(false);
```

### Selecao de Arquivo:

```typescript
// Linha 109-120: Handler de selecao de arquivo
const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string); // Base64 para preview e envio
    };
    reader.readAsDataURL(file);
  }
};
```

---

## 4. Analise por IA - Edge Function

### Arquivo: `supabase/functions/analyze-receipt/index.ts`

### Modelo Utilizado:
- **google/gemini-2.5-flash** - Modelo de visao da Lovable AI Gateway

### Dados Extraidos:

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `banco` | string | Nome do banco (Nubank, Itau, Bradesco, etc.) |
| `valor` | number | Valor da transacao em R$ |
| `data_transacao` | string | Data no formato DD/MM/YYYY HH:MM |
| `tipo_transacao` | enum | PIX, TED, DOC, Deposito, Transferencia |
| `chave_pix` | string | Chave PIX do recebedor |
| `destinatario` | string | Nome do recebedor |
| `confianca` | number | Nivel de confianca (0 a 1) |

### Prompt do Sistema:

```typescript
{
  role: 'system',
  content: `Voce e um especialista em analise de comprovantes de pagamento bancario.
Analise a imagem do comprovante e extraia as informacoes de forma precisa.
Identifique: banco emissor, valor da transacao, data/hora, tipo de transacao (PIX, TED, DOC, Deposito).
Se a imagem nao for um comprovante valido ou as informacoes estiverem ilegiveis, retorne confianca baixa.`
}
```

### Function Calling Schema:

```typescript
tools: [
  {
    type: 'function',
    function: {
      name: 'extract_receipt_data',
      parameters: {
        type: 'object',
        properties: {
          banco: {
            type: 'string',
            description: 'Nome do banco emissor (ex: Nubank, Itau, Bradesco)'
          },
          valor: {
            type: 'number',
            description: 'Valor da transacao em reais (sem R$)'
          },
          data_transacao: {
            type: 'string',
            description: 'Data no formato DD/MM/YYYY HH:MM'
          },
          tipo_transacao: {
            type: 'string',
            enum: ['PIX', 'TED', 'DOC', 'Deposito', 'Transferencia', 'Outro']
          },
          confianca: {
            type: 'number',
            description: 'Nivel de confianca de 0 a 1'
          }
        },
        required: ['valor', 'confianca']
      }
    }
  }
]
```

---

## 5. Logica de Validacao e Baixa

### Arquivo: `src/pages/sales/SalesList.tsx` (linhas 122-203)

### Fluxo Completo:

```typescript
const handleReceiptAnalysis = async () => {
  if (!saleForReceipt || !receiptPreview || !receiptFile) return;
  
  setIsAnalyzing(true);
  
  try {
    // PASSO 1: Upload do comprovante para Storage
    const fileName = `${saleForReceipt.id}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, receiptFile);
    
    if (uploadError) throw new Error('Erro ao fazer upload do comprovante');
    
    // Obter URL publica do comprovante
    const { data: { publicUrl } } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);
    
    // PASSO 2: Chamar Edge Function para analise
    const { data, error } = await supabase.functions.invoke('analyze-receipt', {
      body: { imageBase64: receiptPreview }
    });
    
    if (error) throw new Error('Erro ao analisar comprovante');
    
    // PASSO 3: Validar resultados da IA
    const valorConfere = data?.valor && Math.abs(data.valor - saleForReceipt.total) < 0.50;
    const confiancaAlta = data?.confianca >= 0.8;
    
    // PASSO 4: Decisao automatica
    if (valorConfere && confiancaAlta) {
      // BAIXA AUTOMATICA
      await supabase.from('accounts_receivable').update({
        status: 'recebido',
        confirmed_by: 'ia',
        receipt_date: new Date().toISOString().split('T')[0],
        receipt_url: publicUrl,
        notes: `Baixa automatica por IA. Banco: ${data.banco || 'N/A'}. Valor: R$ ${data.valor?.toFixed(2)}`
      }).eq('sale_id', saleForReceipt.id);
      
      // Finalizar pedido
      await updateSale(saleForReceipt.id, { status: 'finalizado' });
      
      toast({
        title: "Pagamento Confirmado por I.A.",
        description: `Banco: ${data.banco}. Valor: R$ ${data.valor.toFixed(2)}.`,
      });
    } else {
      // VERIFICACAO MANUAL NECESSARIA
      await supabase.from('accounts_receivable').update({
        receipt_url: publicUrl,
        notes: `Comprovante anexado. IA: valor R$ ${data?.valor?.toFixed(2)}, confianca ${((data?.confianca || 0) * 100).toFixed(0)}%. Verificar manualmente.`
      }).eq('sale_id', saleForReceipt.id);
      
      toast({
        title: "Verificacao Necessaria",
        description: `Valor diverge. Verificar manualmente.`,
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsAnalyzing(false);
  }
};
```

---

## 6. Criterios de Validacao

### Regra 1: Tolerancia de Valor

```typescript
// Tolerancia de R$ 0.50 centavos
const valorConfere = Math.abs(valorIA - totalPedido) < 0.50;
```

| Valor Pedido | Valor IA | Diferenca | Resultado |
|--------------|----------|-----------|-----------|
| R$ 150.00 | R$ 150.00 | R$ 0.00 | APROVADO |
| R$ 150.00 | R$ 150.30 | R$ 0.30 | APROVADO |
| R$ 150.00 | R$ 149.60 | R$ 0.40 | APROVADO |
| R$ 150.00 | R$ 151.00 | R$ 1.00 | REPROVADO |

### Regra 2: Nivel de Confianca

```typescript
// Confianca minima de 80%
const confiancaAlta = data.confianca >= 0.8;
```

| Confianca IA | Resultado |
|--------------|-----------|
| 0.95 (95%) | APROVADO |
| 0.85 (85%) | APROVADO |
| 0.80 (80%) | APROVADO |
| 0.75 (75%) | REPROVADO |
| 0.50 (50%) | REPROVADO |

---

## 7. Estrutura do Banco de Dados

### Tabela: `accounts_receivable`

```sql
CREATE TABLE accounts_receivable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id),
  original_amount DECIMAL(10,2) NOT NULL,
  interest_penalty DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente', -- 'pendente' | 'recebido'
  
  -- Campos de baixa
  receiving_account_id UUID REFERENCES receiving_accounts(id),
  receipt_date DATE,
  receipt_url TEXT,        -- URL do comprovante no Storage
  confirmed_by VARCHAR(10), -- 'manual' | 'ia'
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabela: `sales` (campos relevantes)

```sql
-- Atualizado quando baixa automatica
UPDATE sales SET status = 'finalizado' WHERE id = ?;
```

---

## 8. Storage Bucket

### Nome: `receipts`

```sql
-- Criar bucket publico para comprovantes
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true);

-- Policy de upload
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'receipts');

-- Policy de leitura
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts');
```

---

## 9. Exibicao em Contas a Receber

### Arquivo: `src/pages/financial/AccountsReceivable.tsx`

### Badge de Confirmacao por IA:

```typescript
// Linha 236-245: Badge especial para confirmacao por IA
<TableCell>
  {ar.confirmedBy === 'ia' ? (
    <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1 w-fit">
      <Bot className="h-3 w-3" />
      Recebido por I.A.
    </Badge>
  ) : (
    <Badge variant={ar.status === 'pendente' ? 'secondary' : 'default'}>
      {ar.status === 'pendente' ? 'Pendente' : 'Recebido'}
    </Badge>
  )}
</TableCell>
```

### Visualizacao do Comprovante:

```typescript
// Botao para ver comprovante anexado
{ar.receiptUrl && (
  <Button 
    variant="ghost" 
    size="icon"
    title="Ver Comprovante"
    onClick={() => handleViewReceipt(ar)}
  >
    <FileImage className="h-4 w-4" />
  </Button>
)}
```

---

## 10. Resumo da Logica

### Fluxo Completo:

1. **Usuario** clica no icone de clipe (Paperclip) em um pedido pendente com PIX/Deposito
2. **Modal** abre para selecionar imagem do comprovante
3. **Upload** envia arquivo para bucket `receipts`
4. **Edge Function** recebe imagem em base64 e chama Gemini 2.5 Flash
5. **IA** extrai: banco, valor, data, tipo de transacao, confianca
6. **Validacao**:
   - Se valor confere (+-R$ 0.50) E confianca >= 80%:
     - Atualiza `accounts_receivable` com `status: recebido`, `confirmed_by: ia`
     - Atualiza `sales` com `status: finalizado`
     - Toast de sucesso
   - Se nao confere:
     - Salva comprovante mas mantem `status: pendente`
     - Toast de alerta para verificacao manual
7. **Contas a Receber** exibe badge azul "Recebido por I.A." com icone de robo

---

## 11. Arquivos Envolvidos

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/pages/sales/SalesList.tsx` | UI do botao, dialog, logica de validacao |
| `supabase/functions/analyze-receipt/index.ts` | Analise de imagem com Gemini |
| `src/pages/financial/AccountsReceivable.tsx` | Exibicao de baixas e badges |
| `src/contexts/FinancialContext.tsx` | CRUD de contas a receber |
| `src/types/financial.ts` | Tipos TypeScript |


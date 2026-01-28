

# Documentacao Completa das Logicas do Sistema Cezar

Este documento detalha todas as logicas de negocio, fluxos de dados e padroes de implementacao do sistema para que voce possa recria-lo em um novo projeto Lovable com Supabase externo.

---

## 1. Arquitetura de Autenticacao

### 1.1 Fluxo de Login (Edge Function: auth-login)

```text
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Login Form    │────▶│  auth-login      │────▶│   app_users     │
│ (accessCode +   │     │  Edge Function   │     │   (database)    │
│  password)      │     └──────────────────┘     └─────────────────┘
└─────────────────┘              │
                                 ▼
                    ┌──────────────────────────┐
                    │ Token JWT-like (base64)  │
                    │ Expira em 24 horas       │
                    │ Armazenado em localStorage│
                    └──────────────────────────┘
```

**Logica de Senha (PBKDF2)**:
- Hash: SHA-256 com 100.000 iteracoes
- Salt: 16 bytes aleatorios
- Formato armazenado: `pbkdf2:{salt_hex}:{hash_hex}`
- Migracaso automatica: senhas legadas (texto plano) sao hasheadas no primeiro login

**Geracao de Token**:
```javascript
function generateToken(userId, accessCode) {
  const payload = {
    userId,
    accessCode,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  };
  return btoa(JSON.stringify(payload));
}
```

### 1.2 Verificacao de Token (Edge Function: auth-verify)

- Decodifica token base64
- Verifica expiracao (`payload.exp < Date.now()`)
- Consulta `app_users` para confirmar usuario ativo
- Retorna dados do usuario + role + permissions

### 1.3 Redirecionamento por Role

| Role | Rota de Destino |
|------|-----------------|
| motorista | /motorista |
| operador | /operador |
| outros | / (dashboard) |

---

## 2. Sistema de Vendas

### 2.1 Numeracao Sequencial

**Pedidos**: `00001`, `00002`, ... (5 digitos)
```javascript
const getNextSaleNumber = () => {
  const pedidos = sales.filter(s => s.type === 'pedido');
  const numbers = pedidos.map(s => parseInt(s.number)).filter(n => !isNaN(n));
  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  return String(maxNumber + 1).padStart(5, '0');
};
```

**Orcamentos**: `ORC-00001`, `ORC-00002`, ...
```javascript
const getNextQuoteNumber = () => {
  const orcamentos = sales.filter(s => s.type === 'orcamento');
  const match = s.number.match(/ORC-(\d+)/);
  // Extrai numero e incrementa
};
```

### 2.2 Calculo de Peso

```javascript
const calculateItemWeight = (quantity, unit, density) => {
  if ((unit === 'M³' || unit === 'M3') && density) {
    return quantity * density; // Peso em Kg
  } else if (unit === 'KG') {
    return quantity;
  }
  return 0;
};
```

### 2.3 Calculo de Desconto Automatico

- **originalPrice**: Preco cadastrado do produto
- **unitPrice**: Preco praticado (editavel pelo vendedor)
- **Desconto**: `(originalPrice - unitPrice) * quantity`

```javascript
const updateItemUnitPrice = (itemId, newPrice) => {
  const calculatedDiscount = (item.originalPrice - newPrice) * item.quantity;
  return { 
    unitPrice: newPrice, 
    discount: Math.max(0, calculatedDiscount),
    total: item.quantity * newPrice 
  };
};
```

### 2.4 Condicoes de Pagamento

**A Vista** (status = 'finalizado' imediato):
- Dinheiro
- PIX
- Deposito

**A Prazo** (status = 'pendente', gera Conta a Receber):
- Boleto
- Cartao no Credito
- Carteira
- Permuta
- Cartao de Debito

### 2.5 Analise de Comprovante por IA (PIX/Deposito)

```text
Comprovante (foto) ──▶ analyze-receipt ──▶ Gemini 2.5 Flash
                                               │
                                               ▼
                              ┌────────────────────────────┐
                              │ Extrai: banco, valor, data │
                              │ Confianca >= 0.8?          │
                              │ Valor confere (+-R$0.50)?  │
                              └────────────────────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
            Auto-confirmado              Divergencia                 Baixa confianca
          confirmed_by: 'ia'          Alerta ao usuario           Verificacao manual
          status: 'recebido'
```

### 2.6 Soft Delete de Vendas

- Nao exclui do banco, muda `status` para 'cancelado'
- Grava motivo nas `notes`: `[EXCLUIDO]: {reason}`
- Registra em `sales_deletions` para auditoria

---

## 3. Sistema Financeiro

### 3.1 Contas a Receber

**Criacao automatica**: Ao salvar pedido, cria registro em `accounts_receivable`

**Campos**:
- `original_amount`: Valor da venda
- `interest_penalty`: Juros/multas (default 0)
- `final_amount`: `original_amount + interest_penalty`
- `status`: 'pendente' | 'recebido'
- `confirmed_by`: 'manual' | 'ia'

**Fluxo de Baixa**:
```javascript
const confirmReceipt = async (id, data) => {
  const finalAmount = originalAmount + data.interestPenalty;
  await supabase.from('accounts_receivable').update({
    status: 'recebido',
    receiving_account_id: data.receivingAccountId,
    interest_penalty: data.interestPenalty,
    final_amount: finalAmount,
    receipt_date: data.receiptDate,
    confirmed_by: data.confirmedBy || 'manual',
  }).eq('id', id);
  
  // Atualiza status da venda
  await supabase.from('sales').update({ status: 'finalizado' }).eq('id', saleId);
};
```

### 3.2 Contas a Pagar

**Geracao de Parcelas**:
```javascript
const addAccountPayable = async (data) => {
  const { amount, installments, dueDate, daysBetween } = data;
  const baseAmount = Math.floor((amount / installments) * 100) / 100;
  const remainder = Math.round((amount - (baseAmount * (installments - 1))) * 100) / 100;
  
  let currentDate = new Date(dueDate);
  
  for (let i = 1; i <= installments; i++) {
    const instAmount = i === installments ? remainder : baseAmount;
    // Insere parcela com:
    // - due_date: currentDate
    // - installment_number: i
    // - total_installments: installments
    currentDate.setDate(currentDate.getDate() + daysBetween);
  }
};
```

---

## 4. Sistema de Permuta (Barter)

### 4.1 Campos do Cliente

| Campo | Descricao |
|-------|-----------|
| has_barter | Cliente usa permuta (boolean) |
| barter_credit | Saldo disponivel (positivo) |
| barter_limit | Limite de debito permitido (negativo) |
| barter_notes | Observacoes |

### 4.2 Logica de Venda com Permuta

1. Vendedor seleciona pagamento "Permuta"
2. Sistema verifica `barter_credit >= total_venda`
3. Se OK: Debita do `barter_credit`
4. Se nao: Alerta que excede limite

---

## 5. Modulo de Operacao

### 5.1 Painel do Operador

**Estatisticas carregadas**:
- Carregamentos hoje (order_loadings do usuario)
- Abastecimentos do mes (fuel_entries do usuario)
- Checklist diario completo?

**Lembrete automatico**: Se checklist nao foi feito hoje, exibe modal de alerta

### 5.2 Verificacao de Peso por IA (analyze-ticket)

```text
Foto do Ticket ──▶ analyze-ticket ──▶ Gemini 2.5 Flash
                                           │
                                           ▼
                         Extrai: peso_bruto, peso_liquido, tara, data_hora
                                           │
                                           ▼
                         Compara peso_liquido vs peso_esperado (totalWeight da venda)
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    ▼                      ▼                      ▼
              Diferenca < 5%         5% <= Dif <= 10%       Diferenca > 10%
               Aprovado                Alerta                   Erro
               (verde)               (amarelo)               (vermelho)
```

**Feedback por Voz**: Usa Web Speech API para anunciar resultado

### 5.3 Checklist do Operador (28 campos)

Categorias inspecionadas:
- Motor e fluidos (oleo, arrefecimento)
- Sistema hidraulico (mangueiras, cilindros)
- Cacamba e articulacao
- Pneus e rodas
- Balanca (display, calibracao, sensores)
- Seguranca (cintos, extintor, alarme de re)

---

## 6. Modulo de Motorista

### 6.1 Parte Diaria

**Campos**:
- vehicle_plate, customer_name, order_number
- km_initial, km_final, freight_value
- observation, signature

**Auto-preenchimento de KM**:
```javascript
const loadLastKm = async () => {
  const { data } = await supabase
    .from('daily_reports')
    .select('km_final')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (data?.km_final) {
    setFormData(prev => ({ ...prev, km_initial: String(data.km_final) }));
  }
};
```

### 6.2 Multiplicadores de Frete por Placa

```javascript
const VEHICLE_PLATES = [
  { plate: 'RSC7D05', multiplier: 6 },
  { plate: 'RSC5I45', multiplier: 6 },
  { plate: 'RSC3G57', multiplier: 6 },
  { plate: 'RSC3D46', multiplier: 6 },
  { plate: 'QWF1G05', multiplier: 12 },
  { plate: 'QWM1B96', multiplier: 12 },
  { plate: 'MWQ5551', multiplier: 12 },
  { plate: 'QWE3E38', multiplier: 12 },
];

const getPlateMultiplier = (plate) => {
  const found = VEHICLE_PLATES.find(v => v.plate === plate);
  return found?.multiplier ?? 6;
};
```

### 6.3 Checklist de Seguranca (21 itens)

Itens verificados:
- Nivel de agua/oleo/fluido
- Pneus (calibragem e estado)
- Farois, lanternas, setas
- Freios (servico e estacionamento)
- Itens de seguranca (cinto, extintor, triangulo)
- Documentacao

---

## 7. Sistema de Abastecimento

### 7.1 Campos do Formulario

- vehicle_id (Select de veiculos ativos)
- date
- odometer_value (KM ou Horimetro)
- liters
- fuel_type (diesel, gasolina, etanol)
- total_cost (R$)
- notes

### 7.2 Calculo Automatico de Preco/Litro

```javascript
const calculatePricePerLiter = () => {
  const totalCost = parseFloat(formData.total_cost);
  const liters = parseFloat(formData.liters);
  if (totalCost > 0 && liters > 0) {
    return totalCost / liters;
  }
  return null;
};
```

### 7.3 Visibilidade por Role

- **Diretor**: Ve todos os abastecimentos
- **Outros**: Ve apenas seus proprios registros

---

## 8. Importacao Inteligente de Dados

### 8.1 Tipos Suportados

| Tipo | Formatos | IA Usada |
|------|----------|----------|
| Clientes | Excel (.xlsx, .xls) | Gemini 2.5 Flash |
| Produtos | Excel (.xlsx, .xls) | Gemini 2.5 Flash |
| Vendas | Excel + PDF | Gemini 2.5 Flash |

### 8.2 Mapeamento de Colunas (Clientes)

```text
Coluna Excel              │ Campo Banco
──────────────────────────┼────────────────
CEP, Codigo Postal        │ zip_code
Endereco, Rua, Logradouro │ street
Numero, Num, No           │ number
Complemento               │ complement
Bairro                    │ neighborhood
Cidade, Municipio         │ city
Estado, UF                │ state
```

### 8.3 Normalizacao de Produtos (Vendas)

```javascript
// Variacoes normalizadas:
"N.1", "N 1", "NO.1", "NR.1" → "Nº1"
"SEIXO BRITADO N.1" → "SEIXO BRITADO Nº1"
```

### 8.4 Mapeamento de Pagamentos

```javascript
// A Vista
'PIX', 'Dinheiro', 'Cartão de Débito' → paymentType: 'vista'

// A Prazo
'Carteira', 'Vale', 'Boleto', 'Cartão de Crédito' → paymentType: 'prazo'
```

### 8.5 Pre-cadastro Automatico de Clientes

Se cliente nao existe pelo CPF/CNPJ durante importacao de vendas:
1. Cria registro basico com nome + documento
2. Atribui proximo codigo sequencial
3. Adiciona nota: "Cadastro criado via importacao automatica"

---

## 9. Assistente de IA (business-chat)

### 9.1 Consultas Disponiveis (Tools)

| Funcao | Descricao |
|--------|-----------|
| query_customers | Busca clientes, filtra por permuta |
| query_products | Busca produtos, filtra estoque critico |
| query_sales | Busca vendas por periodo/cliente/produto |
| query_financial | Contas a receber/pagar por status |
| query_suppliers | Busca fornecedores |

### 9.2 Formato de Resposta Obrigatorio

```markdown
**📍 Onde encontrar:**
[Caminho no sistema, ex: Menu: Cadastro → Clientes]

**📊 Resultado:**
[Dados encontrados]
```

### 9.3 Periodos de Consulta

```javascript
switch (period) {
  case "today": startDate = startOfDay; break;
  case "week": startDate = startOfWeek; break;
  case "month": startDate = startOfMonth; break;
  case "year": startDate = startOfYear; break;
}
```

---

## 10. Contextos React (State Management)

### 10.1 Hierarquia de Providers

```text
BrowserRouter
└── AuthProvider
    └── CompanyProvider
        └── CustomerProvider
            └── ProductProvider
                └── SalesProvider
                    └── FinancialProvider
                        └── SettingsProvider
                            └── SupplierProvider
                                └── App Routes
```

### 10.2 Padrao de Contexto

```javascript
const CustomerContext = createContext(undefined);

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchCustomers = async () => { /* ... */ };
  
  useEffect(() => { fetchCustomers(); }, []);
  
  return (
    <CustomerContext.Provider value={{
      customers,
      loading,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      getNextCustomerCode,
      refreshCustomers: fetchCustomers
    }}>
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (!context) throw new Error('useCustomers must be used within CustomerProvider');
  return context;
};
```

---

## 11. Edge Functions - Resumo

| Funcao | Autenticacao | Funcionalidade |
|--------|--------------|----------------|
| auth-login | Nao | Login e geracao de token |
| auth-verify | Sim (token) | Validacao de sessao |
| auth-hash-password | Sim (token) | Hash de novas senhas |
| business-chat | Sim (token) | Assistente IA com queries |
| analyze-ticket | Sim (token) | Leitura de tickets de pesagem |
| analyze-receipt | Nao | Analise de comprovantes bancarios |
| analyze-import | Nao | Mapeamento de dados para importacao |
| analyze-sales-pdf | Nao | Extracao de vendas de PDFs |

---

## 12. Storage Buckets

| Bucket | Uso |
|--------|-----|
| receipts | Comprovantes de pagamento (vendas) |
| ticket-images | Fotos de tickets de pesagem |
| expense-receipts | Comprovantes de despesas (motoristas) |
| fuel-receipts | Comprovantes de abastecimento |

---

## 13. Prompt Mestre para Novo Projeto

Use este prompt ao criar o novo projeto Lovable:

```
Crie um sistema de gestao comercial chamado "Sistema Cezar" com:

AUTENTICACAO:
- Login customizado via tabela app_users (nao usar Supabase Auth)
- Tabelas: app_users, user_roles (enum app_role), user_permissions
- Roles: diretor, gerente, vendedor, caixa, administrativo, motorista, operador
- Edge functions: auth-login (PBKDF2), auth-verify, auth-hash-password
- Token JWT-like em base64 com expiracao 24h
- Redirecionar motorista para /motorista, operador para /operador

VENDAS:
- Pedidos (numeracao 00001) e orcamentos (ORC-00001)
- Tabelas: sales, sale_items com calculo de peso (quantity * density para M3)
- Desconto automatico: (preco_cadastrado - preco_praticado) * quantidade
- Pagamentos A Vista (Dinheiro, PIX, Deposito) e A Prazo (Boleto, Cartao, Carteira, Permuta)
- Analise de comprovante por IA para PIX/Deposito com auto-baixa

FINANCEIRO:
- Contas a Receber criadas automaticamente ao salvar pedido
- Contas a Pagar com geracao de parcelas
- Campo confirmed_by para indicar baixa manual ou por IA

PERMUTA:
- Campos no cliente: has_barter, barter_credit, barter_limit, barter_notes
- Pagamento Permuta debita do saldo do cliente

OPERACAO:
- Painel do operador mobile-first
- Verificacao de peso por IA (analyze-ticket) com feedback por voz
- Checklist diario de maquinas (28 itens)
- Abastecimento com upload de comprovante

MOTORISTA:
- Parte diaria com KM inicial auto-preenchido do ultimo registro
- Checklist de seguranca (21 itens)
- Relatorio de manutencao
- Multiplicadores de frete por placa

IMPORTACAO:
- Excel para clientes, produtos, vendas
- PDF para vendas (analyze-sales-pdf)
- Normalizacao de nomes de produtos (N.1 → No1)
- Pre-cadastro automatico de clientes

ASSISTENTE IA:
- Edge function business-chat com tools para consultas
- Resposta sempre com "Onde encontrar" + "Resultado"
- Streaming de respostas

TECNOLOGIAS:
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL, Edge Functions, Storage)
- Recharts para graficos
- date-fns para datas
```

---

## Secao Tecnica: Detalhes de Implementacao

### Chaves de LocalStorage

```javascript
const SESSION_KEY = 'cezar_session';  // { id: userId }
const TOKEN_KEY = 'cezar_auth_token'; // Token base64
```

### Chamadas Autenticadas a Edge Functions

```javascript
const token = localStorage.getItem('cezar_auth_token');
const response = await fetch(`${SUPABASE_URL}/functions/v1/function-name`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

### Tratamento de Rate Limit (429)

```javascript
if (response.status === 429) {
  return { 
    error: "Limite de requisições excedido. Aguarde alguns segundos.",
    retryAfter: 10
  };
}
```


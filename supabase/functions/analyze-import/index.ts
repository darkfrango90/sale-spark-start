import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportData {
  type: 'customers' | 'products' | 'sales';
  data: Record<string, any>[];
  existingCustomers?: { id?: string; code: string; cpf_cnpj: string; name: string }[];
  existingProducts?: { id?: string; code: string; name: string; unit?: string; salePrice?: number }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, existingCustomers, existingProducts }: ImportData = await req.json();

    if (!data || data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum dado fornecido para análise' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Define schemas for each type
    const schemas = {
      customers: {
        required: ['name', 'cpf_cnpj', 'type', 'phone'],
        optional: ['code', 'trade_name', 'rg_ie', 'email', 'cellphone', 'zip_code', 'street', 'number', 'complement', 'neighborhood', 'city', 'state', 'birth_date', 'notes', 'has_barter', 'barter_credit', 'barter_limit', 'barter_notes'],
        validations: {
          type: ['fisica', 'juridica'],
          cpf_cnpj: 'CPF deve ter 11 dígitos, CNPJ deve ter 14 dígitos (apenas números)',
          phone: 'Telefone com DDD (10-11 dígitos)'
        }
      },
      products: {
        required: ['name', 'unit', 'sale_price'],
        optional: ['code', 'barcode', 'description', 'category', 'density', 'cost_price', 'stock', 'min_stock'],
        validations: {
          unit: ['UN', 'KG', 'MT', 'LT', 'CX', 'PC', 'ML', 'M2', 'M3'],
          sale_price: 'Deve ser um número positivo',
          cost_price: 'Deve ser um número positivo'
        }
      },
      sales: {
        required: ['customer_name', 'customer_cpf_cnpj', 'product_name', 'quantity', 'unit_price'],
        optional: ['seller_name', 'payment_method', 'notes'],
        validations: {
          quantity: 'Deve ser um número positivo',
          unit_price: 'Deve ser um número positivo',
          customer_cpf_cnpj: 'CPF deve ter 11 dígitos, CNPJ deve ter 14 dígitos'
        }
      }
    };

    const schema = schemas[type];
    const sampleData = data.slice(0, 10);

    // State mapping for normalization
    const stateMap: Record<string, string> = {
      'acre': 'AC', 'alagoas': 'AL', 'amapa': 'AP', 'amapá': 'AP', 'amazonas': 'AM',
      'bahia': 'BA', 'ceara': 'CE', 'ceará': 'CE', 'distrito federal': 'DF', 'espirito santo': 'ES',
      'espírito santo': 'ES', 'goias': 'GO', 'goiás': 'GO', 'maranhao': 'MA', 'maranhão': 'MA',
      'mato grosso': 'MT', 'mato grosso do sul': 'MS', 'minas gerais': 'MG', 'para': 'PA', 'pará': 'PA',
      'paraiba': 'PB', 'paraíba': 'PB', 'parana': 'PR', 'paraná': 'PR', 'pernambuco': 'PE',
      'piaui': 'PI', 'piauí': 'PI', 'rio de janeiro': 'RJ', 'rio grande do norte': 'RN',
      'rio grande do sul': 'RS', 'rondonia': 'RO', 'rondônia': 'RO', 'roraima': 'RR',
      'santa catarina': 'SC', 'sao paulo': 'SP', 'são paulo': 'SP', 'sergipe': 'SE',
      'tocantins': 'TO'
    };

    let systemPrompt = `Você é um assistente especializado em análise e mapeamento de dados para importação em banco de dados.
Sua tarefa é analisar dados de uma planilha Excel e mapear para o esquema do banco de dados.

TIPO DE IMPORTAÇÃO: ${type.toUpperCase()}

ESQUEMA DO BANCO DE DADOS:
- Campos obrigatórios: ${schema.required.join(', ')}
- Campos opcionais: ${schema.optional.join(', ')}
- Validações: ${JSON.stringify(schema.validations, null, 2)}
`;

    if (type === 'customers') {
      systemPrompt += `
REGRAS IMPORTANTES DE MAPEAMENTO DE ENDEREÇO:
- Colunas com "CEP", "Código Postal", "Cod Postal", "ZIP", "C.E.P." → mapear para "zip_code"
- Colunas com "Endereço", "Logradouro", "Rua", "Avenida", "Av.", "Endereco" → mapear para "street"
- Colunas com "Número", "Num", "Nº", "No", "N°", "Numero" → mapear para "number"
- Colunas com "Complemento", "Comp", "Apto", "Apartamento", "Bloco" → mapear para "complement"
- Colunas com "Bairro" → mapear para "neighborhood"
- Colunas com "Cidade", "Município", "Municipio", "Localidade" → mapear para "city"
- Colunas com "Estado", "UF", "Unidade Federativa" → mapear para "state"

FORMATAÇÃO DE ENDEREÇO:
- CEP deve ter 8 dígitos, formatar como XXXXX-XXX (ex: 01310-100)
- Estado deve ser sigla de 2 letras maiúsculas (SP, RJ, MG, etc)
- Se o estado vier por extenso (São Paulo), converter para sigla (SP)
`;
      if (existingCustomers) {
        systemPrompt += `
CLIENTES EXISTENTES (para verificar duplicados):
${JSON.stringify(existingCustomers.slice(0, 50), null, 2)}
`;
      }
    }

    if (type === 'products' && existingProducts) {
      systemPrompt += `
PRODUTOS EXISTENTES (para verificar duplicados):
${JSON.stringify(existingProducts.slice(0, 50), null, 2)}
`;
    }

    if (type === 'sales') {
      systemPrompt += `
REGRAS ESPECIAIS PARA IMPORTAÇÃO DE VENDAS:

IGNORAR COMPLETAMENTE:
- Cabeçalhos de relatório (nome da empresa, CNPJ, endereço, telefone, etc.)
- Títulos de relatório ("Relatorio de Vendas", "Conferencia de Vendas", etc.)
- Linhas de filtros ("Período:", "Vendedor:", "Tipo:", etc.)
- Rodapés ("Maxdata Sistemas", paginação, etc.)
- Linhas de totalização ("Total Geral:", "Subtotal:", "Total de Venda:", etc.)
- Linhas vazias ou com apenas espaços

EXTRAIR APENAS:
- Linhas que contêm dados reais de vendas (cliente + produto + quantidade + preço)

MAPEAMENTO DE COLUNAS (estrutura do Excel):
- "Data" → sale_date (formato DD/MM/YYYY HH:MM:SS ou DD/MM/YYYY)
- Colunas com "Cliente", "Nome Cliente", "Nome", "Razão Social" → customer_name
- Colunas com "CPF", "CNPJ", "CPF/CNPJ", "CPF / CNPJ Cliente", "Documento" → customer_cpf_cnpj
- Colunas com "Produto", "Nome Produto", "Item", "Descrição", "Mercadoria" → product_name
- Colunas com "Qtd", "Quantidade", "Qt", "Qtde" → quantity
- Colunas com "Vlr. Un.", "Valor Unit.", "Valor Un", "Preço", "Unit", "Vlr.Un" → unit_price
- Colunas com "Vendedor", "Vendedora" → seller_name
- Colunas com "Cond.Pag", "Condição", "Pagamento", "Forma Pag", "Tipo Pagamento" → payment_method

NORMALIZAÇÃO DE NOMES DE PRODUTOS:
Ao buscar correspondência de produtos, normalize variações ANTES de comparar:
- "N." seguido de espaço ou número → "Nº" (ex: "SEIXO BRITADO N.1" = "SEIXO BRITADO Nº1")
- "N " seguido de número → "Nº" (ex: "SEIXO ROLADO N 0" = "SEIXO ROLADO Nº0")
- "NO." → "Nº"
- "NR." → "Nº"
- Remover espaços extras antes de números após "Nº"
- Ignorar acentos na comparação (AREIA MEDIA = AREIA MÉDIA)
- Ignorar diferenças de maiúsculas/minúsculas

REGRA CRÍTICA:
- Apenas CRIAR novos pedidos
- NÃO alterar banco de dados existente (produtos, clientes existentes)
- Se cliente não existir pelo CPF/CNPJ → marcar needs_customer_creation: true
- Se produto não for encontrado mesmo com normalização → marcar como error

VALIDAÇÃO COM DADOS EXISTENTES:
`;
      if (existingProducts && existingProducts.length > 0) {
        systemPrompt += `
PRODUTOS CADASTRADOS NO SISTEMA (buscar por nome similar, usar normalização):
${JSON.stringify(existingProducts.slice(0, 100).map(p => ({ name: p.name, code: p.code })), null, 2)}

- Se o produto da planilha NÃO corresponder a nenhum produto existente (mesmo após normalização) → marcar como "error" com issue "Produto não encontrado no sistema"
- Se corresponder → status "ready" e incluir matched_product_name com o nome do produto no sistema
`;
      }

      if (existingCustomers && existingCustomers.length > 0) {
        systemPrompt += `
CLIENTES CADASTRADOS NO SISTEMA (verificar se já existe):
${JSON.stringify(existingCustomers.slice(0, 100).map(c => ({ name: c.name, cpf_cnpj: c.cpf_cnpj })), null, 2)}

- Se cliente NÃO existir pelo CPF/CNPJ → marcar com status "ready" e flag "needs_customer_creation": true
- Se cliente existir → marcar com status "ready"
`;
      }
    }

    systemPrompt += `
REGRAS DE MAPEAMENTO:
1. Identifique qual coluna da planilha corresponde a qual campo do banco
2. Para clientes:
   - Se CPF/CNPJ tem 11 dígitos → type = "fisica"
   - Se CPF/CNPJ tem 14 dígitos → type = "juridica"
   - Telefone deve ter DDD (adicione se faltar, baseado na cidade/estado)
   - Formate CPF como apenas números (remova pontos e traços)
   - IMPORTANTE: Mapeie TODOS os campos de endereço encontrados
3. Para produtos:
   - Normalize unidades: "unid"/"unidade" → "UN", "quilo" → "KG", "metro cubico" → "M3"
   - Preços devem ser números (remova "R$", pontos de milhar, troque vírgula por ponto)
4. Para vendas:
   - Identifique cliente pelo nome e CPF/CNPJ
   - Identifique produto pelo nome (buscar correspondência no sistema)
   - Extraia quantidade e valor unitário
   - IGNORE linhas que não são dados de vendas (cabeçalhos, totais, etc.)

RESPOSTA OBRIGATÓRIA EM JSON:
{
  "columnMapping": [
    { "excelColumn": "Nome da Coluna Excel", "dbField": "campo_banco", "confidence": 0.95 }
  ],
  "items": [
    {
      "row": 1,
      "originalData": { dados originais },
      "mappedData": { dados mapeados para o banco },
      "status": "ready" | "needs_correction" | "error",
      "needs_customer_creation": false,
      "matched_product_name": "nome do produto encontrado no sistema (se for venda)",
      "issues": [
        {
          "field": "campo",
          "problem": "descrição do problema",
          "currentValue": "valor atual",
          "suggestedValue": "valor sugerido",
          "severity": "warning" | "error",
          "canAutoFix": true | false
        }
      ]
    }
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Analise estes dados da planilha e retorne o mapeamento e validação:\n\n${JSON.stringify(sampleData, null, 2)}\n\nTotal de linhas: ${data.length}\n\nRetorne APENAS o JSON, sem markdown.`
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`Erro na API de IA: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    // Parse the JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Falha ao interpretar resposta da IA');
    }

    // Process remaining rows using the column mapping
    if (data.length > 10 && analysis.columnMapping) {
      const additionalItems = [];
      
      for (let i = 10; i < data.length; i++) {
        const row = data[i];
        const mappedData: Record<string, any> = {};
        const issues: any[] = [];
        
        // Map columns based on AI's mapping
        for (const mapping of analysis.columnMapping) {
          if (row[mapping.excelColumn] !== undefined) {
            mappedData[mapping.dbField] = row[mapping.excelColumn];
          }
        }
        
        // Basic validation
        let status = 'ready';
        let needsCustomerCreation = false;
        let matchedProductName = null;
        
        if (type === 'customers') {
          // Validate CPF/CNPJ
          const cpfCnpj = mappedData.cpf_cnpj?.toString().replace(/\D/g, '');
          if (cpfCnpj && cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
            issues.push({
              field: 'cpf_cnpj',
              problem: 'CPF/CNPJ com formato inválido',
              currentValue: mappedData.cpf_cnpj,
              suggestedValue: null,
              severity: 'error',
              canAutoFix: false
            });
            status = 'error';
          } else {
            mappedData.cpf_cnpj = cpfCnpj;
            mappedData.type = cpfCnpj?.length === 11 ? 'fisica' : 'juridica';
          }
          
          // Check for missing required fields
          if (!mappedData.name) {
            issues.push({
              field: 'name',
              problem: 'Nome é obrigatório',
              currentValue: null,
              suggestedValue: null,
              severity: 'error',
              canAutoFix: false
            });
            status = 'error';
          }
          
          if (!mappedData.phone) {
            issues.push({
              field: 'phone',
              problem: 'Telefone é obrigatório',
              currentValue: null,
              suggestedValue: null,
              severity: 'warning',
              canAutoFix: false
            });
            if (status !== 'error') status = 'needs_correction';
          }

          // Validate and format ZIP code (CEP)
          if (mappedData.zip_code) {
            const cep = mappedData.zip_code.toString().replace(/\D/g, '');
            if (cep.length === 8) {
              mappedData.zip_code = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
            } else if (cep.length > 0 && cep.length !== 8) {
              issues.push({
                field: 'zip_code',
                problem: 'CEP deve ter 8 dígitos',
                currentValue: mappedData.zip_code,
                suggestedValue: cep.length < 8 ? cep.padStart(8, '0').replace(/(\d{5})(\d{3})/, '$1-$2') : null,
                severity: 'warning',
                canAutoFix: cep.length < 8
              });
              if (status !== 'error') status = 'needs_correction';
            }
          }

          // Normalize state to 2-letter abbreviation
          if (mappedData.state) {
            const normalizedState = mappedData.state.toString().toLowerCase().trim();
            if (stateMap[normalizedState]) {
              mappedData.state = stateMap[normalizedState];
            } else if (mappedData.state.length === 2) {
              mappedData.state = mappedData.state.toUpperCase();
            } else if (mappedData.state.length > 2) {
              issues.push({
                field: 'state',
                problem: 'Estado não reconhecido',
                currentValue: mappedData.state,
                suggestedValue: null,
                severity: 'warning',
                canAutoFix: false
              });
              if (status !== 'error') status = 'needs_correction';
            }
          }

          // Clean up street/number/complement
          if (mappedData.street) {
            mappedData.street = mappedData.street.toString().trim();
          }
          if (mappedData.number) {
            mappedData.number = mappedData.number.toString().trim();
          }
          if (mappedData.complement) {
            mappedData.complement = mappedData.complement.toString().trim();
          }
          if (mappedData.neighborhood) {
            mappedData.neighborhood = mappedData.neighborhood.toString().trim();
          }
          if (mappedData.city) {
            mappedData.city = mappedData.city.toString().trim();
          }
        }
        
        if (type === 'products') {
          // Normalize unit
          const unitMap: Record<string, string> = {
            'unid': 'UN', 'unidade': 'UN', 'und': 'UN',
            'quilo': 'KG', 'quilos': 'KG', 'kg': 'KG',
            'metro': 'MT', 'metros': 'MT', 'm': 'MT',
            'litro': 'LT', 'litros': 'LT', 'l': 'LT',
            'caixa': 'CX', 'caixas': 'CX', 'cx': 'CX',
            'peca': 'PC', 'peças': 'PC', 'pç': 'PC',
            'm2': 'M2', 'm²': 'M2', 'metro quadrado': 'M2',
            'm3': 'M3', 'm³': 'M3', 'metro cubico': 'M3', 'metro cúbico': 'M3'
          };
          
          const rawUnit = mappedData.unit?.toString().toLowerCase().trim();
          if (rawUnit && unitMap[rawUnit]) {
            mappedData.unit = unitMap[rawUnit];
          } else if (rawUnit && !['UN', 'KG', 'MT', 'LT', 'CX', 'PC', 'ML', 'M2', 'M3'].includes(mappedData.unit?.toUpperCase())) {
            issues.push({
              field: 'unit',
              problem: `Unidade "${mappedData.unit}" não reconhecida`,
              currentValue: mappedData.unit,
              suggestedValue: 'UN',
              severity: 'warning',
              canAutoFix: true
            });
            if (status !== 'error') status = 'needs_correction';
          }
          
          // Parse price
          if (mappedData.sale_price) {
            const priceStr = mappedData.sale_price.toString()
              .replace('R$', '')
              .replace(/\./g, '')
              .replace(',', '.')
              .trim();
            const price = parseFloat(priceStr);
            if (isNaN(price) || price <= 0) {
              issues.push({
                field: 'sale_price',
                problem: 'Preço inválido',
                currentValue: mappedData.sale_price,
                suggestedValue: null,
                severity: 'error',
                canAutoFix: false
              });
              status = 'error';
            } else {
              mappedData.sale_price = price;
            }
          }
        }

        if (type === 'sales') {
          // Validate required fields
          if (!mappedData.customer_name) {
            issues.push({
              field: 'customer_name',
              problem: 'Nome do cliente é obrigatório',
              currentValue: null,
              suggestedValue: null,
              severity: 'error',
              canAutoFix: false
            });
            status = 'error';
          }

          if (!mappedData.product_name) {
            issues.push({
              field: 'product_name',
              problem: 'Nome do produto é obrigatório',
              currentValue: null,
              suggestedValue: null,
              severity: 'error',
              canAutoFix: false
            });
            status = 'error';
          }

          // Parse and validate quantity
          if (mappedData.quantity) {
            const qty = parseFloat(mappedData.quantity.toString().replace(',', '.'));
            if (isNaN(qty) || qty <= 0) {
              issues.push({
                field: 'quantity',
                problem: 'Quantidade inválida',
                currentValue: mappedData.quantity,
                suggestedValue: null,
                severity: 'error',
                canAutoFix: false
              });
              status = 'error';
            } else {
              mappedData.quantity = qty;
            }
          } else {
            issues.push({
              field: 'quantity',
              problem: 'Quantidade é obrigatória',
              currentValue: null,
              suggestedValue: null,
              severity: 'error',
              canAutoFix: false
            });
            status = 'error';
          }

          // Parse and validate unit price
          if (mappedData.unit_price) {
            const priceStr = mappedData.unit_price.toString()
              .replace('R$', '')
              .replace(/\./g, '')
              .replace(',', '.')
              .trim();
            const price = parseFloat(priceStr);
            if (isNaN(price) || price <= 0) {
              issues.push({
                field: 'unit_price',
                problem: 'Preço unitário inválido',
                currentValue: mappedData.unit_price,
                suggestedValue: null,
                severity: 'error',
                canAutoFix: false
              });
              status = 'error';
            } else {
              mappedData.unit_price = price;
            }
          } else {
            issues.push({
              field: 'unit_price',
              problem: 'Preço unitário é obrigatório',
              currentValue: null,
              suggestedValue: null,
              severity: 'error',
              canAutoFix: false
            });
            status = 'error';
          }

          // Validate CPF/CNPJ
          if (mappedData.customer_cpf_cnpj) {
            const cpfCnpj = mappedData.customer_cpf_cnpj.toString().replace(/\D/g, '');
            if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
              issues.push({
                field: 'customer_cpf_cnpj',
                problem: 'CPF/CNPJ com formato inválido',
                currentValue: mappedData.customer_cpf_cnpj,
                suggestedValue: null,
                severity: 'error',
                canAutoFix: false
              });
              status = 'error';
            } else {
              mappedData.customer_cpf_cnpj = cpfCnpj;
            }
          }

          // Check if product exists using intelligent matching
          if (status !== 'error' && existingProducts && mappedData.product_name) {
            const normalizeProductName = (name: string): string => {
              if (!name) return '';
              return name
                .toUpperCase()
                .trim()
                .replace(/\bN\.\s*/gi, 'Nº')
                .replace(/\bN\s+(\d)/gi, 'Nº$1')
                .replace(/\bNO\.\s*/gi, 'Nº')
                .replace(/\bNR\.\s*/gi, 'Nº')
                .replace(/\bNUM\.\s*/gi, 'Nº')
                .replace(/Nº\s+(\d)/g, 'Nº$1')
                .replace(/\s+/g, ' ')
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .trim();
            };

            const normalizedInput = normalizeProductName(mappedData.product_name.toString());
            
            // 1. Try exact match after normalization
            let matchedProduct = existingProducts.find(p => 
              normalizeProductName(p.name) === normalizedInput
            );
            
            // 2. Try inclusion match
            if (!matchedProduct) {
              matchedProduct = existingProducts.find(p => {
                const normalizedExisting = normalizeProductName(p.name);
                return normalizedExisting.includes(normalizedInput) || 
                       normalizedInput.includes(normalizedExisting);
              });
            }
            
            // 3. Try keyword matching (at least 2 words match)
            if (!matchedProduct) {
              const inputWords = normalizedInput.split(' ').filter(w => w.length > 2);
              matchedProduct = existingProducts.find(p => {
                const existingWords = normalizeProductName(p.name).split(' ');
                const matches = inputWords.filter(w => existingWords.includes(w));
                return matches.length >= 2 || matches.length === inputWords.length;
              });
            }
            
            if (!matchedProduct) {
              issues.push({
                field: 'product_name',
                problem: 'Produto não encontrado no sistema',
                currentValue: mappedData.product_name,
                suggestedValue: null,
                severity: 'error',
                canAutoFix: false
              });
              status = 'error';
            } else {
              matchedProductName = matchedProduct.name;
            }
          }

          // Check if customer exists
          if (status !== 'error' && existingCustomers && mappedData.customer_cpf_cnpj) {
            const cpfCnpjClean = mappedData.customer_cpf_cnpj.toString().replace(/\D/g, '');
            const existingCustomer = existingCustomers.find(c => 
              c.cpf_cnpj?.replace(/\D/g, '') === cpfCnpjClean
            );
            
            if (!existingCustomer) {
              needsCustomerCreation = true;
            }
          }
        }
        
        const itemData: any = {
          row: i + 1,
          originalData: row,
          mappedData,
          status,
          issues
        };

        if (type === 'sales') {
          itemData.needs_customer_creation = needsCustomerCreation;
          if (matchedProductName) {
            itemData.matched_product_name = matchedProductName;
          }
        }
        
        additionalItems.push(itemData);
      }
      
      analysis.items = [...analysis.items, ...additionalItems];
    }

    // Calculate summary
    const summary = {
      total: analysis.items.length,
      ready: analysis.items.filter((i: any) => i.status === 'ready').length,
      needsCorrection: analysis.items.filter((i: any) => i.status === 'needs_correction').length,
      hasError: analysis.items.filter((i: any) => i.status === 'error').length
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        columnMapping: analysis.columnMapping,
        items: analysis.items,
        summary 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in analyze-import:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao analisar dados';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

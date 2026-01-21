import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportData {
  type: 'customers' | 'products' | 'sales';
  data: Record<string, any>[];
  existingCustomers?: { code: string; cpf_cnpj: string; name: string }[];
  existingProducts?: { code: string; name: string }[];
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
        required: ['customer_name', 'items', 'total'],
        optional: ['number', 'customer_cpf_cnpj', 'payment_method', 'notes', 'status'],
        validations: {
          items: 'Lista de itens com produto, quantidade e preço',
          status: ['pendente', 'finalizado', 'cancelado']
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

  const systemPrompt = `Você é um assistente especializado em análise e mapeamento de dados para importação em banco de dados.
Sua tarefa é analisar dados de uma planilha Excel e mapear para o esquema do banco de dados.

TIPO DE IMPORTAÇÃO: ${type.toUpperCase()}

ESQUEMA DO BANCO DE DADOS:
- Campos obrigatórios: ${schema.required.join(', ')}
- Campos opcionais: ${schema.optional.join(', ')}
- Validações: ${JSON.stringify(schema.validations, null, 2)}

${type === 'customers' ? `
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
` : ''}

${type === 'customers' && existingCustomers ? `
CLIENTES EXISTENTES (para verificar duplicados):
${JSON.stringify(existingCustomers.slice(0, 50), null, 2)}
` : ''}

${type === 'products' && existingProducts ? `
PRODUTOS EXISTENTES (para verificar duplicados):
${JSON.stringify(existingProducts.slice(0, 50), null, 2)}
` : ''}

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
   - Identifique cliente pelo nome ou CPF/CNPJ
   - Identifique produtos pelo nome ou código

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
        
        additionalItems.push({
          row: i + 1,
          originalData: row,
          mappedData,
          status,
          issues
        });
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

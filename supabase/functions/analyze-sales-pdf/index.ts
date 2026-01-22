import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SaleItem {
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface ExtractedSale {
  customer_code: string;
  customer_name: string;
  customer_cpf_cnpj: string;
  sale_code: string;
  sale_date: string;
  seller_name: string;
  payment_method: string;
  items: SaleItem[];
  total: number;
}

interface ExistingProduct {
  id: string;
  code: string;
  name: string;
  unit: string;
  salePrice: number;
}

interface ExistingCustomer {
  id: string;
  code: string;
  cpf_cnpj: string;
  name: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64, existingProducts, existingCustomers } = await req.json();

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'PDF base64 é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'LOVABLE_API_KEY não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing PDF for sales extraction...');
    console.log(`Existing products: ${existingProducts?.length || 0}`);
    console.log(`Existing customers: ${existingCustomers?.length || 0}`);

    // Build product reference for AI
    const productList = (existingProducts || []).map((p: ExistingProduct) => 
      `Código: ${p.code} | Nome: ${p.name} | Preço: ${p.salePrice}`
    ).join('\n');

    const systemPrompt = `Você é um especialista em extração de dados de PDFs de vendas de materiais de construção.

TAREFA: Extrair TODAS as vendas do PDF, agrupando corretamente cada venda com seus itens.

ESTRUTURA DO PDF:
- Cada venda tem um CABEÇALHO com: Cód.Cli, Cliente, Venda, Data, Vendedor, Cond.Pag, CPF/CNPJ
- Abaixo do cabeçalho vêm as linhas de ITENS com: Cód.Int., Item, Vlr.Un., Qtd., Vlr.S.Desc
- Uma venda pode ter MÚLTIPLOS itens antes do próximo cabeçalho de venda

PRODUTOS CADASTRADOS NO SISTEMA (use Cód.Int. para corresponder):
${productList || 'Nenhum produto cadastrado - usar nomes como referência'}

REGRAS DE EXTRAÇÃO:
1. Identificar padrões de cabeçalho de venda (linha com Cód.Cli, Cliente, dados do cliente)
2. Coletar todos os itens abaixo até o próximo cabeçalho
3. Para cada item, usar Cód.Int. para vincular ao produto cadastrado
4. Ignorar: cabeçalhos de página, rodapés (ex: "Maxdata"), totalizadores gerais, linhas vazias
5. CPF deve ter 11 dígitos, CNPJ deve ter 14 dígitos (apenas números)
6. Data no formato DD/MM/YYYY ou YYYY-MM-DD
7. Valores monetários: converter vírgula para ponto (ex: 60,00 → 60.00)

CAMPOS A EXTRAIR POR VENDA:
- customer_code: Código do cliente (Cód.Cli)
- customer_name: Nome do cliente
- customer_cpf_cnpj: CPF ou CNPJ (apenas números)
- sale_code: Código da venda (ignorar na importação, mas extrair)
- sale_date: Data da venda (formato YYYY-MM-DD)
- seller_name: Nome do vendedor
- payment_method: Condição de pagamento (ex: CARTEIRA, PIX)
- items: Array de itens com:
  - product_code: Cód.Int. (código interno do produto)
  - product_name: Nome do item conforme PDF
  - quantity: Quantidade
  - unit_price: Valor unitário
  - total: Valor total do item
- total: Valor total da venda

IMPORTANTE: Retorne TODAS as vendas encontradas, mesmo que sejam muitas.`;

    const userPrompt = `Extraia todas as vendas deste PDF de relatório de vendas. 
O PDF contém múltiplas páginas com vendas de uma empresa de materiais de construção.
Agrupe corretamente cada venda com todos os seus itens.
Use o Cód.Int. para identificar os produtos no sistema.`;

    console.log('Calling AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_sales',
              description: 'Extrai todas as vendas do PDF com seus itens agrupados',
              parameters: {
                type: 'object',
                properties: {
                  sales: {
                    type: 'array',
                    description: 'Lista de todas as vendas extraídas do PDF',
                    items: {
                      type: 'object',
                      properties: {
                        customer_code: { type: 'string', description: 'Código do cliente' },
                        customer_name: { type: 'string', description: 'Nome do cliente' },
                        customer_cpf_cnpj: { type: 'string', description: 'CPF ou CNPJ apenas números' },
                        sale_code: { type: 'string', description: 'Código da venda no PDF' },
                        sale_date: { type: 'string', description: 'Data da venda YYYY-MM-DD' },
                        seller_name: { type: 'string', description: 'Nome do vendedor' },
                        payment_method: { type: 'string', description: 'Condição de pagamento' },
                        items: {
                          type: 'array',
                          description: 'Itens da venda',
                          items: {
                            type: 'object',
                            properties: {
                              product_code: { type: 'string', description: 'Cód.Int. do produto' },
                              product_name: { type: 'string', description: 'Nome do produto' },
                              quantity: { type: 'number', description: 'Quantidade' },
                              unit_price: { type: 'number', description: 'Valor unitário' },
                              total: { type: 'number', description: 'Valor total do item' }
                            },
                            required: ['product_code', 'product_name', 'quantity', 'unit_price', 'total']
                          }
                        },
                        total: { type: 'number', description: 'Valor total da venda' }
                      },
                      required: ['customer_name', 'customer_cpf_cnpj', 'seller_name', 'payment_method', 'items', 'total']
                    }
                  }
                },
                required: ['sales']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_sales' } }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'Créditos insuficientes. Adicione créditos à sua conta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Erro no gateway de IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    console.log('AI response received');

    // Extract tool call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'extract_sales') {
      console.error('Unexpected AI response format:', JSON.stringify(aiResponse));
      return new Response(
        JSON.stringify({ success: false, error: 'Formato de resposta inesperado da IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let extractedData: { sales: ExtractedSale[] };
    try {
      extractedData = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      return new Response(
        JSON.stringify({ success: false, error: 'Falha ao processar resposta da IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Extracted ${extractedData.sales?.length || 0} sales from PDF`);

    // Process and validate each sale
    const processedSales = [];
    const existingProductsMap = new Map<string, ExistingProduct>(
      (existingProducts || []).map((p: ExistingProduct) => [p.code, p])
    );
    const existingCustomersMap = new Map<string, ExistingCustomer>(
      (existingCustomers || []).map((c: ExistingCustomer) => [
        c.cpf_cnpj?.replace(/\D/g, ''), c
      ])
    );

    for (const sale of (extractedData.sales || [])) {
      const cpfCnpjClean = sale.customer_cpf_cnpj?.replace(/\D/g, '') || '';
      
      // Check if customer exists
      const existingCustomer = existingCustomersMap.get(cpfCnpjClean);
      const needsCustomerCreation = !existingCustomer && cpfCnpjClean.length >= 11;

      // Process items - match with existing products
      interface ProcessedItem {
        product_code: string;
        product_name: string;
        quantity: number;
        unit_price: number;
        total: number;
        product_id?: string;
        matched_product_code?: string;
        matched_product_name?: string;
        matched_unit?: string;
        status: 'ready' | 'error';
        error?: string;
      }
      
      const processedItems: ProcessedItem[] = [];
      let hasProductError = false;

      for (const item of (sale.items || [])) {
        const productCode = item.product_code?.toString().padStart(6, '0') || '';
        const existingProduct = existingProductsMap.get(productCode);
        
        // Also try without padding
        const existingProductAlt = !existingProduct 
          ? existingProductsMap.get(item.product_code?.toString() || '') 
          : null;
        
        const matchedProduct = existingProduct || existingProductAlt;

        if (matchedProduct) {
          processedItems.push({
            ...item,
            product_id: matchedProduct.id,
            matched_product_code: matchedProduct.code,
            matched_product_name: matchedProduct.name,
            matched_unit: matchedProduct.unit,
            status: 'ready'
          });
        } else {
          // Try to find by name similarity
          let foundByName: ExistingProduct | null = null;
          for (const [, prod] of existingProductsMap) {
            if (prod.name.toLowerCase().includes(item.product_name?.toLowerCase() || '') ||
                (item.product_name?.toLowerCase() || '').includes(prod.name.toLowerCase())) {
              foundByName = prod;
              break;
            }
          }

          if (foundByName) {
            processedItems.push({
              ...item,
              product_id: foundByName.id,
              matched_product_code: foundByName.code,
              matched_product_name: foundByName.name,
              matched_unit: foundByName.unit,
              status: 'ready'
            });
          } else {
            processedItems.push({
              ...item,
              status: 'error',
              error: `Produto não encontrado: Cód. ${item.product_code} - ${item.product_name}`
            });
            hasProductError = true;
          }
        }
      }

      processedSales.push({
        ...sale,
        customer_cpf_cnpj: cpfCnpjClean,
        existing_customer: existingCustomer || null,
        needs_customer_creation: needsCustomerCreation,
        items: processedItems,
        status: hasProductError ? 'error' : 'ready',
        errors: hasProductError ? processedItems.filter(i => i.status === 'error').map(i => i.error) : []
      });
    }

    // Build summary
    const summary = {
      total: processedSales.length,
      ready: processedSales.filter(s => s.status === 'ready').length,
      hasError: processedSales.filter(s => s.status === 'error').length,
      customersToCreate: processedSales.filter(s => s.needs_customer_creation).length,
      totalItems: processedSales.reduce((acc, s) => acc + s.items.length, 0)
    };

    console.log('Summary:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        sales: processedSales,
        summary
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing PDF:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido ao processar PDF' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

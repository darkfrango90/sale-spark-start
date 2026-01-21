import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image base64 is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing receipt image...');

    // Call Lovable AI Gateway with Gemini Flash for image analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em análise de comprovantes de pagamento bancário.
Analise a imagem do comprovante e extraia as informações de forma precisa.
Identifique: banco emissor, valor da transação, data/hora, tipo de transação (PIX, TED, DOC, Depósito).
Se a imagem não for um comprovante válido ou as informações estiverem ilegíveis, retorne confiança baixa.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              },
              {
                type: 'text',
                text: 'Extraia os dados deste comprovante de pagamento bancário. Use a função extract_receipt_data para retornar os dados estruturados.'
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_receipt_data',
              description: 'Extrai dados estruturados do comprovante de pagamento',
              parameters: {
                type: 'object',
                properties: {
                  banco: {
                    type: 'string',
                    description: 'Nome do banco emissor do comprovante (ex: Nubank, Itaú, Bradesco, Banco do Brasil, Caixa, Inter, Santander, C6 Bank, PicPay, Mercado Pago)'
                  },
                  valor: {
                    type: 'number',
                    description: 'Valor da transação em reais (apenas o número, sem R$)'
                  },
                  data_transacao: {
                    type: 'string',
                    description: 'Data e hora da transação no formato DD/MM/YYYY HH:MM (ou apenas DD/MM/YYYY se hora não disponível)'
                  },
                  tipo_transacao: {
                    type: 'string',
                    enum: ['PIX', 'TED', 'DOC', 'Depósito', 'Transferência', 'Outro'],
                    description: 'Tipo da transação identificada'
                  },
                  chave_pix: {
                    type: 'string',
                    description: 'Chave PIX do recebedor, se identificada (CPF, CNPJ, email, telefone ou chave aleatória)'
                  },
                  destinatario: {
                    type: 'string',
                    description: 'Nome do destinatário/recebedor da transação, se identificado'
                  },
                  confianca: {
                    type: 'number',
                    description: 'Nível de confiança na extração, de 0 a 1. Use 0.9+ para dados claros e completos, 0.7-0.9 para dados parciais, abaixo de 0.7 para incertos'
                  }
                },
                required: ['valor', 'confianca']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_receipt_data' } },
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze receipt' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('AI Response received');

    // Extract the function call result
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== 'extract_receipt_data') {
      console.error('No valid tool call in response');
      return new Response(
        JSON.stringify({ 
          error: 'Could not extract receipt data',
          banco: null,
          valor: null,
          data_transacao: null,
          tipo_transacao: null,
          confianca: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    console.log('Extracted data:', extractedData);

    return new Response(
      JSON.stringify({
        success: true,
        banco: extractedData.banco || null,
        valor: extractedData.valor || null,
        data_transacao: extractedData.data_transacao || null,
        tipo_transacao: extractedData.tipo_transacao || null,
        chave_pix: extractedData.chave_pix || null,
        destinatario: extractedData.destinatario || null,
        confianca: extractedData.confianca || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing receipt:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

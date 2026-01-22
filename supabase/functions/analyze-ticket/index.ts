import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TokenPayload {
  userId: string;
  accessCode: string;
  iat: number;
  exp: number;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const payload = JSON.parse(atob(token)) as TokenPayload;
    if (payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Autenticação necessária" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload) {
      return new Response(
        JSON.stringify({ error: "Token inválido ou expirado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      console.error("Missing imageBase64 parameter");
      return new Response(
        JSON.stringify({ error: "Missing image" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", payload.accessCode, "- Sending image to AI for analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um assistente especializado em ler tickets de pesagem de caminhões.
Analise a imagem do ticket e extraia os seguintes dados:
- Peso bruto (kg)
- Peso líquido (kg) 
- Tara (kg)
- Data e hora da pesagem

O peso líquido é o mais importante - é o peso da carga.
Se não conseguir identificar algum valor, retorne null para aquele campo.
Retorne também um nível de confiança de 0 a 1 para a leitura.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analise este ticket de pesagem e extraia os dados de peso."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_ticket_data",
              description: "Extrai os dados do ticket de pesagem",
              parameters: {
                type: "object",
                properties: {
                  peso_bruto_kg: {
                    type: "number",
                    description: "Peso bruto em quilogramas"
                  },
                  peso_liquido_kg: {
                    type: "number",
                    description: "Peso líquido em quilogramas (peso da carga)"
                  },
                  tara_kg: {
                    type: "number",
                    description: "Tara do veículo em quilogramas"
                  },
                  data_hora: {
                    type: "string",
                    description: "Data e hora da pesagem no formato DD/MM/YYYY HH:MM"
                  },
                  confianca: {
                    type: "number",
                    description: "Nível de confiança na leitura de 0 a 1"
                  }
                },
                required: ["peso_liquido_kg", "confianca"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_ticket_data" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes para análise de IA." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Erro ao analisar imagem" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received:", JSON.stringify(data, null, 2));

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response");
      return new Response(
        JSON.stringify({ 
          error: "Não foi possível ler o ticket. Tente tirar outra foto.",
          peso_liquido_kg: null,
          confianca: 0
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ticketData = JSON.parse(toolCall.function.arguments);
    console.log("Extracted ticket data:", ticketData);

    return new Response(
      JSON.stringify(ticketData),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-ticket:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

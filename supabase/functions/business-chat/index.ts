import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

const SYSTEM_PROMPT = `Você é um assistente inteligente do sistema de gestão. Seu objetivo é ajudar os usuários a encontrar informações sobre o negócio.

REGRA IMPORTANTE: Para TODA pergunta, você DEVE:
1. PRIMEIRO informar ONDE encontrar essa informação no sistema (menu/caminho)
2. DEPOIS apresentar o RESULTADO da consulta com os dados

Formato de resposta OBRIGATÓRIO:
**📍 Onde encontrar:**
[Informe o caminho no sistema, ex: Menu: Cadastro → Clientes → Buscar pelo nome]

**📊 Resultado:**
[Apresente os dados encontrados de forma clara e organizada]

Tabelas disponíveis para consulta:
- customers: clientes (nome, código, cpf_cnpj, permuta: has_barter, barter_credit, barter_limit)
- products: produtos (nome, código, estoque, preço)
- sales: vendas/pedidos/orçamentos (número, cliente, total, data, status, tipo: venda/orcamento/pedido)
  IMPORTANTE: Quando usuário perguntar "vendas do mês" ou similar de forma genérica, use type="all" para buscar todos os tipos.
- sale_items: itens de vendas (produto, quantidade, valor)
- suppliers: fornecedores
- accounts_receivable: contas a receber
- accounts_payable: contas a pagar
- vehicles: veículos

Mapeamento de caminhos no sistema:
- Clientes: Menu: Cadastro → Clientes
- Permuta de cliente: Menu: Cadastro → Clientes → [buscar cliente] → Ver permuta
- Produtos/Estoque: Menu: Cadastro → Produtos
- Vendas: Menu: Vendas → Lista de Vendas ou Menu: Relatórios → Vendas
- Financeiro: Menu: Financeiro → Contas a Receber / Contas a Pagar
- Fornecedores: Menu: Cadastro → Fornecedores
- Veículos: Menu: Operação → Veículos

Seja preciso, objetivo e sempre forneça dados numéricos quando disponíveis.
Use formatação em Real brasileiro (R$) para valores monetários.`;

const tools = [
  {
    type: "function",
    function: {
      name: "query_customers",
      description: "Busca informações de clientes, incluindo dados de permuta",
      parameters: {
        type: "object",
        properties: {
          search_term: { type: "string", description: "Nome, código ou CPF/CNPJ do cliente" },
          filter_barter: { type: "boolean", description: "Filtrar apenas clientes com permuta" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "query_products",
      description: "Busca informações de produtos e estoque",
      parameters: {
        type: "object",
        properties: {
          search_term: { type: "string", description: "Nome ou código do produto" },
          filter_critical: { type: "boolean", description: "Filtrar produtos com estoque crítico" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "query_sales",
      description: "Busca vendas/pedidos/orçamentos por período, cliente ou produto. Quando usuário pergunta 'vendas' de forma genérica, busque todos os tipos.",
      parameters: {
        type: "object",
        properties: {
          customer_name: { type: "string", description: "Nome do cliente" },
          product_name: { type: "string", description: "Nome do produto" },
          period: { type: "string", enum: ["today", "week", "month", "year"], description: "Período de busca" },
          type: { type: "string", enum: ["venda", "orcamento", "pedido", "all"], description: "Tipo específico ou 'all' para todos. Use 'all' quando usuário perguntar 'vendas' de forma genérica." }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "query_financial",
      description: "Busca informações financeiras: contas a receber e a pagar",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["receivable", "payable"], description: "Tipo: a receber ou a pagar" },
          status: { type: "string", enum: ["pendente", "pago", "vencido"], description: "Status da conta" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "query_suppliers",
      description: "Busca informações de fornecedores",
      parameters: {
        type: "object",
        properties: {
          search_term: { type: "string", description: "Nome ou código do fornecedor" }
        }
      }
    }
  }
];

async function executeQuery(supabase: any, toolName: string, args: any) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  switch (toolName) {
    case "query_customers": {
      let query = supabase.from("customers").select("*");
      if (args.search_term) {
        query = query.or(`name.ilike.%${args.search_term}%,code.ilike.%${args.search_term}%,cpf_cnpj.ilike.%${args.search_term}%`);
      }
      if (args.filter_barter) {
        query = query.eq("has_barter", true);
      }
      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    }

    case "query_products": {
      let query = supabase.from("products").select("*");
      if (args.search_term) {
        query = query.or(`name.ilike.%${args.search_term}%,code.ilike.%${args.search_term}%`);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      // PostgREST não permite comparar coluna com coluna diretamente (stock < min_stock).
      // Então filtramos no runtime quando solicitado.
      if (args.filter_critical && Array.isArray(data)) {
        return data.filter((p: any) => (p.stock ?? 0) < (p.min_stock ?? 0));
      }

      return data;
    }

    case "query_sales": {
      let query = supabase.from("sales").select(`
        *,
        sale_items (*)
      `);
      
      if (args.customer_name) {
        query = query.ilike("customer_name", `%${args.customer_name}%`);
      }
      // Only filter by type if specified and not "all"
      if (args.type && args.type !== "all") {
        query = query.eq("type", args.type);
      }
      if (args.period) {
        let startDate: Date;
        switch (args.period) {
          case "today": startDate = startOfDay; break;
          case "week": startDate = startOfWeek; break;
          case "month": startDate = startOfMonth; break;
          case "year": startDate = startOfYear; break;
          default: startDate = startOfMonth;
        }
        query = query.gte("created_at", startDate.toISOString());
      }
      
      query = query.not("status", "in", "(excluido,cancelado)");
      const { data, error } = await query.order("created_at", { ascending: false }).limit(50);
      if (error) throw error;

      // If searching for product, filter and aggregate
      if (args.product_name && data) {
        const productSearch = args.product_name.toLowerCase();
        let totalQty = 0;
        let totalValue = 0;
        let matchingSales: any[] = [];

        data.forEach((sale: any) => {
          const matchingItems = sale.sale_items?.filter((item: any) => 
            item.product_name.toLowerCase().includes(productSearch)
          ) || [];
          
          if (matchingItems.length > 0) {
            matchingItems.forEach((item: any) => {
              totalQty += item.quantity;
              totalValue += item.total;
            });
            matchingSales.push({
              ...sale,
              matching_items: matchingItems
            });
          }
        });

        return {
          sales: matchingSales,
          summary: {
            total_quantity: totalQty,
            total_value: totalValue,
            sales_count: matchingSales.length
          }
        };
      }

      return data;
    }

    case "query_financial": {
      const isPayable = args.type === "payable";
      const table = isPayable ? "accounts_payable" : "accounts_receivable";
      let query = supabase.from(table).select("*");

      // Observação: accounts_receivable não possui due_date no schema atual.
      // Para evitar erro, tratamos "vencido" em contas a receber como "pendente".
      if (args.status === "vencido") {
        if (isPayable) {
          query = query.eq("status", "pendente").lt("due_date", now.toISOString().split("T")[0]);
        } else {
          query = query.eq("status", "pendente");
        }
      } else if (args.status) {
        query = query.eq("status", args.status);
      }

      // Ordenação: payable tem due_date; receivable não.
      const orderColumn = isPayable ? "due_date" : "created_at";
      const { data, error } = await query.order(orderColumn, { ascending: true }).limit(50);
      if (error) throw error;

      const total = data?.reduce((sum: number, item: any) => sum + (item.final_amount || 0), 0) || 0;
      return { items: data, total, count: data?.length || 0 };
    }

    case "query_suppliers": {
      let query = supabase.from("suppliers").select("*");
      if (args.search_term) {
        query = query.or(`name.ilike.%${args.search_term}%,code.ilike.%${args.search_term}%`);
      }
      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data;
    }

    default:
      return null;
  }
}

serve(async (req) => {
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

    const { messages } = await req.json();
    
    // Priority: Google Gemini > OpenAI > Lovable AI
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    let apiKey: string;
    let apiUrl: string;
    let model: string;
    let provider: "google" | "openai" | "lovable";
    
    if (GOOGLE_API_KEY) {
      // Use Google Gemini API (OpenAI-compatible endpoint)
      apiKey = GOOGLE_API_KEY;
      apiUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
      model = "gemini-2.0-flash";
      provider = "google";
      console.log("Using Google Gemini API (user's paid plan)");
    } else if (OPENAI_API_KEY) {
      apiKey = OPENAI_API_KEY;
      apiUrl = "https://api.openai.com/v1/chat/completions";
      model = "gpt-4o";
      provider = "openai";
      console.log("Using OpenAI GPT-4o");
    } else if (LOVABLE_API_KEY) {
      apiKey = LOVABLE_API_KEY;
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      model = "google/gemini-3-flash-preview";
      provider = "lovable";
      console.log("Using Lovable AI (Gemini)");
    } else {
      throw new Error("Nenhuma API key configurada (GOOGLE_API_KEY, OPENAI_API_KEY ou LOVABLE_API_KEY)");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Authenticated user: ${payload.accessCode} - Model: ${model}`);

    // First request with tools
    const makeToolRequest = () =>
      fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
        tools,
        tool_choice: "auto"
      }),
    });

    let toolResponse = await makeToolRequest();

    // If Gemini hits 429 (often quota/rate), fallback to OpenAI or Lovable AI if available.
    if (!toolResponse.ok && toolResponse.status === 429 && provider === "google") {
      const errorText = await toolResponse.text();
      console.warn("Gemini returned 429, attempting fallback. Details:", errorText);

      if (OPENAI_API_KEY) {
        apiKey = OPENAI_API_KEY;
        apiUrl = "https://api.openai.com/v1/chat/completions";
        // cheaper + less likely to hit strict limits; you can switch to gpt-4o if desired
        model = "gpt-4o-mini";
        provider = "openai";
        toolResponse = await makeToolRequest();
      } else if (LOVABLE_API_KEY) {
        apiKey = LOVABLE_API_KEY;
        apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
        model = "google/gemini-3-flash-preview";
        provider = "lovable";
        toolResponse = await makeToolRequest();
      }
    }

    if (!toolResponse.ok) {
      const errorText = await toolResponse.text();
      console.error(`AI API error (${provider}):`, toolResponse.status, errorText);
      
      if (toolResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Limite de requisições da API excedido. Aguarde 10 segundos e tente novamente.",
          retryAfter: 10
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (toolResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Verifique sua conta no Google AI Studio." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Erro ao processar sua pergunta");
    }

    const toolResult = await toolResponse.json();
    const assistantMessage = toolResult.choices[0].message;

    console.log("AI response:", JSON.stringify(assistantMessage, null, 2));

    // Check if AI wants to call tools
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: any[] = [];

      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        console.log(`Executing tool: ${functionName}`, args);
        
        const result = await executeQuery(supabase, functionName, args);
        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(result)
        });
      }

      // Second request with tool results - now with streaming
      const finalResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
            assistantMessage,
            ...toolResults
          ],
          stream: true
        }),
      });

      if (!finalResponse.ok) {
        const errorText = await finalResponse.text();
        console.error("Final response error:", errorText);
        throw new Error("Erro ao gerar resposta final");
      }

      return new Response(finalResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tool calls, stream the direct response
    const streamResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
        stream: true
      }),
    });

    return new Response(streamResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("business-chat error:", error);
    const details = (() => {
      try {
        return typeof error === "object" ? JSON.stringify(error) : String(error);
      } catch {
        return "(unserializable error)";
      }
    })();

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido",
        details,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

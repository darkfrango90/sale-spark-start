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
    
    // Check expiration
    if (payload.exp < Date.now()) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Token de autenticação não fornecido", valid: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload) {
      return new Response(
        JSON.stringify({ error: "Token inválido ou expirado", valid: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user still exists and is active
    const { data: appUser, error: userError } = await supabase
      .from("app_users")
      .select("id, access_code, name, cpf, active")
      .eq("id", payload.userId)
      .eq("active", true)
      .single();

    if (userError || !appUser) {
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado ou inativo", valid: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", appUser.id)
      .single();

    // Get user permissions
    const { data: permissionsData } = await supabase
      .from("user_permissions")
      .select("module, actions")
      .eq("user_id", appUser.id);

    return new Response(
      JSON.stringify({
        valid: true,
        user: {
          id: appUser.id,
          accessCode: appUser.access_code,
          name: appUser.name,
          cpf: appUser.cpf,
          role: roleData?.role || "vendedor",
          permissions: permissionsData || [],
          active: appUser.active
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Token verification error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor", valid: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple JWT-like token generation using base64 encoding
function generateToken(userId: string, accessCode: string): string {
  const payload = {
    userId,
    accessCode,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  return btoa(JSON.stringify(payload));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accessCode, password } = await req.json();

    if (!accessCode || !password) {
      return new Response(
        JSON.stringify({ error: "Código de acesso e senha são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find user by access code
    const { data: appUser, error: userError } = await supabase
      .from("app_users")
      .select("id, access_code, password_hash, name, cpf, active")
      .eq("access_code", accessCode)
      .eq("active", true)
      .single();

    if (userError || !appUser) {
      return new Response(
        JSON.stringify({ error: "Código de acesso ou senha inválidos" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify password - support both bcrypt hash and legacy plain text
    let isValidPassword = false;
    
    // Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    if (appUser.password_hash.startsWith("$2")) {
      // Bcrypt hash - verify properly
      isValidPassword = await bcrypt.compare(password, appUser.password_hash);
    } else {
      // Legacy plain text password - compare directly and schedule for migration
      isValidPassword = appUser.password_hash === password;
      
      // If valid legacy password, hash it and update the database
      if (isValidPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await supabase
          .from("app_users")
          .update({ password_hash: hashedPassword })
          .eq("id", appUser.id);
          
        console.log(`Migrated password for user ${appUser.access_code} to bcrypt`);
      }
    }

    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ error: "Código de acesso ou senha inválidos" }),
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

    // Generate token
    const token = generateToken(appUser.id, appUser.access_code);

    return new Response(
      JSON.stringify({
        token,
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
    console.error("Login error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

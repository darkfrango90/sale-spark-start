import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeHex } from "https://deno.land/std@0.208.0/encoding/hex.ts";

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

// PBKDF2-based password hashing (compatible with Edge Functions)
async function hashPassword(password: string, existingSalt?: Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  const salt = existingSalt ? existingSalt : crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordData,
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  
  const hashArray = new Uint8Array(derivedBits);
  const saltHex = encodeHex(salt);
  const hashHex = encodeHex(hashArray);
  
  return `pbkdf2:${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Check if it's a PBKDF2 hash
  if (storedHash.startsWith("pbkdf2:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;
    
    const saltHex = parts[1];
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    
    const newHash = await hashPassword(password, salt);
    return newHash === storedHash;
  }
  
  // Legacy plain text comparison
  return storedHash === password;
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

    // Verify password
    const isValidPassword = await verifyPassword(password, appUser.password_hash);
    
    // If valid legacy password, hash it and update the database
    if (isValidPassword && !appUser.password_hash.startsWith("pbkdf2:")) {
      const hashedPassword = await hashPassword(password);
      
      await supabase
        .from("app_users")
        .update({ password_hash: hashedPassword })
        .eq("id", appUser.id);
        
      console.log(`Migrated password for user ${appUser.access_code} to PBKDF2`);
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

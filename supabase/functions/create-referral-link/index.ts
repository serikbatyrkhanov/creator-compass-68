import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-REFERRAL-LINK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");
    
    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    // Verify admin role
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
    
    if (roleError || !roleData) {
      throw new Error("Unauthorized - Admin access required");
    }
    logStep("Admin role verified");

    const body = await req.json();
    const { code, description, expiresAt, maxUses, metadata } = body;

    if (!code || !description) {
      throw new Error("Code and description are required");
    }

    // Validate code format
    const codeRegex = /^[a-z0-9-]+$/;
    if (!codeRegex.test(code) || code.length > 50) {
      throw new Error("Invalid code format. Use only lowercase letters, numbers, and hyphens (max 50 chars)");
    }

    logStep("Creating referral link", { code, description });

    const { data, error } = await supabaseClient
      .from('referral_links')
      .insert({
        code,
        description,
        created_by: userId,
        expires_at: expiresAt || null,
        max_uses: maxUses || null,
        metadata: metadata || {},
        is_active: true
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error("Referral code already exists");
      }
      throw error;
    }

    logStep("Referral link created successfully", { id: data.id });

    const origin = req.headers.get("origin") || "https://climbley.lovable.app";
    const fullUrl = `${origin}?ref=${code}`;

    return new Response(JSON.stringify({
      success: true,
      referralLink: {
        id: data.id,
        code: data.code,
        fullUrl,
        description: data.description
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
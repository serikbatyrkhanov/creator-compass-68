import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TRACK-REFERRAL-SIGNUP] ${step}${detailsStr}`);
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

    const body = await req.json();
    const { referralCode, ipAddress, userAgent } = body;

    if (!referralCode) {
      throw new Error("Referral code is required");
    }

    logStep("Looking up referral link", { referralCode });

    // Find referral link
    const { data: linkData, error: linkError } = await supabaseClient
      .from('referral_links')
      .select('*')
      .eq('code', referralCode)
      .single();

    if (linkError || !linkData) {
      logStep("Referral link not found", { referralCode });
      throw new Error("Invalid referral code");
    }

    // Check if active
    if (!linkData.is_active) {
      throw new Error("Referral link is inactive");
    }

    // Check if expired
    if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
      throw new Error("Referral link has expired");
    }

    // Check max uses
    if (linkData.max_uses && linkData.current_uses >= linkData.max_uses) {
      throw new Error("Referral link has reached maximum uses");
    }

    logStep("Referral link validated", { linkId: linkData.id });

    // Create referral signup record
    const { data: signupData, error: signupError } = await supabaseClient
      .from('referral_signups')
      .insert({
        referral_link_id: linkData.id,
        user_id: userId,
        ip_address: ipAddress || null,
        user_agent: userAgent || null
      })
      .select()
      .single();

    if (signupError) {
      if (signupError.code === '23505') {
        logStep("Signup already tracked", { userId, linkId: linkData.id });
        return new Response(JSON.stringify({
          success: true,
          message: "Signup already tracked"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      throw signupError;
    }

    // Increment current_uses
    await supabaseClient
      .from('referral_links')
      .update({ current_uses: linkData.current_uses + 1 })
      .eq('id', linkData.id);

    logStep("Referral signup tracked successfully", { signupId: signupData.id });

    return new Response(JSON.stringify({
      success: true,
      signupId: signupData.id
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
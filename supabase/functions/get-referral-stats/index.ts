import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-REFERRAL-STATS] ${step}${detailsStr}`);
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

    const url = new URL(req.url);
    const referralLinkId = url.searchParams.get('referralLinkId');

    logStep("Fetching referral stats", { referralLinkId });

    let query = supabaseClient
      .from('referral_signups')
      .select(`
        *,
        referral_link:referral_links(code, description)
      `);

    if (referralLinkId) {
      query = query.eq('referral_link_id', referralLinkId);
    }

    const { data: signups, error: signupsError } = await query;

    if (signupsError) throw signupsError;

    // Calculate stats
    const totalSignups = signups?.length || 0;
    const totalConversions = signups?.filter(s => s.converted_to_paid).length || 0;
    const conversionRate = totalSignups > 0 ? (totalConversions / totalSignups) * 100 : 0;

    // Group signups by date
    const signupsByDate = signups?.reduce((acc: Record<string, number>, signup) => {
      const date = new Date(signup.signup_date).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};

    const signupsOverTime = Object.entries(signupsByDate).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Get top links if not filtering by specific link
    let topLinks: Array<{ code: string; signups: number }> = [];
    if (!referralLinkId) {
      const { data: links, error: linksError } = await supabaseClient
        .from('referral_links')
        .select('id, code, current_uses')
        .order('current_uses', { ascending: false })
        .limit(10);

      if (!linksError && links) {
        topLinks = links.map(link => ({
          code: link.code,
          signups: link.current_uses
        }));
      }
    }

    return new Response(JSON.stringify({
      totalSignups,
      totalConversions,
      conversionRate: Math.round(conversionRate * 10) / 10,
      signupsOverTime,
      topLinks,
      signups: signups || []
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
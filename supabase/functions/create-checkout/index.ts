import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Get email from request body for non-authenticated signups
    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    logStep("Processing checkout for email", { email });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2025-08-27.basil" 
    });

    // Check if customer exists, create if not
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customer;
    
    if (customers.data.length > 0) {
      customer = customers.data[0];
      logStep("Existing customer found", { customerId: customer.id });
    } else {
      customer = await stripe.customers.create({ email });
      logStep("New customer created", { customerId: customer.id });
    }

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || "http://localhost:8080";

    // Create Checkout Session with trial period
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      line_items: [
        {
          price: "price_1SEvmHRzLvTDNnZmJm0o3nKV",
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${origin}/checkout-success`,
      cancel_url: `${origin}/auth`,
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ 
      url: session.url,
      customerId: customer.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

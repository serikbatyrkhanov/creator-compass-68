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
    logStep("Function started - create-checkout invoked");
    logStep("Request method", { method: req.method });
    logStep("Request headers", { 
      origin: req.headers.get("origin"),
      contentType: req.headers.get("content-type")
    });

    // Get email and name from request body for non-authenticated signups
    const body = await req.json();
    logStep("Request body received", { body });
    
    const { email, name } = body;
    
    if (!email) {
      logStep("ERROR: Email is missing from request");
      throw new Error("Email is required");
    }

    logStep("Processing checkout for email", { email });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found in environment");
      throw new Error("Stripe configuration error");
    }
    logStep("Stripe key found, initializing Stripe client");

    const stripe = new Stripe(stripeKey, { 
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
          price: "price_1SEvmURvCVnQCUeV3vP9GVhX",
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
      },
      metadata: name ? { name } : {},
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
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
    const errorStack = error instanceof Error ? error.stack : undefined;
    logStep("ERROR in create-checkout", { 
      message: errorMessage,
      stack: errorStack,
      error: error
    });
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Check edge function logs for more information"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

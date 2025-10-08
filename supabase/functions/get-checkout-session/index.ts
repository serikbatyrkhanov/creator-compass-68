import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-CHECKOUT-SESSION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started - get-checkout-session invoked");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not found in environment");
      throw new Error("Stripe configuration error");
    }
    logStep("Stripe key found, initializing Stripe client");

    const body = await req.json();
    const { session_id } = body;
    
    if (!session_id) {
      logStep("ERROR: session_id is missing from request");
      throw new Error("session_id is required");
    }

    logStep("Retrieving checkout session", { session_id });

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil" 
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    logStep("Session retrieved", { 
      sessionId: session.id, 
      status: session.status,
      customer: session.customer,
      customerEmail: session.customer_details?.email 
    });

    // Validate that the session is complete or paid
    if (session.status !== "complete" && session.payment_status !== "paid") {
      logStep("WARNING: Session not complete", { 
        status: session.status, 
        paymentStatus: session.payment_status 
      });
      throw new Error("Checkout session is not complete");
    }

    return new Response(JSON.stringify({ 
      email: session.customer_details?.email,
      status: session.status,
      customer: session.customer,
      subscription: session.subscription,
      metadata: session.metadata || {},
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logStep("ERROR in get-checkout-session", { 
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[SEND-TEST-SMS] Function started');

    // Verify Twilio credentials
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials not configured');
    }

    // Parse request body
    const { phoneNumber, message, isTest } = await req.json();

    if (!phoneNumber || !message) {
      throw new Error('Phone number and message are required');
    }

    console.log(`[SEND-TEST-SMS] Sending to ${phoneNumber}`);

    // Prepare message with test prefix if needed
    const finalMessage = isTest ? `[TEST] ${message}` : message;

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: phoneNumber,
        From: TWILIO_PHONE_NUMBER!,
        Body: finalMessage,
      }),
    });

    if (!twilioResponse.ok) {
      const error = await twilioResponse.text();
      console.error('[SEND-TEST-SMS] Twilio error:', error);
      throw new Error(`Twilio API error: ${error}`);
    }

    const result = await twilioResponse.json();
    console.log('[SEND-TEST-SMS] SMS sent successfully:', result.sid);

    return new Response(
      JSON.stringify({
        success: true,
        messageSid: result.sid,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[SEND-TEST-SMS] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

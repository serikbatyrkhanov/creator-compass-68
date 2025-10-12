import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating 7 trending titles for prompt:", prompt);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a creative content strategist specialized in generating viral, trending content titles. 
Generate exactly 7 unique, engaging, and trending content titles based on the user's topic or niche.

Guidelines:
- Make titles attention-grabbing and click-worthy
- Use trending formats like "How to...", "X Ways to...", "Why...", "The Ultimate Guide to..."
- Mix different content types: educational, entertaining, inspirational, controversial
- Consider current trends and what performs well on social media
- Make them specific and actionable
- Vary the length and style

Return ONLY a JSON array of 7 title strings, nothing else.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error("No content generated");
    }

    // Parse the JSON array from the response
    let titles: string[];
    try {
      // Remove markdown code blocks if present
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
      titles = JSON.parse(cleanedText);
      
      if (!Array.isArray(titles)) {
        throw new Error("Response is not an array");
      }
      
      // Ensure we have exactly 7 titles
      if (titles.length < 7) {
        console.warn(`Only ${titles.length} titles generated, expected 7`);
      }
      
      titles = titles.slice(0, 7); // Take only first 7
      
    } catch (parseError) {
      console.error("Failed to parse titles:", parseError);
      // Fallback: split by newlines and clean up
      titles = generatedText
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0 && !line.startsWith('#') && !line.startsWith('```'))
        .slice(0, 7);
    }

    console.log(`Successfully generated ${titles.length} titles`);

    return new Response(
      JSON.stringify({ titles }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-trending-titles function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

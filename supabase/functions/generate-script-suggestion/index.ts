import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, platform } = await req.json();

    console.log('[GENERATE-SCRIPT] Request:', { title, description, platform });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Platform-specific script structures
    const platformGuidelines: Record<string, string> = {
      'YouTube': 'Long-form video (8-15 minutes). Include detailed sections with timestamps. Focus on depth and value.',
      'TikTok': 'Short-form video (15-60 seconds). Fast-paced, hook within 1 second, quick payoff.',
      'Instagram': 'Reels format (15-90 seconds). Visual storytelling, text overlays, trendy audio.',
      'Shorts': 'Vertical short video (15-60 seconds). Similar to TikTok, quick hook and payoff.',
    };

    const guideline = platformGuidelines[platform as keyof typeof platformGuidelines] || platformGuidelines['YouTube'];

    const systemPrompt = `You are an expert content creator and scriptwriter specializing in ${platform || 'social media'} content.

Your task is to generate a complete, ready-to-film video script based on the provided title and description.

Platform Guidelines: ${guideline}

Script Structure:
1. **HOOK (First 3-5 seconds):**
   - Attention-grabbing question, bold statement, or pattern interrupt
   - Must stop scrolling immediately
   - Examples: "Wait, did you know..." / "Stop! Before you scroll..." / "This changed everything..."

2. **INTRODUCTION (5-10 seconds):**
   - Brief preview of what's coming
   - Build curiosity and expectation
   - Confirm value proposition

3. **MAIN CONTENT:**
   - Break into clear, numbered sections
   - For long-form: Include rough timestamps (e.g., [0:15])
   - Use storytelling, examples, and practical tips
   - Keep energy high and pacing appropriate for platform

4. **CALL TO ACTION:**
   - Clear next step for viewer
   - Engagement prompt (like, comment, subscribe, follow)
   - Optional: Tease next video

Formatting:
- Use clear section headers
- Include [PAUSE], [B-ROLL], [TEXT OVERLAY] cues where appropriate
- Write in conversational, energetic tone
- Use short sentences and active voice
- Include emotional beats (laugh, emphasize, slow down)

Generate a complete, word-for-word script that the creator can read or perform directly.`;

    const userPrompt = `Video Title: ${title}

Video Description: ${description}

Platform: ${platform || 'YouTube'}

Generate a complete, ready-to-film script following the structure and guidelines above.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('[GENERATE-SCRIPT] AI API error:', response.status, errorText);
      throw new Error('AI generation failed');
    }

    const data = await response.json();
    const script = data.choices?.[0]?.message?.content;

    if (!script) {
      throw new Error('No script generated');
    }

    console.log('[GENERATE-SCRIPT] Generated script for:', title);

    return new Response(
      JSON.stringify({ script }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[GENERATE-SCRIPT] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

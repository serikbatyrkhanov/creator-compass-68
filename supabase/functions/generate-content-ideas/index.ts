import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valid archetype values
const validArchetypes = [
  "The Educator",
  "The Entertainer", 
  "The Storyteller",
  "The Innovator",
  "The Curator",
  "The Connector",
  "The Advocate",
  "The Artist"
] as const;

// Valid platform values
const validPlatforms = [
  "youtube_video",
  "youtube_shorts",
  "instagram_post",
  "instagram_reels",
  "tiktok"
] as const;

// Input validation schema
const requestSchema = z.object({
  archetype: z.string().max(100).optional(),
  topics: z.array(z.string().max(100)).max(10).optional(),
  timeBucket: z.string().max(50).optional(),
  gear: z.array(z.string().max(100)).max(10).optional(),
  targetAudience: z.string().max(200).optional(),
  quizResponseId: z.string().uuid().optional(),
  preferredPlatform: z.enum(validPlatforms).optional(),
  language: z.enum(["en", "ru"]).optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors[0]?.message || "Invalid input";
      console.error('[GENERATE-IDEAS] Validation error:', errorMessage);
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { archetype, topics, timeBucket, gear, targetAudience, quizResponseId, preferredPlatform, language } = parseResult.data;
    
    console.log('[GENERATE-IDEAS] Starting generation', { archetype, topics, timeBucket, preferredPlatform, language });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build context for AI
    const topicsText = topics?.join(', ') || 'general content';
    const gearText = gear?.join(', ') || 'basic equipment';
    const timeText = timeBucket || '1-5 hours per week';
    const targetLanguage = language === 'ru' ? 'Russian' : 'English';
    
    // Platform-specific guidelines
    const platformGuidelines: Record<string, string> = {
      youtube_video: 'YouTube Video (8-20+ min): Long-form educational/entertainment content. Focus on thumbnails, strong hooks, and in-depth value. Keywords and SEO are important.',
      youtube_shorts: 'YouTube Shorts (15-60 sec): Vertical short-form content. Hook in first 3 seconds. Trending music/sounds. Quick, punchy delivery.',
      instagram_post: 'Instagram Post: Static image carousel or single image. Aesthetic focus. Strong captions with hashtags. Visual storytelling.',
      instagram_reels: 'Instagram Reels (15-90 sec): Vertical short-form with trending audio. Quick cuts, on-trend transitions. Highly visual.',
      tiktok: 'TikTok (15-60 sec): Vertical short-form. Native editing style essential. Trending sounds/challenges. Authentic, raw feel preferred over polished.'
    };
    
    const platformContext = preferredPlatform && platformGuidelines[preferredPlatform] 
      ? `\nPlatform focus: ${platformGuidelines[preferredPlatform]}`
      : '\nPlatform focus: General multi-platform approach';
    
    const systemPrompt = `You are an expert content creator coach. Generate specific, actionable content ideas for a ${archetype || 'content'} creator.
Focus on practical, platform-specific ideas that can be executed with ${gearText} in ${timeText}.
Target audience: ${targetAudience || 'general audience'}.
Topics: ${topicsText}.${platformContext}

CRITICAL: Generate ALL content (titles, descriptions, steps) in ${targetLanguage}. Do not mix languages.`;

    const userPrompt = `Generate 3 unique content ideas optimized for ${preferredPlatform ? platformGuidelines[preferredPlatform] : 'general platforms'}. Each idea should be:
1. Specific and actionable
2. Optimized for their archetype (${archetype || 'general'})
3. Executable within their time constraints (${timeText})
4. Suitable for their topics: ${topicsText}
5. Formatted appropriately for ${preferredPlatform || 'multiple platforms'}

For each idea, provide:
- A catchy title (in ${targetLanguage})
- Platform recommendations (prioritize ${preferredPlatform || 'versatile platforms'})
- Quick execution steps (3-4 steps, in ${targetLanguage})
- Expected effort (time estimate)

Remember: ALL text must be in ${targetLanguage}.`;

    // Call Lovable AI with structured output
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
          { role: "user", content: userPrompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_content_ideas",
            description: "Generate content ideas for creators",
            parameters: {
              type: "object",
              properties: {
                ideas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      platforms: { 
                        type: "array",
                        items: { type: "string" }
                      },
                      steps: {
                        type: "array",
                        items: { type: "string" }
                      },
                      effort: { type: "string" }
                    },
                    required: ["title", "platforms", "steps", "effort"],
                    additionalProperties: false
                  }
                }
              },
              required: ["ideas"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_content_ideas" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GENERATE-IDEAS] AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[GENERATE-IDEAS] AI response received');

    // Extract structured data from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No structured output from AI");
    }

    const generatedIdeas = JSON.parse(toolCall.function.arguments);
    console.log('[GENERATE-IDEAS] Ideas generated:', generatedIdeas.ideas.length);

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    let userId = null;
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Save to database if user is authenticated
    if (userId && quizResponseId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { error: dbError } = await supabase
        .from('generated_ideas')
        .insert({
          user_id: userId,
          quiz_response_id: quizResponseId,
          ideas: generatedIdeas.ideas,
          saved: false
        });
      
      if (dbError) {
        console.error('[GENERATE-IDEAS] Error saving to DB:', dbError);
      } else {
        console.log('[GENERATE-IDEAS] Saved to database');
      }
    }

    return new Response(
      JSON.stringify({ ideas: generatedIdeas.ideas }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GENERATE-IDEAS] Error:', error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate ideas";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
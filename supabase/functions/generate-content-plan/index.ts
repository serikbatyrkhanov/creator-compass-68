import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { archetype, topics, timeBucket, gear, selectedIdeas, quizResponseId, postingDays, duration = 7, language = 'en', preferredPlatform, niche, globalArchetype } = await req.json();
    
    console.log('[GENERATE-PLAN] Starting generation', { archetype, timeBucket, ideasCount: selectedIdeas?.length, postingDays, duration, language, preferredPlatform, niche, globalArchetype });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build context for AI
    const topicsText = topics?.join(', ') || 'general content';
    const gearText = gear?.join(', ') || 'basic equipment';
    const timeText = timeBucket || '1-5 hours per week';
    const ideasText = selectedIdeas?.map((idea: any) => `- ${idea.title}`).join('\n') || 'general content ideas';
    
    // Get posting days (default to all days)
    const selectedPostingDays = postingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const postingDaysText = selectedPostingDays.map((d: string) => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');
    
    const planDays = duration || 7;
    const planType = planDays <= 7 ? '7-day weekly' : '30-day monthly';
    
    // Platform-specific guidelines
    const getPlatformGuidelines = (platform: string | null) => {
      if (!platform) return '';
      const guidelines: { [key: string]: string } = {
        youtube_video: 'Long-form content (8-20+ min), educational/entertainment value, strong thumbnails, SEO titles',
        youtube_shorts: '15-60 sec vertical, hook in first 3 seconds, trending music, fast-paced editing',
        instagram_post: 'Static image carousel, captions with hashtags, aesthetic focus, engagement prompts',
        instagram_reels: '15-90 sec vertical, trending audio, quick cuts, native editing, text overlays',
        tiktok: '15-60 sec vertical, trending sounds, native TikTok editing style, authentic/raw feel'
      };
      return guidelines[platform] || '';
    };
    
    const platformGuidelines = preferredPlatform ? `\nPlatform focus: ${preferredPlatform}\nPlatform requirements: ${getPlatformGuidelines(preferredPlatform)}` : '';
    const languageInstruction = language === 'ru' ? 'Russian' : 'English';
    
    const systemPrompt = `You are an expert content planning coach. Create a realistic ${planType} content creation schedule for a ${globalArchetype || archetype} creator.

CRITICAL: Generate ALL text (tasks, titles, descriptions, tips) in ${languageInstruction}.
Language: ${language}${platformGuidelines}

Content Niche: ${niche || 'general content'}
Creator Archetype: ${globalArchetype || archetype}
The plan should be achievable within ${timeText} total per week.
Available gear: ${gearText}
Topics: ${topicsText}
IMPORTANT: Only create content for these posting days: ${postingDaysText}. For non-posting days, assign planning/research tasks.

For EACH day provide:
1. task: The main workflow/process description (in ${languageInstruction})
2. postTitle: A catchy, specific title for the actual post content (in ${languageInstruction})
3. postDescription: A brief description of what the content will cover - 2-3 sentences (in ${languageInstruction})
4. timeEstimate: Time needed
5. platform: Publishing platform (only for posting days)
6. tip: Helpful advice for execution (in ${languageInstruction})`;

    const userPrompt = `Create a ${planType} content plan based on these ideas:
${ideasText}

The user posts content on: ${postingDaysText}
${preferredPlatform ? `\nPreferred platform: ${preferredPlatform}` : ''}

CRITICAL: Write EVERYTHING in ${languageInstruction}. All tasks, titles, descriptions, and tips must be in ${languageInstruction}.

For each day (${planDays} days total), provide:
1. task: Main task description in ${languageInstruction} (specific action - actual content creation ONLY on posting days: ${postingDaysText})
2. postTitle: An engaging, clickable title for the post content in ${languageInstruction}
3. postDescription: What the content will be about (2-3 sentences) in ${languageInstruction}
4. timeEstimate: Time estimate (in hours)
5. platform: Platform to post on (ONLY for posting days: ${postingDaysText})${preferredPlatform ? ` - prefer ${preferredPlatform}` : ''}
6. tip: Key tip or note in ${languageInstruction}

The total time across all ${planDays} days should fit within ${timeText} per week average.
Non-posting days should have planning, research, or rest activities in ${languageInstruction}.
Posting days should have actual content creation and publishing tasks in ${languageInstruction}.`;

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
            name: "generate_content_plan",
            description: `Generate a ${planDays}-day content creation plan`,
            parameters: {
              type: "object",
              properties: {
                days: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "string" },
                      dayNumber: { type: "number" },
                      task: { type: "string" },
                      postTitle: { type: "string" },
                      postDescription: { type: "string" },
                      timeEstimate: { type: "string" },
                      platform: { type: "string" },
                      tip: { type: "string" }
                    },
                    required: ["day", "dayNumber", "task", "postTitle", "postDescription", "timeEstimate", "tip"],
                    additionalProperties: false
                  }
                }
              },
              required: ["days"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_content_plan" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GENERATE-PLAN] AI API error:', response.status, errorText);
      
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
    console.log('[GENERATE-PLAN] AI response received');

    // Extract structured data from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No structured output from AI");
    }

    const generatedPlan = JSON.parse(toolCall.function.arguments);
    console.log('[GENERATE-PLAN] Plan generated with', generatedPlan.days.length, 'days');

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
      
      // Helper functions for date calculations
      const getNextMonday = (fromDate: Date): Date => {
        const date = new Date(fromDate);
        const currentDay = date.getDay();
        // If already Monday, use that date. Otherwise find next Monday
        if (currentDay === 1) {
          return date;
        }
        const daysUntilMonday = currentDay === 0 ? 1 : (8 - currentDay);
        date.setDate(date.getDate() + daysUntilMonday);
        return date;
      };
      
      const getFirstOfNextMonth = (fromDate: Date): Date => {
        const date = new Date(fromDate);
        date.setMonth(date.getMonth() + 1);
        date.setDate(1);
        return date;
      };
      
      // Query for user's latest plan to stack on top of it
      const { data: latestPlan } = await supabase
        .from('content_plans')
        .select('start_date, duration')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      let startDate: string;
      
      if (latestPlan) {
        // Calculate end date of latest plan
        const lastPlanStart = new Date(latestPlan.start_date);
        const lastPlanEnd = new Date(lastPlanStart);
        lastPlanEnd.setDate(lastPlanStart.getDate() + latestPlan.duration);
        
        // Calculate new start date based on plan type
        let newStartDate: Date;
        if (duration <= 7) {
          // Weekly plan: start on next Monday after last plan ends
          newStartDate = getNextMonday(lastPlanEnd);
        } else {
          // Monthly plan: start on 1st of next month after last plan ends
          newStartDate = getFirstOfNextMonth(lastPlanEnd);
        }
        
        startDate = newStartDate.toISOString().split('T')[0];
        console.log('[GENERATE-PLAN] Stacking plan after latest:', { latestPlanStart: latestPlan.start_date, latestPlanDuration: latestPlan.duration, newStartDate: startDate });
      } else {
        // No existing plans, start next Monday
        const today = new Date();
        const nextMonday = getNextMonday(today);
        startDate = nextMonday.toISOString().split('T')[0];
        console.log('[GENERATE-PLAN] First plan, starting next Monday:', startDate);
      }
      
      const { data: planData, error: dbError } = await supabase
        .from('content_plans')
        .insert({
          user_id: userId,
          quiz_response_id: quizResponseId,
          plan: generatedPlan.days,
          start_date: startDate,
          posting_days: postingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          duration: duration
        })
        .select()
        .single();
      
      if (dbError) {
        console.error('[GENERATE-PLAN] Error saving to DB:', dbError);
      } else {
        console.log('[GENERATE-PLAN] Saved to database with ID:', planData.id);
        
        // Helper to get day of week from day number and start date
        const getDayOfWeek = (dayNum: number, startDateStr: string): string => {
          const date = new Date(startDateStr);
          date.setDate(date.getDate() + (dayNum - 1));
          const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          return days[date.getDay()];
        };
        
        // Create task entries only for selected posting days
        const selectedPostingDaysSet = new Set(postingDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
        const tasks = generatedPlan.days
          .filter((day: any) => {
            const dayOfWeek = getDayOfWeek(day.dayNumber, startDate);
            return selectedPostingDaysSet.has(dayOfWeek);
          })
          .map((day: any) => ({
            plan_id: planData.id,
            user_id: userId,
            day_number: day.dayNumber,
            task_title: day.task,
            post_title: day.postTitle || day.task,
            post_description: day.postDescription || '',
            completed: false
          }));
        
        if (tasks.length > 0) {
          const { error: tasksError } = await supabase
            .from('plan_tasks')
            .insert(tasks);
          
          if (tasksError) {
            console.error('[GENERATE-PLAN] Error creating tasks:', tasksError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ plan: generatedPlan.days }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GENERATE-PLAN] Error:', error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate plan";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

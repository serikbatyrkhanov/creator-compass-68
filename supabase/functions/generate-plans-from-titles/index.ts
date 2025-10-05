import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { titles, userId } = await req.json();
    
    if (!titles || !Array.isArray(titles) || titles.length === 0) {
      return new Response(
        JSON.stringify({ error: "Titles array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating plans from ${titles.length} titles for user ${userId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's quiz response for posting days
    const { data: quizResponse } = await supabase
      .from("quiz_responses")
      .select("posting_days, id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const postingDays = quizResponse?.posting_days || [
      "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
    ];
    const quizResponseId = quizResponse?.id;

    // Batch titles into groups of 7 (one week per plan)
    const batchSize = 7;
    const batches = [];
    for (let i = 0; i < titles.length; i += batchSize) {
      batches.push(titles.slice(i, i + batchSize));
    }

    console.log(`Creating ${batches.length} content plans`);

    // Get the latest plan's start date to continue from there
    const { data: latestPlan } = await supabase
      .from("content_plans")
      .select("start_date, duration")
      .eq("user_id", userId)
      .order("start_date", { ascending: false })
      .limit(1)
      .single();

    let nextStartDate = new Date();
    if (latestPlan) {
      const latestStart = new Date(latestPlan.start_date);
      nextStartDate = new Date(latestStart.getTime() + (latestPlan.duration * 24 * 60 * 60 * 1000));
    }

    const createdPlans = [];

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const startDate = new Date(nextStartDate.getTime() + (batchIndex * 7 * 24 * 60 * 60 * 1000));
      
      // Create plan items from titles
      const planItems = batch.map((title, index) => ({
        day: getDayName(index),
        dayNumber: index + 1,
        task: title,
        timeEstimate: "1-2 hours",
        platform: "Multiple platforms",
        tip: "Focus on creating engaging content that resonates with your audience"
      }));

      // Create the content plan
      const { data: newPlan, error: planError } = await supabase
        .from("content_plans")
        .insert({
          user_id: userId,
          quiz_response_id: quizResponseId,
          plan: planItems,
          start_date: startDate.toISOString().split('T')[0],
          posting_days: postingDays,
          duration: 7
        })
        .select()
        .single();

      if (planError) {
        console.error("Error creating plan:", planError);
        throw planError;
      }

      // Create tasks for this plan
      const tasks = planItems.map(item => ({
        plan_id: newPlan.id,
        user_id: userId,
        day_number: item.dayNumber,
        task_title: item.task,
        completed: false,
        notes: '',
        script_completed: false,
        content_created: false,
        content_edited: false,
        content_published: false
      }));

      const { error: tasksError } = await supabase
        .from("plan_tasks")
        .insert(tasks);

      if (tasksError) {
        console.error("Error creating tasks:", tasksError);
        throw tasksError;
      }

      createdPlans.push(newPlan);
      console.log(`Created plan ${batchIndex + 1}/${batches.length} with ${batch.length} tasks`);
    }

    console.log(`Successfully created ${createdPlans.length} plans with ${titles.length} total tasks`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        plansCreated: createdPlans.length,
        titlesUsed: titles.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-plans-from-titles function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getDayName(index: number): string {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days[index % 7];
}

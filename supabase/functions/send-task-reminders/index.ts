import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Profile {
  id: string;
  phone: string;
  timezone: string;
  first_name: string;
  last_name: string;
}

interface ContentPlan {
  id: string;
  start_date: string;
  posting_days: string[];
  plan_tasks: PlanTask[];
}

interface PlanTask {
  id: string;
  day_number: number;
  task_title: string;
  platform: string | null;
  post_title: string | null;
  completed: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[SEND-TASK-REMINDERS] Function started');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('[SEND-TASK-REMINDERS] Twilio credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Twilio credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];

    console.log(`[SEND-TASK-REMINDERS] Processing reminders for ${todayDateString}`);

    // Get all users eligible for SMS reminders
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, phone, timezone, first_name, last_name, sms_notifications_enabled, sms_consent, last_sms_sent_date')
      .eq('sms_notifications_enabled', true)
      .eq('sms_consent', true)
      .not('phone', 'is', null);

    if (profilesError) {
      console.error('[SEND-TASK-REMINDERS] Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`[SEND-TASK-REMINDERS] Found ${profiles?.length || 0} users with SMS enabled`);

    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const profile of profiles || []) {
      try {
        // Skip if already sent SMS today
        if (profile.last_sms_sent_date === todayDateString) {
          console.log(`[SEND-TASK-REMINDERS] Already sent to user ${profile.id} today`);
          skippedCount++;
          continue;
        }

        // Calculate user's local time
        const userLocalTime = new Date().toLocaleString('en-US', {
          timeZone: profile.timezone || 'America/New_York',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        });

        const userHour = parseInt(userLocalTime.split(':')[0]);
        const userMinute = parseInt(userLocalTime.split(':')[1]);

        // Only send at 9 AM (between 9:00 and 9:59)
        if (userHour !== 9) {
          console.log(`[SEND-TASK-REMINDERS] Not 9 AM for user ${profile.id} (current hour: ${userHour})`);
          skippedCount++;
          continue;
        }

        console.log(`[SEND-TASK-REMINDERS] Processing user ${profile.id} at ${userHour}:${userMinute} in ${profile.timezone}`);

        // Get user's most recent content plan with tasks
        const { data: plan, error: planError } = await supabase
          .from('content_plans')
          .select(`
            id,
            start_date,
            posting_days,
            plan_tasks (
              id,
              day_number,
              task_title,
              platform,
              post_title,
              completed
            )
          `)
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (planError || !plan) {
          console.log(`[SEND-TASK-REMINDERS] No plan found for user ${profile.id}`);
          skippedCount++;
          continue;
        }

        const contentPlan = plan as unknown as ContentPlan;

        // Calculate which day of the plan it is
        const startDate = new Date(contentPlan.start_date);
        const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        // Check if today is a posting day
        const todayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        if (!contentPlan.posting_days.map(d => d.toLowerCase()).includes(todayName)) {
          console.log(`[SEND-TASK-REMINDERS] Today (${todayName}) is not a posting day for user ${profile.id}`);
          skippedCount++;
          continue;
        }

        // Calculate which posting day number this is
        let postingDayNumber = 0;
        for (let i = 0; i <= daysSinceStart; i++) {
          const checkDate = new Date(startDate);
          checkDate.setDate(startDate.getDate() + i);
          const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          if (contentPlan.posting_days.map(d => d.toLowerCase()).includes(dayName)) {
            postingDayNumber++;
          }
        }

        // Find incomplete tasks for today
        const todayTasks = contentPlan.plan_tasks.filter(
          task => task.day_number === postingDayNumber && !task.completed
        );

        if (todayTasks.length === 0) {
          console.log(`[SEND-TASK-REMINDERS] No incomplete tasks for user ${profile.id} on day ${postingDayNumber}`);
          skippedCount++;
          continue;
        }

        const task = todayTasks[0];
        const userName = profile.first_name || 'there';

        // Compose SMS message
        const message = `Good morning ${userName}! 🌄 Coach Climbley here with your task for today:

📝 ${task.task_title}
📱 Platform: ${task.platform || 'Not specified'}
🎯 Post: ${task.post_title || 'Your content'}

Let's create something amazing today! 💪

View your calendar: https://lovable.dev/content-calendar`;

        // Send SMS via Twilio
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;

        const twilioResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: profile.phone,
            From: twilioPhoneNumber,
            Body: message,
          }),
        });

        if (!twilioResponse.ok) {
          const errorText = await twilioResponse.text();
          console.error(`[SEND-TASK-REMINDERS] Twilio error for user ${profile.id}:`, errorText);
          errorCount++;
          continue;
        }

        const twilioData = await twilioResponse.json();
        console.log(`[SEND-TASK-REMINDERS] SMS sent to user ${profile.id}, SID: ${twilioData.sid}`);

        // Update last_sms_sent_date
        await supabase
          .from('profiles')
          .update({ last_sms_sent_date: todayDateString })
          .eq('id', profile.id);

        sentCount++;
      } catch (error) {
        console.error(`[SEND-TASK-REMINDERS] Error processing user ${profile.id}:`, error);
        errorCount++;
      }
    }

    const summary = {
      success: true,
      sent: sentCount,
      skipped: skippedCount,
      errors: errorCount,
      total: profiles?.length || 0,
    };

    console.log('[SEND-TASK-REMINDERS] Summary:', summary);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[SEND-TASK-REMINDERS] Function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

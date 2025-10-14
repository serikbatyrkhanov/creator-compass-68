import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "https://esm.sh/resend@4.0.0";

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  timezone: string;
  email_notifications_enabled: boolean;
  email_consent: boolean;
  last_email_sent_date: string | null;
  notification_time: string;
}

interface ContentPlan {
  id: string;
  plan: { days: PlanDay[] };
  start_date: string;
  duration: number;
  posting_days: string[];
}

interface PlanDay {
  dayNumber: number;
  tasks: Task[];
}

interface Task {
  id: string;
  task_title: string;
  post_title?: string;
  platform?: string;
  completed: boolean;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[SEND-EMAIL-REMINDERS] Starting email reminders check...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('[SEND-EMAIL-REMINDERS] Resend API key not found');
      return new Response(JSON.stringify({ error: 'Resend API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const resend = new Resend(resendApiKey);

    console.log('[SEND-EMAIL-REMINDERS] Resend client initialized');

    // Fetch users with email notifications enabled
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email_notifications_enabled', true)
      .eq('email_consent', true);

    if (profilesError) {
      console.error('[SEND-EMAIL-REMINDERS] Error fetching profiles:', profilesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch profiles' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[SEND-EMAIL-REMINDERS] Found ${profiles?.length || 0} users with email notifications enabled`);

    let sentCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const profile of profiles as Profile[]) {
      try {
        // Check if email was already sent today
        const todayDate = new Date().toISOString().split('T')[0];
        if (profile.last_email_sent_date === todayDate) {
          console.log(`[SEND-EMAIL-REMINDERS] Email already sent today for user ${profile.id}`);
          skippedCount++;
          continue;
        }

        // Get user's notification time preference
        const notificationTime = profile.notification_time || '09:00:00';
        const [notifHour, notifMinute] = notificationTime.split(':').map(Number);

        // Calculate user's local time
        const userLocalTime = new Date().toLocaleString('en-US', {
          timeZone: profile.timezone || 'America/New_York',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        });

        const [userHourStr, userMinuteStr] = userLocalTime.split(':');
        const userHour = parseInt(userHourStr);
        const userMinute = parseInt(userMinuteStr);

        // Check if it's the user's notification time (±5 min buffer)
        if (userHour !== notifHour || Math.abs(userMinute - notifMinute) > 5) {
          console.log(`[SEND-EMAIL-REMINDERS] Not notification time for user ${profile.id} (user time: ${userHour}:${userMinute}, notif time: ${notifHour}:${notifMinute})`);
          skippedCount++;
          continue;
        }

        console.log(`[SEND-EMAIL-REMINDERS] It's notification time for user ${profile.id}`);

        // Fetch user's latest content plan
        const { data: plans } = await supabase
          .from('content_plans')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!plans || plans.length === 0) {
          console.log(`[SEND-EMAIL-REMINDERS] No content plan found for user ${profile.id}`);
          skippedCount++;
          continue;
        }

        const plan = plans[0] as ContentPlan;
        const startDate = new Date(plan.start_date);
        const today = new Date();
        const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        // Check if today is a posting day
        const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const isPostingDay = plan.posting_days?.includes(todayDayName) ?? false;

        if (!isPostingDay) {
          console.log(`[SEND-EMAIL-REMINDERS] Not a posting day for user ${profile.id}`);
          skippedCount++;
          continue;
        }

        // Find today's tasks
        const { data: tasks } = await supabase
          .from('plan_tasks')
          .select('*')
          .eq('plan_id', plan.id)
          .eq('day_number', daysSinceStart + 1);

        if (!tasks || tasks.length === 0) {
          console.log(`[SEND-EMAIL-REMINDERS] No tasks for today for user ${profile.id}`);
          skippedCount++;
          continue;
        }

        // Find incomplete tasks
        const incompleteTasks = tasks.filter(task => !task.completed);

        if (incompleteTasks.length === 0) {
          console.log(`[SEND-EMAIL-REMINDERS] All tasks completed for user ${profile.id}`);
          skippedCount++;
          continue;
        }

        const task = incompleteTasks[0];
        const userName = profile.first_name || 'Creator';

        // Compose HTML email
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
      color: white; 
      padding: 30px 20px; 
      border-radius: 8px 8px 0 0; 
      text-align: center;
    }
    .header h1 { margin: 0 0 10px 0; font-size: 28px; }
    .header p { margin: 0; font-size: 16px; opacity: 0.9; }
    .content { 
      background: #f9f9f9; 
      padding: 30px 20px; 
      border-radius: 0 0 8px 8px; 
    }
    .task-card { 
      background: white; 
      padding: 20px; 
      margin: 20px 0; 
      border-left: 4px solid #667eea; 
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .task-card h2 { 
      margin: 0 0 15px 0; 
      font-size: 20px; 
      color: #333;
    }
    .task-card p { 
      margin: 8px 0; 
      color: #666;
    }
    .task-card strong { 
      color: #333;
    }
    .cta-button { 
      background: #667eea; 
      color: white; 
      padding: 14px 28px; 
      text-decoration: none; 
      border-radius: 6px; 
      display: inline-block;
      margin: 20px 0 10px 0;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #999;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌄 Good morning, ${userName}!</h1>
      <p>Coach Climbley here with your task for today</p>
    </div>
    <div class="content">
      <div class="task-card">
        <h2>📝 ${task.task_title || 'Your content task'}</h2>
        <p><strong>📱 Platform:</strong> ${task.platform || 'Not specified'}</p>
        <p><strong>🎯 Post:</strong> ${task.post_title || 'Your content'}</p>
      </div>
      <p style="text-align: center; margin: 20px 0;">Let's create something amazing today! 💪</p>
      <div style="text-align: center;">
        <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/content-calendar" class="cta-button">
          View Your Calendar
        </a>
      </div>
    </div>
    <div class="footer">
      <p>You're receiving this because you enabled email notifications in your Climbley profile.</p>
    </div>
  </div>
</body>
</html>
`;

        // Send email via Resend
        const emailResponse = await resend.emails.send({
          from: 'Climbley <onboarding@resend.dev>',
          to: [profile.email],
          subject: `🌄 Your content task for today - ${task.task_title}`,
          html: emailHtml,
        });

        if (emailResponse.error) {
          console.error(`[SEND-EMAIL-REMINDERS] Error sending email to ${profile.email}:`, emailResponse.error);
          errorCount++;
          continue;
        }

        console.log(`[SEND-EMAIL-REMINDERS] Email sent successfully to ${profile.email}`);

        // Update last_email_sent_date
        await supabase
          .from('profiles')
          .update({ last_email_sent_date: today })
          .eq('id', profile.id);

        sentCount++;
      } catch (userError) {
        console.error(`[SEND-EMAIL-REMINDERS] Error processing user ${profile.id}:`, userError);
        errorCount++;
      }
    }

    console.log(`[SEND-EMAIL-REMINDERS] Summary - Sent: ${sentCount}, Skipped: ${skippedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          sent: sentCount,
          skipped: skippedCount,
          errors: errorCount,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[SEND-EMAIL-REMINDERS] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
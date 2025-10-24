import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  email: string;
  isTest: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[SEND-TEST-EMAIL] Function started");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, isTest }: TestEmailRequest = await req.json();
    console.log(`[SEND-TEST-EMAIL] Request received for email: ${email}`);

    if (!email) {
      throw new Error("Email address is required");
    }

    // Sample task data for the test email
    const sampleTask = {
      title: "Record and edit a short-form video",
      platform: "TikTok",
      postTitle: "Beginner Python Day 1",
    };

    const userName = "Test User";
    const greeting = "🌄 Good morning";

    // HTML email template (matching the production template)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Daily Content Task</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: rgba(255, 255, 255, 0.1);
              padding: 30px;
              text-align: center;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              background: white;
              padding: 30px;
            }
            .greeting {
              font-size: 24px;
              font-weight: 600;
              color: #667eea;
              margin-bottom: 20px;
            }
            .task-card {
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
              border-left: 4px solid #667eea;
            }
            .task-title {
              font-size: 20px;
              font-weight: 700;
              color: #2d3748;
              margin-bottom: 12px;
            }
            .task-detail {
              font-size: 14px;
              color: #4a5568;
              margin: 8px 0;
            }
            .task-detail strong {
              color: #2d3748;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              padding: 14px 32px;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              transition: transform 0.2s;
            }
            .cta-button:hover {
              transform: translateY(-2px);
            }
            .footer {
              background: #f7fafc;
              padding: 20px;
              text-align: center;
              font-size: 14px;
              color: #718096;
            }
            .test-badge {
              background: #fef3c7;
              color: #92400e;
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: 600;
              display: inline-block;
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 Climbley</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">Your Daily Content Reminder</p>
            </div>
            
            <div class="content">
              ${isTest ? '<div class="test-badge">🧪 TEST EMAIL</div>' : ''}
              
              <div class="greeting">${greeting}, ${userName}!</div>
              
              <p style="font-size: 16px; color: #4a5568; margin-bottom: 16px;">
                ${isTest 
                  ? "This is a test email to verify your notification system is working correctly." 
                  : "Time to create! Here's your task for today:"}
              </p>
              
              <div class="task-card">
                <div class="task-title">📝 ${sampleTask.title}</div>
                <div class="task-detail"><strong>Platform:</strong> ${sampleTask.platform}</div>
                <div class="task-detail"><strong>Post Title:</strong> ${sampleTask.postTitle}</div>
              </div>
              
              <p style="font-size: 16px; color: #4a5568; margin: 20px 0;">
                ${isTest 
                  ? "If you received this email, your email notifications are configured correctly! 🎉" 
                  : "Ready to get started? Open your content calendar and let's make it happen!"}
              </p>
              
              <center>
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'https://climbley.app'}/content-calendar" class="cta-button">
                  Open Content Calendar →
                </a>
              </center>
            </div>
            
            <div class="footer">
              <p style="margin: 0 0 8px 0;">
                ${isTest 
                  ? "This is a test email sent from your admin panel." 
                  : "You're receiving this because you enabled email notifications in your profile settings."}
              </p>
              <p style="margin: 0; font-size: 12px;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('/functions/v1', '') || 'https://climbley.app'}/profile" style="color: #667eea;">
                  Manage notification settings
                </a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log("[SEND-TEST-EMAIL] Sending email via Resend...");
    
    const emailResponse = await resend.emails.send({
      from: "Climbley <onboarding@resend.dev>",
      to: [email],
      subject: isTest ? "🧪 Test Email: Your Daily Content Reminder" : "🎬 Your Daily Content Task",
      html: htmlContent,
    });

    console.log("[SEND-TEST-EMAIL] Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Test email sent successfully",
        emailId: emailResponse.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("[SEND-TEST-EMAIL] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);

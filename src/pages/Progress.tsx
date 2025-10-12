import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowLeft, Target, Calendar, Lightbulb, MessageCircle, CheckCircle2, Award, Users, Video, Heart, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { normalizeExternalUrl, extractUsername } from "@/lib/socialMediaUtils";

interface ProgressStats {
  totalQuizzes: number;
  lastQuizDate: string | null;
  primaryArchetype: string | null;
  totalIdeas: number;
  totalPlans: number;
  completedTasks: number;
  totalTasks: number;
  chatConversations: number;
  totalMessages: number;
}

interface SocialProfiles {
  youtubeUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
}

const Progress = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ProgressStats>({
    totalQuizzes: 0,
    lastQuizDate: null,
    primaryArchetype: null,
    totalIdeas: 0,
    totalPlans: 0,
    completedTasks: 0,
    totalTasks: 0,
    chatConversations: 0,
    totalMessages: 0
  });
  const [socialProfiles, setSocialProfiles] = useState<SocialProfiles>({
    youtubeUrl: null,
    instagramUrl: null,
    tiktokUrl: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch all stats in parallel
      const [
        quizzes,
        ideas,
        plans,
        tasks,
        conversations,
        messages,
        profile
      ] = await Promise.all([
        supabase
          .from("quiz_responses")
          .select("id, created_at, primary_archetype")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        
        supabase
          .from("generated_ideas")
          .select("id")
          .eq("user_id", user.id),
        
        supabase
          .from("content_plans")
          .select("id")
          .eq("user_id", user.id),
        
        supabase
          .from("plan_tasks")
          .select("id, completed")
          .eq("user_id", user.id),
        
        supabase
          .from("chat_conversations")
          .select("id")
          .eq("user_id", user.id),
        
        supabase
          .from("chat_messages")
          .select("id")
          .eq("user_id", user.id),
        
        supabase
          .from("profiles")
          .select("youtube_url, instagram_url, tiktok_url")
          .eq("id", user.id)
          .single()
      ]);

      const completedTasksCount = tasks.data?.filter(t => t.completed).length || 0;
      
      setStats({
        totalQuizzes: quizzes.data?.length || 0,
        lastQuizDate: quizzes.data?.[0]?.created_at || null,
        primaryArchetype: quizzes.data?.[0]?.primary_archetype || null,
        totalIdeas: ideas.data?.length || 0,
        totalPlans: plans.data?.length || 0,
        completedTasks: completedTasksCount,
        totalTasks: tasks.data?.length || 0,
        chatConversations: conversations.data?.length || 0,
        totalMessages: messages.data?.length || 0
      });

      setSocialProfiles({
        youtubeUrl: profile.data?.youtube_url || null,
        instagramUrl: profile.data?.instagram_url || null,
        tiktokUrl: profile.data?.tiktok_url || null
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };


  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  const getMotivationalMessage = () => {
    if (completionRate === 100) return t("progress.motivationalMessage100");
    if (completionRate >= 75) return t("progress.motivationalMessage75");
    if (completionRate >= 50) return t("progress.motivationalMessage50");
    if (completionRate >= 25) return t("progress.motivationalMessage25");
    return t("progress.motivationalMessage0");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-primary" />
                {t("progress.title")}
              </h1>
              <p className="text-muted-foreground">{t("progress.subtitle")}</p>
            </div>
          </div>

          {/* Overall Progress Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2">
            <CardHeader>
              <CardTitle className="text-2xl">{t("progress.overallCompletion")}</CardTitle>
              <CardDescription>{getMotivationalMessage()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl font-bold text-primary">{completionRate}%</div>
                <Award className="h-16 w-16 text-primary/30" />
              </div>
              <div className="w-full bg-secondary rounded-full h-4 mb-2">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-4 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("progress.tasksCompleted", { completed: stats.completedTasks, total: stats.totalTasks })}
              </p>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quiz Stats */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("progress.quizHistory")}</CardTitle>
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">{stats.totalQuizzes}</p>
                  <p className="text-sm text-muted-foreground">{t("progress.quizzesTaken")}</p>
                </div>
                {stats.primaryArchetype && (
                  <div>
                    <p className="text-sm font-medium">{t("progress.currentArchetype")}</p>
                    <Badge className="mt-1 capitalize">{stats.primaryArchetype}</Badge>
                  </div>
                )}
                {stats.lastQuizDate && (
                  <p className="text-xs text-muted-foreground">
                    {t("progress.lastQuiz", { 
                      date: new Date(stats.lastQuizDate).toLocaleDateString()
                    })}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Content Ideas */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("progress.contentIdeas")}</CardTitle>
                  <Lightbulb className="h-6 w-6 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-3xl font-bold">{stats.totalIdeas}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("progress.ideaSets")}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => navigate("/dashboard")}
                >
                  {t("progress.generateMoreIdeas")}
                </Button>
              </CardContent>
            </Card>

            {/* Content Plans */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("progress.contentPlans")}</CardTitle>
                  <Calendar className="h-6 w-6 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-3xl font-bold">{stats.totalPlans}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("progress.plansCreated")}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => navigate("/content-calendar")}
                >
                  {t("progress.viewCalendar")}
                </Button>
              </CardContent>
            </Card>

            {/* Task Completion */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("progress.tasks")}</CardTitle>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
                    <p className="text-sm text-muted-foreground">{t("progress.tasksCompletedLabel")}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-muted-foreground">{stats.totalTasks - stats.completedTasks}</p>
                    <p className="text-xs text-muted-foreground">{t("progress.tasksRemaining")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Coach Usage */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t("progress.aiCoach")}</CardTitle>
                  <MessageCircle className="h-6 w-6 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-3xl font-bold">{stats.chatConversations}</p>
                    <p className="text-sm text-muted-foreground">{t("progress.conversations")}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-muted-foreground">{stats.totalMessages}</p>
                    <p className="text-xs text-muted-foreground">{t("progress.totalMessages")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Score */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader>
                <CardTitle>{t("progress.engagementScore")}</CardTitle>
                <CardDescription>{t("progress.basedOnActivity")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("progress.quizzes")}</span>
                    <Badge variant={stats.totalQuizzes > 0 ? "default" : "secondary"}>
                      {stats.totalQuizzes > 0 ? "✓" : "○"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("progress.generatedIdeas")}</span>
                    <Badge variant={stats.totalIdeas > 0 ? "default" : "secondary"}>
                      {stats.totalIdeas > 0 ? "✓" : "○"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("progress.createdPlans")}</span>
                    <Badge variant={stats.totalPlans > 0 ? "default" : "secondary"}>
                      {stats.totalPlans > 0 ? "✓" : "○"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{t("progress.completedTasksLabel")}</span>
                    <Badge variant={stats.completedTasks > 0 ? "default" : "secondary"}>
                      {stats.completedTasks > 0 ? "✓" : "○"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Media Profiles Section */}
          {(socialProfiles.youtubeUrl || socialProfiles.instagramUrl || socialProfiles.tiktokUrl) && (
            <>
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Social Media Profiles
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* YouTube Profile */}
                {socialProfiles.youtubeUrl && (
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5 text-red-600" />
                        YouTube
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-lg font-medium text-foreground">
                          @{extractUsername(socialProfiles.youtubeUrl, 'youtube')}
                        </p>
                        <p className="text-sm text-muted-foreground">Channel</p>
                      </div>
                      <a 
                        href={normalizeExternalUrl(socialProfiles.youtubeUrl, 'youtube')} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full"
                      >
                        <Button 
                          variant="outline" 
                          className="w-full"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on YouTube
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                )}

                {/* Instagram Profile */}
                {socialProfiles.instagramUrl && (
                  <Card className="bg-gradient-to-br from-pink-50 to-purple-100 dark:from-pink-950/20 dark:to-purple-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-pink-600" />
                        Instagram
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-lg font-medium text-foreground">
                          @{extractUsername(socialProfiles.instagramUrl, 'instagram')}
                        </p>
                        <p className="text-sm text-muted-foreground">Profile</p>
                      </div>
                      <a 
                        href={normalizeExternalUrl(socialProfiles.instagramUrl, 'instagram')} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full"
                      >
                        <Button 
                          variant="outline" 
                          className="w-full"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on Instagram
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                )}

                {/* TikTok Profile */}
                {socialProfiles.tiktokUrl && (
                  <Card className="bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-950/20 dark:to-blue-900/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-cyan-600" />
                        TikTok
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-lg font-medium text-foreground">
                          @{extractUsername(socialProfiles.tiktokUrl, 'tiktok')}
                        </p>
                        <p className="text-sm text-muted-foreground">Profile</p>
                      </div>
                      <a 
                        href={normalizeExternalUrl(socialProfiles.tiktokUrl, 'tiktok')} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full"
                      >
                        <Button 
                          variant="outline" 
                          className="w-full"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on TikTok
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}

          {/* Show message if no social media connected */}
          {!socialProfiles.youtubeUrl && !socialProfiles.instagramUrl && !socialProfiles.tiktokUrl && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No Social Media Connected</p>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Connect your YouTube, Instagram, or TikTok accounts in Profile Management
                </p>
                <Button onClick={() => navigate("/profile")}>
                  Go to Profile Management
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("progress.quickActions")}</CardTitle>
              <CardDescription>{t("progress.continueJourney")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/quiz")}>
                <Target className="h-4 w-4 mr-2" />
                {t("progress.retakeQuiz")}
              </Button>
              <Button variant="outline" onClick={() => navigate("/content-calendar")}>
                <Calendar className="h-4 w-4 mr-2" />
                {t("progress.viewCalendar")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Progress;

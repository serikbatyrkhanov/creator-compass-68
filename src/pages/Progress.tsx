import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowLeft, Target, Calendar, Lightbulb, MessageCircle, CheckCircle2, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

const Progress = () => {
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
        messages
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
          .eq("user_id", user.id)
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
    if (completionRate === 100) return "Perfect! You're crushing it! 🏆";
    if (completionRate >= 75) return "Excellent progress! Keep it up! 🌟";
    if (completionRate >= 50) return "You're halfway there! 💪";
    if (completionRate >= 25) return "Good start! Keep going! 🚀";
    return "Let's get started! 🎯";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading stats...</div>
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
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-primary" />
                Your Progress
              </h1>
              <p className="text-muted-foreground">Track your creator journey</p>
            </div>
          </div>

          {/* Overall Progress Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Overall Completion</CardTitle>
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
                {stats.completedTasks} of {stats.totalTasks} tasks completed
              </p>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quiz Stats */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Quiz History</CardTitle>
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">{stats.totalQuizzes}</p>
                  <p className="text-sm text-muted-foreground">Quizzes taken</p>
                </div>
                {stats.primaryArchetype && (
                  <div>
                    <p className="text-sm font-medium">Current Archetype:</p>
                    <Badge className="mt-1 capitalize">{stats.primaryArchetype}</Badge>
                  </div>
                )}
                {stats.lastQuizDate && (
                  <p className="text-xs text-muted-foreground">
                    Last: {new Date(stats.lastQuizDate).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Content Ideas */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Content Ideas</CardTitle>
                  <Lightbulb className="h-6 w-6 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-3xl font-bold">{stats.totalIdeas}</p>
                  <p className="text-sm text-muted-foreground">
                    AI-generated idea sets
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => navigate("/dashboard")}
                >
                  Generate More Ideas
                </Button>
              </CardContent>
            </Card>

            {/* Content Plans */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Content Plans</CardTitle>
                  <Calendar className="h-6 w-6 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-3xl font-bold">{stats.totalPlans}</p>
                  <p className="text-sm text-muted-foreground">
                    7-day plans created
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => navigate("/content-calendar")}
                >
                  View Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Task Completion */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tasks</CardTitle>
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
                    <p className="text-sm text-muted-foreground">Tasks completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-muted-foreground">{stats.totalTasks - stats.completedTasks}</p>
                    <p className="text-xs text-muted-foreground">Tasks remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Coach Usage */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>AI Coach</CardTitle>
                  <MessageCircle className="h-6 w-6 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-3xl font-bold">{stats.chatConversations}</p>
                    <p className="text-sm text-muted-foreground">Conversations</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-muted-foreground">{stats.totalMessages}</p>
                    <p className="text-xs text-muted-foreground">Total messages</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Score */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardHeader>
                <CardTitle>Engagement Score</CardTitle>
                <CardDescription>Based on your activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Quizzes</span>
                    <Badge variant={stats.totalQuizzes > 0 ? "default" : "secondary"}>
                      {stats.totalQuizzes > 0 ? "✓" : "○"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Generated Ideas</span>
                    <Badge variant={stats.totalIdeas > 0 ? "default" : "secondary"}>
                      {stats.totalIdeas > 0 ? "✓" : "○"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Created Plans</span>
                    <Badge variant={stats.totalPlans > 0 ? "default" : "secondary"}>
                      {stats.totalPlans > 0 ? "✓" : "○"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Completed Tasks</span>
                    <Badge variant={stats.completedTasks > 0 ? "default" : "secondary"}>
                      {stats.completedTasks > 0 ? "✓" : "○"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Continue your creator journey</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/quiz")}>
                <Target className="h-4 w-4 mr-2" />
                Retake Quiz
              </Button>
              <Button variant="outline" onClick={() => navigate("/content-calendar")}>
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate Ideas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Progress;

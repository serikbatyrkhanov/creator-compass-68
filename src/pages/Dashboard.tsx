import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  LogOut, 
  FileCheck, 
  MessageCircle, 
  CheckCircle2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIChatCoach } from "@/components/AIChatCoach";
import ladderLogo from "@/assets/ladder-logo-transparent.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [lastQuizResult, setLastQuizResult] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [journeyProgress, setJourneyProgress] = useState({
    hasQuiz: false,
    hasIdeas: false,
    hasPlan: false,
    hasCompletedTask: false,
    hasChatted: false
  });

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
      // Fetch last quiz result
      const { data: quizData } = await supabase
        .from("quiz_responses")
        .select("id, primary_archetype, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (quizData) {
        setLastQuizResult(quizData);
      }

      // Fetch journey progress
      if (session?.user) {
        const [ideas, plans, tasks, messages] = await Promise.all([
          supabase
            .from("generated_ideas")
            .select("id")
            .eq("user_id", session.user.id)
            .limit(1)
            .maybeSingle(),
          
          supabase
            .from("content_plans")
            .select("id")
            .eq("user_id", session.user.id)
            .limit(1)
            .maybeSingle(),
          
          supabase
            .from("plan_tasks")
            .select("id")
            .eq("user_id", session.user.id)
            .eq("completed", true)
            .limit(1)
            .maybeSingle(),
          
          supabase
            .from("chat_messages")
            .select("id")
            .eq("user_id", session.user.id)
            .limit(1)
            .maybeSingle()
        ]);

        setJourneyProgress({
          hasQuiz: !!quizData,
          hasIdeas: !!ideas.data,
          hasPlan: !!plans.data,
          hasCompletedTask: !!tasks.data,
          hasChatted: !!messages.data
        });
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={ladderLogo} alt="Climbley Logo" className="h-7 w-7" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Climbley
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user.user_metadata?.name || "Creator"}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Let's continue building your creator empire
            </p>
          </div>

          {/* Last Quiz Result */}
          {lastQuizResult && (
            <Card className="border-2 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background animate-fade-in">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                    <FileCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <CardTitle className="text-emerald-700 dark:text-emerald-300">Last Quiz Result</CardTitle>
                <CardDescription>
                  Your archetype: <span className="font-semibold capitalize">{lastQuizResult.primary_archetype}</span>
                  <br />
                  <span className="text-xs">Completed {new Date(lastQuizResult.created_at).toLocaleDateString()}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                  onClick={() => navigate(`/quiz-results/${lastQuizResult.id}`)}
                >
                  View Results
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className={`grid gap-6 animate-slide-up ${lastQuizResult ? 'md:grid-cols-4' : 'md:grid-cols-4'}`}>
            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Find Your Niche</CardTitle>
                <CardDescription>
                  {lastQuizResult ? 'Retake the quiz to update your niche' : 'Take our questionnaire to discover your perfect content niche'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate("/quiz")}>
                  {lastQuizResult ? 'Retake Quiz' : 'Start Quiz'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer" onClick={() => setChatOpen(true)}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>AI Content Coach</CardTitle>
                <CardDescription>
                  Get personalized advice and overcome creative blocks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Chat Now
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/content-calendar")}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Content Calendar</CardTitle>
                <CardDescription>
                  Plan and schedule your upcoming content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Calendar</Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/progress")}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your growth and celebrate milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Stats</Button>
              </CardContent>
            </Card>
          </div>

          {/* Your Journey Section */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Your Journey Begins Here</CardTitle>
              <CardDescription>
                Complete these steps to master your content creation journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div 
                className={`flex items-start gap-4 p-4 rounded-lg transition-all cursor-pointer hover:shadow-md ${
                  journeyProgress.hasQuiz 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200' 
                    : 'bg-muted/50 hover:bg-muted'
                }`}
                onClick={() => !journeyProgress.hasQuiz && navigate("/quiz")}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  journeyProgress.hasQuiz 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-primary/20 text-primary'
                }`}>
                  {journeyProgress.hasQuiz ? <CheckCircle2 className="h-5 w-5" /> : '1'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Take the Niche Quiz</h4>
                  <p className="text-sm text-muted-foreground">
                    Discover your perfect content creator archetype
                  </p>
                </div>
              </div>

              <div 
                className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                  journeyProgress.hasIdeas 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200' 
                    : journeyProgress.hasQuiz 
                      ? 'bg-muted/50 hover:bg-muted cursor-pointer hover:shadow-md' 
                      : 'bg-muted/30 opacity-60'
                }`}
                onClick={() => {
                  if (journeyProgress.hasQuiz && !journeyProgress.hasIdeas && lastQuizResult) {
                    navigate(`/quiz-results/${lastQuizResult.id}`);
                  }
                }}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  journeyProgress.hasIdeas 
                    ? 'bg-emerald-500 text-white' 
                    : journeyProgress.hasQuiz
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {journeyProgress.hasIdeas ? <CheckCircle2 className="h-5 w-5" /> : '2'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Generate Content Ideas</h4>
                  <p className="text-sm text-muted-foreground">
                    Get AI-powered content ideas tailored to your archetype
                  </p>
                </div>
              </div>

              <div 
                className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                  journeyProgress.hasPlan 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200' 
                    : journeyProgress.hasIdeas 
                      ? 'bg-muted/50 hover:bg-muted cursor-pointer hover:shadow-md' 
                      : 'bg-muted/30 opacity-60'
                }`}
                onClick={() => {
                  if (journeyProgress.hasIdeas && !journeyProgress.hasPlan && lastQuizResult) {
                    navigate(`/quiz-results/${lastQuizResult.id}`);
                  }
                }}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  journeyProgress.hasPlan 
                    ? 'bg-emerald-500 text-white' 
                    : journeyProgress.hasIdeas
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {journeyProgress.hasPlan ? <CheckCircle2 className="h-5 w-5" /> : '3'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Create 7-Day Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    Build your weekly content schedule with AI
                  </p>
                </div>
              </div>

              <div 
                className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                  journeyProgress.hasCompletedTask 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200' 
                    : journeyProgress.hasPlan 
                      ? 'bg-muted/50 hover:bg-muted cursor-pointer hover:shadow-md' 
                      : 'bg-muted/30 opacity-60'
                }`}
                onClick={() => {
                  if (journeyProgress.hasPlan && !journeyProgress.hasCompletedTask) {
                    navigate("/content-calendar");
                  }
                }}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  journeyProgress.hasCompletedTask 
                    ? 'bg-emerald-500 text-white' 
                    : journeyProgress.hasPlan
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {journeyProgress.hasCompletedTask ? <CheckCircle2 className="h-5 w-5" /> : '4'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Complete Your First Task</h4>
                  <p className="text-sm text-muted-foreground">
                    Start executing your content plan
                  </p>
                </div>
              </div>

              <div 
                className={`flex items-start gap-4 p-4 rounded-lg transition-all cursor-pointer hover:shadow-md ${
                  journeyProgress.hasChatted 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200' 
                    : 'bg-muted/50 hover:bg-muted'
                }`}
                onClick={() => setChatOpen(true)}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  journeyProgress.hasChatted 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-primary/20 text-primary'
                }`}>
                  {journeyProgress.hasChatted ? <CheckCircle2 className="h-5 w-5" /> : '5'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Chat with AI Coach</h4>
                  <p className="text-sm text-muted-foreground">
                    Get personalized advice and overcome creative blocks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Us Button */}
          <div className="flex justify-center pt-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/contact")}
              className="text-muted-foreground hover:text-foreground"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
      
      <AIChatCoach open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
};

export default Dashboard;

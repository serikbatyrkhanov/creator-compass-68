import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Calendar, TrendingUp, Target, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
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
            <Sparkles className="h-6 w-6 text-primary" />
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

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 animate-slide-up">
            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Find Your Niche</CardTitle>
                <CardDescription>
                  Take our questionnaire to discover your perfect content niche
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate("/quiz")}>Start Quiz</Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer">
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

            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer">
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

          {/* Coming Soon Section */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Your Journey Begins Here</CardTitle>
              <CardDescription>
                Complete these steps to get started with your content creation journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Complete Your Profile</h4>
                  <p className="text-sm text-muted-foreground">
                    Tell us about yourself and your creator goals
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Take the Niche Quiz</h4>
                  <p className="text-sm text-muted-foreground">
                    Discover which content niche is perfect for you
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">Choose Your Platforms</h4>
                  <p className="text-sm text-muted-foreground">
                    Select which social platforms to focus on
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

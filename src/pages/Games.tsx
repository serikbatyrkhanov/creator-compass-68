import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Settings, Gamepad2, Puzzle, Brain, Zap, Trophy, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/no_background.png";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Games = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setFirstName(profileData.first_name || '');
        setLastName(profileData.last_name || '');
        setAvatarUrl(profileData.avatar_url);
      }
    };
    checkAuth();

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
      description: "You've been successfully signed out."
    });
    navigate("/");
  };

  const games = [
    {
      id: "memory-match",
      title: "Memory Match",
      description: "Test your memory with this classic card matching game",
      icon: Brain,
      color: "blue",
      bgClass: "bg-blue-500/10",
      textClass: "text-blue-600",
      buttonClass: "bg-blue-600 hover:bg-blue-700",
      route: "/games/memory-match"
    },
    {
      id: "color-the-cars",
      title: "Color the Cars",
      description: "Paint vehicles and swipe to discover new ones",
      icon: Palette,
      color: "pink",
      bgClass: "bg-pink-500/10",
      textClass: "text-pink-600",
      buttonClass: "bg-pink-600 hover:bg-pink-700",
      route: "/games/color-the-cars"
    },
    {
      id: "word-puzzle",
      title: "Word Puzzle",
      description: "Challenge yourself with content creator vocabulary",
      icon: Puzzle,
      color: "green",
      bgClass: "bg-green-500/10",
      textClass: "text-green-600",
      buttonClass: "bg-green-600 hover:bg-green-700",
      route: "/games/word-puzzle",
      comingSoon: true
    },
    {
      id: "quiz-challenge",
      title: "Quiz Challenge",
      description: "Test your knowledge with timed social media trivia",
      icon: Zap,
      color: "orange",
      bgClass: "bg-orange-500/10",
      textClass: "text-orange-600",
      buttonClass: "bg-orange-600 hover:bg-orange-700",
      route: "/games/quiz-challenge",
      comingSoon: true
    },
    {
      id: "strategy-builder",
      title: "Strategy Builder",
      description: "Plan your content strategy in this interactive game",
      icon: Trophy,
      color: "purple",
      bgClass: "bg-purple-500/10",
      textClass: "text-purple-600",
      buttonClass: "bg-purple-600 hover:bg-purple-700",
      route: "/games/strategy-builder",
      comingSoon: true
    }
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <img src={logo} alt="Climbley Logo" className="h-14 w-auto drop-shadow-md hover:drop-shadow-lg transition-all duration-200" />
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate("/profile")}>
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback>
                  {firstName?.[0]}{lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-4 text-primary">
            <Gamepad2 className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Games Dashboard
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Take a break and sharpen your skills with our collection of fun and educational games
          </p>
        </div>

        {/* Back to Dashboard */}
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game) => {
            const Icon = game.icon;
            return (
              <Card
                key={game.id}
                className="border-2 hover:shadow-lg transition-all cursor-pointer flex flex-col relative overflow-hidden"
                onClick={() => !game.comingSoon && navigate(game.route)}
              >
                {game.comingSoon && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium z-10">
                    Coming Soon
                  </div>
                )}
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg ${game.bgClass} flex items-center justify-center mb-4`}>
                    <Icon className={`h-6 w-6 ${game.textClass}`} />
                  </div>
                  <CardTitle>{game.title}</CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button
                    className={`w-full ${game.comingSoon ? 'opacity-50 cursor-not-allowed' : game.buttonClass}`}
                    disabled={game.comingSoon}
                  >
                    {game.comingSoon ? 'Coming Soon' : 'Play Now'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <Card className="mt-12 border-2">
          <CardHeader>
            <CardTitle>About Games</CardTitle>
            <CardDescription>
              Our games are designed to help you learn while having fun. Each game focuses on different skills that are valuable for content creators.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Memory & Focus</h4>
                <p className="text-sm text-muted-foreground">
                  Improve your concentration and memory skills with our brain training games
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Puzzle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Problem Solving</h4>
                <p className="text-sm text-muted-foreground">
                  Develop critical thinking skills through engaging puzzles and challenges
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Trophy className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-semibold mb-1">Strategy & Planning</h4>
                <p className="text-sm text-muted-foreground">
                  Learn content strategy through interactive gameplay and scenarios
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Games;

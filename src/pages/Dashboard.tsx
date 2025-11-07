import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, Target, LogOut, FileCheck, MessageCircle, CheckCircle2, Flame, Settings, BookOpen, User, Gamepad2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIChatCoach } from "@/components/AIChatCoach";
import { TrendingTitlesDialog } from "@/components/TrendingTitlesDialog";
import { NicheField } from "@/components/NicheField";
import { Label } from "@/components/ui/label";
import { useNiche } from "@/contexts/NicheContext";
import logo from "@/assets/no_background.png";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PlatformSelector } from "@/components/PlatformSelector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const Dashboard = () => {
  const {
    t,
    i18n,
    ready
  } = useTranslation();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    niche,
    archetype,
    setNiche,
    primaryArchetype
  } = useNiche();
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [lastQuizResult, setLastQuizResult] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [trendingTitlesOpen, setTrendingTitlesOpen] = useState(false);
  const [journeyProgress, setJourneyProgress] = useState({
    hasQuiz: false,
    hasIdeas: false,
    hasPlan: false,
    hasCompletedTask: false,
    hasChatted: false
  });
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Fetch last quiz result
      const {
        data: quizData
      } = await supabase.from("quiz_responses").select("id, primary_archetype, created_at").eq("user_id", session.user.id).order("created_at", {
        ascending: false
      }).limit(1).maybeSingle();
      if (quizData) {
        setLastQuizResult(quizData);
      }

      // Fetch journey progress
      if (session?.user) {
        const [ideas, plans, tasks, messages] = await Promise.all([supabase.from("generated_ideas").select("id").eq("user_id", session.user.id).limit(1).maybeSingle(), supabase.from("content_plans").select("id").eq("user_id", session.user.id).limit(1).maybeSingle(), supabase.from("plan_tasks").select("id").eq("user_id", session.user.id).eq("completed", true).limit(1).maybeSingle(), supabase.from("chat_messages").select("id").eq("user_id", session.user.id).limit(1).maybeSingle()]);
        setJourneyProgress({
          hasQuiz: !!quizData,
          hasIdeas: !!ideas.data,
          hasPlan: !!plans.data,
          hasCompletedTask: !!tasks.data,
          hasChatted: !!messages.data
        });

        // Load profile data
        const {
          data: profileData
        } = await supabase.from('profiles').select('first_name, last_name, avatar_url').eq('id', session.user.id).single();
        if (profileData) {
          setFirstName(profileData.first_name || '');
          setLastName(profileData.last_name || '');
          setAvatarUrl(profileData.avatar_url);
        }
      }

      // Fetch featured blog posts
      const {
        data: postsData
      } = await supabase.from('blog_posts').select('id, title, slug, excerpt, cover_image_url, published_at, is_featured').eq('status', 'published').eq('language', i18n.language).order('is_featured', {
        ascending: false
      }).order('published_at', {
        ascending: false
      }).limit(3);
      if (postsData) {
        setBlogPosts(postsData);
      }
    };
    checkAuth();

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, i18n.language]);
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out."
    });
    navigate("/");
  };
  if (!user) return null;
  if (!ready) return <div className="min-h-screen flex items-center justify-center">{t('common.loading', 'Loading...')}</div>;
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Climbley Logo" className="h-14 w-auto drop-shadow-md hover:drop-shadow-lg transition-all duration-200" />
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <PlatformSelector />
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate("/profile")}>
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback>
                  {firstName?.[0]}{lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('nav.signOut')}
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
              {t('dashboard.welcome')}, {firstName || user.user_metadata?.first_name || user.user_metadata?.name || "Creator"}! 👋
            </h1>
            
          </div>

          {/* Profile Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {/* Last Quiz Result */}
            {lastQuizResult && <Card className="border-2 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
                <CardHeader className="pb-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-2">
                    <FileCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-lg text-emerald-700 dark:text-emerald-300">{t('dashboard.lastQuizResult.title')}</CardTitle>
                  <CardDescription className="text-xs">
                    {t('dashboard.lastQuizResult.yourArchetype')}: <span className="font-semibold capitalize">{t(`quiz.archetypes.${lastQuizResult.primary_archetype}.label`)}</span>
                    <br />
                    <span className="text-xs">{t('dashboard.lastQuizResult.completed')} {new Date(lastQuizResult.created_at).toLocaleDateString()}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => navigate(`/quiz-results/${lastQuizResult.id}`)}>
                    {t('dashboard.lastQuizResult.viewResults')}
                  </Button>
                </CardContent>
              </Card>}

            {/* Content Profile */}
            <Card className={`border-2 bg-gradient-to-br from-accent/10 to-white dark:from-accent/20 dark:to-background ${!lastQuizResult ? "md:col-span-2" : ""}`}>
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                  <User className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-lg text-accent">{t('profile.title', { defaultValue: 'Your Content Profile' })}</CardTitle>
                <CardDescription className="text-xs">
                  {t('profile.subtitle', { defaultValue: 'Set your niche and view your creator archetype' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                {/* Niche input */}
                <div className="space-y-2">
                  <Label className="text-sm">{t('profile.niche', { defaultValue: 'Your Niche' })}</Label>
                  <NicheField value={niche || ""} onChange={val => setNiche(val)} compact />
                </div>
                
                {/* Archetype display */}
                <div className="space-y-2">
                  <Label className="text-sm">{t('profile.archetype', { defaultValue: 'Your Archetype' })}</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 border rounded-md px-3 py-2 bg-muted/50 text-sm">
                      {archetype ? <span className="font-medium capitalize">{archetype}</span> : <span className="text-muted-foreground">
                          {t('dashboard.takeQuizFirst', { defaultValue: 'Take the quiz first to discover your archetype' })}
                        </span>}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate('/quiz')}>
                      {archetype ? t('dashboard.quickActions.retakeQuiz') : t('quiz.title')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className={`grid gap-6 animate-slide-up ${lastQuizResult ? 'md:grid-cols-4' : 'md:grid-cols-4'}`}>
            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer flex flex-col">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('dashboard.quickActions.retakeQuiz')}</CardTitle>
                <CardDescription>
                  {lastQuizResult ? t('dashboard.journey.takeQuiz.description') : t('dashboard.journey.takeQuiz.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button className="w-full" onClick={() => navigate("/quiz")}>
                  {lastQuizResult ? t('dashboard.quickActions.retakeQuiz') : t('quiz.title')}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer flex flex-col" onClick={() => setChatOpen(true)}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>{t('dashboard.quickActions.aiCoach')}</CardTitle>
                <CardDescription>
                  {t('coach.greeting')}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {t('coach.send')}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer flex flex-col" onClick={() => setTrendingTitlesOpen(true)}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Flame className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>{t('calendar.trending')}</CardTitle>
                <CardDescription>
                  {t('calendar.plan')}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  {t('calendar.trending')}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer flex flex-col" onClick={() => navigate("/content-calendar")}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>{t('calendar.title')}</CardTitle>
                <CardDescription>
                  {t('dashboard.journey.planContent.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button variant="outline" className="w-full">{t('nav.calendar')}</Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer flex flex-col" onClick={() => navigate("/progress")}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>{t('dashboard.journey.trackProgress.title')}</CardTitle>
                <CardDescription>
                  {t('dashboard.journey.trackProgress.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button variant="outline" className="w-full">{t('nav.progress')}</Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer flex flex-col" onClick={() => navigate("/games")}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                  <Gamepad2 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Games</CardTitle>
                <CardDescription>
                  Take a break and play fun games
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button variant="outline" className="w-full">Play Games</Button>
              </CardContent>
            </Card>
          </div>

          {/* Educational Resources Section */}
          {blogPosts.length > 0 && <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('dashboard.educationalPosts.title')}</CardTitle>
                    <CardDescription>
                      {t('dashboard.educationalPosts.description')}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/blog")}>
                    {t('dashboard.educationalPosts.viewAll')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {blogPosts.map(post => <Card key={post.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/blog/${post.slug}`)}>
                      {post.cover_image_url && <img src={post.cover_image_url} alt={post.title} className="w-full h-32 object-cover rounded-t-lg" />}
                      <CardHeader className="p-4">
                        <CardTitle className="text-base line-clamp-2">{post.title}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {post.excerpt || "Read more to discover valuable insights..."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(post.published_at).toLocaleDateString()}</span>
                          <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent">
                            {t('dashboard.educationalPosts.readMore')} →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>
              </CardContent>
            </Card>}

          {/* Your Journey Section */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{t('dashboard.journey.title')}</CardTitle>
              <CardDescription>
                {t('dashboard.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`flex items-start gap-4 p-4 rounded-lg transition-all cursor-pointer hover:shadow-md ${journeyProgress.hasQuiz ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200' : 'bg-muted/50 hover:bg-muted'}`} onClick={() => !journeyProgress.hasQuiz && navigate("/quiz")}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${journeyProgress.hasQuiz ? 'bg-emerald-500 text-white' : 'bg-primary/20 text-primary'}`}>
                  {journeyProgress.hasQuiz ? <CheckCircle2 className="h-5 w-5" /> : '1'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{t('dashboard.journey.takeQuiz.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.journey.takeQuiz.description')}
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-4 rounded-lg transition-all ${journeyProgress.hasIdeas ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200' : journeyProgress.hasQuiz ? 'bg-muted/50 hover:bg-muted cursor-pointer hover:shadow-md' : 'bg-muted/30 opacity-60'}`} onClick={() => {
              if (journeyProgress.hasQuiz && !journeyProgress.hasIdeas && lastQuizResult) {
                navigate(`/quiz-results/${lastQuizResult.id}`);
              }
            }}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${journeyProgress.hasIdeas ? 'bg-emerald-500 text-white' : journeyProgress.hasQuiz ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {journeyProgress.hasIdeas ? <CheckCircle2 className="h-5 w-5" /> : '2'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{t('dashboard.journey.generateIdeas.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.journey.generateIdeas.description')}
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-4 rounded-lg transition-all ${journeyProgress.hasPlan ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200' : journeyProgress.hasIdeas ? 'bg-muted/50 hover:bg-muted cursor-pointer hover:shadow-md' : 'bg-muted/30 opacity-60'}`} onClick={() => {
              if (journeyProgress.hasIdeas && !journeyProgress.hasPlan && lastQuizResult) {
                navigate(`/quiz-results/${lastQuizResult.id}`);
              }
            }}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${journeyProgress.hasPlan ? 'bg-emerald-500 text-white' : journeyProgress.hasIdeas ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {journeyProgress.hasPlan ? <CheckCircle2 className="h-5 w-5" /> : '3'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{t('dashboard.journey.createPlan.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.journey.createPlan.description')}
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-4 rounded-lg transition-all ${journeyProgress.hasCompletedTask ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200' : journeyProgress.hasPlan ? 'bg-muted/50 hover:bg-muted cursor-pointer hover:shadow-md' : 'bg-muted/30 opacity-60'}`} onClick={() => {
              if (journeyProgress.hasPlan && !journeyProgress.hasCompletedTask) {
                navigate("/content-calendar");
              }
            }}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${journeyProgress.hasCompletedTask ? 'bg-emerald-500 text-white' : journeyProgress.hasPlan ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {journeyProgress.hasCompletedTask ? <CheckCircle2 className="h-5 w-5" /> : '4'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{t('dashboard.journey.completeTask.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.journey.completeTask.description')}
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-4 p-4 rounded-lg transition-all cursor-pointer hover:shadow-md ${journeyProgress.hasChatted ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200' : 'bg-muted/50 hover:bg-muted'}`} onClick={() => setChatOpen(true)}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${journeyProgress.hasChatted ? 'bg-emerald-500 text-white' : 'bg-primary/20 text-primary'}`}>
                  {journeyProgress.hasChatted ? <CheckCircle2 className="h-5 w-5" /> : '5'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{t('dashboard.journey.chatCoach.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.journey.chatCoach.description')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Us Button */}
          <div className="flex justify-center pt-4">
            <Button variant="ghost" onClick={() => navigate("/contact")} className="text-muted-foreground hover:text-foreground">
              {t('dashboard.contactButton')}
            </Button>
          </div>
        </div>
      </div>
      
      <AIChatCoach open={chatOpen} onOpenChange={setChatOpen} />
      <TrendingTitlesDialog open={trendingTitlesOpen} onOpenChange={setTrendingTitlesOpen} />
    </div>;
};
export default Dashboard;
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
  CheckCircle2,
  Sparkles,
  Bell,
  User,
  Youtube,
  Instagram as InstagramIcon,
  Music
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AIChatCoach } from "@/components/AIChatCoach";
import { TrendingTitlesDialog } from "@/components/TrendingTitlesDialog";
import logo from "@/assets/climbley-logo.png";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
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
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [email, setEmail] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');

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

        // Load SMS notification settings and profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('phone, timezone, sms_notifications_enabled, email, youtube_url, instagram_url, tiktok_url')
          .eq('id', session.user.id)
          .single();
        
        if (profileData) {
          setPhoneNumber(profileData.phone || '');
          setTimezone(profileData.timezone || 'America/New_York');
          setSmsEnabled(profileData.sms_notifications_enabled ?? true);
          setEmail(profileData.email || session.user.email || '');
          setYoutubeUrl(profileData.youtube_url || '');
          setInstagramUrl(profileData.instagram_url || '');
          setTiktokUrl(profileData.tiktok_url || '');
        } else {
          setEmail(session.user.email || '');
        }
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

  const handleToggleSMS = async (checked: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ sms_notifications_enabled: checked })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setSmsEnabled(checked);
      toast({
        title: checked ? "SMS reminders enabled" : "SMS reminders disabled",
        description: checked 
          ? "You'll receive daily reminders at 9:00 AM in your timezone" 
          : "You won't receive SMS reminders anymore",
      });
    } catch (error) {
      console.error('Error toggling SMS:', error);
      toast({
        title: "Error",
        description: "Failed to update SMS settings",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePhone = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.startsWith('+')) {
      toast({
        title: "Error",
        description: "Phone number must start with + and country code (e.g., +12125551234)",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ phone: phoneNumber })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Phone number updated",
        description: "Your phone number has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating phone:', error);
      toast({
        title: "Error",
        description: "Failed to update phone number",
        variant: "destructive",
      });
    }
  };

  const handleTimezoneChange = async (value: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ timezone: value })
        .eq('id', user.id);
      
      if (error) throw error;
      
      setTimezone(value);
      toast({
        title: "Timezone updated",
        description: "Your timezone has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating timezone:', error);
      toast({
        title: "Error",
        description: "Failed to update timezone",
        variant: "destructive",
      });
    }
  };

  const handleUpdateEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ email: email })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Email updated",
        description: "Your email has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        title: "Error",
        description: "Failed to update email",
        variant: "destructive",
      });
    }
  };

  const handleUpdateYoutubeUrl = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ youtube_url: youtubeUrl })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "YouTube URL updated",
        description: "Your YouTube channel URL has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating YouTube URL:', error);
      toast({
        title: "Error",
        description: "Failed to update YouTube URL",
        variant: "destructive",
      });
    }
  };

  const handleUpdateInstagramUrl = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ instagram_url: instagramUrl })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Instagram URL updated",
        description: "Your Instagram profile URL has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating Instagram URL:', error);
      toast({
        title: "Error",
        description: "Failed to update Instagram URL",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTiktokUrl = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ tiktok_url: tiktokUrl })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "TikTok URL updated",
        description: "Your TikTok profile URL has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating TikTok URL:', error);
      toast({
        title: "Error",
        description: "Failed to update TikTok URL",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Climbley Logo" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
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
              {t('dashboard.welcome')}, {user.user_metadata?.name || "Creator"}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('dashboard.subtitle')}
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
                <CardTitle className="text-emerald-700 dark:text-emerald-300">{t('dashboard.lastQuizResult.title')}</CardTitle>
                <CardDescription>
                  {t('dashboard.lastQuizResult.yourArchetype')}: <span className="font-semibold capitalize">{lastQuizResult.primary_archetype}</span>
                  <br />
                  <span className="text-xs">{t('dashboard.lastQuizResult.completed')} {new Date(lastQuizResult.created_at).toLocaleDateString()}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                  onClick={() => navigate(`/quiz-results/${lastQuizResult.id}`)}
                >
                  {t('dashboard.lastQuizResult.viewResults')}
                </Button>
              </CardContent>
            </Card>
          )}

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
                  <Sparkles className="h-6 w-6 text-purple-600" />
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
          </div>

          {/* Your Journey Section */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>{t('dashboard.journey.title')}</CardTitle>
              <CardDescription>
                {t('dashboard.subtitle')}
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
                  <h4 className="font-semibold mb-1">{t('dashboard.journey.takeQuiz.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.journey.takeQuiz.description')}
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
                  <h4 className="font-semibold mb-1">{t('dashboard.journey.generateIdeas.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.journey.generateIdeas.description')}
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
                  <h4 className="font-semibold mb-1">{t('dashboard.journey.createPlan.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.journey.createPlan.description')}
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
                  <h4 className="font-semibold mb-1">{t('dashboard.journey.completeTask.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.journey.completeTask.description')}
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
                  <h4 className="font-semibold mb-1">{t('dashboard.journey.chatCoach.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('dashboard.journey.chatCoach.description')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Management */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-blue-700 dark:text-blue-300">👤 Profile Management</CardTitle>
              <CardDescription>
                Manage your profile information and social media connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="flex gap-2">
                  <Input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="flex-1"
                  />
                  <Button onClick={handleUpdateEmail}>Update</Button>
                </div>
              </div>
              
              {/* Phone Number */}
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="flex gap-2">
                  <Input 
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="flex-1"
                  />
                  <Button onClick={handleUpdatePhone}>Update</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: +[country code][number] (e.g., +12125551234)
                </p>
              </div>
              
              {/* Timezone Selector */}
              <div className="space-y-2">
                <Label>Your Timezone</Label>
                <Select value={timezone} onValueChange={handleTimezoneChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Anchorage">Alaska</SelectItem>
                    <SelectItem value="Pacific/Honolulu">Hawaii</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris/Berlin/Rome</SelectItem>
                    <SelectItem value="Europe/Moscow">Moscow</SelectItem>
                    <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                    <SelectItem value="Asia/Kolkata">India</SelectItem>
                    <SelectItem value="Asia/Shanghai">China</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                    <SelectItem value="Pacific/Auckland">Auckland</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Used for SMS reminders and local time calculations
                </p>
              </div>

              {/* Social Media Connections */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Social Media Profiles
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your social media profiles to track real-time statistics in Progress section
                </p>
                
                {/* YouTube URL */}
                <div className="space-y-2 mb-4">
                  <Label className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-600" />
                    YouTube Channel URL
                  </Label>
                  <div className="flex gap-2">
                    <Input 
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@yourchannel"
                      className="flex-1"
                    />
                    <Button onClick={handleUpdateYoutubeUrl}>Update</Button>
                  </div>
                </div>

                {/* Instagram URL */}
                <div className="space-y-2 mb-4">
                  <Label className="flex items-center gap-2">
                    <InstagramIcon className="h-4 w-4 text-pink-600" />
                    Instagram Profile URL
                  </Label>
                  <div className="flex gap-2">
                    <Input 
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                      className="flex-1"
                    />
                    <Button onClick={handleUpdateInstagramUrl}>Update</Button>
                  </div>
                </div>

                {/* TikTok URL */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-black dark:text-white" />
                    TikTok Profile URL
                  </Label>
                  <div className="flex gap-2">
                    <Input 
                      type="url"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      placeholder="https://tiktok.com/@yourprofile"
                      className="flex-1"
                    />
                    <Button onClick={handleUpdateTiktokUrl}>Update</Button>
                  </div>
                </div>
              </div>

              {/* SMS Notifications */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notifications
                </h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Daily Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get SMS reminders at 9:00 AM for your tasks
                    </p>
                  </div>
                  <Switch 
                    checked={smsEnabled}
                    onCheckedChange={handleToggleSMS}
                  />
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
              {t('dashboard.contactButton')}
            </Button>
          </div>
        </div>
      </div>
      
      <AIChatCoach open={chatOpen} onOpenChange={setChatOpen} />
      <TrendingTitlesDialog open={trendingTitlesOpen} onOpenChange={setTrendingTitlesOpen} />
    </div>
  );
};

export default Dashboard;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { archetypes, platformRules, nicheSuggestions } from "@/data/quizData";
import { Sparkles, TrendingUp, Target, Rocket, ArrowLeft } from "lucide-react";

interface QuizResult {
  id: string;
  primary_archetype: string;
  secondary_archetype: string;
  archetype_scores: any;
  selected_topics: string[];
  time_bucket: string;
  gear: string[];
}

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!id) {
        navigate("/quiz");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("quiz_responses")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setResult(data);
      } catch (error) {
        console.error("Error fetching results:", error);
        toast({
          title: "Error loading results",
          description: "Unable to load your quiz results",
          variant: "destructive"
        });
        navigate("/quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--gradient-hero)]">
        <div className="text-center">
          <div className="animate-pulse text-6xl mb-4">✨</div>
          <p className="text-xl">Analyzing your creator path...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const primaryArch = archetypes[result.primary_archetype as keyof typeof archetypes];
  const secondaryArch = archetypes[result.secondary_archetype as keyof typeof archetypes];
  const platforms = platformRules[result.primary_archetype as keyof typeof platformRules] || [];

  // Get niche suggestions based on selected topics and primary archetype
  const nicheIdeas: string[] = [];
  result.selected_topics.forEach(topic => {
    const topicSuggestions = nicheSuggestions[topic];
    if (topicSuggestions) {
      const ideas = topicSuggestions[result.primary_archetype] || [];
      nicheIdeas.push(...ideas);
    }
  });

  const timeAdvice = {
    under_5: "Focus on short-form content (TikTok, Instagram Reels, YouTube Shorts). Batch-record 3-5 videos in one session.",
    "5_to_10": "Mix short-form daily posts with 1 longer piece per week. Repurpose content across platforms.",
    "10_to_20": "Add YouTube long-form content. Consider a weekly upload schedule with daily shorts.",
    "20_plus": "You can handle YouTube, podcast, blog/newsletter. Build a content ecosystem."
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--gradient-hero)]">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Hero Result Card */}
          <Card className="backdrop-blur-sm bg-card/90 border-2 shadow-[var(--shadow-vibrant)] text-center">
            <CardHeader className="pb-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4 mx-auto">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Your Creator Path</span>
              </div>
              <div className="text-7xl mb-4">{primaryArch.emoji}</div>
              <CardTitle className="text-4xl mb-2">{primaryArch.label}</CardTitle>
              <CardDescription className="text-lg">{primaryArch.description}</CardDescription>
              {secondaryArch && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Secondary strength:</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">{secondaryArch.emoji}</span>
                    <span className="font-medium">{secondaryArch.label}</span>
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Platforms */}
          <Card className="backdrop-blur-sm bg-card/90 border-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle>Recommended Platforms</CardTitle>
              </div>
              <CardDescription>Best platforms for your archetype and time commitment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {platforms.slice(0, 4).map((platform) => (
                  <Badge key={platform} variant="secondary" className="px-4 py-2 text-base">
                    {platform}
                  </Badge>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium mb-2">Time Management Strategy:</p>
                <p className="text-sm text-muted-foreground">
                  {timeAdvice[result.time_bucket as keyof typeof timeAdvice] || timeAdvice["5_to_10"]}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Niche Ideas */}
          {nicheIdeas.length > 0 && (
            <Card className="backdrop-blur-sm bg-card/90 border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle>Content Ideas for Your Topics</CardTitle>
                </div>
                <CardDescription>Based on your interests: {result.selected_topics.join(", ")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {nicheIdeas.slice(0, 6).map((idea, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* First Week Action Plan */}
          <Card className="backdrop-blur-sm bg-card/90 border-2 shadow-[var(--shadow-glow)]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                <CardTitle>Your First Week Action Plan</CardTitle>
              </div>
              <CardDescription>Start strong with these actionable steps</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</span>
                  <div>
                    <p className="font-medium">Create 3 pieces of content</p>
                    <p className="text-sm text-muted-foreground">Pick your easiest topic and record 3 short videos (30-60s each)</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</span>
                  <div>
                    <p className="font-medium">Set up your main platform</p>
                    <p className="text-sm text-muted-foreground">Optimize your profile on your #1 recommended platform</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</span>
                  <div>
                    <p className="font-medium">Post consistently</p>
                    <p className="text-sm text-muted-foreground">Commit to posting at least 3x this week, same time each day</p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button
              onClick={() => navigate("/dashboard")}
              size="lg"
              className="bg-[var(--gradient-vibrant)] hover:opacity-90 gap-2"
            >
              Go to Dashboard
              <Rocket className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;

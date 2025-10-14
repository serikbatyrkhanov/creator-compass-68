import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, TrendingUp, BookOpen, VideoIcon, Zap, Clock, MessageCircle, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/climbley-logo.png";
import { Button } from "@/components/ui/button";
import { ContentIdeasDialog } from "@/components/ContentIdeasDialog";
import { ContentPlanDialog } from "@/components/ContentPlanDialog";
import { AIChatCoach } from "@/components/AIChatCoach";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

// ---------- Types ----------
export type ArchetypeId =
  | "educator"
  | "entertainer"
  | "lifestyle"
  | "reviewer"
  | "journey";

export type TimeBucket = "under_5" | "5_to_10" | "10_to_20" | "20_plus";

export interface ArchetypeProfile {
  id: ArchetypeId;
  title: string;
  emoji: string;
  tagline: string;
  description: string;
  strengths: string[];
  challenges: string[];
  platforms: string[];
  ideas: string[];
  monetization: string[];
}

// Helper to safely get array from translation
const safeArrayTranslation = (t: any, key: string, defaultValue: string[] = []): string[] => {
  const result = t(key, { returnObjects: true, defaultValue });
  return Array.isArray(result) ? result : defaultValue;
};

// Hook to get translated archetype profiles
const useArchetypeProfiles = (): Record<ArchetypeId, ArchetypeProfile> => {
  const { t } = useTranslation();
  
  return {
    educator: {
      id: "educator",
      title: t('quiz.archetypes.educator.label', 'Educator / Teacher'),
      emoji: t('quiz.archetypes.educator.emoji', '📚'),
      tagline: t('quiz.archetypes.educator.tagline', 'Turn know-how into clear, actionable lessons.'),
      description: t('quiz.archetypes.educator.fullDescription', 'You thrive at explaining, simplifying, and helping people make real progress.'),
      strengths: safeArrayTranslation(t, 'quiz.archetypes.educator.strengths', ['Builds trust & authority']),
      challenges: safeArrayTranslation(t, 'quiz.archetypes.educator.challenges', ['Prep time for quality lessons']),
      platforms: safeArrayTranslation(t, 'quiz.archetypes.educator.platforms', ['YouTube (tutorials)']),
      ideas: safeArrayTranslation(t, 'quiz.archetypes.educator.ideas', ['Beginner tutorials']),
      monetization: safeArrayTranslation(t, 'quiz.archetypes.educator.monetization', ['Courses']),
    },
    entertainer: {
      id: "entertainer",
      title: t('quiz.archetypes.entertainer.label', 'Entertainer / Performer'),
      emoji: t('quiz.archetypes.entertainer.emoji', '🎭'),
      tagline: t('quiz.archetypes.entertainer.tagline', 'Capture attention with humor, story, and energy.'),
      description: t('quiz.archetypes.entertainer.fullDescription', 'You shine on camera and love making people feel something.'),
      strengths: safeArrayTranslation(t, 'quiz.archetypes.entertainer.strengths', ['High viral potential']),
      challenges: safeArrayTranslation(t, 'quiz.archetypes.entertainer.challenges', ['High content cadence']),
      platforms: safeArrayTranslation(t, 'quiz.archetypes.entertainer.platforms', ['TikTok']),
      ideas: safeArrayTranslation(t, 'quiz.archetypes.entertainer.ideas', ['Daily comedy skits']),
      monetization: safeArrayTranslation(t, 'quiz.archetypes.entertainer.monetization', ['Brand deals']),
    },
    lifestyle: {
      id: "lifestyle",
      title: t('quiz.archetypes.lifestyle.label', 'Lifestyle & Inspiration'),
      emoji: t('quiz.archetypes.lifestyle.emoji', '🌿'),
      tagline: t('quiz.archetypes.lifestyle.tagline', 'Make your habits and taste the brand.'),
      description: t('quiz.archetypes.lifestyle.fullDescription', 'You inspire through routines, aesthetics, and personal stories.'),
      strengths: safeArrayTranslation(t, 'quiz.archetypes.lifestyle.strengths', ['High relatability']),
      challenges: safeArrayTranslation(t, 'quiz.archetypes.lifestyle.challenges', ['Requires unique personal style']),
      platforms: safeArrayTranslation(t, 'quiz.archetypes.lifestyle.platforms', ['Instagram']),
      ideas: safeArrayTranslation(t, 'quiz.archetypes.lifestyle.ideas', ['AM/PM routine reels']),
      monetization: safeArrayTranslation(t, 'quiz.archetypes.lifestyle.monetization', ['Sponsorships']),
    },
    reviewer: {
      id: "reviewer",
      title: t('quiz.archetypes.reviewer.label', 'Reviewer / Analyst'),
      emoji: t('quiz.archetypes.reviewer.emoji', '🔎'),
      tagline: t('quiz.archetypes.reviewer.tagline', 'Help people decide with honest breakdowns.'),
      description: t('quiz.archetypes.reviewer.fullDescription', 'You love testing, comparing, and forming opinions backed by evidence.'),
      strengths: safeArrayTranslation(t, 'quiz.archetypes.reviewer.strengths', ['Searchable & intent-rich']),
      challenges: safeArrayTranslation(t, 'quiz.archetypes.reviewer.challenges', ['Access to products/services']),
      platforms: safeArrayTranslation(t, 'quiz.archetypes.reviewer.platforms', ['YouTube (deep dives)']),
      ideas: safeArrayTranslation(t, 'quiz.archetypes.reviewer.ideas', ['Top 5 budget mics']),
      monetization: safeArrayTranslation(t, 'quiz.archetypes.reviewer.monetization', ['Affiliate programs']),
    },
    journey: {
      id: "journey",
      title: t('quiz.archetypes.journey.label', 'Journey / Documenter'),
      emoji: t('quiz.archetypes.journey.emoji', '🛤'),
      tagline: t('quiz.archetypes.journey.tagline', 'Bring people along as you learn and build.'),
      description: t('quiz.archetypes.journey.fullDescription', 'You share the real process—wins and stumbles.'),
      strengths: safeArrayTranslation(t, 'quiz.archetypes.journey.strengths', ['Highly relatable']),
      challenges: safeArrayTranslation(t, 'quiz.archetypes.journey.challenges', ['Slower monetization early']),
      platforms: safeArrayTranslation(t, 'quiz.archetypes.journey.platforms', ['YouTube (docu/progress)']),
      ideas: safeArrayTranslation(t, 'quiz.archetypes.journey.ideas', ['90-day transformation log']),
      monetization: safeArrayTranslation(t, 'quiz.archetypes.journey.monetization', ['Patreon']),
    },
  };
};

// ---------- Helpers ----------
const TIME_FILTERS: Record<TimeBucket, { prefer: string[]; avoid: string[] }> = {
  under_5: {
    prefer: ["TikTok", "Instagram Reels", "YouTube Shorts"],
    avoid: ["Podcast", "Long-form YouTube unless batch-recording"],
  },
  "5_to_10": {
    prefer: [
      "TikTok",
      "Instagram Reels",
      "YouTube Shorts",
      "1 simple YouTube/week",
    ],
    avoid: [],
  },
  "10_to_20": {
    prefer: ["YouTube long-form + Shorts", "Blog (biweekly)", "Light podcast"],
    avoid: [],
  },
  "20_plus": {
    prefer: ["YouTube long-form + Shorts", "Podcast", "Newsletter/Blog"],
    avoid: [],
  },
};

function pickPlatforms(
  base: string[],
  time?: TimeBucket,
  extras?: string[]
): string[] {
  const t = time ? TIME_FILTERS[time] : undefined;
  const merged = new Set<string>([...base, ...(extras || []), ...(t?.prefer || [])]);
  const unique = Array.from(merged);
  return unique.slice(0, 6);
}

// ---------- UI ----------
// Platform emoji map
const PLATFORM_EMOJIS: Record<string, string> = {
  "YouTube": "🎥",
  "TikTok": "🎬",
  "Instagram": "📸",
  "Pinterest": "📌",
  "Twitch": "🎮",
  "LinkedIn": "💼",
  "Blog": "✍️",
  "Medium": "✍️",
  "Reddit": "💬",
  "Discord": "💬",
  "X": "🐦",
  "Twitter": "🐦",
  "Podcast": "🎙️",
  "Newsletter": "✉️",
};

const getPlatformWithEmoji = (platform: string): string => {
  if (/[\u{1F300}-\u{1F9FF}]/u.test(platform)) return platform;
  
  for (const [key, emoji] of Object.entries(PLATFORM_EMOJIS)) {
    if (platform.includes(key)) {
      return `${emoji} ${platform}`;
    }
  }
  return platform;
};

const badge = (
  label: string,
  key?: string | number
) => (
  <span
    key={key ?? label}
    className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium">
    {label}
  </span>
);

const SectionTitle: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }>=({ icon, children })=> (
  <div className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-neutral-600">
    {icon}
    <span>{children}</span>
  </div>
);

const FeatureList: React.FC<{ items: string[]; icon?: React.ComponentType<any> }> = ({ items, icon: Icon = Check }) => (
  <ul className="mt-2 space-y-2">
    {items.map((it, idx) => (
      <li key={idx} className="flex items-start gap-2 text-sm leading-5">
        <Icon className="mt-0.5 h-4 w-4" />
        <span>{it}</span>
      </li>
    ))}
  </ul>
);

const Divider: React.FC = () => (
  <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
);

// ---------- Card Component ----------
interface ArchetypeCardProps {
  profile: ArchetypeProfile;
  time?: TimeBucket;
  extras?: string[];
  highlight?: boolean;
  quizResponseId?: string;
  selectedTopics?: string[];
  targetAudience?: string;
}

const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ 
  profile, 
  time, 
  extras, 
  highlight,
  quizResponseId,
  selectedTopics,
  targetAudience
}) => {
  const { t, i18n } = useTranslation();
  const recPlatforms = pickPlatforms(profile.platforms, time, extras);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [plan, setPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [preferredPlatform, setPreferredPlatform] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch user's preferred platform
  React.useEffect(() => {
    const fetchPlatform = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('preferred_platform')
            .eq('id', user.id)
            .maybeSingle();
          
          if (data?.preferred_platform) {
            setPreferredPlatform(data.preferred_platform);
          }
        }
      } catch (error) {
        console.error('Error fetching platform preference:', error);
      }
    };
    
    fetchPlatform();
  }, []);

  const generateIdeas = async () => {
    setLoading(true);
    setDialogOpen(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-ideas', {
        body: {
          archetype: profile.id,
          topics: selectedTopics || [],
          timeBucket: time,
          gear: extras || [],
          targetAudience: targetAudience || 'general audience',
          quizResponseId,
          preferredPlatform,
          language: i18n.language
        }
      });

      if (error) throw error;

      if (data?.ideas) {
        setIdeas(data.ideas);
      } else {
        throw new Error('No ideas returned');
      }
    } catch (err: any) {
      console.error('Error generating ideas:', err);
      toast({
        title: "Generation failed",
        description: err.message || "Failed to generate content ideas. Please try again.",
        variant: "destructive"
      });
      setDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    setPlanLoading(true);
    setPlanDialogOpen(true);
    
    try {
      const selectedIdeas = ideas.length > 0 ? ideas : profile.ideas.map(idea => ({ title: idea }));

      const { data, error } = await supabase.functions.invoke('generate-content-plan', {
        body: {
          archetype: profile.id,
          topics: selectedTopics || [],
          timeBucket: time,
          gear: extras || [],
          selectedIdeas,
          quizResponseId
        }
      });

      if (error) throw error;

      if (data?.plan) {
        setPlan(data.plan);
      } else {
        throw new Error('No plan returned');
      }
    } catch (err: any) {
      console.error('Error generating plan:', err);
      toast({
        title: "Generation failed",
        description: err.message || "Failed to generate content plan. Please try again.",
        variant: "destructive"
      });
      setPlanDialogOpen(false);
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`${highlight ? "ring-2 ring-emerald-400 shadow-xl" : ""} rounded-2xl bg-white/80 backdrop-blur-sm shadow-md border border-neutral-200`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl">{profile.emoji}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold tracking-tight">
                {profile.title}
              </h3>
              <p className="mt-1 text-sm text-neutral-600">{profile.tagline}</p>
            </div>
            {highlight && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                {t('quiz.results.topMatch')}
              </span>
            )}
          </div>

          <Divider />

          <p className="text-sm leading-6 text-neutral-800">{profile.description}</p>

          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <SectionTitle icon={<img src={logo} alt="" className="h-4 w-4" />}>
                {t('quiz.results.strengths')}
              </SectionTitle>
              <FeatureList items={profile.strengths} />
            </div>
            <div>
              <SectionTitle icon={<Zap className="h-4 w-4" />}>
                {t('quiz.results.challenges')}
              </SectionTitle>
              <FeatureList items={profile.challenges} />
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <SectionTitle icon={<VideoIcon className="h-4 w-4" />}>
                {t('quiz.results.bestPlatforms')}
              </SectionTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                {recPlatforms.map((p) => badge(getPlatformWithEmoji(p), p))}
              </div>
            </div>
            <div>
              <SectionTitle icon={<BookOpen className="h-4 w-4" />}>
                {t('quiz.results.exampleIdeas')}
              </SectionTitle>
              <ul className="mt-2 list-disc pl-5 text-sm leading-6">
                {profile.ideas.map((idea, idx) => (
                  <li key={idx}>{idea}</li>
                ))}
              </ul>
            </div>
          </div>

          <Divider />

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <SectionTitle icon={<TrendingUp className="h-4 w-4" />}>
                {t('quiz.results.monetization')}
              </SectionTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.monetization.map((m, i) => badge(m, i))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                className="rounded-2xl gap-2" 
                onClick={generateIdeas}
                disabled={loading}
              >
                <img src={logo} alt="" className="h-4 w-4" />
                {t('quiz.results.getStarterPrompts')}
              </Button>
              <Button 
                variant="outline" 
                className="rounded-2xl gap-2"
                onClick={generatePlan}
                disabled={planLoading}
              >
                <Calendar className="h-4 w-4" />
                {t('quiz.results.make7DayPlan')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ContentIdeasDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ideas={ideas}
        loading={loading}
        onRegenerate={generateIdeas}
      />
      
      <ContentPlanDialog
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        plan={plan}
        loading={planLoading}
        onRegenerate={generatePlan}
      />
    </motion.div>
  );
};

// ---------- Main Results Component ----------

interface ResultsProps {
  primary?: ArchetypeId;
  secondary?: ArchetypeId;
  time?: TimeBucket;
  extras?: string[];
  quizResponseId?: string;
  selectedTopics?: string[];
  targetAudience?: string;
}

const orderedIds: ArchetypeId[] = [
  "educator",
  "entertainer",
  "lifestyle",
  "reviewer",
  "journey",
];

export default function ArchetypeResults(
  {
    primary = "educator",
    secondary = "journey",
    time = "5_to_10",
    extras = [],
    quizResponseId,
    selectedTopics,
    targetAudience
  }: ResultsProps
) {
  const { t } = useTranslation();
  const PROFILES = useArchetypeProfiles();
  const primaryProfile = PROFILES[primary];
  const secondaryProfile = PROFILES[secondary];
  const [chatOpen, setChatOpen] = useState(false);

  const rest = orderedIds.filter((id) => id !== primary && id !== secondary);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-50 to-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between" data-testid="archetype-results-v2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('quiz.results.yourCreatorPath')}</h1>
            <p className="mt-1 text-neutral-600">
              {t('quiz.results.basedOnQuiz')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChatOpen(true)}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              {t('quiz.results.aiCoach')}
            </Button>
            <div className="flex items-center gap-2 rounded-2xl border bg-white/70 px-3 py-1 text-sm">
              <Clock className="h-4 w-4" />
              <span>{t('quiz.results.weeklyTime')} </span>
              <strong className="ml-1 capitalize">{time.replace(/_/g, " ")}</strong>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <ArchetypeCard 
            profile={primaryProfile} 
            time={time} 
            extras={extras} 
            highlight 
            quizResponseId={quizResponseId}
            selectedTopics={selectedTopics}
            targetAudience={targetAudience}
          />
        </div>

        <footer className="mx-auto mt-10 max-w-3xl text-center text-sm text-neutral-500">
          <p>
            {t('quiz.results.tip')}
          </p>
        </footer>
      </div>
      
      <AIChatCoach open={chatOpen} onOpenChange={setChatOpen} />
    </div>
  );
}

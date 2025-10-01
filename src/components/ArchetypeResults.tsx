import React from "react";
import { motion } from "framer-motion";
import { Check, TrendingUp, BookOpen, VideoIcon, Sparkles, Zap, Clock, Stars } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  platforms: string[]; // base platforms before filters
  ideas: string[]; // example content ideas
  monetization: string[];
}

// ---------- Data ----------
const PROFILES: Record<ArchetypeId, ArchetypeProfile> = {
  educator: {
    id: "educator",
    title: "Educator / Teacher",
    emoji: "📚",
    tagline: "Turn know-how into clear, actionable lessons.",
    description:
      "You thrive when teaching, explaining, and helping others learn. You make complex topics simple and actionable.",
    strengths: [
      "Builds trust and authority",
      "Creates evergreen, searchable content",
      "Easy to grow into courses or consulting",
    ],
    challenges: [
      "Requires preparation and consistency",
      "Content may take longer to produce",
    ],
    platforms: [
      "🎥 YouTube (tutorials, step-by-step guides)",
      "🎬 TikTok / Reels (quick how-to tips)",
      "💼 LinkedIn (professional knowledge)",
      "✍️ Blog / Medium",
    ],
    ideas: [
      "5-Minute Productivity Hacks",
      "How to Start Investing With $100",
      "Beginner Python Tutorial",
    ],
    monetization: ["Courses", "Ebooks", "Workshops", "Coaching", "Consulting"],
  },
  entertainer: {
    id: "entertainer",
    title: "Entertainer / Performer",
    emoji: "🎭",
    tagline: "Capture attention with humor, story, and energy.",
    description:
      "You shine when entertaining. Whether it’s comedy, reactions, gaming, or storytelling—you grab attention and make people feel.",
    strengths: [
      "Fast growth potential (viral content)",
      "Builds strong audience connection",
      "Great for trends and challenges",
    ],
    challenges: [
      "High content demand to stay relevant",
      "Content often has short lifespan",
    ],
    platforms: [
      "🎬 TikTok (skits, challenges)",
      "📸 Instagram Reels (trendy/visual humor)",
      "🎥 YouTube Shorts",
      "🎮 Twitch (live gaming/performances)",
    ],
    ideas: [
      "Reacting to Viral TikToks",
      "Comedy Skits About Daily Struggles",
      "Fun Gaming Challenges",
    ],
    monetization: ["Brand deals", "Merch", "Sponsorships", "Patreon"],
  },
  lifestyle: {
    id: "lifestyle",
    title: "Lifestyle & Inspiration",
    emoji: "🌿",
    tagline: "Make your habits and taste the brand.",
    description:
      "You inspire by sharing your routines, habits, or aesthetics. Your personality and lifestyle are the brand.",
    strengths: [
      "Easy to connect with audiences",
      "Strong opportunities for partnerships",
      "Flexible (covers fashion, wellness, travel, etc.)",
    ],
    challenges: [
      "Relies heavily on personal branding",
      "Hard to stand out without unique style",
    ],
    platforms: [
      "📸 Instagram (photos, Reels, Stories)",
      "🎬 TikTok (relatable daily life)",
      "🎥 YouTube (vlogs, lifestyle routines)",
      "📌 Pinterest (aesthetics, inspiration boards)",
    ],
    ideas: [
      "Morning Routine for Success",
      "Budget Travel Hacks",
      "Healthy Meal Preps for Busy Days",
    ],
    monetization: ["Sponsorships", "Affiliate marketing", "Product collabs"],
  },
  reviewer: {
    id: "reviewer",
    title: "Reviewer / Analyst",
    emoji: "🔎",
    tagline: "Help people decide with honest breakdowns.",
    description:
      "You love testing, analyzing, and sharing your honest opinions. You break things down so others can make better choices.",
    strengths: [
      "Builds credibility and trust",
      "Highly searchable content (people seek reviews)",
      "Strong affiliate marketing potential",
    ],
    challenges: [
      "Competitive in big niches (tech, finance)",
      "Requires access to products/services",
    ],
    platforms: [
      "🎥 YouTube (deep reviews, comparisons)",
      "🎬 TikTok / Reels (quick takes, unboxings)",
      "✍️ Blog / Medium (long-form reviews)",
      "💬 Reddit/Discord (community engagement)",
    ],
    ideas: [
      "iPhone 15 vs Samsung S24: Honest Comparison",
      "Top 5 Budget Microphones for Creators",
      "Weekly Netflix Show Reviews",
    ],
    monetization: [
      "Affiliate links",
      "Sponsorships",
      "Brand deals",
      "Amazon Influencer",
    ],
  },
  journey: {
    id: "journey",
    title: "Journey / Documenter",
    emoji: "🛤",
    tagline: "Bring people along as you learn and build.",
    description:
      "You bring people along as you learn, build, or transform. The value comes from authenticity and showing progress, not perfection.",
    strengths: [
      "Very relatable, inspires community",
      "Low barrier to start (you don’t need expertise)",
      "Creates long-term loyalty as audience follows your growth",
    ],
    challenges: [
      "Takes time to show results",
      "Monetization is slower in the beginning",
    ],
    platforms: [
      "🎥 YouTube (progress/documentary series)",
      "🎬 TikTok (short updates)",
      "🐦 X/Twitter (threads, reflections)",
      "📸 Instagram Stories (daily check-ins)",
    ],
    ideas: [
      "Day 1 of Learning Guitar – Watch My Progress",
      "Building My Startup in Public",
      "90-Day Fitness Transformation Journey",
    ],
    monetization: [
      "Community support (Patreon)",
      "Affiliate links",
      "Courses (later once expertise develops)",
    ],
  },
};

// ---------- Helpers ----------
const TIME_FILTERS: Record<TimeBucket, { prefer: string[]; avoid: string[] }> = {
  "under_5": {
    prefer: ["TikTok", "Instagram Reels", "YouTube Shorts"],
    avoid: ["Podcast", "Long‑form YouTube unless batch‑recording"],
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
    prefer: ["YouTube long‑form + Shorts", "Blog (biweekly)", "Light podcast"],
    avoid: [],
  },
  "20_plus": {
    prefer: ["YouTube long‑form + Shorts", "Podcast", "Newsletter/Blog"],
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
  // Light de‑duplication by label start
  const unique = Array.from(merged);
  return unique.slice(0, 6);
}

// ---------- UI ----------
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
  extras?: string[]; // e.g., from gear or audience bias
  highlight?: boolean;
}

const ArchetypeCard: React.FC<ArchetypeCardProps> = ({ profile, time, extras, highlight }) => {
  const recPlatforms = pickPlatforms(profile.platforms, time, extras);

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
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">Top Match</span>
            )}
          </div>

          <Divider />

          <p className="text-sm leading-6 text-neutral-800">{profile.description}</p>

          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <SectionTitle icon={<Sparkles className="h-4 w-4" />}>Strengths</SectionTitle>
              <FeatureList items={profile.strengths} />
            </div>
            <div>
              <SectionTitle icon={<Zap className="h-4 w-4" />}>Challenges</SectionTitle>
              <FeatureList items={profile.challenges} />
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <SectionTitle icon={<VideoIcon className="h-4 w-4" />}>Best Platforms</SectionTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                {recPlatforms.map((p) => badge(p, p))}
              </div>
            </div>
            <div>
              <SectionTitle icon={<BookOpen className="h-4 w-4" />}>Example Content Ideas</SectionTitle>
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
              <SectionTitle icon={<TrendingUp className="h-4 w-4" />}>Monetization Paths</SectionTitle>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.monetization.map((m, i) => badge(m, i))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="rounded-2xl">Get 3 Starter Prompts</Button>
              <Button variant="outline" className="rounded-2xl">Make 7‑Day Plan</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ---------- Demo Page Component ----------

interface ResultsProps {
  primary?: ArchetypeId;
  secondary?: ArchetypeId;
  time?: TimeBucket; // from quiz Q6
  extras?: string[]; // from gear or audience bias
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
  }: ResultsProps
) {
  const primaryProfile = PROFILES[primary];
  const secondaryProfile = PROFILES[secondary];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-50 to-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Creator Path</h1>
            <p className="mt-1 text-neutral-600">
              Based on your quiz, here are your archetypes and tailored platform recommendations.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border bg-white/70 px-3 py-1 text-sm">
            <Clock className="h-4 w-4" />
            <span>Weekly time: </span>
            <strong className="ml-1 capitalize">{time.replace(/_/g, " ")}</strong>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <ArchetypeCard profile={primaryProfile} time={time} extras={extras} highlight />
          <ArchetypeCard profile={secondaryProfile} time={time} extras={extras} />
        </div>

{/* Showing only primary and optional secondary archetypes per user request */}

        <footer className="mx-auto mt-10 max-w-3xl text-center text-sm text-neutral-500">
          <p>
            Tip: Click "Get 3 Starter Prompts" to generate ideas tuned to your archetype, topic, and time budget.
          </p>
        </footer>
      </div>
    </div>
  );
}

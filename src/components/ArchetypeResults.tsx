import React from "react";
import { motion } from "framer-motion";
import { Check, TrendingUp, BookOpen, VideoIcon, Sparkles, Zap, Clock } from "lucide-react";
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
    tagline: "Turn know‑how into clear, actionable lessons.",
    description:
      "You thrive at explaining, simplifying, and helping people make real progress. Your content compounds as evergreen value.",
    strengths: [
      "Builds trust & authority",
      "Evergreen, searchable content",
      "Natural path to courses & coaching",
    ],
    challenges: [
      "Prep time for quality lessons",
      "Consistency needed for growth",
    ],
    platforms: [
      "YouTube (tutorials)",
      "TikTok/Reels (quick tips)",
      "LinkedIn (pro topics)",
      "Blog/Medium",
    ],
    ideas: [
      "Beginner Python in 7 days",
      "5‑minute productivity hacks",
      "No‑code app tutorial series",
    ],
    monetization: ["Courses", "Workshops", "Ebooks", "Coaching/Consulting"],
  },
  entertainer: {
    id: "entertainer",
    title: "Entertainer / Performer",
    emoji: "🎭",
    tagline: "Capture attention with humor, story, and energy.",
    description:
      "You shine on camera and love making people feel something—laughs, thrills, or surprise. Great fit for trends and rapid iteration.",
    strengths: ["High viral potential", "Strong parasocial connection", "Trend‑friendly"],
    challenges: ["High content cadence", "Short shelf life for trends"],
    platforms: [
      "TikTok",
      "Instagram Reels",
      "YouTube Shorts",
      "Twitch (live)",
    ],
    ideas: [
      "Daily comedy skits",
      "Reacting to viral clips",
      "Gaming challenges with forfeits",
    ],
    monetization: ["Brand deals", "Sponsorships", "Merch", "Patreon"],
  },
  lifestyle: {
    id: "lifestyle",
    title: "Lifestyle & Inspiration",
    emoji: "🌿",
    tagline: "Make your habits and taste the brand.",
    description:
      "You inspire through routines, aesthetics, and personal stories. Your personality is the product—show, don't tell.",
    strengths: ["High relatability", "Strong brand partnerships", "Broad topics"],
    challenges: ["Requires unique personal style", "Consistency around your life"],
    platforms: [
      "Instagram",
      "TikTok",
      "YouTube (vlogs)",
      "Pinterest",
    ],
    ideas: [
      "AM/PM routine reels",
      "Budget travel mini‑vlogs",
      "Healthy meal prep week",
    ],
    monetization: [
      "Sponsorships",
      "Affiliate links",
      "Product collabs",
      "Digital presets/templates",
    ],
  },
  reviewer: {
    id: "reviewer",
    title: "Reviewer / Analyst",
    emoji: "🔎",
    tagline: "Help people decide with honest breakdowns.",
    description:
      "You love testing, comparing, and forming opinions backed by evidence. Trust is your growth engine.",
    strengths: ["Searchable & intent‑rich", "Credibility builds fast", "Affiliate friendly"],
    challenges: ["Access to products/services", "Crowded in big niches"],
    platforms: [
      "YouTube (deep dives)",
      "TikTok/Reels (quick takes)",
      "Blog/Medium/Substack",
      "Reddit/Discord",
    ],
    ideas: [
      "Top 5 budget mics",
      "iPhone vs Galaxy honest review",
      "Weekly streaming picks",
    ],
    monetization: [
      "Affiliate programs",
      "Sponsorships",
      "Brand partnerships",
      "Amazon Influencer",
    ],
  },
  journey: {
    id: "journey",
    title: "Journey / Documenter",
    emoji: "🛤",
    tagline: "Bring people along as you learn and build.",
    description:
      "You share the real process—wins and stumbles. Authenticity and consistency turn long arcs into loyal communities.",
    strengths: ["Highly relatable", "Low barrier to start", "Long‑term loyalty"],
    challenges: ["Slower monetization early", "Results take time"],
    platforms: [
      "YouTube (docu/progress)",
      "TikTok (updates)",
      "X/Twitter (threads)",
      "Instagram Stories",
    ],
    ideas: [
      "90‑day transformation log",
      "Building a startup in public",
      "Learning guitar: day‑by‑day",
    ],
    monetization: ["Patreon", "Affiliate links", "Courses later", "Community"],
  },
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
  // Light de‑duplication by label start
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
  // Check if platform already has emoji
  if (/[\u{1F300}-\u{1F9FF}]/u.test(platform)) return platform;
  
  // Find matching emoji
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
                {recPlatforms.map((p) => badge(getPlatformWithEmoji(p), p))}
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

// ---------- Main Results Component ----------

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

  // Build a display list with primary first, then secondary, then others (collapsed)
  const rest = orderedIds.filter((id) => id !== primary && id !== secondary);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-50 to-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between" data-testid="archetype-results-v2">
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

        {/* Optional: show the rest minimized */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {rest.map((id) => (
            <ArchetypeCard key={id} profile={PROFILES[id]} time={time} extras={extras} />
          ))}
        </div>

        <footer className="mx-auto mt-10 max-w-3xl text-center text-sm text-neutral-500">
          <p>
            Tip: Click "Get 3 Starter Prompts" to generate ideas tuned to your archetype, topic, and time budget.
          </p>
        </footer>
      </div>
    </div>
  );
}

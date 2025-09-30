type ArchetypeWeights = {
  educator?: number;
  entertainer?: number;
  lifestyle?: number;
  reviewer?: number;
  journey?: number;
};

type QuizOption = {
  id: string;
  label: string;
  weights?: ArchetypeWeights;
  meta?: {
    time_bucket?: string;
    gear?: string;
    platform_bias?: string[];
  };
};

export const archetypes = {
  educator: {
    label: "Educator / Teacher",
    description: "Explains concepts, teaches skills, breaks things into steps.",
    emoji: "🎓"
  },
  entertainer: {
    label: "Entertainer / Performer",
    description: "Skits, humor, reactions, gaming, performance.",
    emoji: "🎭"
  },
  lifestyle: {
    label: "Lifestyle & Inspiration",
    description: "Daily routines, fashion, wellness, motivation, travel.",
    emoji: "✨"
  },
  reviewer: {
    label: "Reviewer / Analyst",
    description: "Unboxings, comparisons, deep dives, opinions with evidence.",
    emoji: "🔍"
  },
  journey: {
    label: "Journey / Documenter",
    description: "Build in public, progress logs, behind-the-scenes.",
    emoji: "🚀"
  }
};

export const quizQuestions: Array<{
  id: string;
  text: string;
  type: "single_select" | "multi_select";
  maxSelect?: number;
  options: QuizOption[];
}> = [
  {
    id: "Q1_content_mode",
    text: "Which style of creating sounds most like you?",
    type: "single_select" as const,
    options: [
      { id: "Q1A1", label: "Teaching and explaining step by step", weights: { educator: 3 } },
      { id: "Q1A2", label: "Entertaining with humor, skits, or performance", weights: { entertainer: 3 } },
      { id: "Q1A3", label: "Sharing lifestyle, routines, or inspiration", weights: { lifestyle: 3 } },
      { id: "Q1A4", label: "Reviewing or analyzing products and trends", weights: { reviewer: 3 } },
      { id: "Q1A5", label: "Documenting my progress and lessons learned", weights: { journey: 3 } }
    ]
  },
  {
    id: "Q2_passions",
    text: "Pick up to 3 topics you could talk about for hours.",
    type: "multi_select" as const,
    maxSelect: 3,
    options: [
      { id: "Q2T1", label: "Technology & AI" },
      { id: "Q2T2", label: "Fitness & Wellness" },
      { id: "Q2T3", label: "Food & Cooking" },
      { id: "Q2T4", label: "Travel & Adventure" },
      { id: "Q2T5", label: "Money & Careers" },
      { id: "Q2T6", label: "Education & Study Hacks" },
      { id: "Q2T7", label: "Fashion & Beauty" },
      { id: "Q2T8", label: "Gaming & Esports" },
      { id: "Q2T9", label: "Home, DIY & Productivity" },
      { id: "Q2T10", label: "Parenting & Relationships" },
      { id: "Q2T11", label: "Entertainment & Pop Culture" },
      { id: "Q2T12", label: "Entrepreneurship & Startups" }
    ]
  },
  {
    id: "Q3_strengths",
    text: "Which strengths feel most true? (Pick up to 2)",
    type: "multi_select" as const,
    maxSelect: 2,
    options: [
      { id: "Q3A1", label: "Clear explanations and step-by-steps", weights: { educator: 2, reviewer: 1 } },
      { id: "Q3A2", label: "Making people laugh / performance", weights: { entertainer: 2 } },
      { id: "Q3A3", label: "Aesthetics / lifestyle storytelling", weights: { lifestyle: 2 } },
      { id: "Q3A4", label: "Breaking things down analytically", weights: { reviewer: 2, educator: 1 } },
      { id: "Q3A5", label: "Honest self-reflection / sharing progress", weights: { journey: 2 } }
    ]
  },
  {
    id: "Q4_motivation",
    text: "Your main reason to create?",
    type: "single_select" as const,
    options: [
      { id: "Q4A1", label: "Help others learn and grow", weights: { educator: 2 } },
      { id: "Q4A2", label: "Entertain and bring joy", weights: { entertainer: 2 } },
      { id: "Q4A3", label: "Inspire with my lifestyle", weights: { lifestyle: 2 } },
      { id: "Q4A4", label: "Share opinions and reviews people trust", weights: { reviewer: 2 } },
      { id: "Q4A5", label: "Document my journey from zero", weights: { journey: 2 } }
    ]
  },
  {
    id: "Q5_format_comfort",
    text: "Which format feels most natural?",
    type: "single_select" as const,
    options: [
      { id: "Q5A1", label: "Talking head tutorials", weights: { educator: 1 } },
      { id: "Q5A2", label: "Skits / reactions / performance", weights: { entertainer: 1 } },
      { id: "Q5A3", label: "Aesthetic b-roll / vlogs", weights: { lifestyle: 1, journey: 1 } },
      { id: "Q5A4", label: "Screen shares / breakdowns", weights: { educator: 1, reviewer: 1 } },
      { id: "Q5A5", label: "Short progress updates", weights: { journey: 1 } }
    ]
  },
  {
    id: "Q6_time",
    text: "Realistic time you can dedicate weekly?",
    type: "single_select" as const,
    options: [
      { id: "Q6A1", label: "< 5 hours", meta: { time_bucket: "under_5" } },
      { id: "Q6A2", label: "5–10 hours", meta: { time_bucket: "5_to_10" } },
      { id: "Q6A3", label: "10–20 hours", meta: { time_bucket: "10_to_20" } },
      { id: "Q6A4", label: "20+ hours", meta: { time_bucket: "20_plus" } }
    ]
  },
  {
    id: "Q7_resources",
    text: "What gear/resources do you have today?",
    type: "multi_select" as const,
    maxSelect: 3,
    options: [
      { id: "Q7A1", label: "Smartphone only", meta: { gear: "phone" } },
      { id: "Q7A2", label: "Good lighting / mic", meta: { gear: "basic_studio" } },
      { id: "Q7A3", label: "Screen capture setup", meta: { gear: "screen" } },
      { id: "Q7A4", label: "Camera + lenses", meta: { gear: "camera" } },
      { id: "Q7A5", label: "Editing software", meta: { gear: "editor" } }
    ]
  },
  {
    id: "Q8_audience",
    text: "Who do you most want to reach?",
    type: "single_select" as const,
    options: [
      { id: "Q8A1", label: "Beginners learning a skill", weights: { educator: 1 }, meta: { platform_bias: ["YouTube", "TikTok", "Blog"] } },
      { id: "Q8A2", label: "Professionals in my field", weights: { educator: 1, reviewer: 1 }, meta: { platform_bias: ["LinkedIn", "YouTube"] } },
      { id: "Q8A3", label: "People who like my lifestyle", weights: { lifestyle: 1 }, meta: { platform_bias: ["Instagram", "TikTok", "YouTube"] } },
      { id: "Q8A4", label: "General audience / entertainment", weights: { entertainer: 1 }, meta: { platform_bias: ["TikTok", "Instagram", "YouTube Shorts"] } },
      { id: "Q8A5", label: "Niche hobby communities", weights: { reviewer: 1, journey: 1 }, meta: { platform_bias: ["YouTube", "Reddit", "Discord"] } }
    ]
  }
];

export const platformRules = {
  educator: ["YouTube (tutorials)", "TikTok (quick tips)", "LinkedIn", "Blog"],
  entertainer: ["TikTok", "Instagram Reels", "YouTube Shorts", "Twitch"],
  lifestyle: ["Instagram", "TikTok", "YouTube (vlogs)", "Pinterest"],
  reviewer: ["YouTube (in-depth)", "Blog/Medium", "TikTok (quick reviews)", "Reddit"],
  journey: ["YouTube (documentaries)", "TikTok (progress)", "X/Twitter", "Discord"]
};

export const nicheSuggestions: Record<string, Record<string, string[]>> = {
  "Technology & AI": {
    educator: ["No-code app tutorials", "AI tools in 60s", "Beginner Python series"],
    reviewer: ["Weekly AI tool reviews", "Laptop/creator gear comparisons"],
    journey: ["Learning ML in public", "Building an AI startup log"]
  },
  "Fitness & Wellness": {
    educator: ["Home workouts 10-minute series", "Macros for beginners"],
    lifestyle: ["Daily healthy routine vlogs", "Meal-prep diaries"],
    journey: ["90-day transformation log", "Post-injury comeback"]
  },
  "Food & Cooking": {
    educator: ["5-ingredient recipes", "Knife skills 101"],
    lifestyle: ["What I eat in a day", "Budget grocery hauls"],
    reviewer: ["Kitchen gadget reviews", "Restaurant shorts"]
  },
  "Travel & Adventure": {
    lifestyle: ["Minimalist travel hacks", "City weekend itineraries"],
    journey: ["Backpacking series from zero", "Vanlife build log"],
    reviewer: ["Travel gear comparisons", "Airline/lounge reviews"]
  },
  "Money & Careers": {
    educator: ["Resume/LinkedIn teardown", "Budgeting basics"],
    reviewer: ["Fintech app reviews", "Credit card comparisons"],
    journey: ["From broke to $10k savings", "Career switch diary"]
  },
  "Education & Study Hacks": {
    educator: ["Study-with-me pomodoros", "Note-taking systems"],
    lifestyle: ["Student day-in-the-life"],
    journey: ["From 2.5 to 3.8 GPA"]
  },
  "Fashion & Beauty": {
    lifestyle: ["Capsule wardrobe series", "Skin routines"],
    reviewer: ["Haul breakdowns", "Product dupes tests"],
    journey: ["Personal style evolution"]
  },
  "Gaming & Esports": {
    entertainer: ["Funny highlights", "Challenge runs"],
    reviewer: ["Peripheral reviews", "New title first looks"],
    journey: ["Climbing ranked ladder"]
  },
  "Home, DIY & Productivity": {
    educator: ["Notion/Obsidian tutorials", "Declutter systems"],
    lifestyle: ["Room makeovers", "Desk setups"],
    journey: ["30-day productivity sprint"]
  },
  "Parenting & Relationships": {
    lifestyle: ["Parent routines", "Date-night ideas"],
    journey: ["New parent diary"],
    educator: ["Positive discipline basics"]
  },
  "Entertainment & Pop Culture": {
    entertainer: ["Sketches & parodies", "Hot take shorts"],
    reviewer: ["Movie/show breakdowns"],
    journey: ["Scriptwriting in public"]
  },
  "Entrepreneurship & Startups": {
    journey: ["Build in public log", "Weekly KPI updates"],
    educator: ["How to validate ideas", "No-code MVP series"],
    reviewer: ["SaaS tool reviews"]
  }
};

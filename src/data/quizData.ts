type ArchetypeWeights = {
  educator?: number;
  entertainer?: number;
  lifestyle?: number;
  reviewer?: number;
  journey?: number;
};

type QuizOption = {
  id: string;
  labelKey: string; // Translation key instead of hardcoded label
  weights?: ArchetypeWeights;
  meta?: {
    time_bucket?: string;
    gear?: string;
    platform_bias?: string[];
  };
};

export const archetypeIds = ['educator', 'entertainer', 'lifestyle', 'reviewer', 'journey'] as const;
export type ArchetypeId = typeof archetypeIds[number];

// Simple archetype data - emoji only, rest comes from translations
export const archetypes = {
  educator: { emoji: "🎓" },
  entertainer: { emoji: "🎭" },
  lifestyle: { emoji: "✨" },
  reviewer: { emoji: "🔍" },
  journey: { emoji: "🚀" }
};

export const quizQuestions: Array<{
  id: string;
  textKey: string; // Translation key for question text
  type: "single_select" | "multi_select";
  maxSelect?: number;
  options: QuizOption[];
}> = [
  {
    id: "Q1_content_mode",
    textKey: "quiz.questions.Q1_content_mode.text",
    type: "single_select" as const,
    options: [
      { id: "Q1A1", labelKey: "quiz.questions.Q1_content_mode.options.Q1A1", weights: { educator: 3 } },
      { id: "Q1A2", labelKey: "quiz.questions.Q1_content_mode.options.Q1A2", weights: { entertainer: 3 } },
      { id: "Q1A3", labelKey: "quiz.questions.Q1_content_mode.options.Q1A3", weights: { lifestyle: 3 } },
      { id: "Q1A4", labelKey: "quiz.questions.Q1_content_mode.options.Q1A4", weights: { reviewer: 3 } },
      { id: "Q1A5", labelKey: "quiz.questions.Q1_content_mode.options.Q1A5", weights: { journey: 3 } }
    ]
  },
  {
    id: "Q2_passions",
    textKey: "quiz.questions.Q2_passions.text",
    type: "multi_select" as const,
    maxSelect: 3,
    options: [
      { id: "Q2T1", labelKey: "quiz.questions.Q2_passions.options.Q2T1" },
      { id: "Q2T2", labelKey: "quiz.questions.Q2_passions.options.Q2T2" },
      { id: "Q2T3", labelKey: "quiz.questions.Q2_passions.options.Q2T3" },
      { id: "Q2T4", labelKey: "quiz.questions.Q2_passions.options.Q2T4" },
      { id: "Q2T5", labelKey: "quiz.questions.Q2_passions.options.Q2T5" },
      { id: "Q2T6", labelKey: "quiz.questions.Q2_passions.options.Q2T6" },
      { id: "Q2T7", labelKey: "quiz.questions.Q2_passions.options.Q2T7" },
      { id: "Q2T8", labelKey: "quiz.questions.Q2_passions.options.Q2T8" },
      { id: "Q2T9", labelKey: "quiz.questions.Q2_passions.options.Q2T9" },
      { id: "Q2T10", labelKey: "quiz.questions.Q2_passions.options.Q2T10" },
      { id: "Q2T11", labelKey: "quiz.questions.Q2_passions.options.Q2T11" },
      { id: "Q2T12", labelKey: "quiz.questions.Q2_passions.options.Q2T12" }
    ]
  },
  {
    id: "Q3_strengths",
    textKey: "quiz.questions.Q3_strengths.text",
    type: "multi_select" as const,
    maxSelect: 2,
    options: [
      { id: "Q3A1", labelKey: "quiz.questions.Q3_strengths.options.Q3A1", weights: { educator: 2, reviewer: 1 } },
      { id: "Q3A2", labelKey: "quiz.questions.Q3_strengths.options.Q3A2", weights: { entertainer: 2 } },
      { id: "Q3A3", labelKey: "quiz.questions.Q3_strengths.options.Q3A3", weights: { lifestyle: 2 } },
      { id: "Q3A4", labelKey: "quiz.questions.Q3_strengths.options.Q3A4", weights: { reviewer: 2, educator: 1 } },
      { id: "Q3A5", labelKey: "quiz.questions.Q3_strengths.options.Q3A5", weights: { journey: 2 } }
    ]
  },
  {
    id: "Q4_motivation",
    textKey: "quiz.questions.Q4_motivation.text",
    type: "single_select" as const,
    options: [
      { id: "Q4A1", labelKey: "quiz.questions.Q4_motivation.options.Q4A1", weights: { educator: 2 } },
      { id: "Q4A2", labelKey: "quiz.questions.Q4_motivation.options.Q4A2", weights: { entertainer: 2 } },
      { id: "Q4A3", labelKey: "quiz.questions.Q4_motivation.options.Q4A3", weights: { lifestyle: 2 } },
      { id: "Q4A4", labelKey: "quiz.questions.Q4_motivation.options.Q4A4", weights: { reviewer: 2 } },
      { id: "Q4A5", labelKey: "quiz.questions.Q4_motivation.options.Q4A5", weights: { journey: 2 } }
    ]
  },
  {
    id: "Q5_format_comfort",
    textKey: "quiz.questions.Q5_format_comfort.text",
    type: "single_select" as const,
    options: [
      { id: "Q5A1", labelKey: "quiz.questions.Q5_format_comfort.options.Q5A1", weights: { educator: 1 } },
      { id: "Q5A2", labelKey: "quiz.questions.Q5_format_comfort.options.Q5A2", weights: { entertainer: 1 } },
      { id: "Q5A3", labelKey: "quiz.questions.Q5_format_comfort.options.Q5A3", weights: { lifestyle: 1, journey: 1 } },
      { id: "Q5A4", labelKey: "quiz.questions.Q5_format_comfort.options.Q5A4", weights: { educator: 1, reviewer: 1 } },
      { id: "Q5A5", labelKey: "quiz.questions.Q5_format_comfort.options.Q5A5", weights: { journey: 1 } }
    ]
  },
  {
    id: "Q6_time",
    textKey: "quiz.questions.Q6_time.text",
    type: "single_select" as const,
    options: [
      { id: "Q6A1", labelKey: "quiz.questions.Q6_time.options.Q6A1", meta: { time_bucket: "under_5" } },
      { id: "Q6A2", labelKey: "quiz.questions.Q6_time.options.Q6A2", meta: { time_bucket: "5_to_10" } },
      { id: "Q6A3", labelKey: "quiz.questions.Q6_time.options.Q6A3", meta: { time_bucket: "10_to_20" } },
      { id: "Q6A4", labelKey: "quiz.questions.Q6_time.options.Q6A4", meta: { time_bucket: "20_plus" } }
    ]
  },
  {
    id: "Q7_resources",
    textKey: "quiz.questions.Q7_resources.text",
    type: "multi_select" as const,
    maxSelect: 3,
    options: [
      { id: "Q7A1", labelKey: "quiz.questions.Q7_resources.options.Q7A1", meta: { gear: "phone" } },
      { id: "Q7A2", labelKey: "quiz.questions.Q7_resources.options.Q7A2", meta: { gear: "basic_studio" } },
      { id: "Q7A3", labelKey: "quiz.questions.Q7_resources.options.Q7A3", meta: { gear: "screen" } },
      { id: "Q7A4", labelKey: "quiz.questions.Q7_resources.options.Q7A4", meta: { gear: "camera" } },
      { id: "Q7A5", labelKey: "quiz.questions.Q7_resources.options.Q7A5", meta: { gear: "editor" } }
    ]
  },
  {
    id: "Q8_audience",
    textKey: "quiz.questions.Q8_audience.text",
    type: "single_select" as const,
    options: [
      { id: "Q8A1", labelKey: "quiz.questions.Q8_audience.options.Q8A1", weights: { educator: 1 }, meta: { platform_bias: ["YouTube", "TikTok", "Blog"] } },
      { id: "Q8A2", labelKey: "quiz.questions.Q8_audience.options.Q8A2", weights: { educator: 1, reviewer: 1 }, meta: { platform_bias: ["LinkedIn", "YouTube"] } },
      { id: "Q8A3", labelKey: "quiz.questions.Q8_audience.options.Q8A3", weights: { lifestyle: 1 }, meta: { platform_bias: ["Instagram", "TikTok", "YouTube"] } },
      { id: "Q8A4", labelKey: "quiz.questions.Q8_audience.options.Q8A4", weights: { entertainer: 1 }, meta: { platform_bias: ["TikTok", "Instagram", "YouTube Shorts"] } },
      { id: "Q8A5", labelKey: "quiz.questions.Q8_audience.options.Q8A5", weights: { reviewer: 1, journey: 1 }, meta: { platform_bias: ["YouTube", "Reddit", "Discord"] } }
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

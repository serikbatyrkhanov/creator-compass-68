export type ArchetypeEnum = 
  | "Educator" 
  | "Entertainer" 
  | "Reviewer" 
  | "Lifestyle" 
  | "Journey" 
  | "Analyst" 
  | "Coach";

export const ARCHETYPE_OPTIONS: { value: ArchetypeEnum; label: string }[] = [
  { value: "Educator", label: "Educator" },
  { value: "Entertainer", label: "Entertainer" },
  { value: "Reviewer", label: "Reviewer" },
  { value: "Lifestyle", label: "Lifestyle" },
  { value: "Journey", label: "Journey" },
  { value: "Analyst", label: "Analyst" },
  { value: "Coach", label: "Coach" },
];

// Sanitization
export const sanitizeNiche = (value: string): string => {
  return value
    .trim()
    .replace(/\s{2,}/g, ' '); // collapse multiple spaces
};

// Validation
export const validateNiche = (value: string): { valid: boolean; error?: string } => {
  const sanitized = sanitizeNiche(value);
  const length = sanitized.length;
  
  if (length < 3) return { valid: false, error: "Please enter at least 3 characters." };
  if (length > 44) return { valid: false, error: "Keep it under 44 characters." };
  
  const regex = /^(?!\s)(?!.*\s$)(?!.* {2,})[A-Za-z0-9,&./'\- ]{3,44}$/;
  if (!regex.test(sanitized)) {
    return { valid: false, error: "Use letters, numbers, spaces, and , & . / ' - only." };
  }
  
  return { valid: true };
};

// Archetype validation removed - archetypes are now auto-populated from quiz results

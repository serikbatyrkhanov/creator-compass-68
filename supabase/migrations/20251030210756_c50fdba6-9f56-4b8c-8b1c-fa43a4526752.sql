-- Add niche and archetype columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS niche TEXT,
ADD COLUMN IF NOT EXISTS archetype TEXT;

-- Add check constraints for validation
ALTER TABLE profiles
ADD CONSTRAINT profiles_niche_check 
CHECK (
  niche IS NULL OR (
    LENGTH(TRIM(niche)) >= 3 AND 
    LENGTH(TRIM(niche)) <= 44 AND
    niche ~ '^(?!\s)(?!.*\s$)(?!.* {2,})[A-Za-z0-9,&./''\- ]{3,44}$'
  )
);

ALTER TABLE profiles
ADD CONSTRAINT profiles_archetype_check 
CHECK (
  archetype IS NULL OR 
  archetype IN ('Educator', 'Entertainer', 'Reviewer', 'Lifestyle', 'Journey', 'Analyst', 'Coach')
);
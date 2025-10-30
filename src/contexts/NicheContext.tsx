import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { validateNiche } from "@/lib/nicheArchetype";

interface NicheContextType {
  niche: string | null;
  archetype: string | null; // READ-ONLY - derived from quiz
  primaryArchetype: string | null;
  secondaryArchetype: string | null;
  setNiche: (value: string) => Promise<void>;
  isValid: boolean;
  refresh: () => Promise<void>;
  loading: boolean;
}

const NicheContext = createContext<NicheContextType | undefined>(undefined);

export const NicheProvider = ({ children }: { children: ReactNode }) => {
  const [niche, setNicheState] = useState<string | null>(null);
  const [primaryArchetype, setPrimaryArchetype] = useState<string | null>(null);
  const [secondaryArchetype, setSecondaryArchetype] = useState<string | null>(null);
  const [archetype, setArchetype] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Compute display archetype from primary/secondary
  useEffect(() => {
    if (primaryArchetype) {
      const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
      const display = secondaryArchetype 
        ? `${capitalize(primaryArchetype)} / ${capitalize(secondaryArchetype)}`
        : capitalize(primaryArchetype);
      setArchetype(display);
    } else {
      setArchetype(null);
    }
  }, [primaryArchetype, secondaryArchetype]);

  const isValid = 
    niche !== null && 
    primaryArchetype !== null && 
    validateNiche(niche).valid;

  const refresh = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch niche from profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('niche')
          .eq('id', user.id)
          .single();

        // Fetch most recent quiz response for archetype
        const { data: quizData } = await supabase
          .from('quiz_responses')
          .select('primary_archetype, secondary_archetype')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setNicheState(profileData?.niche || null);
        setPrimaryArchetype(quizData?.primary_archetype || null);
        setSecondaryArchetype(quizData?.secondary_archetype || null);
      }
    } catch (error) {
      console.error('Error loading niche/archetype:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        refresh();
      } else if (event === 'SIGNED_OUT') {
        setNicheState(null);
        setPrimaryArchetype(null);
        setSecondaryArchetype(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const setNiche = async (value: string) => {
    setNicheState(value);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ niche: value })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error updating niche:', error);
    }
  };

  return (
    <NicheContext.Provider value={{
      niche,
      archetype,
      primaryArchetype,
      secondaryArchetype,
      setNiche,
      isValid,
      refresh,
      loading
    }}>
      {children}
    </NicheContext.Provider>
  );
};

export const useNiche = () => {
  const context = useContext(NicheContext);
  if (context === undefined) {
    throw new Error('useNiche must be used within NicheProvider');
  }
  return context;
};

// Keep the old hook name for backward compatibility during transition
export const useNicheArchetype = useNiche;

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { validateNiche, validateArchetype, type ArchetypeEnum } from "@/lib/nicheArchetype";

interface NicheArchetypeContextType {
  niche: string | null;
  archetype: ArchetypeEnum | null;
  setNiche: (value: string) => void;
  setArchetype: (value: ArchetypeEnum) => void;
  isValid: boolean;
  refresh: () => Promise<void>;
  loading: boolean;
}

const NicheArchetypeContext = createContext<NicheArchetypeContextType | undefined>(undefined);

export const NicheArchetypeProvider = ({ children }: { children: ReactNode }) => {
  const [niche, setNicheState] = useState<string | null>(null);
  const [archetype, setArchetypeState] = useState<ArchetypeEnum | null>(null);
  const [loading, setLoading] = useState(true);

  const isValid = 
    niche !== null && 
    archetype !== null && 
    validateNiche(niche).valid && 
    validateArchetype(archetype).valid;

  const refresh = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('niche, archetype')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setNicheState(data.niche || null);
          setArchetypeState(data.archetype as ArchetypeEnum | null);
        }
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
        setArchetypeState(null);
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

  const setArchetype = async (value: ArchetypeEnum) => {
    setArchetypeState(value);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ archetype: value })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error updating archetype:', error);
    }
  };

  return (
    <NicheArchetypeContext.Provider value={{
      niche,
      archetype,
      setNiche,
      setArchetype,
      isValid,
      refresh,
      loading
    }}>
      {children}
    </NicheArchetypeContext.Provider>
  );
};

export const useNicheArchetype = () => {
  const context = useContext(NicheArchetypeContext);
  if (context === undefined) {
    throw new Error('useNicheArchetype must be used within NicheArchetypeProvider');
  }
  return context;
};

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NicheField } from "./NicheField";
import { ArchetypeSelect } from "./ArchetypeSelect";
import { sanitizeNiche, validateNiche, validateArchetype, type ArchetypeEnum } from "@/lib/nicheArchetype";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface NicheArchetypeFormProps {
  onSave?: (niche: string, archetype: ArchetypeEnum) => void;
  inline?: boolean;
  initialNiche?: string;
  initialArchetype?: string;
}

export const NicheArchetypeForm = ({ 
  onSave, 
  inline = false, 
  initialNiche = "", 
  initialArchetype = "" 
}: NicheArchetypeFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [niche, setNiche] = useState(initialNiche);
  const [archetype, setArchetype] = useState(initialArchetype);
  const [nicheError, setNicheError] = useState<string>();
  const [archetypeError, setArchetypeError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNiche(initialNiche);
    setArchetype(initialArchetype);
  }, [initialNiche, initialArchetype]);

  const handleSave = async () => {
    // Validate
    const sanitized = sanitizeNiche(niche);
    const nicheValidation = validateNiche(sanitized);
    const archetypeValidation = validateArchetype(archetype);

    if (!nicheValidation.valid) {
      setNicheError(nicheValidation.error);
      return;
    }
    
    if (!archetypeValidation.valid) {
      setArchetypeError(archetypeValidation.error);
      return;
    }

    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save your profile.",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          niche: sanitized, 
          archetype: archetype as ArchetypeEnum 
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: t('profile.profileSaved'),
        description: "Your content profile has been updated."
      });

      if (onSave) {
        onSave(sanitized, archetype as ArchetypeEnum);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <div className="space-y-4">
      <NicheField 
        value={niche} 
        onChange={setNiche} 
        error={nicheError}
        compact={inline}
      />
      <ArchetypeSelect 
        value={archetype} 
        onChange={setArchetype} 
        error={archetypeError}
        compact={inline}
      />
      <Button 
        onClick={handleSave} 
        disabled={saving}
        className="w-full"
      >
        {saving ? "Saving..." : t('profile.saveProfile')}
      </Button>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Content Profile</CardTitle>
        <CardDescription>
          Define your niche and creator style to get personalized content plans.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NicheField } from "./NicheField";
import { sanitizeNiche, validateNiche } from "@/lib/nicheArchetype";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface NicheFormProps {
  onSave?: (niche: string) => void;
  inline?: boolean;
  initialNiche?: string;
}

export const NicheForm = ({ 
  onSave, 
  inline = false, 
  initialNiche = "" 
}: NicheFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [niche, setNiche] = useState(initialNiche);
  const [nicheError, setNicheError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNiche(initialNiche);
  }, [initialNiche]);

  const handleSave = async () => {
    // Validate
    const sanitized = sanitizeNiche(niche);
    const nicheValidation = validateNiche(sanitized);

    if (!nicheValidation.valid) {
      setNicheError(nicheValidation.error);
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
        .update({ niche: sanitized })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: t('profile.profileSaved'),
        description: "Your niche has been updated."
      });

      if (onSave) {
        onSave(sanitized);
      }
    } catch (error) {
      console.error('Error saving niche:', error);
      toast({
        title: "Error",
        description: "Failed to save your niche. Please try again.",
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
        <CardTitle>Your Niche</CardTitle>
        <CardDescription>
          Define your content niche to get personalized recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

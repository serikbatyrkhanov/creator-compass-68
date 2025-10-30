import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizeNiche, validateNiche } from "@/lib/nicheArchetype";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface NicheFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  compact?: boolean;
}

export const NicheField = ({ value, onChange, error, compact = false }: NicheFieldProps) => {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState(value);
  const [localError, setLocalError] = useState<string | undefined>(error);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const handleBlur = () => {
    const sanitized = sanitizeNiche(localValue);
    setLocalValue(sanitized);
    onChange(sanitized);
    
    const validation = validateNiche(sanitized);
    setLocalError(validation.error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Truncate if pasted text exceeds 44 characters
    if (newValue.length > 44) {
      newValue = newValue.substring(0, 44);
    }
    
    setLocalValue(newValue);
    
    // Real-time validation
    const sanitized = sanitizeNiche(newValue);
    const validation = validateNiche(sanitized);
    setLocalError(validation.error);
  };

  const charCount = sanitizeNiche(localValue).length;

  return (
    <div className={compact ? "flex-1" : "space-y-2"}>
      {!compact && (
        <Label htmlFor="niche">
          {t('profile.niche', { defaultValue: 'Your Niche' })}
        </Label>
      )}
      <div className="relative">
        <Input
          id="niche"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t('profile.nichePlaceholder', { defaultValue: 'e.g., AI tools for teachers' })}
          className={localError ? "border-destructive" : ""}
          maxLength={44}
        />
        <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
          {charCount}/44
        </span>
      </div>
      {localError && (
        <p className="text-xs text-destructive mt-1">{localError}</p>
      )}
      {!compact && !localError && (
        <p className="text-xs text-muted-foreground">{t('profile.nicheDescription', { defaultValue: 'What topics do you focus on?' })}</p>
      )}
    </div>
  );
};

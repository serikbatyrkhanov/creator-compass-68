import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ARCHETYPE_OPTIONS, type ArchetypeEnum } from "@/lib/nicheArchetype";
import { useTranslation } from "react-i18next";

interface ArchetypeSelectProps {
  value: string;
  onChange: (value: ArchetypeEnum) => void;
  error?: string;
  compact?: boolean;
}

export const ArchetypeSelect = ({ value, onChange, error, compact = false }: ArchetypeSelectProps) => {
  const { t } = useTranslation();

  return (
    <div className={compact ? "flex-1" : "space-y-2"}>
      {!compact && (
        <Label htmlFor="archetype">
          {t('profile.archetype')}
        </Label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={error ? "border-destructive" : ""}>
          <SelectValue placeholder="Select your archetype" />
        </SelectTrigger>
        <SelectContent>
          {ARCHETYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
      {!compact && !error && (
        <p className="text-xs text-muted-foreground">{t('profile.archetypeDescription')}</p>
      )}
    </div>
  );
};

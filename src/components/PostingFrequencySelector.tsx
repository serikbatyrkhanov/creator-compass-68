import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PostingFrequencySelectorProps {
  userId: string;
  onUpdate?: (days: string[]) => void;
}

export const PostingFrequencySelector = ({ userId, onUpdate }: PostingFrequencySelectorProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const DAYS_OF_WEEK = [
    { value: 'monday', label: t('postingScheduleCard.monday') },
    { value: 'tuesday', label: t('postingScheduleCard.tuesday') },
    { value: 'wednesday', label: t('postingScheduleCard.wednesday') },
    { value: 'thursday', label: t('postingScheduleCard.thursday') },
    { value: 'friday', label: t('postingScheduleCard.friday') },
    { value: 'saturday', label: t('postingScheduleCard.saturday') },
    { value: 'sunday', label: t('postingScheduleCard.sunday') }
  ];
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostingDays();
  }, [userId]);

  const fetchPostingDays = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_responses')
        .select('posting_days')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data?.posting_days) {
        setSelectedDays(data.posting_days);
      }
    } catch (error) {
      console.error('Error fetching posting days:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];

    if (newDays.length === 0) {
      toast({
        title: t('postingScheduleCard.selectAtLeastOne'),
        description: t('postingScheduleCard.mustPostOneDay'),
        variant: "destructive"
      });
      return;
    }

    setSelectedDays(newDays);
    onUpdate?.(newDays);
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('postingScheduleCard.title')}</CardTitle>
        <CardDescription>
          {t('postingScheduleCard.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {DAYS_OF_WEEK.map(day => (
            <div key={day.value} className="flex items-center space-x-2">
              <Checkbox
                id={day.value}
                checked={selectedDays.includes(day.value)}
                onCheckedChange={() => toggleDay(day.value)}
              />
              <Label
                htmlFor={day.value}
                className="text-sm font-medium leading-none cursor-pointer"
              >
                {day.label}
              </Label>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          {t('postingScheduleCard.postingDaysPerWeek', { count: selectedDays.length })}
        </p>
      </CardContent>
    </Card>
  );
};

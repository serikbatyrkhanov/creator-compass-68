import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PostingFrequencySelectorProps {
  userId: string;
  onUpdate?: (days: string[]) => void;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

export const PostingFrequencySelector = ({ userId, onUpdate }: PostingFrequencySelectorProps) => {
  const { toast } = useToast();
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

  const toggleDay = async (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];

    if (newDays.length === 0) {
      toast({
        title: "Select at least one day",
        description: "You must post on at least one day per week",
        variant: "destructive"
      });
      return;
    }

    setSelectedDays(newDays);

    try {
      const { data: latestQuiz } = await supabase
        .from('quiz_responses')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (latestQuiz) {
        const { error } = await supabase
          .from('quiz_responses')
          .update({ posting_days: newDays })
          .eq('id', latestQuiz.id);

        if (error) throw error;

        toast({
          title: "Posting schedule updated",
          description: `You'll post on ${newDays.length} day${newDays.length > 1 ? 's' : ''} per week`
        });

        onUpdate?.(newDays);
      }
    } catch (error) {
      console.error('Error updating posting days:', error);
      toast({
        title: "Error",
        description: "Failed to update posting schedule",
        variant: "destructive"
      });
    }
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posting Schedule</CardTitle>
        <CardDescription>
          Select which days you want to post content
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
          Posting {selectedDays.length} {selectedDays.length === 1 ? 'day' : 'days'} per week
        </p>
      </CardContent>
    </Card>
  );
};

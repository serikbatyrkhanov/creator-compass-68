import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import ArchetypeResults from "@/components/ArchetypeResults";
import type { ArchetypeId, TimeBucket } from "@/components/ArchetypeResults";

interface QuizResult {
  id: string;
  primary_archetype: string;
  secondary_archetype: string;
  archetype_scores: any;
  selected_topics: string[];
  time_bucket: string;
  gear: string[];
  target_audience: string;
}

const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!id) {
        navigate("/quiz");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("quiz_responses")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setResult(data);
      } catch (error) {
        console.error("Error fetching results:", error);
        toast({
          title: "Error loading results",
          description: "Unable to load your quiz results",
          variant: "destructive"
        });
        navigate("/quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--gradient-hero)]">
        <div className="text-center">
          <div className="animate-pulse text-6xl mb-4">✨</div>
          <p className="text-xl">Analyzing your creator path...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <ArchetypeResults
          primary={result.primary_archetype as ArchetypeId}
          secondary={result.secondary_archetype as ArchetypeId}
          time={result.time_bucket as TimeBucket}
          extras={result.gear}
          quizResponseId={result.id}
          selectedTopics={result.selected_topics}
          targetAudience={result.target_audience}
        />
      </div>
    </div>
  );
};

export default QuizResults;

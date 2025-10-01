import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Sparkles, Home } from "lucide-react";
import { quizQuestions, archetypes } from "@/data/quizData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Quiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentQuestion = quizQuestions[currentStep];
  const progress = ((currentStep + 1) / quizQuestions.length) * 100;

  const handleSingleSelect = (optionId: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: [optionId] });
  };

  const handleMultiSelect = (optionId: string, checked: boolean) => {
    const current = answers[currentQuestion.id] || [];
    const maxSelect = currentQuestion.maxSelect || 999;
    
    if (checked) {
      if (current.length < maxSelect) {
        setAnswers({ ...answers, [currentQuestion.id]: [...current, optionId] });
      } else {
        toast({
          title: "Selection limit reached",
          description: `You can only select up to ${maxSelect} options`,
          variant: "destructive"
        });
      }
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: current.filter(id => id !== optionId) });
    }
  };

  const canProceed = () => {
    const answer = answers[currentQuestion.id];
    return answer && answer.length > 0;
  };

  const handleNext = () => {
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResults();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateResults = async () => {
    // Calculate archetype weights
    const weights: Record<string, number> = {
      educator: 0,
      entertainer: 0,
      lifestyle: 0,
      reviewer: 0,
      journey: 0
    };

    for (const question of quizQuestions) {
      const selectedIds = answers[question.id] || [];
      for (const optionId of selectedIds) {
        const option = question.options.find(o => o.id === optionId);
        if (option?.weights) {
          for (const [archetype, weight] of Object.entries(option.weights)) {
            weights[archetype] += weight;
          }
        }
      }
    }

    // Get primary and secondary archetypes
    const sortedArchetypes = Object.entries(weights)
      .sort(([, a], [, b]) => b - a);
    
    const primaryArchetype = sortedArchetypes[0][0];
    const secondaryArchetype = sortedArchetypes[1][0];

    // Extract metadata
    const q2Topics = answers["Q2_passions"] || [];
    const selectedTopics = q2Topics.map(id => {
      const opt = quizQuestions[1].options.find(o => o.id === id);
      return opt?.label || "";
    }).filter(Boolean);

    const q6Answer = answers["Q6_time"]?.[0];
    const timeBucket = quizQuestions[5].options.find(o => o.id === q6Answer)?.meta?.time_bucket || "";

    const q7Answers = answers["Q7_resources"] || [];
    const gear = q7Answers.map(id => {
      const opt = quizQuestions[6].options.find(o => o.id === id);
      return opt?.meta?.gear || "";
    }).filter(Boolean);

    const q8Answer = answers["Q8_audience"]?.[0];
    const targetAudience = quizQuestions[7].options.find(o => o.id === q8Answer)?.label || "";

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("quiz_responses")
        .insert({
          user_id: user?.id || null,
          answers,
          primary_archetype: primaryArchetype,
          secondary_archetype: secondaryArchetype,
          archetype_scores: weights,
          selected_topics: selectedTopics,
          time_bucket: timeBucket,
          gear,
          target_audience: targetAudience
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate to results with the response ID
      navigate(`/quiz-results/${data.id}`);
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Error saving results",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--gradient-hero)]">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="absolute left-0 top-0 gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Find Your Creator Niche</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">
              Step {currentStep + 1} of {quizQuestions.length}
            </h1>
            <Progress value={progress} className="mt-4" />
          </div>

          {/* Question Card */}
          <Card className="backdrop-blur-sm bg-card/80 border-2 shadow-[var(--shadow-vibrant)] flex flex-col max-h-[calc(100vh-16rem)]">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-2xl">{currentQuestion.text}</CardTitle>
              {currentQuestion.type === "multi_select" && (
                <CardDescription>
                  Select up to {currentQuestion.maxSelect} option{currentQuestion.maxSelect > 1 ? "s" : ""} (selected: {answers[currentQuestion.id]?.length || 0})
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto pb-0">
              {currentQuestion.type === "single_select" ? (
                <RadioGroup
                  value={answers[currentQuestion.id]?.[0] || ""}
                  onValueChange={handleSingleSelect}
                >
                  {currentQuestion.options.map((option) => (
                  <div 
                      key={option.id} 
                      className={`flex items-center space-x-3 p-4 rounded-lg hover:bg-accent/50 transition-all border border-border/50 ${
                        answers[currentQuestion.id]?.[0] === option.id ? 'bg-primary/10 border-primary' : ''
                      }`}
                    >
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer text-base">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => {
                    const isChecked = (answers[currentQuestion.id] || []).includes(option.id);
                    return (
                      <div key={option.id} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-accent/50 transition-colors border border-border/50">
                        <Checkbox
                          id={option.id}
                          checked={isChecked}
                          onCheckedChange={(checked) => handleMultiSelect(option.id, checked as boolean)}
                        />
                        <Label htmlFor={option.id} className="flex-1 cursor-pointer text-base">
                          {option.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}

            </CardContent>
            
            {/* Navigation - Always visible at bottom */}
            <div className="flex justify-between items-center p-6 pt-4 gap-4 border-t-2 border-border bg-card flex-shrink-0">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2 bg-[var(--gradient-vibrant)] shadow-[var(--shadow-vibrant)]"
              >
                {currentStep === quizQuestions.length - 1 ? "See Results" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Quiz;

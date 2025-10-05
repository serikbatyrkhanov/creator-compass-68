import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, CheckCircle2, Circle, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlanTask {
  id: string;
  day_number: number;
  task_title: string;
  completed: boolean;
  completed_at: string | null;
}

interface ContentPlan {
  id: string;
  created_at: string;
  plan: Array<{
    day: string;
    dayNumber: number;
    task: string;
    timeEstimate: string;
    platform?: string;
    tip: string;
  }>;
  tasks: PlanTask[];
}

const ContentCalendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<ContentPlan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch plans with their tasks
      const { data: plansData, error: plansError } = await supabase
        .from("content_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (plansError) throw plansError;

      if (plansData && plansData.length > 0) {
        // Fetch tasks for each plan
        const plansWithTasks = await Promise.all(
          plansData.map(async (plan) => {
            const { data: tasksData } = await supabase
              .from("plan_tasks")
              .select("*")
              .eq("plan_id", plan.id)
              .order("day_number");

            return {
              ...plan,
              plan: plan.plan as any, // Cast from Json to our type
              tasks: tasksData || []
            };
          })
        );

        setPlans(plansWithTasks as ContentPlan[]);
        setSelectedPlan(plansWithTasks[0] as ContentPlan);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast({
        title: "Error",
        description: "Failed to load your content plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("plan_tasks")
        .update({
          completed: !currentStatus,
          completed_at: !currentStatus ? new Date().toISOString() : null
        })
        .eq("id", taskId);

      if (error) throw error;

      // Update local state
      setPlans(prevPlans =>
        prevPlans.map(plan => ({
          ...plan,
          tasks: plan.tasks.map(task =>
            task.id === taskId
              ? { ...task, completed: !currentStatus, completed_at: !currentStatus ? new Date().toISOString() : null }
              : task
          )
        }))
      );

      if (selectedPlan) {
        setSelectedPlan(prev => prev ? ({
          ...prev,
          tasks: prev.tasks.map(task =>
            task.id === taskId
              ? { ...task, completed: !currentStatus, completed_at: !currentStatus ? new Date().toISOString() : null }
              : task
          )
        }) : null);
      }

      toast({
        title: !currentStatus ? "Task completed! 🎉" : "Task marked incomplete",
        description: !currentStatus ? "Great work! Keep going!" : "Task status updated"
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading your content calendar...</p>
        </div>
      </div>
    );
  }

  const completedTasks = selectedPlan?.tasks.filter(t => t.completed).length || 0;
  const totalTasks = selectedPlan?.tasks.length || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Calendar className="h-8 w-8 text-primary" />
                  Content Calendar
                </h1>
                <p className="text-muted-foreground">Track your 7-day content plans</p>
              </div>
            </div>
            <Button onClick={() => navigate("/quiz-results/" + plans[0]?.id)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate New Plan
            </Button>
          </div>

          {plans.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No plans yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete the quiz and generate your first 7-day content plan
                </p>
                <Button onClick={() => navigate("/quiz")}>Take Quiz</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Plan Selector Sidebar */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Your Plans</CardTitle>
                  <CardDescription>Select a plan to view</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {plans.map((plan, idx) => {
                    const planCompleted = plan.tasks.filter(t => t.completed).length;
                    const planTotal = plan.tasks.length;
                    const isSelected = selectedPlan?.id === plan.id;
                    
                    return (
                      <Button
                        key={plan.id}
                        variant={isSelected ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <div className="flex flex-col items-start w-full">
                          <span className="font-semibold">Plan #{plans.length - idx}</span>
                          <span className="text-xs opacity-75">
                            {planCompleted}/{planTotal} completed
                          </span>
                        </div>
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Main Content Area */}
              <div className="lg:col-span-3 space-y-6">
                {/* Progress Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Current Plan Progress</CardTitle>
                        <CardDescription>
                          Created {new Date(selectedPlan?.created_at || "").toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{progressPercentage}%</div>
                        <div className="text-sm text-muted-foreground">
                          {completedTasks} of {totalTasks} tasks
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Tasks */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedPlan?.plan.map((day, idx) => {
                    const dayTask = selectedPlan.tasks.find(t => t.day_number === day.dayNumber);
                    const isCompleted = dayTask?.completed || false;

                    return (
                      <Card
                        key={idx}
                        className={`relative transition-all ${
                          isCompleted ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300" : ""
                        }`}
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{day.day}</CardTitle>
                            <Badge variant="secondary">{day.timeEstimate}</Badge>
                          </div>
                          {day.platform && (
                            <Badge variant="outline" className="w-fit">
                              {day.platform}
                            </Badge>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-sm font-medium mb-1">Task:</p>
                            <p className="text-sm text-muted-foreground">{day.task}</p>
                          </div>
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground italic">💡 {day.tip}</p>
                          </div>
                          {dayTask && (
                            <Button
                              size="sm"
                              variant={isCompleted ? "default" : "outline"}
                              className="w-full gap-2"
                              onClick={() => toggleTaskCompletion(dayTask.id, isCompleted)}
                            >
                              {isCompleted ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Completed
                                </>
                              ) : (
                                <>
                                  <Circle className="h-4 w-4" />
                                  Mark Complete
                                </>
                              )}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentCalendar;

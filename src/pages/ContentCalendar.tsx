import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, CheckCircle2, Circle, RefreshCw, Edit2, Save, X, StickyNote, Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/climbley-logo.png";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays, parseISO, startOfWeek, getMonth, getYear, startOfMonth, differenceInDays, getDate } from "date-fns";
import { PostingFrequencySelector } from "@/components/PostingFrequencySelector";

interface PlanTask {
  id: string;
  day_number: number;
  task_title: string;
  completed: boolean;
  completed_at: string | null;
  notes: string;
  updated_at?: string;
  post_title?: string;
  post_description?: string;
  script_completed: boolean;
  content_created: boolean;
  content_edited: boolean;
  content_published: boolean;
  platform?: string;
}

interface ContentPlan {
  id: string;
  created_at: string;
  start_date: string;
  posting_days: string[];
  duration?: number;
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
  const [editingTask, setEditingTask] = useState<PlanTask | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [editedPostTitle, setEditedPostTitle] = useState("");
  const [editedPostDescription, setEditedPostDescription] = useState("");
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [postingDays, setPostingDays] = useState<string[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
  const [notesSaving, setNotesSaving] = useState<{ [key: string]: boolean }>({});
  const [notesSaved, setNotesSaved] = useState<{ [key: string]: boolean }>({});
  const notesTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

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
      
      setCurrentUserId(user.id);

      // Fetch latest quiz response to get posting days
      const { data: quizResponse } = await supabase
        .from("quiz_responses")
        .select("posting_days")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (quizResponse?.posting_days) {
        setPostingDays(quizResponse.posting_days);
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

  const openEditDialog = (task: PlanTask) => {
    setEditingTask(task);
    setEditedTitle(task.task_title);
    setEditedNotes(task.notes || "");
    setEditedPostTitle(task.post_title || "");
    setEditedPostDescription(task.post_description || "");
    setEditDialogOpen(true);
  };

  const saveTaskEdit = async () => {
    if (!editingTask) return;

    try {
      const { error } = await supabase
        .from("plan_tasks")
        .update({
          task_title: editedTitle,
          notes: editedNotes,
          post_title: editedPostTitle,
          post_description: editedPostDescription
        })
        .eq("id", editingTask.id);

      if (error) throw error;

      // Update local state
      const updateTask = (task: PlanTask) =>
        task.id === editingTask.id
          ? { 
              ...task, 
              task_title: editedTitle, 
              notes: editedNotes,
              post_title: editedPostTitle,
              post_description: editedPostDescription
            }
          : task;

      setPlans(prevPlans =>
        prevPlans.map(plan => ({
          ...plan,
          tasks: plan.tasks.map(updateTask)
        }))
      );

      if (selectedPlan) {
        setSelectedPlan(prev => prev ? ({
          ...prev,
          tasks: prev.tasks.map(updateTask)
        }) : null);
      }

      toast({
        title: "Task updated",
        description: "Your changes have been saved successfully"
      });

      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  const updateTaskNotes = useCallback(async (taskId: string, notes: string) => {
    // Update local state immediately
    setPlans(prevPlans => prevPlans.map(plan => ({
      ...plan,
      tasks: plan.tasks.map(task =>
        task.id === taskId ? { ...task, notes } : task
      )
    })));

    if (selectedPlan) {
      setSelectedPlan(prev => prev ? ({
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id === taskId ? { ...task, notes } : task
        )
      }) : null);
    }

    // Clear existing timeout for this task
    if (notesTimeouts.current[taskId]) {
      clearTimeout(notesTimeouts.current[taskId]);
    }

    // Set saving state
    setNotesSaving(prev => ({ ...prev, [taskId]: true }));
    setNotesSaved(prev => ({ ...prev, [taskId]: false }));

    // Debounce the save operation
    notesTimeouts.current[taskId] = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("plan_tasks")
          .update({ notes })
          .eq("id", taskId);

        if (error) throw error;

        setNotesSaving(prev => ({ ...prev, [taskId]: false }));
        setNotesSaved(prev => ({ ...prev, [taskId]: true }));

        // Hide saved indicator after 2 seconds
        setTimeout(() => {
          setNotesSaved(prev => ({ ...prev, [taskId]: false }));
        }, 2000);
      } catch (error) {
        console.error("Error updating task notes:", error);
        setNotesSaving(prev => ({ ...prev, [taskId]: false }));
        toast({
          title: "Error updating notes",
          description: "Failed to update task notes",
          variant: "destructive"
        });
      }
    }, 1000);
  }, [plans, selectedPlan, toast]);

  const toggleProgressCheckbox = async (taskId: string, field: 'script_completed' | 'content_created' | 'content_edited' | 'content_published', currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from("plan_tasks")
        .update({ [field]: !currentValue })
        .eq("id", taskId);

      if (error) throw error;

      setPlans(prevPlans =>
        prevPlans.map(plan => ({
          ...plan,
          tasks: plan.tasks.map(task =>
            task.id === taskId ? { ...task, [field]: !currentValue } : task
          )
        }))
      );

      if (selectedPlan) {
        setSelectedPlan(prev => prev ? ({
          ...prev,
          tasks: prev.tasks.map(task =>
            task.id === taskId ? { ...task, [field]: !currentValue } : task
          )
        }) : null);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    }
  };

  const generateNewPlan = async () => {
    setGeneratingPlan(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: quizResponse, error: quizError } = await supabase
        .from("quiz_responses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (quizError || !quizResponse) {
        toast({
          title: "No quiz results found",
          description: "Please take the quiz first",
          variant: "destructive"
        });
        navigate("/quiz");
        return;
      }

      // Use the current posting days state from the selector
      const currentPostingDays = postingDays.length > 0 ? postingDays : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("generate-content-plan", {
        body: {
          primary: quizResponse.primary_archetype,
          secondary: quizResponse.secondary_archetype,
          time: quizResponse.time_bucket,
          extras: quizResponse.gear || [],
          quizResponseId: quizResponse.id,
          selectedTopics: quizResponse.selected_topics || [],
          targetAudience: quizResponse.target_audience || "",
          postingDays: currentPostingDays,
          duration: 7
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Plan generated!",
        description: "Your new weekly content plan is ready"
      });

      await fetchPlans();
    } catch (error) {
      console.error("Error generating plan:", error);
      toast({
        title: "Error generating plan",
        description: "Failed to create new plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingPlan(false);
    }
  };

  const getActualDate = (plan: ContentPlan, dayNumber: number): Date => {
    const startDate = parseISO(plan.start_date);
    return addDays(startDate, dayNumber - 1);
  };

  const formatDateDisplay = (date: Date): string => {
    return format(date, 'EEE, MMM d');
  };

  const deletePlan = async (planId: string) => {
    setDeletingPlanId(planId);
    setPlanToDelete(null);
    try {
      // Delete tasks first
      const { error: tasksError } = await supabase
        .from("plan_tasks")
        .delete()
        .eq("plan_id", planId);

      if (tasksError) throw tasksError;

      // Delete the plan
      const { error: planError } = await supabase
        .from("content_plans")
        .delete()
        .eq("id", planId);

      if (planError) throw planError;

      // Update local state
      const updatedPlans = plans.filter(p => p.id !== planId);
      setPlans(updatedPlans);
      
      // Select the first remaining plan or null
      if (selectedPlan?.id === planId) {
        setSelectedPlan(updatedPlans[0] || null);
      }

      toast({
        title: "Plan deleted",
        description: "Your content plan has been removed"
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Error deleting plan",
        description: "Failed to delete the plan",
        variant: "destructive"
      });
    } finally {
      setDeletingPlanId(null);
    }
  };

  const updatePlanForPostingDays = async (newPostingDays: string[]) => {
    try {
      // 1. Update global user preference in quiz_responses
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: quizError } = await supabase
        .from("quiz_responses")
        .update({ posting_days: newPostingDays })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (quizError) throw quizError;

      // 2. Update ALL content plans with the new posting schedule
      const { error: plansUpdateError } = await supabase
        .from("content_plans")
        .update({ posting_days: newPostingDays })
        .eq("user_id", user.id);

      if (plansUpdateError) throw plansUpdateError;

      // 3. For each plan, handle adding and removing tasks
      for (const plan of plans) {
        const oldPostingDays = plan.posting_days || [];
        const oldPostingDaysSet = new Set(oldPostingDays);
        const newPostingDaysSet = new Set(newPostingDays);
        
        // Find newly added days
        const daysToAdd = newPostingDays.filter(day => !oldPostingDaysSet.has(day));
        // Find removed days
        const daysToRemove = oldPostingDays.filter(day => !newPostingDaysSet.has(day));
        
        // Create tasks for newly selected days
        if (daysToAdd.length > 0) {
          const planDays = plan.plan;
          const tasksToCreate = [];
          
          for (const planDay of planDays) {
            const actualDate = getActualDate(plan, planDay.dayNumber);
            const dayOfWeek = getDayOfWeek(actualDate);
            
            // If this is a newly selected day and no task exists
            if (daysToAdd.includes(dayOfWeek) && !plan.tasks.find(t => t.day_number === planDay.dayNumber)) {
              tasksToCreate.push({
                plan_id: plan.id,
                user_id: user.id,
                day_number: planDay.dayNumber,
                task_title: planDay.task,
                completed: false,
                script_completed: false,
                content_created: false,
                content_edited: false,
                content_published: false,
                notes: ''
              });
            }
          }
          
          if (tasksToCreate.length > 0) {
            const { error: tasksError } = await supabase
              .from("plan_tasks")
              .insert(tasksToCreate);
            
            if (tasksError) throw tasksError;
          }
        }
        
        // Delete tasks for unselected days
        if (daysToRemove.length > 0) {
          const taskIdsToDelete = [];
          
          for (const task of plan.tasks) {
            const actualDate = getActualDate(plan, task.day_number);
            const dayOfWeek = getDayOfWeek(actualDate);
            
            if (daysToRemove.includes(dayOfWeek)) {
              taskIdsToDelete.push(task.id);
            }
          }
          
          if (taskIdsToDelete.length > 0) {
            const { error: deleteError } = await supabase
              .from("plan_tasks")
              .delete()
              .in('id', taskIdsToDelete);
            
            if (deleteError) throw deleteError;
          }
        }
      }

      // 4. Refresh all plans to show updated schedule
      await fetchPlans();

      toast({
        title: "Posting schedule updated",
        description: "Your calendar has been updated across all plans"
      });
    } catch (error) {
      console.error("Error updating posting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to update posting schedule",
        variant: "destructive"
      });
    }
  };

  const getDayOfWeek = (date: Date): string => {
    return format(date, 'EEEE').toLowerCase();
  };

  const shouldShowDay = (plan: ContentPlan, dayNumber: number): boolean => {
    const actualDate = getActualDate(plan, dayNumber);
    const dayOfWeek = getDayOfWeek(actualDate);
    // Use global postingDays state as primary filter
    return postingDays.includes(dayOfWeek);
  };

  const getPlanWeekInfo = (plan: ContentPlan) => {
    const startDate = parseISO(plan.start_date);
    const month = format(startDate, 'MMMM yyyy');
    const year = getYear(startDate);
    const isMonthly = (plan.duration || 7) === 30;
    
    // Calculate which Monday of the month this is (1st Monday = Week 1, etc.)
    const dayOfMonth = getDate(startDate);
    const weekOfMonth = Math.floor((dayOfMonth - 1) / 7) + 1;
    
    return { weekOfMonth, month, year, isMonthly };
  };

  const groupPlansByMonth = (plans: ContentPlan[]) => {
    const grouped: { [key: string]: ContentPlan[] } = {};
    plans.forEach(plan => {
      const { month } = getPlanWeekInfo(plan);
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(plan);
    });
    
    // Sort plans within each month by start date
    Object.keys(grouped).forEach(month => {
      grouped[month].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    });
    
    return grouped;
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

  const completedTasks = selectedPlan?.tasks.filter(t => {
    // Only count tasks for days that should be shown
    if (selectedPlan && !shouldShowDay(selectedPlan, t.day_number)) {
      return false;
    }
    return t.completed;
  }).length || 0;
  
  const totalTasks = selectedPlan?.tasks.filter(t => {
    // Only count tasks for days that should be shown
    if (selectedPlan && !shouldShowDay(selectedPlan, t.day_number)) {
      return false;
    }
    return true;
  }).length || 0;
  
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
                <p className="text-muted-foreground">Track your content plans</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={generateNewPlan} disabled={generatingPlan}>
                <img src={logo} alt="" className="h-4 w-4 mr-2" />
                {generatingPlan ? "Generating..." : "Generate New Plan"}
              </Button>
            </div>
          </div>

          {/* Posting Schedule Filter */}
          {currentUserId && (
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Posting Schedule Filter
                </CardTitle>
                <CardDescription>
                  Select which days to show in your content calendar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PostingFrequencySelector 
                  userId={currentUserId}
                  onUpdate={(newDays) => {
                    setPostingDays(newDays);
                    updatePlanForPostingDays(newDays);
                  }}
                />
              </CardContent>
            </Card>
          )}

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
                <CardContent className="space-y-4">
                  {Object.entries(groupPlansByMonth(plans)).map(([month, monthPlans]) => (
                    <div key={month} className="space-y-2 border rounded-lg p-3 bg-muted/30">
                      <h3 className="text-sm font-semibold text-foreground px-1 pb-1 border-b">{month}</h3>
                      <div className="space-y-2">
                        {monthPlans.map((plan) => {
                          const visibleTasks = plan.tasks.filter(t => shouldShowDay(plan, t.day_number));
                          const planCompleted = visibleTasks.filter(t => t.completed).length;
                          const planTotal = visibleTasks.length;
                          const isSelected = selectedPlan?.id === plan.id;
                          const isDeleting = deletingPlanId === plan.id;
                          const { weekOfMonth, isMonthly } = getPlanWeekInfo(plan);
                          const startDate = parseISO(plan.start_date);
                          const endDate = addDays(startDate, (plan.duration || 7) - 1);
                          
                          return (
                            <div key={plan.id} className="relative group">
                              <Button
                                variant={isSelected ? "default" : "outline"}
                                className="w-full justify-start pr-10 h-auto py-2"
                                onClick={() => setSelectedPlan(plan)}
                                disabled={isDeleting}
                              >
                                <div className="flex flex-col items-start w-full gap-0.5 overflow-hidden">
                                  <div className="flex items-center gap-2 w-full">
                                    <span className="font-semibold text-sm truncate">
                                      {isMonthly ? "Month Plan" : `Week ${weekOfMonth}`}
                                    </span>
                                    <Badge variant={isMonthly ? "default" : "secondary"} className="text-xs">
                                      {isMonthly ? "30d" : "7d"}
                                    </Badge>
                                  </div>
                                  <span className="text-xs opacity-75 truncate w-full">
                                    {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
                                  </span>
                                  <span className="text-xs opacity-75 truncate w-full">
                                    {planCompleted}/{planTotal} done
                                  </span>
                                </div>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPlanToDelete(plan.id);
                                }}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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
                    const actualDate = getActualDate(selectedPlan, day.dayNumber);
                    const dateDisplay = formatDateDisplay(actualDate);
                    
                    // Check if this day should be shown based on posting schedule
                    if (!shouldShowDay(selectedPlan, day.dayNumber)) {
                      return null;
                    }

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
                            <div className="flex flex-col">
                              <CardTitle className="text-base">{dateDisplay}</CardTitle>
                              <p className="text-xs text-muted-foreground">{day.day}</p>
                            </div>
                            <Badge variant="secondary">{day.timeEstimate}</Badge>
                          </div>
                          {dayTask && (
                            <Select
                              value={dayTask.platform || day.platform || ""}
                              onValueChange={async (value) => {
                                try {
                                  const { error } = await supabase
                                    .from("plan_tasks")
                                    .update({ platform: value })
                                    .eq("id", dayTask.id);
                                  
                                  if (error) throw error;
                                  
                                  setPlans(plans.map(p => ({
                                    ...p,
                                    tasks: p.tasks.map(t => t.id === dayTask.id ? { ...t, platform: value } : t)
                                  })));
                                  
                                  toast({
                                    title: "Platform updated",
                                    description: `Changed to ${value}`,
                                  });
                                } catch (error) {
                                  console.error("Failed to update platform:", error);
                                  toast({
                                    title: "Failed to update platform",
                                    description: "Please try again",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="w-fit h-7 text-xs">
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TikTok">TikTok</SelectItem>
                                <SelectItem value="Instagram Reels/Post">Instagram Reels/Post</SelectItem>
                                <SelectItem value="YouTube video">YouTube video</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Post Title */}
                          {dayTask && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Post Title</Label>
                              <Input
                                value={dayTask.post_title || ""}
                                onChange={(e) => {
                                  const newTitle = e.target.value;
                                  supabase.from("plan_tasks").update({ post_title: newTitle }).eq("id", dayTask.id);
                                  setPlans(plans.map(p => ({
                                    ...p,
                                    tasks: p.tasks.map(t => t.id === dayTask.id ? { ...t, post_title: newTitle } : t)
                                  })));
                                }}
                                placeholder="Enter post title..."
                                className="text-sm"
                              />
                            </div>
                          )}

                          {/* Post Description */}
                          {dayTask && (
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Description</Label>
                              <Textarea
                                value={dayTask.post_description || ""}
                                onChange={(e) => {
                                  const newDesc = e.target.value;
                                  supabase.from("plan_tasks").update({ post_description: newDesc }).eq("id", dayTask.id);
                                  setPlans(plans.map(p => ({
                                    ...p,
                                    tasks: p.tasks.map(t => t.id === dayTask.id ? { ...t, post_description: newDesc } : t)
                                  })));
                                }}
                                placeholder="What will this content be about..."
                                className="text-xs min-h-[60px] resize-none"
                              />
                            </div>
                          )}

                          {/* Original AI Task */}
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-muted-foreground">AI Suggestion</Label>
                            <p className="text-xs text-muted-foreground">{day.task}</p>
                          </div>

                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground italic">💡 {day.tip}</p>
                          </div>

                          {/* Progress Tracking Checkboxes */}
                          {dayTask && (
                            <div className="pt-2 border-t space-y-2">
                              <Label className="text-xs font-semibold">Progress Steps</Label>
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`script-${dayTask.id}`}
                                    checked={dayTask.script_completed}
                                    onCheckedChange={() => toggleProgressCheckbox(dayTask.id, 'script_completed', dayTask.script_completed)}
                                  />
                                  <label
                                    htmlFor={`script-${dayTask.id}`}
                                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    Work on Script/Plan
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`content-${dayTask.id}`}
                                    checked={dayTask.content_created}
                                    onCheckedChange={() => toggleProgressCheckbox(dayTask.id, 'content_created', dayTask.content_created)}
                                  />
                                  <label
                                    htmlFor={`content-${dayTask.id}`}
                                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    Shoot Video / Take Photo
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-${dayTask.id}`}
                                    checked={dayTask.content_edited}
                                    onCheckedChange={() => toggleProgressCheckbox(dayTask.id, 'content_edited', dayTask.content_edited)}
                                  />
                                  <label
                                    htmlFor={`edit-${dayTask.id}`}
                                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    Edit Content
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`publish-${dayTask.id}`}
                                    checked={dayTask.content_published}
                                    onCheckedChange={() => toggleProgressCheckbox(dayTask.id, 'content_published', dayTask.content_published)}
                                  />
                                  <label
                                    htmlFor={`publish-${dayTask.id}`}
                                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    Published
                                  </label>
                                </div>
                              </div>
                              {/* Mini Progress Indicator */}
                              <div className="pt-1">
                                <p className="text-xs text-muted-foreground">
                                  {[dayTask.script_completed, dayTask.content_created, dayTask.content_edited, dayTask.content_published].filter(Boolean).length}/4 steps completed
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Quick Notes Section */}
                          {dayTask && (
                            <div className="pt-2 border-t space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <StickyNote className="h-4 w-4 text-amber-500" />
                                  <Label className="text-xs font-medium">Quick Notes</Label>
                                </div>
                                {notesSaving[dayTask.id] && (
                                  <span className="text-xs text-muted-foreground italic">Saving...</span>
                                )}
                                {notesSaved[dayTask.id] && (
                                  <span className="text-xs text-emerald-600 flex items-center gap-1">
                                    <Check className="h-3 w-3" />
                                    Saved
                                  </span>
                                )}
                              </div>
                              <Textarea
                                value={dayTask.notes || ""}
                                onChange={(e) => updateTaskNotes(dayTask.id, e.target.value)}
                                placeholder="Add notes, ideas, or reminders..."
                                className="text-xs min-h-[60px] resize-none"
                              />
                            </div>
                          )}

                          {/* Action Buttons */}
                          {dayTask && (
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-2"
                                onClick={() => openEditDialog(dayTask)}
                              >
                                <Edit2 className="h-3 w-3" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant={isCompleted ? "default" : "outline"}
                                className="flex-1 gap-2"
                                onClick={() => toggleTaskCompletion(dayTask.id, isCompleted)}
                              >
                                {isCompleted ? (
                                  <>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Done
                                  </>
                                ) : (
                                  <>
                                    <Circle className="h-4 w-4" />
                                    Complete
                                  </>
                                )}
                              </Button>
                            </div>
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

        {/* Edit Task Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Task Details</DialogTitle>
              <DialogDescription>
                Customize your post details, track progress, and add notes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="post-title">Post Title</Label>
                <Input
                  id="post-title"
                  value={editedPostTitle}
                  onChange={(e) => setEditedPostTitle(e.target.value)}
                  placeholder="Enter post title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-description">Description</Label>
                <Textarea
                  id="post-description"
                  value={editedPostDescription}
                  onChange={(e) => setEditedPostDescription(e.target.value)}
                  placeholder="What will this content be about..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-title" className="text-muted-foreground">Original AI Task</Label>
                <Input
                  id="task-title"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Enter task title..."
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-notes">Quick Notes</Label>
                <Textarea
                  id="task-notes"
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  placeholder="Add notes, ideas, or reminders..."
                  className="min-h-[100px]"
                />
              </div>
              {editingTask && (
                <div className="space-y-3 pt-2 border-t">
                  <Label className="font-semibold">Progress Tracking</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-script"
                        checked={editingTask.script_completed}
                        onCheckedChange={() => toggleProgressCheckbox(editingTask.id, 'script_completed', editingTask.script_completed)}
                      />
                      <label htmlFor="edit-script" className="text-sm font-medium cursor-pointer">
                        Work on Script/Plan
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-content"
                        checked={editingTask.content_created}
                        onCheckedChange={() => toggleProgressCheckbox(editingTask.id, 'content_created', editingTask.content_created)}
                      />
                      <label htmlFor="edit-content" className="text-sm font-medium cursor-pointer">
                        Shoot Video / Take Photo
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-edit"
                        checked={editingTask.content_edited}
                        onCheckedChange={() => toggleProgressCheckbox(editingTask.id, 'content_edited', editingTask.content_edited)}
                      />
                      <label htmlFor="edit-edit" className="text-sm font-medium cursor-pointer">
                        Edit Content
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-publish"
                        checked={editingTask.content_published}
                        onCheckedChange={() => toggleProgressCheckbox(editingTask.id, 'content_published', editingTask.content_published)}
                      />
                      <label htmlFor="edit-publish" className="text-sm font-medium cursor-pointer">
                        Published
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={saveTaskEdit}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Plan Confirmation Dialog */}
        <AlertDialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Content Plan?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this content plan and all its tasks. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (planToDelete) {
                    deletePlan(planToDelete);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Plan
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ContentCalendar;

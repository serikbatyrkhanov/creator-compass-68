import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, CheckCircle2, Circle, Sparkles, RefreshCw, Edit2, Save, X, StickyNote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays, parseISO } from "date-fns";
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
}

interface ContentPlan {
  id: string;
  created_at: string;
  start_date: string;
  posting_days: string[];
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

  const updateTaskNotes = async (taskId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from("plan_tasks")
        .update({ notes })
        .eq("id", taskId);

      if (error) throw error;

      setPlans(plans.map(plan => ({
        ...plan,
        tasks: plan.tasks.map(task =>
          task.id === taskId ? { ...task, notes } : task
        )
      })));

      toast({
        title: "Notes updated",
        description: "Task notes saved successfully"
      });
    } catch (error) {
      console.error("Error updating task notes:", error);
      toast({
        title: "Error updating notes",
        description: "Failed to update task notes",
        variant: "destructive"
      });
    }
  };

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
          postingDays: quizResponse.posting_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Plan generated!",
        description: "Your new 7-day content plan is ready"
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
            <Button onClick={generateNewPlan} disabled={generatingPlan}>
              <Sparkles className="h-4 w-4 mr-2" />
              {generatingPlan ? "Generating..." : "Generate New Plan"}
            </Button>
          </div>

          {/* Posting Frequency Selector */}
          {currentUserId && (
            <PostingFrequencySelector 
              userId={currentUserId}
              onUpdate={() => {
                toast({
                  title: "Schedule updated",
                  description: "Generate a new plan to apply your posting schedule"
                });
              }}
            />
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
                    const actualDate = getActualDate(selectedPlan, day.dayNumber);
                    const dateDisplay = formatDateDisplay(actualDate);

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
                          {day.platform && (
                            <Badge variant="outline" className="w-fit">
                              {day.platform}
                            </Badge>
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
                              <div className="flex items-center gap-2">
                                <StickyNote className="h-4 w-4 text-amber-500" />
                                <Label className="text-xs font-medium">Quick Notes</Label>
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
      </div>
    </div>
  );
};

export default ContentCalendar;

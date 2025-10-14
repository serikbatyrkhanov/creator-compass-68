import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type PlanTask = Database["public"]["Tables"]["plan_tasks"]["Row"];
type ScriptDocument = Database["public"]["Tables"]["script_documents"]["Row"];

export default function ScriptEditor() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [task, setTask] = useState<PlanTask | null>(null);
  const [scriptDoc, setScriptDoc] = useState<ScriptDocument | null>(null);
  const [title, setTitle] = useState("");
  const [scriptContent, setScriptContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, [taskId]);

  const loadData = async () => {
    if (!taskId) return;
    
    try {
      // Load task
      const { data: taskData, error: taskError } = await supabase
        .from("plan_tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (taskError) throw taskError;
      setTask(taskData);

      // Load or create script document
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: scriptData, error: scriptError } = await supabase
        .from("script_documents")
        .select("*")
        .eq("task_id", taskId)
        .maybeSingle();

      if (scriptError && scriptError.code !== "PGRST116") throw scriptError;

      if (scriptData) {
        setScriptDoc(scriptData);
        setTitle(scriptData.title || taskData.task_title);
        
        // Handle content - could be string or JSON object
        if (typeof scriptData.content === "string") {
          setScriptContent(scriptData.content);
        } else if (scriptData.content && typeof scriptData.content === "object" && "text" in scriptData.content) {
          setScriptContent(String(scriptData.content.text) || "");
        } else if (scriptData.content) {
          setScriptContent(JSON.stringify(scriptData.content, null, 2));
        }
      } else {
        setTitle(taskData.task_title);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: t("scriptEditor.error"),
        description: t("scriptEditor.errorLoading"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!taskId) return;
    
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (scriptDoc) {
        // Update existing document
        const { error } = await supabase
          .from("script_documents")
          .update({
            title,
            content: scriptContent,
            last_edited_at: new Date().toISOString(),
          })
          .eq("id", scriptDoc.id);

        if (error) throw error;
      } else {
        // Create new document
        const { data, error } = await supabase
          .from("script_documents")
          .insert({
            task_id: taskId,
            user_id: user.id,
            title,
            content: scriptContent,
          })
          .select()
          .single();

        if (error) throw error;
        setScriptDoc(data);
      }

      toast({
        title: t("scriptEditor.saved"),
        description: t("scriptEditor.scriptSaved"),
      });
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: t("scriptEditor.error"),
        description: t("scriptEditor.errorSaving"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!task) return;
    
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-script-suggestion",
        {
          body: {
            title: task.task_title,
            description: task.post_description || "",
            platform: task.platform || "general",
          },
        }
      );

      if (error) throw error;

      if (data?.script) {
        setScriptContent(data.script);
        toast({
          title: t("scriptEditor.generated"),
          description: t("scriptEditor.aiGenerated"),
        });
      }
    } catch (error) {
      console.error("Error generating script:", error);
      toast({
        title: t("scriptEditor.error"),
        description: t("scriptEditor.errorGenerating"),
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t("scriptEditor.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/content-calendar')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">{t("scriptEditor.title")}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerateScript}
              disabled={generating}
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {generating ? t("scriptEditor.generating") : t("scriptEditor.generateAI")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? t("scriptEditor.saving") : t("scriptEditor.save")}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">{t("scriptEditor.titleLabel")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("scriptEditor.titlePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="script">{t("scriptEditor.scriptContentLabel")}</Label>
            <Textarea
              id="script"
              value={scriptContent}
              onChange={(e) => setScriptContent(e.target.value)}
              placeholder={t("scriptEditor.scriptContentPlaceholder")}
              className="min-h-[500px] font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

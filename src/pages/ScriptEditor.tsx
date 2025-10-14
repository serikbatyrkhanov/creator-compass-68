import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Canvas, Textbox, Circle, Image as FabricImage } from "fabric";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Type,
  Image as ImageIcon,
  Pen,
  Save,
  Download,
  Loader2,
  Trash2,
  Upload,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const ScriptEditor = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [drawMode, setDrawMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [brushColor, setBrushColor] = useState("#8B5CF6");
  const [brushSize, setBrushSize] = useState(5);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [taskDetails, setTaskDetails] = useState<{
    post_title: string;
    post_description: string;
    platform: string | null;
  } | null>(null);
  const [generatingScript, setGeneratingScript] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new Canvas(canvasRef.current, {
      width: 1200,
      height: 1600,
      backgroundColor: "#fff",
    });

    // Initialize the freeDrawingBrush right after canvas creation
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = brushColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Load task details
  useEffect(() => {
    if (!taskId || !userId) return;

    const loadTaskDetails = async () => {
      const { data, error } = await supabase
        .from("plan_tasks")
        .select("post_title, post_description, platform")
        .eq("id", taskId)
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error loading task:", error);
        return;
      }

      if (data) {
        setTaskDetails(data);
      }
    };

    loadTaskDetails();
  }, [taskId, userId]);

  // Load existing document
  useEffect(() => {
    if (!canvas || !taskId || !userId) return;

    const loadDocument = async () => {
      const { data, error } = await supabase
        .from("script_documents")
        .select("content")
        .eq("task_id", taskId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error loading document:", error);
        return;
      }

      if (data?.content) {
        canvas.loadFromJSON(data.content as string | Record<string, any>, () => {
          canvas.renderAll();
        });
      }
    };

    loadDocument();
  }, [canvas, taskId, userId]);

  // Update drawing mode
  useEffect(() => {
    if (!canvas) return;
    
    canvas.isDrawingMode = drawMode;
    if (drawMode && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
    }
  }, [canvas, drawMode, brushColor, brushSize]);

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!canvas || !taskId || !userId) return;

    setSaving(true);

    try {
      const canvasJSON = canvas.toJSON();

      const { error } = await supabase
        .from("script_documents")
        .upsert(
          {
            task_id: taskId,
            user_id: userId,
            content: canvasJSON,
            last_edited_at: new Date().toISOString(),
          },
          {
            onConflict: "task_id",
          }
        );

      if (error) throw error;

      setLastSaved(new Date());
      toast({
        title: t("scriptEditor.documentSaved"),
        duration: 2000,
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: t("scriptEditor.errorSaving"),
        description: t("scriptEditor.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [canvas, taskId, userId, toast]);

  // Trigger auto-save on canvas changes
  useEffect(() => {
    if (!canvas) return;

    let saveTimeout: NodeJS.Timeout;

    const handleChange = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        autoSave();
      }, 3000);
    };

    canvas.on("object:modified", handleChange);
    canvas.on("object:added", handleChange);
    canvas.on("object:removed", handleChange);

    return () => {
      clearTimeout(saveTimeout);
      canvas.off("object:modified", handleChange);
      canvas.off("object:added", handleChange);
      canvas.off("object:removed", handleChange);
    };
  }, [canvas, autoSave]);

  const addTextBlock = () => {
    if (!canvas) return;

    const text = new Textbox("Type here...", {
      left: 100,
      top: 100,
      width: 400,
      fontSize: 18,
      fill: "#000",
      fontFamily: "Inter, sans-serif",
      editable: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files?.[0]) return;

    const file = e.target.files[0];
    
    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from("blog-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("blog-images")
        .getPublicUrl(data.path);

      FabricImage.fromURL(publicUrl).then((img) => {
        img.scaleToWidth(400);
        canvas.add(img);
        canvas.renderAll();
      });

      toast({
        title: t("scriptEditor.imageUploaded"),
        description: t("scriptEditor.imageAdded"),
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: t("scriptEditor.errorUploading"),
        description: t("scriptEditor.tryAgain"),
        variant: "destructive",
      });
    }
  };

  const addImageFromUrl = () => {
    if (!canvas || !imageUrl) return;

    FabricImage.fromURL(imageUrl).then((img) => {
      img.scaleToWidth(400);
      canvas.add(img);
      canvas.renderAll();
      setImageUrl("");
      setShowImageInput(false);
      
      toast({
        title: t("scriptEditor.imageAdded"),
        description: t("scriptEditor.imageAdded"),
      });
    });
  };

  const deleteSelected = () => {
    if (!canvas) return;
    
    const activeObjects = canvas.getActiveObjects();
    canvas.remove(...activeObjects);
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  const clearDrawings = () => {
    if (!canvas) return;
    
    const objects = canvas.getObjects();
    objects.forEach((obj) => {
      if (obj.type === "path") {
        canvas.remove(obj);
      }
    });
    canvas.renderAll();
  };

  const exportToPDF = async () => {
    if (!canvas) return;

    try {
      const dataURL = canvas.toDataURL({
        format: "png",
        quality: 1.0,
        multiplier: 1,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [1200, 1600],
      });

      pdf.addImage(dataURL, "PNG", 0, 0, 1200, 1600);
      pdf.save(`script-${taskId}.pdf`);

      toast({
        title: t("scriptEditor.pdfExported"),
        description: t("scriptEditor.pdfExportDesc"),
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: t("scriptEditor.errorExporting"),
        description: t("scriptEditor.tryAgain"),
        variant: "destructive",
      });
    }
  };

  const loadDemo = () => {
    if (!canvas) return;

    // Clear existing content
    canvas.clear();
    canvas.backgroundColor = "#fff";

    // Add demo text block
    const demoText = new Textbox(
      "Hook: Did you know 90% of people struggle with consistency?\n\nBody: Here's my 3-step system...\n\nCTA: Follow for more tips!",
      {
        left: 100,
        top: 100,
        width: 600,
        fontSize: 18,
        fill: "#000",
        fontFamily: "Inter",
      }
    );
    canvas.add(demoText);

    // Add demo circle
    const demoCircle = new Circle({
      left: 750,
      top: 200,
      radius: 50,
      fill: "transparent",
      stroke: "#EC4899",
      strokeWidth: 3,
    });
    canvas.add(demoCircle);

    canvas.renderAll();

    toast({
      title: t("scriptEditor.demoLoaded"),
      description: t("scriptEditor.demoLoadedDesc"),
    });
  };

  const generateAIScript = async () => {
    if (!taskDetails) {
      toast({
        title: t("scriptEditor.errorGenerating"),
        description: t("scriptEditor.tryAgain"),
        variant: "destructive",
      });
      return;
    }

    setGeneratingScript(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-script-suggestion", {
        body: {
          title: taskDetails.post_title,
          description: taskDetails.post_description,
          platform: taskDetails.platform || "YouTube",
        },
      });

      if (error) throw error;

      const scriptText = data.script;

      // Add script as text block to canvas
      if (canvas) {
        const scriptBlock = new Textbox(scriptText, {
          left: 50,
          top: 50,
          width: 1100,
          fontSize: 16,
          fill: "#000",
          fontFamily: "Inter, sans-serif",
          editable: true,
        });

        canvas.add(scriptBlock);
        canvas.setActiveObject(scriptBlock);
        canvas.renderAll();
      }

      toast({
        title: t("scriptEditor.suggestionGenerated"),
        description: t("scriptEditor.editSuggestion"),
      });
    } catch (error) {
      console.error("Script generation error:", error);
      toast({
        title: t("scriptEditor.errorGenerating"),
        description: t("scriptEditor.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setGeneratingScript(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Task Info Card */}
      {taskDetails && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="bg-card border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {t("scriptEditor.scriptTitle")}
                    </Label>
                    <p className="font-medium">{taskDetails.post_title}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      {t("scriptEditor.scriptDescription")}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {taskDetails.post_description}
                    </p>
                  </div>
                  {taskDetails.platform && (
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        {t("scriptEditor.platform")}
                      </Label>
                      <p className="text-sm">{taskDetails.platform}</p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={generateAIScript}
                  disabled={generatingScript}
                  className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {generatingScript ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("scriptEditor.generating")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t("scriptEditor.generateSuggestion")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/content-calendar")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("scriptEditor.backToCalendar")}
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg font-semibold">{t("scriptEditor.title")}</h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={addTextBlock}
              className="gap-2"
            >
              <Type className="h-4 w-4" />
              {t("scriptEditor.addText")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImageInput(!showImageInput)}
              className="gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              {t("scriptEditor.insertImage")}
            </Button>

            <Button
              variant={drawMode ? "default" : "outline"}
              size="sm"
              onClick={() => setDrawMode(!drawMode)}
              className="gap-2"
            >
              <Pen className="h-4 w-4" />
              {drawMode ? t("scriptEditor.stopDrawing") : t("scriptEditor.draw")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={deleteSelected}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {t("scriptEditor.delete")}
            </Button>

            <div className="h-6 w-px bg-border" />

            <Button
              size="sm"
              onClick={autoSave}
              disabled={saving}
              className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("scriptEditor.saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("scriptEditor.save")}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {t("scriptEditor.exportPdf")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadDemo}
              className="gap-2"
            >
              {t("scriptEditor.loadDemo")}
            </Button>
          </div>
        </div>

        {/* Image URL Input */}
        {showImageInput && (
          <div className="border-t bg-muted/50 px-4 py-3">
            <div className="flex items-center gap-2 max-w-2xl">
              <Label className="text-sm whitespace-nowrap">{t("scriptEditor.imageUrl")}:</Label>
              <Input
                type="url"
                placeholder={t("scriptEditor.imageUrlPlaceholder")}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addImageFromUrl} size="sm">
                {t("scriptEditor.add")}
              </Button>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span className="gap-2">
                    <Upload className="h-4 w-4" />
                    {t("scriptEditor.upload")}
                  </span>
                </Button>
              </Label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        )}

        {/* Drawing Tools */}
        {drawMode && (
          <div className="border-t bg-muted/50 px-4 py-2 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="text-xs">{t("scriptEditor.color")}:</Label>
              <div className="flex gap-1">
                {["#8B5CF6", "#EC4899", "#000000", "#3B82F6", "#10B981"].map(
                  (color) => (
                    <button
                      key={color}
                      onClick={() => setBrushColor(color)}
                      className={`w-6 h-6 rounded-full border-2 ${
                        brushColor === color
                          ? "border-primary"
                          : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs">{t("scriptEditor.brushSize")}:</Label>
              <Slider
                value={[brushSize]}
                onValueChange={([size]) => setBrushSize(size)}
                min={2}
                max={20}
                step={1}
                className="w-32"
              />
              <span className="text-xs text-muted-foreground">{brushSize}px</span>
            </div>

            <Button variant="ghost" size="sm" onClick={clearDrawings}>
              {t("scriptEditor.clearDrawings")}
            </Button>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className={`${taskDetails ? 'pt-56' : 'pt-32'} pb-10 bg-muted min-h-screen flex justify-center items-start`}
        <div className="mt-8 shadow-2xl rounded-lg overflow-hidden">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Save Indicator */}
      {lastSaved && (
        <div className="fixed bottom-4 right-4 bg-card shadow-lg rounded-full px-4 py-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-xs text-muted-foreground">
            Saved {format(lastSaved, "h:mm a")}
          </span>
        </div>
      )}
    </div>
  );
};

export default ScriptEditor;

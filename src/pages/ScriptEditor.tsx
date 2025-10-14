import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Image as ImageIcon,
  Save,
  Download,
  Loader2,
  Trash2,
  Upload,
  Sparkles,
  Bold,
  Italic,
  List,
  Heading2,
} from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const ScriptEditor = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [taskDetails, setTaskDetails] = useState<{
    post_title: string;
    post_description: string;
    platform: string | null;
  } | null>(null);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[600px] p-8 bg-background',
      },
    },
    onUpdate: ({ editor }) => {
      // Trigger auto-save on content change
      debouncedAutoSave();
    },
  });

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
    if (!editor || !taskId || !userId) return;

    const loadDocument = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("script_documents")
        .select("content")
        .eq("task_id", taskId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error loading document:", error);
        setIsLoading(false);
        return;
      }

      if (data?.content) {
        try {
          // Check if content is HTML string (new format) or Canvas JSON (old format)
          if (typeof data.content === 'string') {
            // New format: HTML string
            editor.commands.setContent(data.content);
          } else if (data.content && typeof data.content === 'object') {
            // Old format: Canvas JSON - extract text from objects
            const canvasObjects = (data.content as any).objects || [];
            let extractedText = '';
            
            canvasObjects.forEach((obj: any) => {
              if (obj.type === 'textbox' || obj.type === 'text') {
                extractedText += obj.text + '\n\n';
              }
            });
            
            if (extractedText) {
              editor.commands.setContent(`<p>${extractedText.replace(/\n/g, '<br>')}</p>`);
              toast({
                title: "Canvas data converted",
                description: "Your previous script has been converted to text format",
              });
            }
          }
          console.log("Document loaded successfully");
        } catch (loadError) {
          console.error("Error loading document:", loadError);
        }
      }
      setIsLoading(false);
    };

    loadDocument();
  }, [editor, taskId, userId]);

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!editor || !taskId || !userId || isLoading) return;

    setSaving(true);

    try {
      const htmlContent = editor.getHTML();

      const { error } = await supabase
        .from("script_documents")
        .upsert(
          {
            task_id: taskId,
            user_id: userId,
            content: htmlContent,
            last_edited_at: new Date().toISOString(),
          },
          {
            onConflict: "task_id",
          }
        );

      if (error) throw error;

      setLastSaved(new Date());
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
  }, [editor, taskId, userId, isLoading, toast, t]);

  // Debounced auto-save
  const debouncedAutoSave = useCallback(() => {
    const timeoutId = setTimeout(() => {
      autoSave();
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [autoSave]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor || !e.target.files?.[0]) return;

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

      // Insert image into editor
      editor.chain().focus().setImage({ src: publicUrl }).run();

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
    if (!editor || !imageUrl) return;

    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setShowImageDialog(false);
    
    toast({
      title: t("scriptEditor.imageAdded"),
    });
  };

  const deleteSelected = () => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
  };

  const exportToPDF = async () => {
    if (!editor) return;

    try {
      // Create a temporary div to render the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = editor.getHTML();
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.padding = '40px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'Inter, sans-serif';
      document.body.appendChild(tempDiv);

      // Use html2canvas to convert to image
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
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

  const generateAIScript = async () => {
    if (!taskDetails || !editor) {
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

      // Insert script as formatted HTML into editor
      const formattedScript = scriptText
        .split('\n\n')
        .map((paragraph: string) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
        .join('');

      editor.chain().focus().clearContent().insertContent(formattedScript).run();

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

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Fixed Toolbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/content-calendar")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("scriptEditor.back")}
              </Button>
              <h1 className="text-lg font-semibold">{t("scriptEditor.title")}</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Text Formatting */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-accent' : ''}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-accent' : ''}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-accent' : ''}
              >
                <List className="h-4 w-4" />
              </Button>

              <div className="h-6 w-px bg-border mx-1" />

              {/* Image Upload */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Image from URL */}
              <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("scriptEditor.imageUrl")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Button onClick={addImageFromUrl} className="w-full">
                      {t("scriptEditor.addImage")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="h-6 w-px bg-border mx-1" />

              {/* Delete */}
              <Button
                variant="ghost"
                size="sm"
                onClick={deleteSelected}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              {/* Save */}
              <Button
                variant="ghost"
                size="sm"
                onClick={autoSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>

              {/* Export PDF */}
              <Button
                variant="ghost"
                size="sm"
                onClick={exportToPDF}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Save Status */}
          {lastSaved && (
            <div className="text-xs text-muted-foreground mt-2 text-center">
              {t("scriptEditor.lastSaved")}: {format(lastSaved, "HH:mm:ss")}
            </div>
          )}
        </div>
      </div>

      {/* Task Info Card */}
      {taskDetails && (
        <div className="fixed top-[73px] left-0 right-0 z-40 bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="bg-card border rounded-lg p-4">
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

      {/* Editor Area */}
      <div className={`container mx-auto px-4 ${taskDetails ? 'mt-[250px]' : 'mt-[90px]'}`}>
        <div className="bg-card border rounded-lg shadow-sm">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default ScriptEditor;

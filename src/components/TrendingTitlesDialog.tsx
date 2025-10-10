import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, RefreshCw, Copy, Check, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "@/assets/climbley-logo.png";

interface TrendingTitlesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TrendingTitlesDialog = ({ open, onOpenChange }: TrendingTitlesDialogProps) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingPlans, setGeneratingPlans] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateTitles = async () => {
    if (!prompt.trim()) {
      toast({
        title: t("trendingTitles.promptRequired"),
        description: t("trendingTitles.promptRequiredDescription"),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setTitles([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-trending-titles", {
        body: { prompt },
      });

      if (error) throw error;

      if (data?.titles && Array.isArray(data.titles)) {
        setTitles(data.titles);
        toast({
          title: t("trendingTitles.success"),
          description: t("trendingTitles.generatedTitles", { count: data.titles.length }),
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error generating titles:", error);
      toast({
        title: t("trendingTitles.generationFailed"),
        description: error.message || t("trendingTitles.errorMessage"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (title: string, index: number) => {
    try {
      await navigator.clipboard.writeText(title);
      setCopiedIndex(index);
      toast({
        title: t("trendingTitles.copied"),
        description: t("trendingTitles.copiedDescription"),
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast({
        title: t("trendingTitles.copyFailed"),
        description: t("trendingTitles.copyFailedDescription"),
        variant: "destructive",
      });
    }
  };

  const copyAllTitles = async () => {
    try {
      const allTitles = titles.join('\n');
      await navigator.clipboard.writeText(allTitles);
      toast({
        title: t("trendingTitles.allCopied"),
        description: t("trendingTitles.allCopiedDescription"),
      });
    } catch (error) {
      toast({
        title: t("trendingTitles.copyFailed"),
        description: t("trendingTitles.copyFailedDescription"),
        variant: "destructive",
      });
    }
  };

  const generatePlansFromTitles = async () => {
    if (titles.length === 0) {
      toast({
        title: t("trendingTitles.noTitles"),
        description: t("trendingTitles.noTitlesDescription"),
        variant: "destructive",
      });
      return;
    }

    setGeneratingPlans(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("generate-plans-from-titles", {
        body: { 
          titles,
          userId: user.id 
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: t("trendingTitles.plansCreated"),
          description: t("trendingTitles.plansCreatedDescription", { 
            plansCreated: data.plansCreated, 
            titlesUsed: data.titlesUsed 
          }),
        });
        
        // Close dialog and navigate to content calendar
        onOpenChange(false);
        setTimeout(() => {
          navigate("/content-calendar");
        }, 500);
      } else {
        throw new Error("Failed to create plans");
      }
    } catch (error: any) {
      console.error("Error generating plans:", error);
      toast({
        title: t("trendingTitles.planGenerationFailed"),
        description: error.message || t("trendingTitles.planErrorMessage"),
        variant: "destructive",
      });
    } finally {
      setGeneratingPlans(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <img src={logo} alt="" className="h-6 w-6" />
            {t("trendingTitles.title")}
          </DialogTitle>
          <DialogDescription>
            {t("trendingTitles.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("trendingTitles.topicLabel")}</label>
            <Textarea
              placeholder={t("trendingTitles.topicPlaceholder")}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px]"
              disabled={loading}
            />
            <Button
              onClick={generateTitles}
              disabled={loading || !prompt.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t("trendingTitles.generating")}
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t("trendingTitles.generateButton")}
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          {titles.length > 0 && (
              <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{t("trendingTitles.generatedTitlesLabel")}</h3>
                  <Badge variant="secondary">{titles.length} {t("trendingTitles.titlesCount")}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAllTitles}
                    className="gap-2"
                  >
                    <Copy className="h-3 w-3" />
                    {t("trendingTitles.copyAll")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={generatePlansFromTitles}
                    disabled={generatingPlans}
                    className="gap-2 bg-gradient-to-r from-primary to-secondary"
                  >
                    {generatingPlans ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        {t("trendingTitles.creatingPlans")}
                      </>
                    ) : (
                      <>
                        <Calendar className="h-3 w-3" />
                        {t("trendingTitles.generatePlansButton")}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 rounded-lg border bg-muted/30 p-4">
                <div className="space-y-2">
                  {titles.map((title, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-lg bg-background hover:bg-accent/50 transition-colors group"
                    >
                      <Badge variant="outline" className="shrink-0 mt-0.5">
                        {index + 1}
                      </Badge>
                      <p className="text-sm flex-1 leading-relaxed">{title}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(title, index)}
                      >
                        {copiedIndex === index ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Empty State */}
          {!loading && titles.length === 0 && (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-lg p-8">
              <div className="text-center space-y-2">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t("trendingTitles.emptyState")}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

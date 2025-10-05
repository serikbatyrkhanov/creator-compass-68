import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, RefreshCw } from "lucide-react";

interface ContentIdea {
  title: string;
  platforms: string[];
  steps: string[];
  effort: string;
}

interface ContentIdeasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideas: ContentIdea[];
  loading: boolean;
  onRegenerate: () => void;
}

export function ContentIdeasDialog({
  open,
  onOpenChange,
  ideas,
  loading,
  onRegenerate,
}: ContentIdeasDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-emerald-500" />
            Your Content Ideas
          </DialogTitle>
          <DialogDescription>
            AI-generated ideas tailored to your creator archetype and time constraints
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <p className="text-sm text-muted-foreground">Generating ideas...</p>
            </div>
          </div>
        ) : ideas.length > 0 ? (
          <div className="space-y-6">
            {ideas.map((idea, idx) => (
              <div
                key={idx}
                className="rounded-lg border bg-gradient-to-br from-white to-emerald-50/30 p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold">{idea.title}</h3>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {idea.effort}
                  </Badge>
                </div>

                <div className="mb-3">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Best Platforms:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {idea.platforms.map((platform, i) => (
                      <Badge key={i} variant="outline">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">
                    Quick Steps:
                  </p>
                  <ol className="space-y-1.5 pl-5 text-sm">
                    {idea.steps.map((step, i) => (
                      <li key={i} className="list-decimal">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}

            <div className="flex justify-center gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onRegenerate}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Generate New Ideas
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No ideas generated yet</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

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
import { Calendar, Clock, CheckCircle2, RefreshCw, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DayPlan {
  day: string;
  dayNumber: number;
  task: string;
  timeEstimate: string;
  platform?: string;
  tip: string;
}

interface ContentPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: DayPlan[];
  loading: boolean;
  onRegenerate: () => void;
}

export function ContentPlanDialog({
  open,
  onOpenChange,
  plan,
  loading,
  onRegenerate,
}: ContentPlanDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6 text-emerald-500" />
            Your 7-Day Content Plan
          </DialogTitle>
          <DialogDescription>
            A personalized weekly schedule to help you create consistent content
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <p className="text-sm text-muted-foreground">Creating your plan...</p>
            </div>
          </div>
        ) : plan.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.map((day, idx) => (
                <Card
                  key={idx}
                  className="relative overflow-hidden border-2 hover:border-emerald-300 transition-colors"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
                  <CardContent className="p-5 pt-6">
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-lg">{day.day}</h3>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {day.timeEstimate}
                        </Badge>
                      </div>
                      {day.platform && (
                        <Badge variant="outline" className="mt-1">
                          {day.platform}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Today's Task:
                        </p>
                        <p className="text-sm font-semibold">{day.task}</p>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground">{day.tip}</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full mt-4 gap-2"
                      onClick={() => {/* TODO: Mark as complete */}}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Complete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onRegenerate}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Generate New Plan
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No plan generated yet</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

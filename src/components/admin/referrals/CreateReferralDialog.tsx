import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { PRODUCTION_DOMAIN } from "@/lib/constants";

interface CreateReferralDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateReferralDialog({ open, onOpenChange, onSuccess }: CreateReferralDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date>();
  const [maxUses, setMaxUses] = useState<string>("");
  const [hasExpiration, setHasExpiration] = useState(false);
  const [hasMaxUses, setHasMaxUses] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !description) {
      toast({
        title: "Validation Error",
        description: "Code and description are required",
        variant: "destructive"
      });
      return;
    }

    // Validate code format
    const codeRegex = /^[a-z0-9-]+$/;
    if (!codeRegex.test(code)) {
      toast({
        title: "Invalid Code Format",
        description: "Use only lowercase letters, numbers, and hyphens",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-referral-link', {
        body: {
          code,
          description,
          expiresAt: hasExpiration && expiresAt ? expiresAt.toISOString() : null,
          maxUses: hasMaxUses && maxUses ? parseInt(maxUses) : null,
          metadata: {}
        }
      });

      if (error) throw error;

      toast({
        title: "Referral Link Created",
        description: `Successfully created referral code: ${code}`
      });

      // Reset form
      setCode("");
      setDescription("");
      setExpiresAt(undefined);
      setMaxUses("");
      setHasExpiration(false);
      setHasMaxUses(false);
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create referral link",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const previewUrl = code ? `${PRODUCTION_DOMAIN}?ref=${code}` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Referral Link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Referral Code *</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toLowerCase())}
              placeholder="partner-123"
              maxLength={50}
              required
            />
            {previewUrl && (
              <p className="text-sm text-muted-foreground">
                Preview: {previewUrl}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Campaign description..."
              maxLength={255}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Expiration Date</Label>
              <Switch
                checked={hasExpiration}
                onCheckedChange={setHasExpiration}
              />
            </div>
            {hasExpiration && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt ? format(expiresAt, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiresAt}
                    onSelect={setExpiresAt}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Max Uses</Label>
              <Switch
                checked={hasMaxUses}
                onCheckedChange={setHasMaxUses}
              />
            </div>
            {hasMaxUses && (
              <Input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="100"
                min="1"
              />
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
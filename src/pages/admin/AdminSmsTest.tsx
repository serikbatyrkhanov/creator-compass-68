import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AdminSmsTest() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!phone || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-sms', {
        body: { phoneNumber: phone, message, isTest: true },
      });

      if (error) throw error;

      toast.success("Test SMS sent successfully!");
      setMessage("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send SMS");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">SMS Testing</h1>
        <p className="text-muted-foreground">Send test SMS messages to verify Twilio integration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Test SMS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (E.164 format)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Your test message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">{message.length}/160 characters</p>
          </div>

          <Button onClick={handleSend} disabled={sending} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : "Send Test SMS"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

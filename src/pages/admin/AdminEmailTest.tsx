import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminEmailTest() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendTestEmail = async () => {
    if (!email.trim()) {
      toast.error(t("adminEmailTest.errorTitle"), {
        description: t("adminEmailTest.emailRequired"),
      });
      return;
    }

    if (!validateEmail(email)) {
      toast.error(t("adminEmailTest.errorTitle"), {
        description: t("adminEmailTest.invalidEmail"),
      });
      return;
    }

    setSending(true);

    try {
      console.log(`[ADMIN-EMAIL-TEST] Sending test email to: ${email}`);
      
      const { data, error } = await supabase.functions.invoke("send-test-email", {
        body: { email, isTest: true },
      });

      if (error) {
        console.error("[ADMIN-EMAIL-TEST] Error:", error);
        throw error;
      }

      console.log("[ADMIN-EMAIL-TEST] Success:", data);

      toast.success(t("adminEmailTest.successTitle"), {
        description: t("adminEmailTest.successDescription"),
      });
      
      setEmail("");
    } catch (error: any) {
      console.error("[ADMIN-EMAIL-TEST] Failed:", error);
      toast.error(t("adminEmailTest.errorTitle"), {
        description: error.message || t("adminEmailTest.errorDescription"),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("adminEmailTest.title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("adminEmailTest.description")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              {t("adminEmailTest.sendTestTitle")}
            </CardTitle>
            <CardDescription>
              {t("adminEmailTest.sendTestDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("adminEmailTest.emailLabel")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("adminEmailTest.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sending}
              />
            </div>
            
            <Button
              onClick={handleSendTestEmail}
              disabled={sending || !email.trim()}
              className="w-full"
            >
              {sending ? (
                <>
                  <Mail className="mr-2 h-4 w-4 animate-pulse" />
                  {t("adminEmailTest.sending")}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {t("adminEmailTest.sendButton")}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("adminEmailTest.previewTitle")}
            </CardTitle>
            <CardDescription>
              {t("adminEmailTest.previewDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-gradient-to-r from-violet-50 to-purple-50 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-violet-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm">
                    {t("adminEmailTest.sampleTaskTitle")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>{t("adminEmailTest.platform")}:</strong> TikTok
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>{t("adminEmailTest.postTitle")}:</strong> Beginner Python Day 1
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ {t("adminEmailTest.feature1")}</p>
              <p>✅ {t("adminEmailTest.feature2")}</p>
              <p>✅ {t("adminEmailTest.feature3")}</p>
              <p>✅ {t("adminEmailTest.feature4")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("adminEmailTest.technicalTitle")}</CardTitle>
          <CardDescription>
            {t("adminEmailTest.technicalDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-green-100 p-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{t("adminEmailTest.resendIntegration")}</p>
                <p className="text-muted-foreground">{t("adminEmailTest.resendDescription")}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-green-100 p-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{t("adminEmailTest.templateSync")}</p>
                <p className="text-muted-foreground">{t("adminEmailTest.templateDescription")}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-green-100 p-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{t("adminEmailTest.logging")}</p>
                <p className="text-muted-foreground">{t("adminEmailTest.loggingDescription")}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { InlineWidget } from "react-calendly";

export default function ConsultationSuccess() {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl">Оплата успешна!</CardTitle>
            <CardDescription>
              Спасибо за покупку консультации. Теперь выберите удобное время для встречи.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-background rounded-lg p-4">
              <InlineWidget
                url="https://calendly.com/serikclips/1"
                styles={{
                  height: "700px",
                  minWidth: "320px",
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
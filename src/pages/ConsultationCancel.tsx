import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ConsultationCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Оплата отменена</CardTitle>
          <CardDescription>
            Вы отменили процесс оплаты. Если это была ошибка, вы можете попробовать снова.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            size="lg"
            onClick={() => navigate("/consultation-payment")}
            className="w-full"
          >
            Попробовать снова
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full"
          >
            Вернуться на главную
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
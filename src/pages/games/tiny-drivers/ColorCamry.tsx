import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stage, Graphics } from "@pixi/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Palette } from "lucide-react";
import { useHint } from "@/hooks/useHint";

const ColorCamry = () => {
  const navigate = useNavigate();
  const { hintLevel, resetHint } = useHint();
  const [fills, setFills] = useState({ body: 0xff0000, door: 0xff0000, hood: 0xff0000 });
  const [activeColor, setActiveColor] = useState(0xff0000);

  const colors = [
    { name: "Red", value: 0xff0000 },
    { name: "Orange", value: 0xff8800 },
    { name: "Green", value: 0x00ff00 },
    { name: "Blue", value: 0x0088ff },
    { name: "Purple", value: 0x8800ff },
    { name: "Brown", value: 0x8b4513 },
  ];

  const drawCar = (g: any) => {
    g.clear();
    
    // Body
    g.beginFill(fills.body);
    g.drawRect(200, 250, 560, 120);
    g.endFill();
    
    // Door
    g.beginFill(fills.door);
    g.drawRect(350, 260, 180, 100);
    g.endFill();
    
    // Hood
    g.beginFill(fills.hood);
    g.drawRect(580, 260, 150, 100);
    g.endFill();

    // Wheels
    g.beginFill(0x333333);
    g.drawCircle(320, 380, 40);
    g.drawCircle(640, 380, 40);
    g.endFill();

    // Windows
    g.beginFill(0x88ccff);
    g.drawRect(370, 220, 70, 40);
    g.drawRect(460, 220, 70, 40);
    g.endFill();

    // Hint glow
    if (hintLevel > 0) {
      g.lineStyle(4 + hintLevel * 2, 0xffff00, 0.3 + hintLevel * 0.2);
      g.drawRect(200, 250, 560, 120);
      g.lineStyle(0);
    }
  };

  const handlePartClick = (part: 'body' | 'door' | 'hood') => {
    setFills({ ...fills, [part]: activeColor });
    resetHint();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-orange-500/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/games/tiny-drivers")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold">Color the Camry</h1>
          </div>
          <div className="w-24" />
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="bg-card rounded-lg shadow-lg p-4">
            <Stage width={960} height={540} options={{ backgroundColor: 0xf0f0f0 }}>
              <Graphics draw={drawCar} />
              <Graphics
                draw={(g) => {
                  g.beginFill(0x000000, 0);
                  g.drawRect(200, 250, 560, 120);
                  g.endFill();
                }}
                interactive={true}
                pointerdown={() => handlePartClick('body')}
              />
              <Graphics
                draw={(g) => {
                  g.beginFill(0x000000, 0);
                  g.drawRect(350, 260, 180, 100);
                  g.endFill();
                }}
                interactive={true}
                pointerdown={() => handlePartClick('door')}
              />
              <Graphics
                draw={(g) => {
                  g.beginFill(0x000000, 0);
                  g.drawRect(580, 260, 150, 100);
                  g.endFill();
                }}
                interactive={true}
                pointerdown={() => handlePartClick('hood')}
              />
            </Stage>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {colors.map((color) => (
              <Button
                key={color.name}
                onClick={() => {
                  setActiveColor(color.value);
                  resetHint();
                }}
                className={`w-16 h-16 rounded-full transition-all ${
                  activeColor === color.value ? 'ring-4 ring-primary scale-110' : ''
                }`}
                style={{ backgroundColor: `#${color.value.toString(16).padStart(6, '0')}` }}
                aria-label={color.name}
              />
            ))}
          </div>

          <p className="text-muted-foreground text-center">
            Tap the car parts to paint them with the selected color
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorCamry;

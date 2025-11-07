import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Stage, Graphics } from "@pixi/react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CircleDot } from "lucide-react";
import { useHint } from "@/hooks/useHint";
import { toast } from "sonner";

const MatchWheels = () => {
  const navigate = useNavigate();
  const { hintLevel, resetHint } = useHint();
  const [wheels, setWheels] = useState([
    { id: 1, x: 150, y: 100 },
    { id: 2, x: 300, y: 100 },
    { id: 3, x: 450, y: 100 },
    { id: 4, x: 600, y: 100 },
  ]);
  const [placed, setPlaced] = useState([false, false, false, false]);
  const draggingRef = useRef<number | null>(null);

  const targets = [
    { x: 320, y: 380 },
    { x: 640, y: 380 },
    { x: 480, y: 300 },
    { x: 480, y: 460 },
  ];

  const snapDistance = 50;

  const handleDragStart = (id: number) => {
    draggingRef.current = id;
    resetHint();
  };

  const handleDragMove = (e: any) => {
    if (draggingRef.current === null) return;
    const idx = wheels.findIndex((w) => w.id === draggingRef.current);
    if (idx === -1) return;
    
    const newWheels = [...wheels];
    newWheels[idx] = {
      ...newWheels[idx],
      x: e.data.global.x,
      y: e.data.global.y,
    };
    setWheels(newWheels);
  };

  const handleDragEnd = () => {
    if (draggingRef.current === null) return;
    const idx = wheels.findIndex((w) => w.id === draggingRef.current);
    if (idx === -1) return;

    const wheel = wheels[idx];
    let snapped = false;

    for (let i = 0; i < targets.length; i++) {
      if (placed[i]) continue;
      const dx = wheel.x - targets[i].x;
      const dy = wheel.y - targets[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < snapDistance) {
        const newWheels = [...wheels];
        newWheels[idx] = { ...wheel, x: targets[i].x, y: targets[i].y };
        setWheels(newWheels);
        
        const newPlaced = [...placed];
        newPlaced[i] = true;
        setPlaced(newPlaced);
        snapped = true;
        
        if (newPlaced.every(p => p)) {
          setTimeout(() => {
            toast.success("Great job! You matched all the wheels!");
          }, 300);
        }
        break;
      }
    }

    if (!snapped) {
      const newWheels = [...wheels];
      newWheels[idx] = {
        ...wheels[idx],
        x: 150 + idx * 150,
        y: 100,
      };
      setWheels(newWheels);
    }

    draggingRef.current = null;
  };

  const drawCar = (g: any) => {
    g.clear();
    g.beginFill(0xff0000);
    g.drawRect(200, 250, 560, 120);
    g.endFill();
    
    g.beginFill(0x88ccff);
    g.drawRect(370, 220, 70, 40);
    g.drawRect(460, 220, 70, 40);
    g.endFill();
  };

  const drawTargets = (g: any) => {
    g.clear();
    targets.forEach((target, i) => {
      if (!placed[i]) {
        const glow = hintLevel > 0 ? 0.3 + hintLevel * 0.2 : 0.3;
        g.lineStyle(3 + hintLevel * 2, 0xffff00, glow);
        g.drawCircle(target.x, target.y, 42);
        g.lineStyle(0);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-500/5">
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
            <CircleDot className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Match the Wheels</h1>
          </div>
          <div className="w-24" />
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="bg-card rounded-lg shadow-lg p-4">
            <Stage 
              width={960} 
              height={540} 
              options={{ backgroundColor: 0xf0f0f0 }}
            >
              <Graphics draw={drawCar} />
              <Graphics draw={drawTargets} />
              {wheels.map((wheel) => (
                <Graphics
                  key={wheel.id}
                  draw={(g) => {
                    g.clear();
                    g.beginFill(0x333333);
                    g.drawCircle(0, 0, 40);
                    g.endFill();
                    g.beginFill(0x666666);
                    g.drawCircle(0, 0, 20);
                    g.endFill();
                    (g as any).eventMode = 'static';
                    (g as any).cursor = 'pointer';
                    (g as any).on('pointerdown', () => handleDragStart(wheel.id));
                    (g as any).on('pointermove', handleDragMove);
                    (g as any).on('pointerup', handleDragEnd);
                    (g as any).on('pointerupoutside', handleDragEnd);
                  }}
                  x={wheel.x}
                  y={wheel.y}
                />
              ))}
            </Stage>
          </div>

          <p className="text-muted-foreground text-center">
            Drag the wheels to match them with the car
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchWheels;

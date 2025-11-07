import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Undo, RotateCcw, Palette, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  name: string;
  paths: { d: string; fillable: boolean }[];
}

const vehicles: Vehicle[] = [
  {
    id: "sedan",
    name: "Sedan Car",
    paths: [
      { d: "M150,200 L100,150 L100,120 L140,120 L160,100 L240,100 L260,120 L300,120 L300,150 L250,200 Z", fillable: true },
      { d: "M120,200 Q110,210 120,220 Q130,230 140,220 Q150,210 140,200 Z", fillable: true },
      { d: "M260,200 Q250,210 260,220 Q270,230 280,220 Q290,210 280,200 Z", fillable: true },
      { d: "M130,130 L130,150 L180,150 L180,130 Z", fillable: true },
      { d: "M220,130 L220,150 L270,150 L270,130 Z", fillable: true }
    ]
  },
  {
    id: "truck",
    name: "Pickup Truck",
    paths: [
      { d: "M100,180 L100,120 L160,120 L180,100 L240,100 L260,120 L300,120 L300,180 Z", fillable: true },
      { d: "M250,180 L250,200 L100,200 L100,180 Z", fillable: true },
      { d: "M120,200 Q110,210 120,220 Q130,230 140,220 Q150,210 140,200 Z", fillable: true },
      { d: "M260,200 Q250,210 260,220 Q270,230 280,220 Q290,210 280,200 Z", fillable: true },
      { d: "M180,130 L180,160 L230,160 L230,130 Z", fillable: true }
    ]
  },
  {
    id: "van",
    name: "Delivery Van",
    paths: [
      { d: "M100,200 L100,110 L140,110 L140,90 L280,90 L280,110 L300,110 L300,200 Z", fillable: true },
      { d: "M120,200 Q110,210 120,220 Q130,230 140,220 Q150,210 140,200 Z", fillable: true },
      { d: "M260,200 Q250,210 260,220 Q270,230 280,220 Q290,210 280,200 Z", fillable: true },
      { d: "M150,110 L150,180 L270,180 L270,110 Z", fillable: true },
      { d: "M110,130 L110,170 L135,170 L135,130 Z", fillable: true }
    ]
  },
  {
    id: "sports",
    name: "Sports Car",
    paths: [
      { d: "M150,210 L110,170 L110,140 L140,130 L170,110 L230,110 L260,130 L290,140 L290,170 L250,210 Z", fillable: true },
      { d: "M120,210 Q110,220 120,230 Q130,240 140,230 Q150,220 140,210 Z", fillable: true },
      { d: "M260,210 Q250,220 260,230 Q270,240 280,230 Q290,220 280,210 Z", fillable: true },
      { d: "M150,140 L150,165 L190,165 L190,140 Z", fillable: true },
      { d: "M210,140 L210,165 L250,165 L250,140 Z", fillable: true }
    ]
  },
  {
    id: "firetruck",
    name: "Fire Truck",
    paths: [
      { d: "M80,190 L80,100 L150,100 L170,80 L250,80 L270,100 L320,100 L320,190 Z", fillable: true },
      { d: "M100,190 Q90,200 100,210 Q110,220 120,210 Q130,200 120,190 Z", fillable: true },
      { d: "M180,190 Q170,200 180,210 Q190,220 200,210 Q210,200 200,190 Z", fillable: true },
      { d: "M280,190 Q270,200 280,210 Q290,220 300,210 Q310,200 300,190 Z", fillable: true },
      { d: "M190,110 L190,170 L310,170 L310,110 Z", fillable: true }
    ]
  },
  {
    id: "bus",
    name: "School Bus",
    paths: [
      { d: "M90,200 L90,90 L310,90 L310,200 Z", fillable: true },
      { d: "M110,200 Q100,210 110,220 Q120,230 130,220 Q140,210 130,200 Z", fillable: true },
      { d: "M270,200 Q260,210 270,220 Q280,230 290,220 Q300,210 290,200 Z", fillable: true },
      { d: "M110,110 L110,180 L190,180 L190,110 Z", fillable: true },
      { d: "M210,110 L210,180 L290,180 L290,110 Z", fillable: true }
    ]
  },
  {
    id: "police",
    name: "Police Car",
    paths: [
      { d: "M150,200 L100,150 L100,120 L140,120 L160,100 L240,100 L260,120 L300,120 L300,150 L250,200 Z", fillable: true },
      { d: "M180,90 L180,105 L220,105 L220,90 Z", fillable: true },
      { d: "M120,200 Q110,210 120,220 Q130,230 140,220 Q150,210 140,200 Z", fillable: true },
      { d: "M260,200 Q250,210 260,220 Q270,230 280,220 Q290,210 280,200 Z", fillable: true },
      { d: "M130,130 L130,150 L180,150 L180,130 Z", fillable: true }
    ]
  },
  {
    id: "taxi",
    name: "Taxi",
    paths: [
      { d: "M150,200 L100,150 L100,120 L140,120 L160,100 L240,100 L260,120 L300,120 L300,150 L250,200 Z", fillable: true },
      { d: "M180,85 L170,100 L230,100 L220,85 Z", fillable: true },
      { d: "M120,200 Q110,210 120,220 Q130,230 140,220 Q150,210 140,200 Z", fillable: true },
      { d: "M260,200 Q250,210 260,220 Q270,230 280,220 Q290,210 280,200 Z", fillable: true },
      { d: "M220,130 L220,150 L270,150 L270,130 Z", fillable: true }
    ]
  }
];

const colors = [
  { name: "Red", value: "hsl(0, 84%, 60%)" },
  { name: "Blue", value: "hsl(217, 91%, 60%)" },
  { name: "Green", value: "hsl(142, 71%, 45%)" },
  { name: "Yellow", value: "hsl(45, 93%, 55%)" },
  { name: "Orange", value: "hsl(24, 95%, 55%)" },
  { name: "Purple", value: "hsl(271, 81%, 56%)" },
  { name: "Pink", value: "hsl(330, 81%, 60%)" },
  { name: "Cyan", value: "hsl(189, 85%, 48%)" },
  { name: "Brown", value: "hsl(25, 45%, 37%)" },
  { name: "Gray", value: "hsl(220, 9%, 46%)" },
  { name: "White", value: "hsl(0, 0%, 95%)" },
  { name: "Black", value: "hsl(0, 0%, 15%)" }
];

const ColorTheCars = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colors[0].value);
  const [coloredPaths, setColoredPaths] = useState<{ [vehicleId: string]: { [pathIndex: number]: string } }>({});
  const [history, setHistory] = useState<{ [vehicleId: string]: { [pathIndex: number]: string }[] }>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentVehicle = vehicles[currentIndex];

  useEffect(() => {
    const savedColors = localStorage.getItem('coloredCars');
    if (savedColors) {
      setColoredPaths(JSON.parse(savedColors));
    }
  }, []);

  const saveColors = useCallback((newColors: typeof coloredPaths) => {
    localStorage.setItem('coloredCars', JSON.stringify(newColors));
  }, []);

  const drawVehicle = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'hsl(var(--foreground))';
    ctx.lineWidth = 2;

    currentVehicle.paths.forEach((path, index) => {
      const pathObj = new Path2D(path.d);
      
      const vehicleColors = coloredPaths[currentVehicle.id] || {};
      if (vehicleColors[index]) {
        ctx.fillStyle = vehicleColors[index];
        ctx.fill(pathObj);
      }
      
      ctx.stroke(pathObj);
    });
  }, [currentVehicle, coloredPaths]);

  useEffect(() => {
    drawVehicle();
  }, [drawVehicle]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (let i = currentVehicle.paths.length - 1; i >= 0; i--) {
      const path = currentVehicle.paths[i];
      if (!path.fillable) continue;

      const pathObj = new Path2D(path.d);
      if (ctx.isPointInPath(pathObj, x, y)) {
        const newColors = {
          ...coloredPaths,
          [currentVehicle.id]: {
            ...(coloredPaths[currentVehicle.id] || {}),
            [i]: selectedColor
          }
        };
        
        setHistory({
          ...history,
          [currentVehicle.id]: [...(history[currentVehicle.id] || []), coloredPaths[currentVehicle.id] || {}]
        });
        
        setColoredPaths(newColors);
        saveColors(newColors);
        break;
      }
    }
  };

  const handleUndo = () => {
    const vehicleHistory = history[currentVehicle.id];
    if (!vehicleHistory || vehicleHistory.length === 0) return;

    const previousState = vehicleHistory[vehicleHistory.length - 1];
    const newHistory = { ...history };
    newHistory[currentVehicle.id] = vehicleHistory.slice(0, -1);
    
    const newColors = { ...coloredPaths, [currentVehicle.id]: previousState };
    setHistory(newHistory);
    setColoredPaths(newColors);
    saveColors(newColors);
  };

  const handleClear = () => {
    const newColors = { ...coloredPaths };
    delete newColors[currentVehicle.id];
    setColoredPaths(newColors);
    saveColors(newColors);
    setHistory({ ...history, [currentVehicle.id]: [] });
    toast({ title: "Cleared!", description: `${currentVehicle.name} has been cleared.` });
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === 0 ? vehicles.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev === vehicles.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
    
    setTouchStart(null);
  };

  const completedCount = Object.keys(coloredPaths).filter(
    (vehicleId) => Object.keys(coloredPaths[vehicleId] || {}).length > 0
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate("/games")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>

        <Card className="p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-2 text-primary">
              <Palette className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Color the Cars</h1>
            <p className="text-muted-foreground">
              {currentVehicle.name} • {currentIndex + 1}/{vehicles.length} • {completedCount} colored
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={isTransitioning}
              className="h-12 w-12"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <div
              className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                onClick={handleCanvasClick}
                className="border-2 border-border rounded-lg bg-card cursor-pointer touch-none max-w-full"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={isTransitioning}
              className="h-12 w-12"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex gap-2 justify-center mb-4">
            {vehicles.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Choose a color:</span>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.value)}
                  className={`h-10 w-10 rounded-lg border-2 transition-all hover:scale-110 ${
                    selectedColor === color.value ? 'border-primary ring-2 ring-primary/50' : 'border-border'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={!history[currentVehicle.id]?.length}
            >
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ColorTheCars;

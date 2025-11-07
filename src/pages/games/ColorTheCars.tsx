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
      // Main body
      { d: "M150,200 L100,150 L100,135 L105,135 L105,150 L150,200 Z", fillable: true },
      { d: "M250,200 L300,150 L300,135 L295,135 L295,150 L250,200 Z", fillable: true },
      // Hood
      { d: "M100,135 L100,120 L140,120 L160,100 L180,100 L180,120 L105,120 L105,135 Z", fillable: true },
      // Roof/cabin
      { d: "M180,100 L180,120 L220,120 L220,100 Z", fillable: true },
      // Trunk
      { d: "M220,100 L220,120 L240,100 L260,120 L300,120 L300,135 L295,135 L295,120 L260,120 L240,100 Z", fillable: true },
      // Front door
      { d: "M105,135 L105,150 L140,180 L140,135 Z", fillable: true },
      // Rear door
      { d: "M260,135 L260,180 L295,150 L295,135 Z", fillable: true },
      // Front bumper
      { d: "M140,180 L150,200 L170,200 L160,180 Z", fillable: true },
      // Rear bumper
      { d: "M230,180 L240,200 L250,200 L260,180 Z", fillable: true },
      // Front wheel
      { d: "M120,200 Q110,210 120,220 Q130,230 140,220 Q150,210 140,200 Z", fillable: true },
      // Rear wheel
      { d: "M260,200 Q250,210 260,220 Q270,230 280,220 Q290,210 280,200 Z", fillable: true },
      // Front window
      { d: "M130,125 L130,150 L165,150 L175,125 Z", fillable: true },
      // Rear window
      { d: "M225,125 L235,150 L270,150 L270,125 Z", fillable: true },
      // Mirror left
      { d: "M100,135 L95,140 L100,145 Z", fillable: true },
      // Mirror right
      { d: "M300,135 L305,140 L300,145 Z", fillable: true }
    ]
  },
  {
    id: "truck",
    name: "Pickup Truck",
    paths: [
      // Cabin left side
      { d: "M100,180 L100,120 L140,120 L140,180 Z", fillable: true },
      // Cabin right side
      { d: "M140,120 L160,120 L180,100 L220,100 L220,120 L220,180 L140,180 Z", fillable: true },
      // Roof
      { d: "M140,120 L160,120 L180,100 L220,100 L220,120 L180,120 Z", fillable: true },
      // Front window
      { d: "M110,130 L110,160 L135,160 L135,130 Z", fillable: true },
      // Side window
      { d: "M145,130 L165,110 L205,110 L205,130 Z", fillable: true },
      // Bed left side
      { d: "M220,120 L220,180 L230,180 L230,120 Z", fillable: true },
      // Bed center
      { d: "M230,120 L230,180 L270,180 L270,120 Z", fillable: true },
      // Bed right side
      { d: "M270,120 L270,180 L300,180 L300,120 Z", fillable: true },
      // Bed floor
      { d: "M220,180 L220,200 L300,200 L300,180 Z", fillable: true },
      // Undercarriage
      { d: "M100,180 L100,200 L110,200 L110,180 Z", fillable: true },
      { d: "M150,180 L150,200 L220,200 L220,180 Z", fillable: true },
      // Front wheel
      { d: "M120,200 Q110,210 120,220 Q130,230 140,220 Q150,210 140,200 Z", fillable: true },
      // Rear wheel
      { d: "M260,200 Q250,210 260,220 Q270,230 280,220 Q290,210 280,200 Z", fillable: true },
      // Hood detail
      { d: "M100,130 L95,135 L95,145 L100,150 Z", fillable: true }
    ]
  },
  {
    id: "van",
    name: "Delivery Van",
    paths: [
      // Front cabin lower
      { d: "M100,200 L100,140 L140,140 L140,200 Z", fillable: true },
      // Front cabin upper
      { d: "M100,140 L100,110 L140,110 L140,90 L150,90 L150,110 L140,110 L140,140 Z", fillable: true },
      // Windshield
      { d: "M110,115 L110,135 L135,135 L135,115 Z", fillable: true },
      // Door
      { d: "M140,140 L140,200 L180,200 L180,140 Z", fillable: true },
      // Cargo area lower
      { d: "M180,140 L180,200 L260,200 L260,140 Z", fillable: true },
      // Cargo area upper left
      { d: "M150,90 L150,140 L220,140 L220,90 Z", fillable: true },
      // Cargo area upper right
      { d: "M220,90 L220,140 L280,140 L280,90 Z", fillable: true },
      // Rear door
      { d: "M260,140 L260,200 L300,200 L300,110 L280,110 L280,90 L280,110 L300,110 L300,140 Z", fillable: true },
      // Cargo window left
      { d: "M160,105 L160,130 L210,130 L210,105 Z", fillable: true },
      // Cargo window right
      { d: "M230,105 L230,130 L270,130 L270,105 Z", fillable: true },
      // Front wheel
      { d: "M120,200 Q110,210 120,220 Q130,230 140,220 Q150,210 140,200 Z", fillable: true },
      // Rear wheel
      { d: "M260,200 Q250,210 260,220 Q270,230 280,220 Q290,210 280,200 Z", fillable: true },
      // Front bumper
      { d: "M100,145 L95,150 L95,160 L100,165 Z", fillable: true },
      // Side stripe
      { d: "M145,170 L145,180 L295,180 L295,170 Z", fillable: true }
    ]
  },
  {
    id: "sports",
    name: "Sports Car",
    paths: [
      // Front left body
      { d: "M150,210 L110,170 L110,150 L130,145 L150,165 Z", fillable: true },
      // Front hood
      { d: "M130,145 L110,150 L110,140 L140,130 L170,110 L190,110 L190,130 L160,140 Z", fillable: true },
      // Windshield
      { d: "M160,140 L170,110 L190,110 L180,140 Z", fillable: true },
      // Roof
      { d: "M190,110 L190,130 L210,130 L210,110 Z", fillable: true },
      // Rear window
      { d: "M210,110 L220,140 L230,110 Z", fillable: true },
      // Rear hood
      { d: "M220,140 L230,110 L260,130 L290,140 L270,145 Z", fillable: true },
      // Rear right body
      { d: "M270,145 L290,140 L290,150 L290,170 L250,210 L250,165 Z", fillable: true },
      // Front door
      { d: "M150,165 L130,145 L160,140 L180,140 L190,155 L170,175 Z", fillable: true },
      // Rear door
      { d: "M190,155 L210,155 L220,140 L240,140 L270,145 L250,165 L230,175 Z", fillable: true },
      // Undercarriage front
      { d: "M150,165 L150,210 L170,210 L170,175 Z", fillable: true },
      // Undercarriage rear
      { d: "M230,175 L230,210 L250,210 L250,165 Z", fillable: true },
      // Front wheel
      { d: "M120,210 Q110,220 120,230 Q130,240 140,230 Q150,220 140,210 Z", fillable: true },
      // Rear wheel
      { d: "M260,210 Q250,220 260,230 Q270,240 280,230 Q290,220 280,210 Z", fillable: true },
      // Front window
      { d: "M150,145 L150,160 L175,160 L185,145 Z", fillable: true },
      // Rear window
      { d: "M215,145 L225,160 L250,160 L250,145 Z", fillable: true },
      // Spoiler
      { d: "M290,150 L295,145 L295,155 L290,160 Z", fillable: true }
    ]
  },
  {
    id: "firetruck",
    name: "Fire Truck",
    paths: [
      // Cabin lower
      { d: "M80,190 L80,120 L150,120 L150,190 Z", fillable: true },
      // Cabin upper
      { d: "M80,120 L80,100 L150,100 L170,80 L180,80 L180,100 L150,100 L150,120 Z", fillable: true },
      // Cabin roof
      { d: "M150,100 L170,80 L180,80 L160,100 Z", fillable: true },
      // Front window
      { d: "M90,110 L90,135 L140,135 L140,110 Z", fillable: true },
      // Side window
      { d: "M155,90 L165,85 L175,90 L175,110 L155,110 Z", fillable: true },
      // Equipment section 1
      { d: "M150,120 L150,190 L190,190 L190,120 Z", fillable: true },
      // Equipment section 2
      { d: "M190,120 L190,190 L230,190 L230,120 Z", fillable: true },
      // Equipment section 3
      { d: "M230,120 L230,190 L270,190 L270,120 Z", fillable: true },
      // Rear compartment
      { d: "M270,100 L270,190 L320,190 L320,100 Z", fillable: true },
      // Ladder section 1
      { d: "M195,105 L195,115 L225,115 L225,105 Z", fillable: true },
      // Ladder section 2
      { d: "M235,105 L235,115 L265,115 L265,105 Z", fillable: true },
      // Rear door
      { d: "M280,110 L280,170 L310,170 L310,110 Z", fillable: true },
      // Front wheel
      { d: "M100,190 Q90,200 100,210 Q110,220 120,210 Q130,200 120,190 Z", fillable: true },
      // Middle wheel
      { d: "M180,190 Q170,200 180,210 Q190,220 200,210 Q210,200 200,190 Z", fillable: true },
      // Rear wheel
      { d: "M280,190 Q270,200 280,210 Q290,220 300,210 Q310,200 300,190 Z", fillable: true },
      // Light bar
      { d: "M155,95 L155,100 L175,100 L175,95 Z", fillable: true },
      // Hose reel
      { d: "M275,125 Q270,125 270,135 Q270,145 275,145 Q280,145 280,135 Q280,125 275,125 Z", fillable: true }
    ]
  },
  {
    id: "bus",
    name: "School Bus",
    paths: [
      // Main body lower
      { d: "M90,160 L90,200 L310,200 L310,160 Z", fillable: true },
      // Main body upper
      { d: "M90,90 L90,160 L310,160 L310,90 Z", fillable: true },
      // Front section
      { d: "M90,110 L90,140 L100,140 L100,110 Z", fillable: true },
      // Hood
      { d: "M90,140 L90,160 L105,160 L105,140 Z", fillable: true },
      // Window 1 (driver)
      { d: "M110,100 L110,150 L145,150 L145,100 Z", fillable: true },
      // Window 2
      { d: "M155,100 L155,150 L190,150 L190,100 Z", fillable: true },
      // Window 3
      { d: "M200,100 L200,150 L235,150 L235,100 Z", fillable: true },
      // Window 4
      { d: "M245,100 L245,150 L280,150 L280,100 Z", fillable: true },
      // Window 5 (rear)
      { d: "M290,100 L290,150 L305,150 L305,110 Z", fillable: true },
      // Door panel
      { d: "M105,140 L105,180 L145,180 L145,140 Z", fillable: true },
      // Side panel 1
      { d: "M155,155 L155,180 L190,180 L190,155 Z", fillable: true },
      // Side panel 2
      { d: "M200,155 L200,180 L235,180 L235,155 Z", fillable: true },
      // Side panel 3
      { d: "M245,155 L245,180 L280,180 L280,155 Z", fillable: true },
      // Rear panel
      { d: "M290,155 L290,180 L305,180 L305,160 Z", fillable: true },
      // Front wheel
      { d: "M110,200 Q100,210 110,220 Q120,230 130,220 Q140,210 130,200 Z", fillable: true },
      // Rear wheel
      { d: "M270,200 Q260,210 270,220 Q280,230 290,220 Q300,210 290,200 Z", fillable: true },
      // Front bumper
      { d: "M90,155 L85,160 L85,170 L90,175 Z", fillable: true },
      // Stop sign
      { d: "M310,120 L315,125 L315,135 L310,140 L305,135 L305,125 Z", fillable: true },
      // Roof stripe
      { d: "M95,95 L95,100 L305,100 L305,95 Z", fillable: true }
    ]
  },
  {
    id: "police",
    name: "Police Car",
    paths: [
      // Front left fender
      { d: "M150,200 L100,150 L100,135 L115,135 L150,175 Z", fillable: true },
      // Hood left
      { d: "M115,135 L100,135 L100,120 L140,120 L140,135 Z", fillable: true },
      // Hood right
      { d: "M140,120 L160,100 L180,100 L180,120 Z", fillable: true },
      // Roof
      { d: "M180,100 L180,120 L220,120 L220,100 Z", fillable: true },
      // Trunk left
      { d: "M220,100 L220,120 L240,100 Z", fillable: true },
      // Trunk right
      { d: "M240,100 L260,120 L260,135 L285,135 L285,120 Z", fillable: true },
      // Rear right fender
      { d: "M285,135 L300,135 L300,150 L250,200 L250,175 Z", fillable: true },
      // Light bar
      { d: "M180,90 L180,105 L220,105 L220,90 Z", fillable: true },
      // Light bar left
      { d: "M185,92 L185,103 L198,103 L198,92 Z", fillable: true },
      // Light bar right
      { d: "M202,92 L202,103 L215,103 L215,92 Z", fillable: true },
      // Front door
      { d: "M115,135 L115,175 L150,175 L140,135 Z", fillable: true },
      // Rear door
      { d: "M260,135 L250,175 L285,175 L285,135 Z", fillable: true },
      // Front bumper
      { d: "M150,175 L150,200 L170,200 L160,180 Z", fillable: true },
      // Rear bumper
      { d: "M230,180 L240,200 L250,200 L250,175 Z", fillable: true },
      // Front wheel
      { d: "M120,200 Q110,210 120,220 Q130,230 140,220 Q150,210 140,200 Z", fillable: true },
      // Rear wheel
      { d: "M260,200 Q250,210 260,220 Q270,230 280,220 Q290,210 280,200 Z", fillable: true },
      // Front window
      { d: "M125,125 L125,150 L165,150 L175,125 Z", fillable: true },
      // Rear window
      { d: "M225,125 L235,150 L275,150 L275,125 Z", fillable: true },
      // Badge/emblem
      { d: "M195,110 Q190,115 195,120 Q200,115 195,110 Z", fillable: true }
    ]
  },
  {
    id: "taxi",
    name: "Taxi",
    paths: [
      // Front left fender
      { d: "M150,200 L100,150 L100,135 L115,135 L150,175 Z", fillable: true },
      // Hood
      { d: "M115,135 L100,135 L100,120 L140,120 L160,100 L180,100 L180,120 L140,120 L140,135 Z", fillable: true },
      // Roof
      { d: "M180,100 L180,120 L220,120 L220,100 Z", fillable: true },
      // Trunk
      { d: "M220,100 L220,120 L240,100 L260,120 L285,120 L285,135 L260,120 Z", fillable: true },
      // Rear right fender
      { d: "M285,135 L300,135 L300,150 L250,200 L250,175 Z", fillable: true },
      // Taxi sign
      { d: "M180,85 L170,100 L230,100 L220,85 Z", fillable: true },
      // Taxi sign "TAXI" left
      { d: "M175,87 L175,98 L190,98 L190,87 Z", fillable: true },
      // Taxi sign "TAXI" right
      { d: "M210,87 L210,98 L225,98 L225,87 Z", fillable: true },
      // Front door upper
      { d: "M115,125 L115,145 L140,145 L165,125 Z", fillable: true },
      // Front door lower
      { d: "M115,145 L115,175 L150,175 L140,145 Z", fillable: true },
      // Rear door upper
      { d: "M235,125 L260,145 L285,145 L285,125 Z", fillable: true },
      // Rear door lower
      { d: "M260,145 L250,175 L285,175 L285,145 Z", fillable: true },
      // Checkerboard stripe 1
      { d: "M145,160 L145,170 L155,170 L155,160 Z", fillable: true },
      // Checkerboard stripe 2
      { d: "M165,160 L165,170 L175,170 L175,160 Z", fillable: true },
      // Front wheel
      { d: "M120,200 Q110,210 120,220 Q130,230 140,220 Q150,210 140,200 Z", fillable: true },
      // Rear wheel
      { d: "M260,200 Q250,210 260,220 Q270,230 280,220 Q290,210 280,200 Z", fillable: true },
      // Front window
      { d: "M125,128 L125,145 L160,145 L170,128 Z", fillable: true },
      // Rear window
      { d: "M230,128 L240,145 L275,145 L275,128 Z", fillable: true },
      // Door handle
      { d: "M140,155 L140,158 L150,158 L150,155 Z", fillable: true }
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

  const colorPath = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
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
  }, [currentVehicle, coloredPaths, selectedColor, history, saveColors]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    colorPath(e.clientX, e.clientY);
  };

  const handleCanvasTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      colorPath(touch.clientX, touch.clientY);
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
                width={600}
                height={400}
                onClick={handleCanvasClick}
                onTouchStart={handleCanvasTouch}
                className="border-2 border-border rounded-lg bg-card cursor-pointer touch-none max-w-full shadow-lg"
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  touchAction: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none'
                }}
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

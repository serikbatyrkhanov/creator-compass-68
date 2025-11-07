import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Undo, RotateCcw, Palette, ArrowLeft, Eraser } from "lucide-react";
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
      // Main body lower
      { d: "M75,290 L75,230 L150,230 L210,200 L390,200 L450,230 L525,230 L525,290 Z", fillable: true },
      // Hood
      { d: "M150,230 L150,200 L210,200 L270,170 L270,200 L210,200 Z", fillable: true },
      // Windshield
      { d: "M270,170 L270,200 L330,200 L330,170 Z", fillable: true },
      // Roof
      { d: "M330,170 L330,200 L390,200 L390,170 Z", fillable: true },
      // Rear window
      { d: "M390,170 L390,200 L450,200 L450,170 Z", fillable: true },
      // Trunk
      { d: "M450,200 L450,230 L525,230 L525,200 Z", fillable: true },
      // Front fender
      { d: "M75,230 L30,260 L30,290 L75,290 Z", fillable: true },
      // Rear fender
      { d: "M525,230 L525,290 L570,290 L570,260 Z", fillable: true },
      // Front door upper
      { d: "M210,200 L210,230 L270,230 L270,200 Z", fillable: true },
      // Front door lower
      { d: "M195,230 L195,275 L270,275 L270,230 Z", fillable: true },
      // Rear door upper
      { d: "M330,200 L330,230 L390,230 L390,200 Z", fillable: true },
      // Rear door lower
      { d: "M330,230 L330,275 L405,275 L405,230 Z", fillable: true },
      // Side panel front
      { d: "M75,275 L75,290 L195,290 L195,275 Z", fillable: true },
      // Side panel rear
      { d: "M405,275 L405,290 L525,290 L525,275 Z", fillable: true },
      // Front bumper
      { d: "M75,290 L30,305 L30,320 L90,320 L90,305 Z", fillable: true },
      // Rear bumper
      { d: "M510,305 L510,320 L570,320 L570,305 L525,290 Z", fillable: true },
      // Front wheel
      { d: "M120,320 Q90,335 120,350 Q150,365 180,350 Q210,335 180,320 Z", fillable: true },
      // Rear wheel
      { d: "M480,320 Q450,335 480,350 Q510,365 540,350 Q570,335 540,320 Z", fillable: true },
      // Front window
      { d: "M217,207 L217,230 L262,230 L262,207 Z", fillable: true },
      // Rear window
      { d: "M337,207 L337,230 L382,230 L382,207 Z", fillable: true },
      // Mirror left
      { d: "M75,237 L60,247 L67,257 Z", fillable: true },
      // Mirror right
      { d: "M525,237 L540,247 L532,257 Z", fillable: true }
    ]
  },
  {
    id: "truck",
    name: "Pickup Truck",
    paths: [
      // Cabin main body
      { d: "M75,290 L75,200 L210,200 L270,170 L330,170 L330,200 L330,290 Z", fillable: true },
      // Cabin roof
      { d: "M210,200 L210,170 L270,170 L330,200 Z", fillable: true },
      // Windshield
      { d: "M225,177 L225,200 L315,200 L315,177 Z", fillable: true },
      // Hood
      { d: "M75,230 L30,260 L30,290 L75,290 Z", fillable: true },
      // Side window
      { d: "M90,215 L90,260 L195,260 L195,215 Z", fillable: true },
      // Front door
      { d: "M75,260 L75,290 L195,290 L195,260 Z", fillable: true },
      // Rear cabin wall
      { d: "M330,200 L330,290 L360,290 L360,200 Z", fillable: true },
      // Bed floor
      { d: "M360,260 L360,290 L570,290 L570,260 Z", fillable: true },
      // Bed left side
      { d: "M360,200 L360,260 L390,260 L390,200 Z", fillable: true },
      // Bed center
      { d: "M390,200 L390,260 L480,260 L480,200 Z", fillable: true },
      // Bed right side
      { d: "M480,200 L480,260 L570,260 L570,200 Z", fillable: true },
      // Tailgate
      { d: "M570,215 L570,275 L585,275 L585,215 Z", fillable: true },
      // Front bumper
      { d: "M30,275 L15,290 L30,305 L75,305 L75,290 Z", fillable: true },
      // Side step
      { d: "M75,305 L75,312 L330,312 L330,305 Z", fillable: true },
      // Rear bumper
      { d: "M570,275 L585,282 L585,297 L570,290 Z", fillable: true },
      // Front wheel
      { d: "M120,320 Q90,335 120,350 Q150,365 180,350 Q210,335 180,320 Z", fillable: true },
      // Rear wheel
      { d: "M510,320 Q480,335 510,350 Q540,365 570,350 Q600,335 570,320 Z", fillable: true }
    ]
  },
  {
    id: "van",
    name: "Delivery Van",
    paths: [
      // Front cabin lower
      { d: "M30,290 L30,230 L150,230 L150,290 Z", fillable: true },
      // Front cabin upper
      { d: "M30,230 L30,170 L150,170 L180,140 L180,170 L150,170 L150,230 Z", fillable: true },
      // Windshield
      { d: "M45,185 L45,215 L135,215 L135,185 Z", fillable: true },
      // Front door
      { d: "M150,230 L150,290 L240,290 L240,230 Z", fillable: true },
      // Cargo area lower main
      { d: "M240,230 L240,290 L540,290 L540,230 Z", fillable: true },
      // Cargo area upper left
      { d: "M180,140 L180,230 L360,230 L360,140 Z", fillable: true },
      // Cargo area upper right
      { d: "M360,140 L360,230 L540,230 L540,140 Z", fillable: true },
      // Rear door left
      { d: "M540,170 L540,290 L570,290 L570,170 Z", fillable: true },
      // Roof
      { d: "M180,110 L180,140 L540,140 L540,110 Z", fillable: true },
      // Cargo window left
      { d: "M202,155 L202,215 L337,215 L337,155 Z", fillable: true },
      // Cargo window right
      { d: "M382,155 L382,215 L517,215 L517,155 Z", fillable: true },
      // Side panel lower
      { d: "M30,282 L30,290 L570,290 L570,282 Z", fillable: true },
      // Front bumper
      { d: "M15,252 L15,275 L30,290 L30,245 Z", fillable: true },
      // Rear bumper
      { d: "M570,252 L585,260 L585,282 L570,290 Z", fillable: true },
      // Company stripe
      { d: "M165,260 L165,275 L555,275 L555,260 Z", fillable: true },
      // Front wheel
      { d: "M90,320 Q60,335 90,350 Q120,365 150,350 Q180,335 150,320 Z", fillable: true },
      // Rear wheel
      { d: "M510,320 Q480,335 510,350 Q540,365 570,350 Q600,335 570,320 Z", fillable: true }
    ]
  },
  {
    id: "sports",
    name: "Sports Car",
    paths: [
      // Front left fender
      { d: "M120,320 L60,275 L60,245 L105,230 L150,245 Z", fillable: true },
      // Hood left
      { d: "M105,230 L60,245 L60,215 L120,200 L180,185 L210,200 Z", fillable: true },
      // Windshield
      { d: "M180,185 L210,140 L270,140 L285,185 Z", fillable: true },
      // Roof
      { d: "M270,140 L270,185 L360,185 L360,140 Z", fillable: true },
      // Rear window
      { d: "M360,140 L360,185 L390,185 L420,140 Z", fillable: true },
      // Hood right
      { d: "M390,200 L420,185 L480,200 L540,215 L540,245 L495,230 Z", fillable: true },
      // Rear right fender
      { d: "M495,230 L540,245 L540,275 L480,320 L450,245 Z", fillable: true },
      // Front door lower
      { d: "M150,245 L105,230 L120,200 L210,200 L255,230 L225,275 Z", fillable: true },
      // Front door upper
      { d: "M210,200 L210,185 L285,185 L285,215 L255,230 Z", fillable: true },
      // Rear door lower
      { d: "M375,275 L345,230 L390,200 L480,200 L495,230 L450,245 Z", fillable: true },
      // Rear door upper
      { d: "M345,230 L345,215 L360,185 L390,185 L390,200 Z", fillable: true },
      // Side skirt front
      { d: "M150,245 L120,320 L225,320 L225,275 Z", fillable: true },
      // Side skirt rear
      { d: "M375,275 L375,320 L480,320 L450,245 Z", fillable: true },
      // Spoiler
      { d: "M540,230 L555,222 L562,237 L547,252 Z", fillable: true },
      // Front wheel
      { d: "M135,320 Q105,335 135,350 Q165,372 195,350 Q225,335 195,320 Z", fillable: true },
      // Rear wheel
      { d: "M465,320 Q435,335 465,350 Q495,372 525,350 Q555,335 525,320 Z", fillable: true },
      // Side vent
      { d: "M285,237 L285,252 L330,252 L330,237 Z", fillable: true }
    ]
  },
  {
    id: "firetruck",
    name: "Fire Truck",
    paths: [
      // Cabin main
      { d: "M0,290 L0,170 L180,170 L240,140 L270,140 L270,170 L180,170 L180,290 Z", fillable: true },
      // Cabin roof
      { d: "M180,170 L240,140 L270,140 L210,170 Z", fillable: true },
      // Windshield
      { d: "M195,155 L225,147 L255,155 L255,170 L195,170 Z", fillable: true },
      // Side window
      { d: "M15,192 L15,245 L165,245 L165,192 Z", fillable: true },
      // Front door
      { d: "M0,245 L0,290 L165,290 L165,245 Z", fillable: true },
      // Equipment bay 1
      { d: "M180,185 L180,290 L300,290 L300,185 Z", fillable: true },
      // Equipment bay 2
      { d: "M300,185 L300,290 L420,290 L420,185 Z", fillable: true },
      // Equipment bay 3
      { d: "M420,185 L420,290 L540,290 L540,185 Z", fillable: true },
      // Rear compartment
      { d: "M540,155 L540,290 L600,290 L600,155 Z", fillable: true },
      // Ladder mount 1
      { d: "M315,162 L315,177 L405,177 L405,162 Z", fillable: true },
      // Ladder mount 2
      { d: "M435,162 L435,177 L525,177 L525,162 Z", fillable: true },
      // Storage compartment 1
      { d: "M187,215 L187,275 L292,275 L292,215 Z", fillable: true },
      // Storage compartment 2
      { d: "M307,215 L307,275 L412,275 L412,215 Z", fillable: true },
      // Storage compartment 3
      { d: "M427,215 L427,275 L532,275 L532,215 Z", fillable: true },
      // Rear door
      { d: "M555,177 L555,267 L585,267 L585,177 Z", fillable: true },
      // Light bar
      { d: "M195,132 L195,147 L255,147 L255,132 Z", fillable: true },
      // Front wheel
      { d: "M60,320 Q30,335 60,350 Q90,372 120,350 Q150,335 120,320 Z", fillable: true },
      // Middle wheel
      { d: "M285,320 Q255,335 285,350 Q315,372 345,350 Q375,335 345,320 Z", fillable: true },
      // Rear wheel
      { d: "M555,320 Q525,335 555,350 Q585,372 615,350 Q645,335 615,320 Z", fillable: true },
      // Hose reel
      { d: "M547,200 Q540,207 547,215 Q555,222 562,215 Q570,207 562,200 Q555,192 547,200 Z", fillable: true }
    ]
  },
  {
    id: "bus",
    name: "School Bus",
    paths: [
      // Main body
      { d: "M30,290 L30,110 L600,110 L600,290 Z", fillable: true },
      // Front section
      { d: "M30,155 L30,230 L75,230 L75,155 Z", fillable: true },
      // Hood
      { d: "M30,230 L30,275 L75,275 L75,230 Z", fillable: true },
      // Driver window
      { d: "M90,140 L90,230 L180,230 L180,140 Z", fillable: true },
      // Window 1
      { d: "M202,140 L202,230 L292,230 L292,140 Z", fillable: true },
      // Window 2
      { d: "M315,140 L315,230 L405,230 L405,140 Z", fillable: true },
      // Window 3
      { d: "M427,140 L427,230 L517,230 L517,140 Z", fillable: true },
      // Rear window
      { d: "M540,155 L540,230 L585,230 L585,170 Z", fillable: true },
      // Door panel
      { d: "M75,230 L75,282 L180,282 L180,230 Z", fillable: true },
      // Side panel 1
      { d: "M202,237 L202,282 L292,282 L292,237 Z", fillable: true },
      // Side panel 2
      { d: "M315,237 L315,282 L405,282 L405,237 Z", fillable: true },
      // Side panel 3
      { d: "M427,237 L427,282 L517,282 L517,237 Z", fillable: true },
      // Rear panel
      { d: "M540,237 L540,282 L585,282 L585,237 Z", fillable: true },
      // Roof stripe
      { d: "M37,117 L37,132 L592,132 L592,117 Z", fillable: true },
      // Front bumper
      { d: "M15,260 L15,290 L30,305 L30,275 Z", fillable: true },
      // Stop sign
      { d: "M600,185 L615,192 L615,222 L600,230 L585,222 L585,192 Z", fillable: true },
      // Emergency door
      { d: "M540,155 L540,215 L577,215 L577,170 Z", fillable: true },
      // Front wheel
      { d: "M90,320 Q60,335 90,350 Q120,372 150,350 Q180,335 150,320 Z", fillable: true },
      // Rear wheel
      { d: "M525,320 Q495,335 525,350 Q555,372 585,350 Q615,335 585,320 Z", fillable: true }
    ]
  },
  {
    id: "police",
    name: "Police Car",
    paths: [
      // Front left fender
      { d: "M75,290 L30,260 L30,230 L75,215 L120,237 Z", fillable: true },
      // Hood
      { d: "M75,215 L30,230 L30,200 L150,200 L210,170 L270,200 L210,215 Z", fillable: true },
      // Windshield
      { d: "M210,170 L210,200 L270,200 L270,170 Z", fillable: true },
      // Roof
      { d: "M270,170 L270,200 L390,200 L390,170 Z", fillable: true },
      // Rear window
      { d: "M390,170 L390,200 L450,200 L450,170 Z", fillable: true },
      // Trunk
      { d: "M450,200 L390,215 L480,200 L525,215 L570,230 L570,260 L525,290 Z", fillable: true },
      // Front door lower
      { d: "M120,237 L75,215 L210,215 L270,237 L240,267 Z", fillable: true },
      // Front door upper
      { d: "M210,215 L210,200 L270,200 L270,237 Z", fillable: true },
      // Rear door lower
      { d: "M360,267 L330,237 L390,215 L525,215 L525,237 Z", fillable: true },
      // Rear door upper
      { d: "M330,237 L330,200 L390,200 L390,215 Z", fillable: true },
      // Light bar left
      { d: "M255,155 L255,174 L315,174 L315,155 Z", fillable: true },
      // Light bar right
      { d: "M345,155 L345,174 L405,174 L405,155 Z", fillable: true },
      // Light bar center
      { d: "M315,155 L315,174 L345,174 L345,155 Z", fillable: true },
      // Side panel front
      { d: "M120,237 L75,290 L240,290 L240,267 Z", fillable: true },
      // Side panel rear
      { d: "M360,267 L360,290 L525,290 L525,237 Z", fillable: true },
      // Front bumper
      { d: "M75,290 L30,305 L30,320 L90,320 L90,305 Z", fillable: true },
      // Rear bumper
      { d: "M510,305 L510,320 L570,320 L570,305 L525,290 Z", fillable: true },
      // Front wheel
      { d: "M120,320 Q90,335 120,350 Q150,365 180,350 Q210,335 180,320 Z", fillable: true },
      // Rear wheel
      { d: "M480,320 Q450,335 480,350 Q510,365 540,350 Q570,335 540,320 Z", fillable: true },
      // Badge
      { d: "M315,185 Q307,192 315,200 Q322,192 315,185 Z", fillable: true },
      // Door stripe
      { d: "M135,252 L135,260 L225,260 L225,252 Z", fillable: true }
    ]
  },
  {
    id: "taxi",
    name: "Taxi",
    paths: [
      // Main body lower
      { d: "M75,290 L30,260 L30,230 L150,200 L450,200 L570,230 L570,260 L525,290 Z", fillable: true },
      // Hood
      { d: "M150,200 L150,170 L210,170 L270,140 L270,170 L210,200 Z", fillable: true },
      // Windshield
      { d: "M210,170 L210,200 L270,200 L270,170 Z", fillable: true },
      // Roof
      { d: "M270,170 L270,200 L390,200 L390,170 Z", fillable: true },
      // Rear window
      { d: "M390,170 L390,200 L450,200 L450,170 Z", fillable: true },
      // Trunk
      { d: "M450,170 L450,200 L510,200 L510,230 L570,230 Z", fillable: true },
      // Taxi sign
      { d: "M255,110 L225,140 L435,140 L405,110 Z", fillable: true },
      // Taxi sign text background
      { d: "M247,117 L247,132 L412,132 L412,117 Z", fillable: true },
      // Front door lower
      { d: "M150,200 L120,230 L120,275 L210,275 L210,230 Z", fillable: true },
      // Front door upper
      { d: "M210,200 L210,230 L270,230 L270,200 Z", fillable: true },
      // Rear door lower
      { d: "M390,200 L390,230 L450,275 L480,275 L480,230 Z", fillable: true },
      // Rear door upper
      { d: "M390,200 L390,230 L450,230 L450,200 Z", fillable: true },
      // Checkerboard 1
      { d: "M135,245 L135,260 L165,260 L165,245 Z", fillable: true },
      // Checkerboard 2
      { d: "M180,245 L180,260 L210,260 L210,245 Z", fillable: true },
      // Checkerboard 3
      { d: "M225,245 L225,260 L255,260 L255,245 Z", fillable: true },
      // Side panel front
      { d: "M120,275 L75,290 L210,290 L210,275 Z", fillable: true },
      // Side panel rear
      { d: "M390,275 L390,290 L525,290 L480,275 Z", fillable: true },
      // Front wheel
      { d: "M120,320 Q90,335 120,350 Q150,365 180,350 Q210,335 180,320 Z", fillable: true },
      // Rear wheel
      { d: "M480,320 Q450,335 480,350 Q510,365 540,350 Q570,335 540,320 Z", fillable: true },
      // Door handle
      { d: "M210,252 L210,260 L240,260 L240,252 Z", fillable: true }
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
  const [isEraserMode, setIsEraserMode] = useState(false);

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
        const currentVehicleColors = coloredPaths[currentVehicle.id] || {};
        
        // Store current state in history
        setHistory({
          ...history,
          [currentVehicle.id]: [...(history[currentVehicle.id] || []), currentVehicleColors]
        });
        
        let newColors;
        if (isEraserMode) {
          // Eraser mode: remove the color from this path
          const updatedVehicleColors = { ...currentVehicleColors };
          delete updatedVehicleColors[i];
          newColors = {
            ...coloredPaths,
            [currentVehicle.id]: updatedVehicleColors
          };
        } else {
          // Color mode: apply the selected color
          newColors = {
            ...coloredPaths,
            [currentVehicle.id]: {
              ...currentVehicleColors,
              [i]: selectedColor
            }
          };
        }
        
        setColoredPaths(newColors);
        saveColors(newColors);
        break;
      }
    }
  }, [currentVehicle, coloredPaths, selectedColor, history, saveColors, isEraserMode]);

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
              <span className="text-sm font-medium">
                {isEraserMode ? 'Eraser mode active' : 'Choose a color:'}
              </span>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => {
                    setSelectedColor(color.value);
                    setIsEraserMode(false);
                  }}
                  className={`h-10 w-10 rounded-lg border-2 transition-all hover:scale-110 ${
                    selectedColor === color.value && !isEraserMode ? 'border-primary ring-2 ring-primary/50' : 'border-border'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              variant="outline"
              onClick={handleUndo}
              disabled={!history[currentVehicle.id]?.length}
            >
              <Undo className="h-4 w-4 mr-2" />
              Undo
            </Button>
            <Button 
              variant={isEraserMode ? "default" : "outline"}
              onClick={() => setIsEraserMode(!isEraserMode)}
            >
              <Eraser className="h-4 w-4 mr-2" />
              Eraser
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

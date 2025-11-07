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
      // Main body lower
      { d: "M150,320 L150,280 L200,280 L240,260 L360,260 L400,280 L450,280 L450,320 Z", fillable: true },
      // Hood
      { d: "M200,280 L200,260 L240,260 L280,240 L280,260 L240,260 Z", fillable: true },
      // Windshield
      { d: "M280,240 L280,260 L320,260 L320,240 Z", fillable: true },
      // Roof
      { d: "M320,240 L320,260 L360,260 L360,240 Z", fillable: true },
      // Rear window
      { d: "M360,240 L360,260 L400,260 L400,240 Z", fillable: true },
      // Trunk
      { d: "M400,260 L400,280 L450,280 L450,260 Z", fillable: true },
      // Front fender
      { d: "M150,280 L120,300 L120,320 L150,320 Z", fillable: true },
      // Rear fender
      { d: "M450,280 L450,320 L480,320 L480,300 Z", fillable: true },
      // Front door upper
      { d: "M240,260 L240,280 L280,280 L280,260 Z", fillable: true },
      // Front door lower
      { d: "M230,280 L230,310 L280,310 L280,280 Z", fillable: true },
      // Rear door upper
      { d: "M320,260 L320,280 L360,280 L360,260 Z", fillable: true },
      // Rear door lower
      { d: "M320,280 L320,310 L370,310 L370,280 Z", fillable: true },
      // Side panel front
      { d: "M150,310 L150,320 L230,320 L230,310 Z", fillable: true },
      // Side panel rear
      { d: "M370,310 L370,320 L450,320 L450,310 Z", fillable: true },
      // Front bumper
      { d: "M150,320 L120,330 L120,340 L160,340 L160,330 Z", fillable: true },
      // Rear bumper
      { d: "M440,330 L440,340 L480,340 L480,330 L450,320 Z", fillable: true },
      // Front wheel
      { d: "M180,340 Q160,350 180,360 Q200,370 220,360 Q240,350 220,340 Z", fillable: true },
      // Rear wheel
      { d: "M420,340 Q400,350 420,360 Q440,370 460,360 Q480,350 460,340 Z", fillable: true },
      // Front window
      { d: "M245,265 L245,280 L275,280 L275,265 Z", fillable: true },
      // Rear window
      { d: "M325,265 L325,280 L355,280 L355,265 Z", fillable: true },
      // Mirror left
      { d: "M150,285 L140,290 L145,295 Z", fillable: true },
      // Mirror right
      { d: "M450,285 L460,290 L455,295 Z", fillable: true }
    ]
  },
  {
    id: "truck",
    name: "Pickup Truck",
    paths: [
      // Cabin main body
      { d: "M150,320 L150,260 L240,260 L280,240 L320,240 L320,260 L320,320 Z", fillable: true },
      // Cabin roof
      { d: "M240,260 L240,240 L280,240 L320,260 Z", fillable: true },
      // Windshield
      { d: "M250,245 L250,260 L310,260 L310,245 Z", fillable: true },
      // Hood
      { d: "M150,280 L120,300 L120,320 L150,320 Z", fillable: true },
      // Side window
      { d: "M160,270 L160,300 L230,300 L230,270 Z", fillable: true },
      // Front door
      { d: "M150,300 L150,320 L230,320 L230,300 Z", fillable: true },
      // Rear cabin wall
      { d: "M320,260 L320,320 L340,320 L340,260 Z", fillable: true },
      // Bed floor
      { d: "M340,300 L340,320 L480,320 L480,300 Z", fillable: true },
      // Bed left side
      { d: "M340,260 L340,300 L360,300 L360,260 Z", fillable: true },
      // Bed center
      { d: "M360,260 L360,300 L420,300 L420,260 Z", fillable: true },
      // Bed right side
      { d: "M420,260 L420,300 L480,300 L480,260 Z", fillable: true },
      // Tailgate
      { d: "M480,270 L480,310 L490,310 L490,270 Z", fillable: true },
      // Front bumper
      { d: "M120,310 L110,320 L120,330 L150,330 L150,320 Z", fillable: true },
      // Side step
      { d: "M150,330 L150,335 L320,335 L320,330 Z", fillable: true },
      // Rear bumper
      { d: "M480,310 L490,315 L490,325 L480,320 Z", fillable: true },
      // Front wheel
      { d: "M180,340 Q160,350 180,360 Q200,370 220,360 Q240,350 220,340 Z", fillable: true },
      // Rear wheel
      { d: "M440,340 Q420,350 440,360 Q460,370 480,360 Q500,350 480,340 Z", fillable: true }
    ]
  },
  {
    id: "van",
    name: "Delivery Van",
    paths: [
      // Front cabin lower
      { d: "M120,320 L120,280 L200,280 L200,320 Z", fillable: true },
      // Front cabin upper
      { d: "M120,280 L120,240 L200,240 L220,220 L220,240 L200,240 L200,280 Z", fillable: true },
      // Windshield
      { d: "M130,250 L130,270 L190,270 L190,250 Z", fillable: true },
      // Front door
      { d: "M200,280 L200,320 L260,320 L260,280 Z", fillable: true },
      // Cargo area lower main
      { d: "M260,280 L260,320 L460,320 L460,280 Z", fillable: true },
      // Cargo area upper left
      { d: "M220,220 L220,280 L340,280 L340,220 Z", fillable: true },
      // Cargo area upper right
      { d: "M340,220 L340,280 L460,280 L460,220 Z", fillable: true },
      // Rear door left
      { d: "M460,240 L460,320 L480,320 L480,240 Z", fillable: true },
      // Roof
      { d: "M220,200 L220,220 L460,220 L460,200 Z", fillable: true },
      // Cargo window left
      { d: "M235,230 L235,270 L325,270 L325,230 Z", fillable: true },
      // Cargo window right
      { d: "M355,230 L355,270 L445,270 L445,230 Z", fillable: true },
      // Side panel lower
      { d: "M120,315 L120,320 L480,320 L480,315 Z", fillable: true },
      // Front bumper
      { d: "M110,295 L110,310 L120,320 L120,290 Z", fillable: true },
      // Rear bumper
      { d: "M480,295 L490,300 L490,315 L480,320 Z", fillable: true },
      // Company stripe
      { d: "M210,300 L210,310 L470,310 L470,300 Z", fillable: true },
      // Front wheel
      { d: "M160,340 Q140,350 160,360 Q180,370 200,360 Q220,350 200,340 Z", fillable: true },
      // Rear wheel
      { d: "M440,340 Q420,350 440,360 Q460,370 480,360 Q500,350 480,340 Z", fillable: true }
    ]
  },
  {
    id: "sports",
    name: "Sports Car",
    paths: [
      // Front left fender
      { d: "M180,340 L140,310 L140,290 L170,280 L200,290 Z", fillable: true },
      // Hood left
      { d: "M170,280 L140,290 L140,270 L180,260 L220,250 L240,260 Z", fillable: true },
      // Windshield
      { d: "M220,250 L240,220 L280,220 L290,250 Z", fillable: true },
      // Roof
      { d: "M280,220 L280,250 L340,250 L340,220 Z", fillable: true },
      // Rear window
      { d: "M340,220 L340,250 L360,250 L380,220 Z", fillable: true },
      // Hood right
      { d: "M360,260 L380,250 L420,260 L460,270 L460,290 L430,280 Z", fillable: true },
      // Rear right fender
      { d: "M430,280 L460,290 L460,310 L420,340 L400,290 Z", fillable: true },
      // Front door lower
      { d: "M200,290 L170,280 L180,260 L240,260 L270,280 L250,310 Z", fillable: true },
      // Front door upper
      { d: "M240,260 L240,250 L290,250 L290,270 L270,280 Z", fillable: true },
      // Rear door lower
      { d: "M350,310 L330,280 L360,260 L420,260 L430,280 L400,290 Z", fillable: true },
      // Rear door upper
      { d: "M330,280 L330,270 L340,250 L360,250 L360,260 Z", fillable: true },
      // Side skirt front
      { d: "M200,290 L180,340 L250,340 L250,310 Z", fillable: true },
      // Side skirt rear
      { d: "M350,310 L350,340 L420,340 L400,290 Z", fillable: true },
      // Spoiler
      { d: "M460,280 L470,275 L475,285 L465,295 Z", fillable: true },
      // Front wheel
      { d: "M190,340 Q170,350 190,360 Q210,375 230,360 Q250,350 230,340 Z", fillable: true },
      // Rear wheel
      { d: "M410,340 Q390,350 410,360 Q430,375 450,360 Q470,350 450,340 Z", fillable: true },
      // Side vent
      { d: "M290,285 L290,295 L320,295 L320,285 Z", fillable: true }
    ]
  },
  {
    id: "firetruck",
    name: "Fire Truck",
    paths: [
      // Cabin main
      { d: "M100,320 L100,240 L220,240 L260,220 L280,220 L280,240 L220,240 L220,320 Z", fillable: true },
      // Cabin roof
      { d: "M220,240 L260,220 L280,220 L240,240 Z", fillable: true },
      // Windshield
      { d: "M230,230 L250,225 L270,230 L270,240 L230,240 Z", fillable: true },
      // Side window
      { d: "M110,255 L110,290 L210,290 L210,255 Z", fillable: true },
      // Front door
      { d: "M100,290 L100,320 L210,320 L210,290 Z", fillable: true },
      // Equipment bay 1
      { d: "M220,250 L220,320 L300,320 L300,250 Z", fillable: true },
      // Equipment bay 2
      { d: "M300,250 L300,320 L380,320 L380,250 Z", fillable: true },
      // Equipment bay 3
      { d: "M380,250 L380,320 L460,320 L460,250 Z", fillable: true },
      // Rear compartment
      { d: "M460,230 L460,320 L520,320 L520,230 Z", fillable: true },
      // Ladder mount 1
      { d: "M310,235 L310,245 L370,245 L370,235 Z", fillable: true },
      // Ladder mount 2
      { d: "M390,235 L390,245 L450,245 L450,235 Z", fillable: true },
      // Storage compartment 1
      { d: "M225,270 L225,310 L295,310 L295,270 Z", fillable: true },
      // Storage compartment 2
      { d: "M305,270 L305,310 L375,310 L375,270 Z", fillable: true },
      // Storage compartment 3
      { d: "M385,270 L385,310 L455,310 L455,270 Z", fillable: true },
      // Rear door
      { d: "M470,245 L470,305 L510,305 L510,245 Z", fillable: true },
      // Light bar
      { d: "M230,215 L230,225 L270,225 L270,215 Z", fillable: true },
      // Front wheel
      { d: "M140,340 Q120,350 140,360 Q160,375 180,360 Q200,350 180,340 Z", fillable: true },
      // Middle wheel
      { d: "M290,340 Q270,350 290,360 Q310,375 330,360 Q350,350 330,340 Z", fillable: true },
      // Rear wheel
      { d: "M470,340 Q450,350 470,360 Q490,375 510,360 Q530,350 510,340 Z", fillable: true },
      // Hose reel
      { d: "M465,260 Q460,265 465,270 Q470,275 475,270 Q480,265 475,260 Q470,255 465,260 Z", fillable: true }
    ]
  },
  {
    id: "bus",
    name: "School Bus",
    paths: [
      // Main body
      { d: "M120,320 L120,200 L500,200 L500,320 Z", fillable: true },
      // Front section
      { d: "M120,230 L120,280 L150,280 L150,230 Z", fillable: true },
      // Hood
      { d: "M120,280 L120,310 L150,310 L150,280 Z", fillable: true },
      // Driver window
      { d: "M160,220 L160,280 L220,280 L220,220 Z", fillable: true },
      // Window 1
      { d: "M235,220 L235,280 L295,280 L295,220 Z", fillable: true },
      // Window 2
      { d: "M310,220 L310,280 L370,280 L370,220 Z", fillable: true },
      // Window 3
      { d: "M385,220 L385,280 L445,280 L445,220 Z", fillable: true },
      // Rear window
      { d: "M460,230 L460,280 L490,280 L490,240 Z", fillable: true },
      // Door panel
      { d: "M150,280 L150,315 L220,315 L220,280 Z", fillable: true },
      // Side panel 1
      { d: "M235,285 L235,315 L295,315 L295,285 Z", fillable: true },
      // Side panel 2
      { d: "M310,285 L310,315 L370,315 L370,285 Z", fillable: true },
      // Side panel 3
      { d: "M385,285 L385,315 L445,315 L445,285 Z", fillable: true },
      // Rear panel
      { d: "M460,285 L460,315 L490,315 L490,285 Z", fillable: true },
      // Roof stripe
      { d: "M125,205 L125,215 L495,215 L495,205 Z", fillable: true },
      // Front bumper
      { d: "M110,300 L110,320 L120,330 L120,310 Z", fillable: true },
      // Stop sign
      { d: "M500,250 L510,255 L510,275 L500,280 L490,275 L490,255 Z", fillable: true },
      // Emergency door
      { d: "M460,230 L460,270 L485,270 L485,240 Z", fillable: true },
      // Front wheel
      { d: "M160,340 Q140,350 160,360 Q180,375 200,360 Q220,350 200,340 Z", fillable: true },
      // Rear wheel
      { d: "M450,340 Q430,350 450,360 Q470,375 490,360 Q510,350 490,340 Z", fillable: true }
    ]
  },
  {
    id: "police",
    name: "Police Car",
    paths: [
      // Front left fender
      { d: "M150,320 L120,300 L120,280 L150,270 L180,285 Z", fillable: true },
      // Hood
      { d: "M150,270 L120,280 L120,260 L200,260 L240,240 L280,260 L240,270 Z", fillable: true },
      // Windshield
      { d: "M240,240 L240,260 L280,260 L280,240 Z", fillable: true },
      // Roof
      { d: "M280,240 L280,260 L360,260 L360,240 Z", fillable: true },
      // Rear window
      { d: "M360,240 L360,260 L400,260 L400,240 Z", fillable: true },
      // Trunk
      { d: "M400,260 L360,270 L420,260 L450,270 L480,280 L480,300 L450,320 Z", fillable: true },
      // Front door lower
      { d: "M180,285 L150,270 L240,270 L280,285 L260,305 Z", fillable: true },
      // Front door upper
      { d: "M240,270 L240,260 L280,260 L280,285 Z", fillable: true },
      // Rear door lower
      { d: "M340,305 L320,285 L360,270 L450,270 L450,285 Z", fillable: true },
      // Rear door upper
      { d: "M320,285 L320,260 L360,260 L360,270 Z", fillable: true },
      // Light bar left
      { d: "M270,230 L270,243 L310,243 L310,230 Z", fillable: true },
      // Light bar right
      { d: "M330,230 L330,243 L370,243 L370,230 Z", fillable: true },
      // Light bar center
      { d: "M310,230 L310,243 L330,243 L330,230 Z", fillable: true },
      // Side panel front
      { d: "M180,285 L150,320 L260,320 L260,305 Z", fillable: true },
      // Side panel rear
      { d: "M340,305 L340,320 L450,320 L450,285 Z", fillable: true },
      // Front bumper
      { d: "M150,320 L120,330 L120,340 L160,340 L160,330 Z", fillable: true },
      // Rear bumper
      { d: "M440,330 L440,340 L480,340 L480,330 L450,320 Z", fillable: true },
      // Front wheel
      { d: "M180,340 Q160,350 180,360 Q200,370 220,360 Q240,350 220,340 Z", fillable: true },
      // Rear wheel
      { d: "M420,340 Q400,350 420,360 Q440,370 460,360 Q480,350 460,340 Z", fillable: true },
      // Badge
      { d: "M310,250 Q305,255 310,260 Q315,255 310,250 Z", fillable: true },
      // Door stripe
      { d: "M190,295 L190,300 L250,300 L250,295 Z", fillable: true }
    ]
  },
  {
    id: "taxi",
    name: "Taxi",
    paths: [
      // Main body lower
      { d: "M150,320 L120,300 L120,280 L200,260 L400,260 L480,280 L480,300 L450,320 Z", fillable: true },
      // Hood
      { d: "M200,260 L200,240 L240,240 L280,220 L280,240 L240,260 Z", fillable: true },
      // Windshield
      { d: "M240,240 L240,260 L280,260 L280,240 Z", fillable: true },
      // Roof
      { d: "M280,240 L280,260 L360,260 L360,240 Z", fillable: true },
      // Rear window
      { d: "M360,240 L360,260 L400,260 L400,240 Z", fillable: true },
      // Trunk
      { d: "M400,240 L400,260 L440,260 L440,280 L480,280 Z", fillable: true },
      // Taxi sign
      { d: "M270,200 L250,220 L390,220 L370,200 Z", fillable: true },
      // Taxi sign text background
      { d: "M265,205 L265,215 L375,215 L375,205 Z", fillable: true },
      // Front door lower
      { d: "M200,260 L180,280 L180,310 L240,310 L240,280 Z", fillable: true },
      // Front door upper
      { d: "M240,260 L240,280 L280,280 L280,260 Z", fillable: true },
      // Rear door lower
      { d: "M360,260 L360,280 L400,310 L420,310 L420,280 Z", fillable: true },
      // Rear door upper
      { d: "M360,260 L360,280 L400,280 L400,260 Z", fillable: true },
      // Checkerboard 1
      { d: "M190,290 L190,300 L210,300 L210,290 Z", fillable: true },
      // Checkerboard 2
      { d: "M220,290 L220,300 L240,300 L240,290 Z", fillable: true },
      // Checkerboard 3
      { d: "M250,290 L250,300 L270,300 L270,290 Z", fillable: true },
      // Side panel front
      { d: "M180,310 L150,320 L240,320 L240,310 Z", fillable: true },
      // Side panel rear
      { d: "M360,310 L360,320 L450,320 L420,310 Z", fillable: true },
      // Front wheel
      { d: "M180,340 Q160,350 180,360 Q200,370 220,360 Q240,350 220,340 Z", fillable: true },
      // Rear wheel
      { d: "M420,340 Q400,350 420,360 Q440,370 460,360 Q480,350 460,340 Z", fillable: true },
      // Door handle
      { d: "M240,295 L240,300 L260,300 L260,295 Z", fillable: true }
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

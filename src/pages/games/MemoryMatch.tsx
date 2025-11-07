import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, RotateCcw, ArrowLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/no_background.png";

type CardType = {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const emojis = ["🎬", "📱", "🎨", "💡", "🚀", "⭐", "🎯", "💻"];

const MemoryMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive && !isGameWon) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive, isGameWon]);

  const initializeGame = () => {
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setIsGameActive(false);
    setIsGameWon(false);
  };

  const handleCardClick = (id: number) => {
    if (!isGameActive) setIsGameActive(true);
    
    if (isChecking || flippedCards.length >= 2) return;
    
    const card = cards.find((c) => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;

    const newCards = cards.map((c) =>
      c.id === id ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setMoves((prev) => prev + 1);
      checkMatch(newFlippedCards, newCards);
    }
  };

  const checkMatch = (flippedIds: number[], currentCards: CardType[]) => {
    setTimeout(() => {
      const [firstId, secondId] = flippedIds;
      const firstCard = currentCards.find((c) => c.id === firstId);
      const secondCard = currentCards.find((c) => c.id === secondId);

      if (firstCard?.emoji === secondCard?.emoji) {
        // Match found
        const updatedCards = currentCards.map((c) =>
          c.id === firstId || c.id === secondId
            ? { ...c, isMatched: true }
            : c
        );
        setCards(updatedCards);
        setMatches((prev) => {
          const newMatches = prev + 1;
          if (newMatches === emojis.length) {
            setIsGameWon(true);
            setIsGameActive(false);
            toast({
              title: "🎉 Congratulations!",
              description: `You won in ${moves + 1} moves and ${formatTime(timer)} seconds!`,
            });
          }
          return newMatches;
        });
      } else {
        // No match
        const updatedCards = currentCards.map((c) =>
          c.id === firstId || c.id === secondId
            ? { ...c, isFlipped: false }
            : c
        );
        setCards(updatedCards);
      }

      setFlippedCards([]);
      setIsChecking(false);
    }, 800);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <img src={logo} alt="Climbley Logo" className="h-14 w-auto drop-shadow-md hover:drop-shadow-lg transition-all duration-200" />
          </div>
          <Button variant="outline" onClick={() => navigate("/games")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
      </nav>

      {/* Game Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Game Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Memory Match
          </h1>
          <p className="text-muted-foreground">
            Find all matching pairs of cards!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Moves</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moves}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(timer)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matches}/{emojis.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`aspect-square cursor-pointer transition-all duration-300 hover:shadow-lg ${
                card.isMatched ? 'opacity-50' : ''
              }`}
              onClick={() => handleCardClick(card.id)}
            >
              <CardContent className="h-full flex items-center justify-center p-4">
                {card.isFlipped || card.isMatched ? (
                  <span className="text-5xl">{card.emoji}</span>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">?</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="outline"
            onClick={initializeGame}
            className="gap-2"
          >
            <RotateCcw className="h-5 w-5" />
            New Game
          </Button>
          {isGameWon && (
            <Button
              size="lg"
              onClick={() => navigate("/games")}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Trophy className="h-5 w-5" />
              Back to Games
            </Button>
          )}
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Click on cards to flip them over</p>
            <p>• Match pairs of identical emojis</p>
            <p>• Find all pairs in the fewest moves possible</p>
            <p>• Try to beat your best time!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemoryMatch;

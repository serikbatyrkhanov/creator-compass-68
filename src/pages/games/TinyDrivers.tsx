import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Car, Palette, CircleDot, ArrowLeft } from "lucide-react";
import logo from "@/assets/climbley-logo-updated.png";

const TinyDrivers = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setAvatarUrl(profile.avatar_url || "");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const activities = [
    {
      id: 'color-camry',
      title: 'Color the Camry',
      description: 'Paint a Toyota Camry with your favorite colors',
      icon: Palette,
      color: 'from-orange-400 to-red-500',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-600',
      route: '/games/tiny-drivers/color-camry',
    },
    {
      id: 'match-wheels',
      title: 'Match the Wheels',
      description: 'Drag and drop wheels to the right places',
      icon: CircleDot,
      color: 'from-blue-400 to-cyan-500',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-600',
      route: '/games/tiny-drivers/match-wheels',
    },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <img 
            src={logo} 
            alt="Climbley" 
            className="h-8 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          />
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate("/profile")}>
              <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
              <AvatarFallback>{firstName?.[0]}{lastName?.[0]}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              {t("Sign Out")}
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Car className="w-12 h-12 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Tiny Drivers
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Educational driving adventures with colors and shapes
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/games")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Games
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((activity) => (
              <Card 
                key={activity.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
                onClick={() => navigate(activity.route)}
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl ${activity.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <activity.icon className={`w-8 h-8 ${activity.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl">{activity.title}</CardTitle>
                  <CardDescription className="text-base">
                    {activity.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className={`w-full bg-gradient-to-r ${activity.color} hover:opacity-90 transition-opacity`}
                  >
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TinyDrivers;

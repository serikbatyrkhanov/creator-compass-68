import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Target, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/climbley-logo.png";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import slider1 from "@/assets/slider/1.jpg";
import slider2 from "@/assets/slider/2.jpg";
import slider4 from "@/assets/slider/4.jpg";
import slider5 from "@/assets/slider/5.jpg";
import slider8 from "@/assets/slider/8.jpg";
import slider10 from "@/assets/slider/10.jpg";
import slider11 from "@/assets/slider/11.jpg";
import slider13 from "@/assets/slider/13.jpg";
import slider14 from "@/assets/slider/14.jpg";
import slider15 from "@/assets/slider/15.jpg";

const sliderImages = [
  { src: slider1, alt: "Food content creator with ring light" },
  { src: slider2, alt: "Podcast creator with microphone" },
  { src: slider4, alt: "Beauty content creator" },
  { src: slider5, alt: "Fitness lifestyle creator" },
  { src: slider8, alt: "Tech tutorial creator" },
  { src: slider10, alt: "Outdoor videography creator" },
  { src: slider11, alt: "Educational content creator" },
  { src: slider13, alt: "Fashion content creator" },
  { src: slider14, alt: "Gaming streaming creator" },
  { src: slider15, alt: "Lifestyle vlog couple" },
];

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Climbley" className="h-8 w-auto" />
        </div>
        <Link to="/auth">
          <Button variant="outline" className="rounded-full">
            Get Started
          </Button>
        </Link>
      </nav>

      {/* Hero Section with Image Slider */}
      <section className="relative h-[72vh] overflow-hidden">
        {/* Image Slider */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <img
                src={sliderImages[currentSlide].src}
                alt={sliderImages[currentSlide].alt}
                className="w-full h-full object-cover"
              />
              {/* Dark gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-4"
            >
              Your Content Journey Starts Here
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl lg:text-6xl font-bold tracking-tight text-white"
            >
              You've Always Wanted to Create Content...
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl lg:text-3xl font-semibold text-white/90"
            >
              ...but didn't have a plan
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-lg lg:text-xl text-white/80 max-w-2xl mx-auto"
            >
              Climbley helps you identify your niche, create content plans, stay consistent, and track your progress
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl lg:text-2xl font-medium bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent"
            >
              Your personal Coach, Trainer, and Producer — all in one
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="rounded-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity text-white shadow-lg shadow-purple-500/50"
                >
                  Start Free • 7-Day Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              >
                Watch 60-sec Demo
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all animate-slide-up">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Find Your Niche</h3>
            <p className="text-muted-foreground">
              Discover your perfect content niche with our smart questionnaire that analyzes your skills, passions, and market demand.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all animate-slide-up [animation-delay:0.1s]">
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
              <Calendar className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Plan Content</h3>
            <p className="text-muted-foreground">
              Stay consistent with AI-powered content ideas, scheduling tools, and reminders to keep your audience engaged.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all animate-slide-up [animation-delay:0.2s]">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Track Growth</h3>
            <p className="text-muted-foreground">
              Monitor your progress with beautiful charts, celebrate milestones, and get insights to optimize your strategy.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground">
            Start with a 7-day free trial, then just $9.99/month
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-primary shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 p-3">
                <img src={logo} alt="Climbley" className="h-full w-full object-contain" />
              </div>
              <CardTitle className="text-2xl mb-2">Climbley Premium</CardTitle>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">7-day free trial • Seamless checkout</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Personalized niche discovery</span>
                </li>
                <li className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>AI-powered content planning</span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Advanced growth analytics</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of creators building their audience and monetizing their passion.
          </p>
          <Link to="/auth">
            <Button 
              size="lg" 
              className="rounded-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border mt-20">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <img src={logo} alt="Climbley" className="h-6 w-auto" />
          <span>Climbley © 2025</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;

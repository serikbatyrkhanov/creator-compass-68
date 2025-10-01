import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles, Target, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Climbley
          </span>
        </div>
        <Link to="/auth">
          <Button variant="outline" className="rounded-full">
            Get Started
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
            Your Content Journey Starts Here
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
            Your Next Step{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              To The Top
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your personal Coach | Trainer | Producer to help finding your niche to tracking your growth. The all-in-one platform that guides aspiring creators to success.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="rounded-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              >
                Start Your Journey
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full"
            >
              Learn More
            </Button>
          </div>
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
            Start with a 7-day free trial, then $19.99/month
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-primary shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl mb-2">Premium</CardTitle>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold">$19.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">7-day free trial included</p>
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
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Climbley © 2025</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

import { Button } from "@/components/ui/button";
import { ArrowRight, Target, TrendingUp, Calendar, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/climbley-logo-updated.png";
import { LanguageSelector } from "@/components/LanguageSelector";
import slider1 from "@/assets/slider/1.jpg";
import slider2 from "@/assets/slider/2.jpg";
import slider4 from "@/assets/slider/4.jpg";
import slider5 from "@/assets/slider/5.jpg";
import slider8 from "@/assets/slider/8.jpg";
import slider10 from "@/assets/slider/10.jpg";
import slider11 from "@/assets/slider/11.jpg";
import slider13 from "@/assets/slider/13.jpg";

const LearnMore = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-50 border-b border-border/50">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Climbley" className="h-20 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Link to="/auth">
            <Button variant="outline" className="rounded-full">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Climbley — Your Personal AI Producer
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground">
            Stop overthinking. Start building. Finally achieve the consistency that successful creators have.
          </p>
        </div>
      </section>

      {/* Image 1 - Food Content Creator */}
      <section className="w-full">
        <div className="max-w-6xl mx-auto px-4">
          <img 
            src={slider1} 
            alt="Food content creator with ring light" 
            className="w-full h-[400px] object-contain rounded-2xl shadow-2xl bg-muted/20"
          />
        </div>
      </section>

      {/* Problem Section 1 */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold">
            Does This Sound Familiar?
          </h2>
          <div className="prose prose-lg lg:prose-xl max-w-none">
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              You've got ideas. Real ones. You know you should be creating content, building an audience, maybe even growing your business through it. But here's what actually happens: you record one video, feel good about it, then... nothing for three weeks.
            </p>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              You sit down to create and immediately hit a wall: "What should I even post about?" An hour later, you're still staring at a blank screen. Meanwhile, you're watching creators with half your expertise grow their audiences simply because they show up consistently.
            </p>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              The frustration is real. And it's not your fault.
            </p>
          </div>
        </div>
      </section>

      {/* Image 2 - Podcast Creator */}
      <section className="w-full bg-muted/30 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <img 
            src={slider2} 
            alt="Podcast creator with microphone" 
            className="w-full h-[400px] object-contain rounded-2xl shadow-2xl bg-muted/20"
          />
        </div>
      </section>

      {/* Real Problem Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold">
            Here's the Real Problem
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            Most people think the hard part of content creation is coming up with ideas or being creative. It's not. The real challenge is organization, planning, and maintaining consistency long enough to see results.
          </p>
          <p className="text-2xl lg:text-3xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            That's exactly what Climbley solves.
          </p>
        </div>
      </section>

      {/* Image 3 - Beauty Content Creator */}
      <section className="w-full">
        <div className="max-w-6xl mx-auto px-4">
            <img
              src={slider4}
              alt="Beauty content creator"
              className="w-full h-[400px] object-contain rounded-2xl shadow-2xl bg-muted/20"
            />
        </div>
      </section>

      {/* Solution Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold">
            Meet Your Personal Producer
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            Think of Climbley as the producer you'd hire if you had a team — except it's AI-powered, always available, and fits in your pocket. It builds your content strategy, tracks your progress, and keeps you accountable when motivation fades.
          </p>
        </div>
      </section>

      {/* Image 4 - Fitness Lifestyle Creator */}
      <section className="w-full">
        <div className="max-w-6xl mx-auto px-4">
            <img
              src={slider5}
              alt="Fitness lifestyle creator"
              className="w-full h-[400px] object-contain rounded-2xl shadow-2xl bg-muted/20"
            />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-center">
            Here's How It Works
          </h2>
          
          <div className="grid gap-8">
            <div className="flex gap-6 p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-7 w-7 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">🎯 Discover Your Niche</h3>
                <p className="text-lg text-muted-foreground">
                  A guided quiz helps you identify where your content fits and who it's really for. No more guessing.
                </p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-secondary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">🧠 Your Weekly Content Plan</h3>
                <p className="text-lg text-muted-foreground">
                  Climbley generates a complete content calendar with video prompts, hooks, and post ideas tailored to your platforms. You wake up knowing exactly what to create.
                </p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-accent" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">📈 Visual Progress Tracking</h3>
                <p className="text-lg text-muted-foreground">
                  Watch your growth, engagement, and consistency improve with a clean dashboard that shows you what's working.
                </p>
              </div>
            </div>

            <div className="flex gap-6 p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="h-7 w-7 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">🔔 Smart Accountability</h3>
                <p className="text-lg text-muted-foreground">
                  Gentle reminders nudge you when it's time to shoot or post — so you never lose momentum.
                </p>
              </div>
            </div>
          </div>

          <p className="text-lg lg:text-xl text-center text-muted-foreground pt-8">
            No more Sunday night panic about Monday's content. No more weeks of silence. Just a clear system that keeps you moving forward.
          </p>
        </div>
      </section>

      {/* Image 5 - Tech Tutorial Creator */}
      <section className="w-full bg-muted/30 py-16">
        <div className="max-w-6xl mx-auto px-4">
            <img
              src={slider8}
              alt="Tech tutorial creator"
              className="w-full h-[400px] object-contain rounded-2xl shadow-2xl bg-muted/20"
            />
        </div>
      </section>

      {/* Why Now Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold">
            Why This Matters Now
          </h2>
          <div className="prose prose-lg lg:prose-xl max-w-none">
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Your content is your currency in today's world. Whether you're a plumber, a fitness coach, a financial advisor, or running a cleaning company — people want to see what you do before they trust you. They want to learn from you, understand your approach, and feel confident you're the right choice.
            </p>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              That's how clients find you. That's how opportunities appear. That's how your income grows.
            </p>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Being excellent at your craft isn't enough anymore. You need to show it. Share it. Build an audience around it.
            </p>
          </div>
        </div>
      </section>

      {/* Image 6 - Outdoor Videography Creator */}
      <section className="w-full">
        <div className="max-w-6xl mx-auto px-4">
            <img
              src={slider10}
              alt="Outdoor videography creator"
              className="w-full h-[400px] object-contain rounded-2xl shadow-2xl bg-muted/20"
            />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-center">
            Common Questions
          </h2>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                Do I need experience creating content?
              </h3>
              <p className="text-lg text-muted-foreground">
                Not at all. Climbley adapts to your level — whether you're posting your first video or your hundredth.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                What platforms does it support?
              </h3>
              <p className="text-lg text-muted-foreground">
                Currently YouTube, Instagram, and TikTok, with more platforms coming soon.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                How much does it cost?
              </h3>
              <p className="text-lg text-muted-foreground">
                $9.99/month — less than a couple of coffees. Cancel anytime, no strings attached.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image 7 - Educational Content Creator */}
      <section className="w-full">
        <div className="max-w-6xl mx-auto px-4">
            <img
              src={slider11}
              alt="Educational content creator"
              className="w-full h-[400px] object-contain rounded-2xl shadow-2xl bg-muted/20"
            />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl lg:text-5xl font-bold text-center">
            Stop Overthinking. Start Building.
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground text-center leading-relaxed">
            Climbley helps you find your voice, maintain consistency, and actually grow your audience — without burning out trying.
          </p>
          <p className="text-xl lg:text-2xl font-semibold text-center">
            The creators winning right now aren't necessarily more talented. They're just more consistent. And now you can be too.
          </p>
        </div>
      </section>

      {/* Image 8 - Fashion Content Creator */}
      <section className="w-full bg-muted/30 py-16">
        <div className="max-w-6xl mx-auto px-4">
            <img
              src={slider13}
              alt="Fashion content creator"
              className="w-full h-[400px] object-contain rounded-2xl shadow-2xl bg-muted/20"
            />
        </div>
      </section>

      {/* Final CTA Button Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-2 border-primary/20 shadow-2xl">
          <h3 className="text-2xl lg:text-3xl font-bold mb-6">
            👉 Start your free trial today and take your next step to the top.
          </h3>
          <Link to="/auth">
            <Button size="lg" className="rounded-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity text-white shadow-lg shadow-purple-500/50 text-lg px-8 py-6 h-auto">
              Start Your 7-Day Free Trial
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required. Cancel anytime.
          </p>
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

export default LearnMore;

import { Button } from "@/components/ui/button";
import { ArrowRight, Target, TrendingUp, Calendar, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/no_background.png";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import slider1 from "@/assets/slider/1.jpg";
import slider2 from "@/assets/slider/2.jpg";
import slider4 from "@/assets/slider/4.jpg";
import slider5 from "@/assets/slider/5.jpg";
import slider8 from "@/assets/slider/8.jpg";
import slider10 from "@/assets/slider/10.jpg";
import slider11 from "@/assets/slider/11.jpg";
import slider13 from "@/assets/slider/13.jpg";

const LearnMore = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center sticky top-0 bg-background/80 backdrop-blur-md z-50 border-b border-border/50">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Climbley" className="h-20 w-auto drop-shadow-md hover:drop-shadow-lg transition-all duration-200" />
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Link to="/auth">
            <Button variant="outline" className="rounded-full">
              {t('learnMore.nav.startTrial')}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {t('learnMore.hero.title')}
          </h1>
          <p className="text-xl lg:text-2xl text-muted-foreground">
            {t('learnMore.hero.subtitle')}
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
            {t('learnMore.problem1.title')}
          </h2>
          <div className="prose prose-lg lg:prose-xl max-w-none">
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              {t('learnMore.problem1.text1')}
            </p>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              {t('learnMore.problem1.text2')}
            </p>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              {t('learnMore.problem1.text3')}
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
            {t('learnMore.problem2.title')}
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            {t('learnMore.problem2.text')}
          </p>
          <p className="text-2xl lg:text-3xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t('learnMore.problem2.tagline')}
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
            {t('learnMore.solution.title')}
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            {t('learnMore.solution.text')}
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
            {t('learnMore.howItWorks.title')}
          </h2>
          
          <div className="grid gap-8">
            <div className="flex gap-6 p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all">
              <div className="flex-shrink-0">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-7 w-7 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{t('learnMore.howItWorks.step1.title')}</h3>
                <p className="text-lg text-muted-foreground">
                  {t('learnMore.howItWorks.step1.description')}
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
                <h3 className="text-2xl font-bold">{t('learnMore.howItWorks.step2.title')}</h3>
                <p className="text-lg text-muted-foreground">
                  {t('learnMore.howItWorks.step2.description')}
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
                <h3 className="text-2xl font-bold">{t('learnMore.howItWorks.step3.title')}</h3>
                <p className="text-lg text-muted-foreground">
                  {t('learnMore.howItWorks.step3.description')}
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
                <h3 className="text-2xl font-bold">{t('learnMore.howItWorks.step4.title')}</h3>
                <p className="text-lg text-muted-foreground">
                  {t('learnMore.howItWorks.step4.description')}
                </p>
              </div>
            </div>
          </div>

          <p className="text-lg lg:text-xl text-center text-muted-foreground pt-8">
            {t('learnMore.howItWorks.summary')}
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
            {t('learnMore.whyNow.title')}
          </h2>
          <div className="prose prose-lg lg:prose-xl max-w-none">
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              {t('learnMore.whyNow.text1')}
            </p>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              {t('learnMore.whyNow.text2')}
            </p>
            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
              {t('learnMore.whyNow.text3')}
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
            {t('learnMore.faq.title')}
          </h2>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                {t('learnMore.faq.q1.question')}
              </h3>
              <p className="text-lg text-muted-foreground">
                {t('learnMore.faq.q1.answer')}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                {t('learnMore.faq.q2.question')}
              </h3>
              <p className="text-lg text-muted-foreground">
                {t('learnMore.faq.q2.answer')}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold">
                {t('learnMore.faq.q3.question')}
              </h3>
              <p className="text-lg text-muted-foreground">
                {t('learnMore.faq.q3.answer')}
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
            {t('learnMore.finalCta.title')}
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground text-center leading-relaxed">
            {t('learnMore.finalCta.subtitle')}
          </p>
          <p className="text-xl lg:text-2xl font-semibold text-center">
            {t('learnMore.finalCta.quote')}
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
            {t('learnMore.finalCta.button')}
          </h3>
          <Link to="/auth">
            <Button size="lg" className="rounded-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity text-white shadow-lg shadow-purple-500/50 text-lg px-8 py-6 h-auto">
              {t('learnMore.finalCta.action')}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            {t('learnMore.finalCta.disclaimer')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border mt-20">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <img src={logo} alt="Climbley" className="h-6 w-auto" />
          <span>{t('learnMore.footer.copyright')}</span>
        </div>
      </footer>
    </div>
  );
};

export default LearnMore;

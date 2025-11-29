import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Target, TrendingUp, Calendar, Star } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/no_background.png";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";
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
const sliderImages = [{
  src: slider1,
  alt: "Food content creator with ring light"
}, {
  src: slider2,
  alt: "Podcast creator with microphone"
}, {
  src: slider4,
  alt: "Beauty content creator"
}, {
  src: slider5,
  alt: "Fitness lifestyle creator"
}, {
  src: slider8,
  alt: "Tech tutorial creator"
}, {
  src: slider10,
  alt: "Outdoor videography creator"
}, {
  src: slider11,
  alt: "Educational content creator"
}, {
  src: slider13,
  alt: "Fashion content creator"
}, {
  src: slider14,
  alt: "Gaming streaming creator"
}, {
  src: slider15,
  alt: "Lifestyle vlog couple"
}];
const Index = () => {
  const {
    t
  } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Capture referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
      localStorage.setItem('referralTimestamp', new Date().toISOString());
      console.log('Referral code captured on Index page:', refCode);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Climbley" className="h-24 w-auto drop-shadow-md hover:drop-shadow-lg transition-all duration-200" />
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Link to="/auth">
            <Button variant="outline" className="rounded-full">
              {t('nav.signUp')}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section with Image Slider */}
      <section className="relative min-h-[85vh] overflow-hidden">
        {/* Image Slider */}
        <div className="absolute inset-0">
          <AnimatePresence>
            <motion.div key={currentSlide} initial={{
            x: "100%",
            opacity: 1
          }} animate={{
            x: 0,
            opacity: 1
          }} exit={{
            x: "-100%",
            opacity: 1
          }} transition={{
            duration: 0.6,
            ease: "easeInOut"
          }} className="absolute inset-0" style={{
            willChange: "transform"
          }}>
              <img src={sliderImages[currentSlide].src} alt={sliderImages[currentSlide].alt} className="w-full h-full object-cover brightness-110" />
              {/* Lighter gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Hero Content - Left Aligned */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center py-12 md:py-16">
          <div className="max-w-3xl text-left space-y-6 md:space-y-8">
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.2
          }} className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white mb-4">
              {t('index.hero.title')}
            </motion.div>
            
            <motion.h1 initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.3
          }} className="text-4xl lg:text-6xl font-bold tracking-tight text-white">
              {t('index.hero.mainHeadline')}
            </motion.h1>

            <motion.p initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.4
          }} className="text-2xl lg:text-3xl font-semibold text-white/90">{t('index.hero.subHeadline')}</motion.p>
            
            <motion.p initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.5
          }} className="text-lg lg:text-xl max-w-2xl text-zinc-50">
              {t('index.hero.description')}
            </motion.p>

            <motion.p initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.6
          }} className="text-xl font-medium bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text lg:text-xl text-zinc-50">
              {t('index.hero.tagline')}
            </motion.p>
            
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.7
          }} className="flex flex-col sm:flex-row gap-4 pt-4 pb-4">
              <Link to="/auth">
                <Button size="lg" className="rounded-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity text-white shadow-lg shadow-purple-500/50">
                  {t('index.hero.cta')}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/learn-more">
                <Button size="lg" variant="outline" className="rounded-full bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                  {t('index.hero.learnMore')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {sliderImages.map((_, index) => <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"}`} aria-label={`Go to slide ${index + 1}`} />)}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all animate-slide-up">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('index.features.quiz.title')}</h3>
            <p className="text-muted-foreground">
              {t('index.features.quiz.description')}
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all animate-slide-up [animation-delay:0.1s]">
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
              <Calendar className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('index.features.calendar.title')}</h3>
            <p className="text-muted-foreground">
              {t('index.features.calendar.description')}
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all animate-slide-up [animation-delay:0.2s]">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('index.features.analytics.title')}</h3>
            <p className="text-muted-foreground">
              {t('index.features.analytics.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t('index.pricing.title')}</h2>
          <p className="text-lg text-muted-foreground">
            {t('index.pricing.subtitle')}
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-primary shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 p-3">
                <img src={logo} alt="Climbley" className="h-full w-full object-contain" />
              </div>
              <CardTitle className="text-2xl mb-2">{t('index.pricing.cardTitle')}</CardTitle>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold">{t('index.pricing.price')}</span>
                <span className="text-muted-foreground">{t('index.pricing.perMonth')}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{t('index.pricing.trial')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{t('index.pricing.features.niche')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{t('index.pricing.features.planning')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{t('index.pricing.features.analytics')}</span>
                </li>
              </ul>
              <Link to="/auth">
                <Button size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  {t('index.pricing.cta')}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t('index.testimonials.title')}</h2>
            <p className="text-lg text-muted-foreground">
              {t('index.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300 animate-fade-in">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                    SM
                  </div>
                  <div>
                    <div className="font-semibold">{t('index.testimonials.creator1.name')}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-muted-foreground italic">
                  {t('index.testimonials.creator1.quote')}
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300 animate-fade-in [animation-delay:0.1s]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                    MJ
                  </div>
                  <div>
                    <div className="font-semibold">{t('index.testimonials.creator2.name')}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-muted-foreground italic">
                  {t('index.testimonials.creator2.quote')}
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300 animate-fade-in [animation-delay:0.2s]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg">
                    EC
                  </div>
                  <div>
                    <div className="font-semibold">{t('index.testimonials.creator3.name')}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-muted-foreground italic">
                  {t('index.testimonials.creator3.quote')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Consultation Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-secondary shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-secondary/20 via-primary/10 to-accent/10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-block px-4 py-1 bg-secondary/20 rounded-full text-sm font-medium mb-4">
                    Персональная консультация
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                    Как создать дополнительный доход $2000/месяц
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    1-часовая персональная консультация по Zoom. Получите индивидуальный план действий и ответы на все ваши вопросы.
                  </p>
                  <ul className="text-left space-y-2 mb-8">
                    <li className="flex items-start gap-2">
                      <Star className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                      <span>Анализ вашей ситуации и возможностей</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                      <span>Персональная стратегия монетизации</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                      <span>Конкретные шаги для достижения цели</span>
                    </li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
                    <Link to="/consultation">
                      <Button size="lg" variant="outline">
                        Подробнее
                      </Button>
                    </Link>
                    <Link to="/consultation-payment">
                      <Button size="lg" className="bg-gradient-to-r from-secondary to-primary hover:opacity-90">
                        Записаться на консультацию
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                    <div className="text-center">
                      <div className="text-3xl font-bold">$500</div>
                      <div className="text-sm text-muted-foreground">разовый платеж</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            {t('index.cta.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t('index.cta.subtitle')}
          </p>
          <Link to="/auth">
            <Button size="lg" className="rounded-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
              {t('index.cta.button')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border mt-20">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <img src={logo} alt="Climbley" className="h-6 w-auto drop-shadow-sm" />
          <span>Climbley © 2025</span>
        </div>
      </footer>
    </div>;
};
export default Index;
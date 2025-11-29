import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, CheckCircle, Clock, Video, FileText, TrendingUp, Users, Target } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/no_background.png";

export default function ConsultationDetails() {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: Video,
      title: "Персональная встреча по Zoom",
      description: "1 час индивидуальной консультации в удобное для вас время"
    },
    {
      icon: Target,
      title: "Анализ вашей ситуации",
      description: "Детальный разбор ваших возможностей и потенциала"
    },
    {
      icon: FileText,
      title: "План действий",
      description: "Пошаговая стратегия достижения дохода $2000/месяц"
    },
    {
      icon: TrendingUp,
      title: "Стратегия монетизации",
      description: "Конкретные способы заработка подходящие именно вам"
    },
    {
      icon: Users,
      title: "Поиск целевой аудитории",
      description: "Определение вашей ниши и идеальных клиентов"
    },
    {
      icon: Clock,
      title: "Оптимизация времени",
      description: "Как создавать контент эффективно без выгорания"
    }
  ];

  const faqItems = [
    {
      question: "Как проходит консультация?",
      answer: "Консультация проходит онлайн через Zoom. После оплаты вы выбираете удобное время для встречи. Перед консультацией я попрошу вас заполнить короткую анкету, чтобы лучше подготовиться к разговору."
    },
    {
      question: "Что нужно подготовить к консультации?",
      answer: "Подготовьте информацию о ваших навыках, интересах, доступном времени и текущей ситуации. Также подумайте о ваших целях - почему вы хотите создать дополнительный доход и что планируете с ним делать."
    },
    {
      question: "Подойдет ли мне консультация, если у меня нет опыта?",
      answer: "Да! Консультация подходит для людей с любым уровнем опыта. Мы найдем стратегию, которая соответствует вашим навыкам и возможностям. Многие начинающие достигают успеха с правильным планом."
    },
    {
      question: "Что если у меня мало времени?",
      answer: "Во время консультации мы разработаем план, учитывающий ваш график. Можно начать с 1-2 часов в день и постепенно масштабировать результаты."
    },
    {
      question: "Когда я увижу первые результаты?",
      answer: "При правильном выполнении плана, первые результаты можно увидеть через 2-4 недели. Достижение цели $2000/месяц обычно занимает 3-6 месяцев, в зависимости от вашей ниши и усилий."
    },
    {
      question: "Что если мне нужна дополнительная поддержка?",
      answer: "После консультации вы получите план действий, которому сможете следовать самостоятельно. Если вам понадобится дополнительная помощь, мы можем обсудить варианты продолжения сотрудничества."
    },
    {
      question: "Есть ли гарантия результата?",
      answer: "Я предоставляю проверенную стратегию и план действий. Результат зависит от вашего выполнения рекомендаций. Большинство клиентов, следующих плану, достигают своих целей."
    },
    {
      question: "Можно ли вернуть деньги?",
      answer: "Если после консультации вы не получили ценности, мы можем обсудить возможность возврата средств. Главное для меня - ваше удовлетворение и результат."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center border-b border-border/50">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Climbley" className="h-16 w-auto drop-shadow-md" />
        </Link>
        <Link to="/consultation-payment">
          <Button size="lg" className="bg-gradient-to-r from-secondary to-primary">
            Записаться
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-block px-4 py-2 bg-secondary/20 rounded-full text-sm font-medium mb-4 animate-fade-in">
            Персональная консультация
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 animate-fade-in">
            Как создать дополнительный доход<br />$2000/месяц
          </h1>
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in [animation-delay:0.1s]">
            Получите персональный план действий и стратегию монетизации,<br />
            основанную на ваших навыках и возможностях
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in [animation-delay:0.2s]">
            <Link to="/consultation-payment">
              <Button size="lg" className="bg-gradient-to-r from-secondary to-primary hover:opacity-90">
                Записаться на консультацию
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold">$500</div>
              <div className="text-sm text-muted-foreground">разовый платеж</div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Что входит в консультацию
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card 
                key={index}
                className="border-2 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="container mx-auto px-4 py-16 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Как проходит консультация
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start animate-fade-in">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Оплата и выбор времени</h3>
                <p className="text-muted-foreground">
                  После оплаты вы выбираете удобное время для встречи через Calendly
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start animate-fade-in [animation-delay:0.1s]">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Предварительная анкета</h3>
                <p className="text-muted-foreground">
                  Вы заполняете короткую анкету о ваших навыках, целях и текущей ситуации
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start animate-fade-in [animation-delay:0.2s]">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Zoom консультация</h3>
                <p className="text-muted-foreground">
                  1-часовая встреча, где мы разбираем вашу ситуацию и создаем план действий
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start animate-fade-in [animation-delay:0.3s]">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">План действий</h3>
                <p className="text-muted-foreground">
                  Вы получаете персональный план с конкретными шагами для достижения цели $2000/месяц
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Часто задаваемые вопросы
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-2 rounded-lg px-6 hover:border-primary/50 transition-colors"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary shadow-xl">
            <CardContent className="p-12 text-center space-y-6">
              <CheckCircle className="h-16 w-16 text-primary mx-auto" />
              <h2 className="text-3xl font-bold">
                Готовы начать создавать дополнительный доход?
              </h2>
              <p className="text-lg text-muted-foreground">
                Запишитесь на консультацию прямо сейчас и получите персональный план действий
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link to="/consultation-payment">
                  <Button size="lg" className="bg-gradient-to-r from-secondary to-primary hover:opacity-90">
                    Записаться на консультацию
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold">$500</div>
                  <div className="text-sm text-muted-foreground">разовый платеж</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border mt-12">
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <img src={logo} alt="Climbley" className="h-6 w-auto drop-shadow-sm" />
          <span>Climbley © 2025</span>
        </div>
      </footer>
    </div>
  );
}
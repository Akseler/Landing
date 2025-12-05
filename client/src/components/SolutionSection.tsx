import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ClipboardList, ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Mail, MessageSquare, Calendar, CheckCircle, Clock } from "lucide-react";
import { SiMessenger, SiInstagram } from "react-icons/si";

function Step02Visual() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const messages = [
    { id: 0, type: "ai", text: "Sveiki, čia iš Akseler. Gavome Jūsų užklausą, kas paskatino domėtis AI sprendimais?" },
    { id: 1, type: "customer", text: "Laba, norime apsiimti daugiau projektų, bet pardavėjai nespėja." },
    { id: 2, type: "ai", text: "Supratau, kiek šiuo metu apsiimate projektų ir kiek norėtumėte apsiimti?" },
    { id: 3, type: "customer", text: "Per mėnesį atliekam apie 10 projektų, bet norėtųsi gauti bent dvigubai." },
    { id: 4, type: "ai", text: "Supratau, kiek šiuo metu turite pardavėjų ir kiek išleidžiate ant reklamos?" },
    { id: 5, type: "customer", text: "Išleidžiame apie 2000EUR ir turime 2 pardavėjus." },
    { id: 6, type: "ai", text: "Super, kada jums būtų patogiau pasikalbėti rytoj 10:00 ar 13:00?" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= messages.length - 1) {
          return 0;
        }
        return prev + 1;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const visibleMessages = currentIndex === 0 
    ? [messages[0]]
    : [messages[currentIndex - 1], messages[currentIndex]];

  return (
    <div className="relative bg-white dark:bg-card rounded-2xl border border-border p-6 md:p-8 h-[300px] flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md">
        <div className="space-y-3 md:space-y-4 relative">
          <AnimatePresence initial={false}>
            {visibleMessages.map((message) => {
              if (message.type === "ai") {
                return (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.95 }}
                    transition={{ 
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="flex items-start gap-2 md:gap-3"
                  >
                    <div className="bg-[#1d8263]/10 px-3 md:px-4 py-2 md:py-3 rounded-2xl rounded-tl-sm max-w-[85%]">
                      <p className="text-xs md:text-sm">{message.text}</p>
                    </div>
                  </motion.div>
                );
              } else {
                return (
                  <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.95 }}
                    transition={{ 
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="flex items-end gap-2 md:gap-3 flex-row-reverse"
                  >
                    <div className="bg-muted px-3 md:px-4 py-2 md:py-3 rounded-2xl rounded-tr-sm max-w-[85%]">
                      <p className="text-xs md:text-sm">{message.text}</p>
                    </div>
                  </motion.div>
                );
              }
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Step03Visual() {
  const [currentNotif, setCurrentNotif] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNotif(prev => (prev + 1) % 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const notifications = [
    {
      title: "Pokalbis su Enrike suplanuotas",
      time: "Rytoj 11:00val.",
      status: "Klientas kvalifikuotas"
    },
    {
      title: "Perskambinti Mariui",
      time: "Šiandien",
      status: "Klientas kvalifikuotas"
    }
  ];

  return (
    <div className="relative bg-white dark:bg-card rounded-2xl border border-border p-6 md:p-8 h-[300px] flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNotif}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-[#1d8263]/10 to-[#1d8263]/5 border border-[#1d8263]/20 rounded-2xl p-4 md:p-6"
          >
            <div className="flex items-start gap-2 md:gap-3">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#1d8263] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm md:text-base mb-1">{notifications[currentNotif].title}</h4>
                <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">{notifications[currentNotif].time}</p>
                <div className="flex items-center gap-2 text-[#1d8263] font-medium">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs md:text-sm">{notifications[currentNotif].status}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Step04Visual() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { icon: Mail, title: "Siunčia edukacinį turinį", color: "from-[#1d8263]/10 to-[#1d8263]/5", border: "border-[#1d8263]/20" },
    { icon: Clock, title: "Laukia tinkamo momento", color: "from-[#1d8263]/10 to-[#1d8263]/5", border: "border-[#1d8263]/20" },
    { icon: MessageSquare, title: "Inicijuoja pokalbį iš naujo", color: "from-[#1d8263]/10 to-[#1d8263]/5", border: "border-[#1d8263]/20" }
  ];

  return (
    <div className="relative bg-white dark:bg-card rounded-2xl border border-border p-6 md:p-8 h-[300px] flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-sm space-y-3">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0.4, scale: 0.95 }}
              animate={{ 
                opacity: currentStep === index ? 1 : 0.4,
                scale: currentStep === index ? 1 : 0.95
              }}
              transition={{ duration: 0.3 }}
              className={`bg-gradient-to-br ${step.color} border ${step.border} rounded-xl p-4 flex items-center gap-3`}
            >
              <IconComponent className="w-6 h-6" />
              <div className="font-medium text-sm md:text-base">{step.title}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.05, margin: "0px 0px -100px 0px" });

  const steps = [
    {
      number: "01",
      title: "Susisiekia žaibišku greičiu",
      description: "AI darbuotojai realiu laiku gauna užklausas iš visų reklamos kanalų ir minutės bėgyje susisiekia personalizuota žinute.",
      visual: (
        <div className="relative bg-white dark:bg-card rounded-2xl border border-border p-6 md:p-8 h-[300px] flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-[240px] aspect-square">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 border-4 border-gray-500 flex items-center justify-center shadow-lg">
                <span className="text-xl md:text-2xl font-bold text-white">AI</span>
              </div>
            </div>

            <svg className="absolute top-[22%] left-1/2 -translate-x-1/2" width="2" height="50" viewBox="0 0 2 50">
              <motion.line
                x1="1" y1="14" x2="1" y2="36"
                stroke="#1d8263"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ strokeDashoffset: -8 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </svg>

            <svg className="absolute left-[22%] top-1/2 -translate-y-1/2" width="50" height="2" viewBox="0 0 50 2">
              <motion.line
                x1="14" y1="1" x2="36" y2="1"
                stroke="#1d8263"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ strokeDashoffset: -8 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </svg>

            <svg className="absolute right-[22%] top-1/2 -translate-y-1/2" width="50" height="2" viewBox="0 0 50 2">
              <motion.line
                x1="14" y1="1" x2="36" y2="1"
                stroke="#1d8263"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ strokeDashoffset: 8 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </svg>

            <svg className="absolute bottom-[22%] left-1/2 -translate-x-1/2" width="2" height="50" viewBox="0 0 2 50">
              <motion.line
                x1="1" y1="14" x2="1" y2="36"
                stroke="#1d8263"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ strokeDashoffset: 8 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </svg>

            <div className="absolute top-0 left-1/2 -translate-x-1/2">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#1d8263]/10 border border-[#1d8263]/20 flex items-center justify-center shadow-lg">
                <SiMessenger className="w-7 h-7 md:w-9 md:h-9 text-[#1d8263]" />
              </div>
            </div>

            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#1d8263]/10 border border-[#1d8263]/20 flex items-center justify-center shadow-lg">
                <SiInstagram className="w-6 h-6 md:w-8 md:h-8 text-[#1d8263]" />
              </div>
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#1d8263]/10 border border-[#1d8263]/20 flex items-center justify-center shadow-lg">
                <span className="text-sm md:text-base font-bold text-[#1d8263]">SMS</span>
              </div>
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <div className="w-14 h-12 md:w-16 md:h-14 rounded-lg bg-[#1d8263]/10 border border-[#1d8263]/20 flex items-center justify-center shadow-lg">
                <Mail className="w-6 h-6 md:w-8 md:h-8 text-[#1d8263]" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "02",
      title: "Kvalifikuoja ir atrenka",
      description: "Užmezga žmogišką pokalbį, surenka info ir atfiltruoja smalsuolius nuo pirkėjų.",
      visual: <Step02Visual />,
    },
    {
      number: "03",
      title: "Planuoja pokalbius",
      description: "Su kvalifikuotais ir rimtai nusiteikusiais klientais planuoja pokalbius ir užduotis.",
      visual: <Step03Visual />,
    },
    {
      number: "04",
      title: "\"Šildo\" nepasiruošusius",
      description: "Jei klientas sako \"man reikia laiko\", sistema jį \"šildo\" informatyviu turiniu ir po kurio laiko vėl inicijuoja pokalbį.",
      visual: <Step04Visual />,
    },
  ];

  return (
    <section ref={ref} className="pt-16 md:pt-20 pb-20 md:pb-24 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block mb-4 md:mb-5">
            <Badge 
              variant="outline" 
              className="px-6 py-2 text-sm font-semibold border-2 border-[#1d8263]/30 bg-[#1d8263]/5 text-[#1d8263]"
              data-testid="badge-solution"
            >
              KAIP VEIKIA AI DARBUOTOJAI
            </Badge>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-[32px] lg:text-[36px] font-bold mb-0 leading-tight" data-testid="text-solution-title">
            Jūsų pardavimų pastiprinimas{" "}
            <span className="inline-block relative">
              <span className="relative z-10 text-foreground px-4 py-1">su Dirbtiniu Intelektu</span>
              <span className="absolute inset-0 bg-[#1d8263]/20 -skew-x-6 rounded-lg transform translate-y-1 -mx-2"></span>
            </span>
          </h2>
        </div>

        <div className="relative space-y-12 md:space-y-14 mt-8 md:mt-12">
          <div className="hidden md:block absolute left-[2.5rem] lg:left-[3rem] top-12 bottom-12 w-[2px] bg-gradient-to-b from-[#1d8263]/20 via-[#1d8263]/40 to-[#1d8263]/20" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="relative"
              data-testid={`how-it-works-step-${index + 1}`}
            >
              <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
                <div className="flex gap-4 md:gap-6 items-start">
                  <div className="relative z-10">
                    <div className="text-5xl md:text-6xl lg:text-7xl font-light text-[#1d8263] flex-shrink-0 bg-background">{step.number}</div>
                  </div>
                  <div className="space-y-2 md:space-y-3 pt-2">
                    <h3 className="text-xl md:text-[22px] font-bold leading-tight">{step.title}</h3>
                    <p className="text-sm md:text-[16px] text-foreground/70 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                <div>
                  {step.visual}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-16 md:mt-20">
          <Link href="/survey">
            <Button 
              size="lg" 
              variant="default"
              className="px-12 py-3 h-auto btn-gradient hover:opacity-95 border-0 min-w-[320px] md:min-w-[400px]"
              data-testid="button-survey-solution"
              onClick={() => trackEvent('button_click', window.location.pathname, 'button-survey-solution')}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg md:text-xl font-semibold">Kokių rezultatų galiu tikėtis?</span>
                <span className="text-xs opacity-80 flex items-center gap-1.5">
                  <ClipboardList className="w-3 h-3" />
                  Atsakykite į 4 klausimus ir sužinokite
                </span>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

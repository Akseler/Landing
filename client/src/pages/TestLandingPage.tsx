import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MarketsScrolling from "@/components/MarketsScrolling";
import { trackPageView, trackButtonClick, trackEvent, initScrollTracking, initSessionDurationTracking } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Calendar,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Percent,
  Phone,
  Smartphone,
  Sprout,
  Timer,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Link, useLocation } from "wouter";
import useEmblaCarousel from "embla-carousel-react";
import { SiFacebook, SiInstagram } from "react-icons/si";
import veeslaLogo from "@assets/2_1763670424934.png";
import energija24Logo from "@assets/energija transparent.png";
import specdarbaiLogo from "@assets/3_1763670424934.png";
import videoGif from "@assets/video-presentation.gif";

const badgeGreen =
  "px-6 py-2.5 text-[12px] font-bold border-2 border-[#1d8263]/25 bg-[#1d8263]/5 text-[#1d8263] uppercase tracking-widest rounded-full";

function SectionHeading({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string | React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="text-center space-y-3">
      <div className="flex justify-center">
        <Badge variant="outline" className={badgeGreen}>
          {badge}
        </Badge>
      </div>
      <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-900">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-[520px] mx-auto">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function AnimatedSectionHeading({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string | React.ReactNode;
  subtitle?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="text-center space-y-3"
    >
      <div className="flex justify-center">
        <Badge variant="outline" className={badgeGreen}>
          {badge}
        </Badge>
      </div>
      <h2 className="text-xl md:text-3xl font-extrabold tracking-tight text-slate-900">
        {title}
      </h2>
      {subtitle ? (
        <p className="text-sm md:text-base text-slate-500 leading-relaxed max-w-[520px] mx-auto">
          {subtitle}
        </p>
      ) : null}
    </motion.div>
  );
}

function RotatingTrust({ whiteText = false }: { whiteText?: boolean }) {
  const items = useMemo(
    () => [
      { name: "Veesla", logo: veeslaLogo },
      { name: "Energija24", logo: energija24Logo },
      { name: "Specdarbai", logo: specdarbaiLogo },
    ],
    []
  );
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((v) => (v + 1) % items.length), 2200);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <div className="pt-2 flex flex-col items-center justify-center gap-3">
      <div className={`text-sm font-semibold ${whiteText ? "text-white" : "text-slate-600"}`}>
        Mumis pasitiki rinkos lyderiai
      </div>
      <div className="h-10 w-[200px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={items[idx].name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <img
              src={items[idx].logo}
              alt={items[idx].name}
              className={`h-8 w-auto object-contain ${whiteText ? "brightness-0 invert opacity-90" : "opacity-70 grayscale"}`}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  visual,
  index = 0,
}: {
  step: string;
  title: string;
  description: string;
  visual: React.ReactNode;
  index?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="bg-gradient-to-b from-[#E0F2E8] to-[#F0F9F4] rounded-2xl overflow-hidden shadow-[0_18px_40px_-22px_rgba(0,0,0,0.14)] border border-[#1d8263]/20 relative"
    >
      <div className="md:flex md:items-center md:gap-6">
        <div className="px-5 md:px-7 pt-5 md:pt-6 pb-4 md:pb-6 md:w-1/2 md:flex md:flex-col md:justify-center md:text-left">
          <h3 className="text-[17px] md:text-[22px] font-extrabold text-slate-900 leading-tight">{title}</h3>
          <p className="mt-2 text-[13px] md:text-[14px] text-slate-600 leading-relaxed">{description}</p>
        </div>
        <div className="relative px-4 md:px-6 pt-0 pb-5 md:py-6 md:min-h-[260px] md:w-1/2 md:flex md:items-center md:justify-center">
          <div className="relative z-10 w-full">{visual}</div>
        </div>
      </div>
    </motion.div>
  );
}

function Step1Visual() {
  return (
    <div className="h-[210px] flex items-center justify-center">
      <div className="relative w-full max-w-[340px] h-[180px]">
        <motion.div
          className="absolute left-5 top-6 w-[160px] h-[150px] rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden"
          animate={{ rotate: [-6, -4, -6], y: [0, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Reels-like header */}
          <div className="h-8 bg-[#1d8263]/10 border-b border-[#1d8263]/10 flex items-center px-3 justify-between">
            <div className="text-[10px] font-bold text-[#1d8263] uppercase tracking-wider">
              "META" REKLAMA
            </div>
            <div className="w-2 h-2 rounded-full bg-[#1d8263]/50" />
          </div>
          <div className="p-3 pt-3">
            <div className="mt-3 h-[74px] bg-slate-100 rounded-xl flex items-center justify-center gap-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(29,130,99,0.18),transparent_50%)]" />
              <SiFacebook className="w-8 h-8 text-[#1877F2]" />
              <SiInstagram className="w-8 h-8 text-[#E4405F]" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute right-5 top-6 w-[160px] h-[150px] rounded-2xl bg-white border border-[#1d8263]/18 shadow-sm overflow-hidden"
          animate={{ rotate: [5, 3, 5], y: [0, 2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="h-8 bg-slate-50 border-b border-slate-200 flex items-center px-3">
            <div className="w-2 h-2 rounded-full bg-slate-300 mr-2" />
            <div className="w-2 h-2 rounded-full bg-slate-300 mr-2" />
            <div className="w-2 h-2 rounded-full bg-slate-300" />
          </div>
          <div className="p-3 pt-3">
            <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              SVETAINĖ
            </div>
            <div className="mt-2 h-2 w-28 bg-[#1d8263]/20 rounded-full" />
            <div className="mt-2 h-2 w-20 bg-slate-100 rounded-full" />
            <div className="mt-3 h-[74px] bg-slate-100 rounded-xl flex flex-col justify-end items-center pb-2 gap-2">
              <div className="h-2 w-28 rounded-full bg-white/80" />
              <div className="h-9 w-28 rounded-xl bg-[#1d8263] flex items-center justify-center text-[10px] font-bold text-white">
                Registruotis
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="absolute left-1/2 -translate-x-1/2 bottom-3 w-10 h-10 rounded-full bg-[#1d8263]/10 border border-[#1d8263]/20 flex items-center justify-center"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-2 h-2 bg-[#1d8263] rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}

function Step2Visual() {
  const [stage, setStage] = useState(0);
  // 0: Form empty
  // 1: "Vardas" filled
  // 2: "Tel.numeris" filled
  // 3: "El.paštas" filled
  // 4: SMS notification appears

  useEffect(() => {
    let t: NodeJS.Timeout;
    const run = () => {
      setStage(0);
      t = setTimeout(() => {
        setStage(1);
        t = setTimeout(() => {
          setStage(2);
          t = setTimeout(() => {
            setStage(3);
            t = setTimeout(() => {
              setStage(4);
              t = setTimeout(() => {
                // Fade out SMS first, then reset to form
                setStage(0);
                t = setTimeout(run, 500);
              }, 3000);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    };
    run();
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-[230px] flex items-center justify-center relative">
      <div className="w-full max-w-[360px]">
        <div className="relative rounded-2xl bg-white border border-slate-200 shadow-sm p-4 h-[210px] overflow-hidden">
          {/* Form */}
          <AnimatePresence mode="wait">
            {stage < 4 && (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: stage === 3 ? 0 : 1, scale: stage === 3 ? 0.95 : 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="space-y-2.5"
              >
                {/* Vardas */}
                <div>
                  <label className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider mb-1 block">
                    Vardas
                  </label>
                  <motion.div
                    className="h-8 rounded-lg border-2 bg-white"
                    animate={{
                      borderColor: stage >= 1 ? "#1d8263" : "#e2e8f0",
                      backgroundColor: stage >= 1 ? "#F3FBF6" : "#FFFFFF",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {stage >= 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="h-full flex items-center px-2.5 text-xs font-medium text-slate-700"
                      >
                        Jonas
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* Tel.numeris */}
                <div>
                  <label className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider mb-1 block">
                    Tel.numeris
                  </label>
                  <motion.div
                    className="h-8 rounded-lg border-2 bg-white"
                    animate={{
                      borderColor: stage >= 2 ? "#1d8263" : "#e2e8f0",
                      backgroundColor: stage >= 2 ? "#F3FBF6" : "#FFFFFF",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {stage >= 2 && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="h-full flex items-center px-2.5 text-xs font-medium text-slate-700"
                      >
                        +370 600 12345
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                {/* El.paštas */}
                <div>
                  <label className="text-[9px] font-semibold text-slate-600 uppercase tracking-wider mb-1 block">
                    El.paštas
                  </label>
                  <motion.div
                    className="h-8 rounded-lg border-2 bg-white"
                    animate={{
                      borderColor: stage >= 3 ? "#1d8263" : "#e2e8f0",
                      backgroundColor: stage >= 3 ? "#F3FBF6" : "#FFFFFF",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {stage >= 3 && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="h-full flex items-center px-2.5 text-xs font-medium text-slate-700"
                      >
                        jonas@example.com
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SMS Notification - Centered */}
          <AnimatePresence mode="wait">
            {stage === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center z-10 m-0"
              >
                <div className="w-[280px] md:w-[240px] rounded-xl bg-white border-2 border-[#1d8263]/20 shadow-lg p-4 md:p-3">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 md:w-4 md:h-4 text-[#1d8263]" />
                      <div className="text-[11px] font-bold text-[#1d8263] uppercase tracking-wider">
                        SMS
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-400">Dabar</div>
                  </div>
                  <div className="rounded-lg border border-[#1d8263]/15 bg-[#1d8263]/8 p-3 md:p-2.5">
                    <p className="text-[10px] md:text-[9px] leading-relaxed text-slate-700 font-medium">
                      Sveiki, Jonai, čia iš Akseler. Gavome Jūsų užklausą, kas paskatino domėtis AI sprendimais?
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Step3Visual() {
  const [stage, setStage] = useState(0);
  const eventDays = [3, 8, 12];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStage((v) => (v + 1) % 7);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filledDays = Math.min(stage, 3);

  return (
    <div className="h-[210px] flex items-center justify-center">
      <div className="w-full max-w-[360px]">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-700">
              Kalendorius
            </div>
            <div className="text-[11px] font-bold text-[#1d8263]">
              {filledDays} suplanuoti
            </div>
          </div>
          
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {Array.from({ length: 14 }).map((_, i) => {
              const eventIndex = eventDays.indexOf(i);
              const isEventDay = eventIndex !== -1;
              const isFilled = isEventDay && eventIndex < filledDays;
              return (
                <motion.div
                  key={i}
                  className="h-4 rounded-md"
                  animate={{ 
                    backgroundColor: isFilled ? "#1d8263" : "#f1f5f9",
                    scale: isFilled ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}
          </div>
          
          <div className="mt-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 h-[30px] text-[10px] text-slate-700">
              <motion.div
                className="flex items-center gap-2 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: filledDays >= 1 ? 1 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1d8263] shrink-0" />
                <span className="font-semibold">Jonas • pir 11:00</span>
              </motion.div>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 h-[30px] text-[10px] text-slate-700">
              <motion.div
                className="flex items-center gap-2 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: filledDays >= 2 ? 1 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1d8263] shrink-0" />
                <span className="font-semibold">Aistė • treč. 14:00</span>
              </motion.div>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 h-[30px] text-[10px] text-slate-700">
              <motion.div
                className="flex items-center gap-2 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: filledDays >= 3 ? 1 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1d8263] shrink-0" />
                <span className="font-semibold">Tomas • pen 10:00</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step4Visual() {
  const items = useMemo(
    () => [
      { label: "Siunčia edukacinį turinį laiškais", icon: Mail },
      { label: "Laukia tinkamo momento", icon: Calendar },
      { label: "Parašo SMS priminimą", icon: Smartphone },
    ],
    []
  );

  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % items.length), 2100);
    return () => clearInterval(t);
  }, [items.length]);

  const Icon = items[i].icon;

  return (
    <div className="h-[210px] flex items-center justify-center">
      <div className="w-full max-w-[340px] rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold text-slate-700">Šildymo seka</div>
          <Icon className="w-4 h-4 text-[#1d8263]" />
        </div>
        <div className="mt-4 space-y-3">
          {items.map((it, idx) => {
            const active = idx === i;
            const ItIcon = it.icon;
            return (
              <motion.div
                key={it.label}
                animate={{ opacity: active ? 1 : 0.4 }}
                transition={{ duration: 0.2 }}
                className={`rounded-xl border px-3 py-2 text-[11px] font-semibold flex items-center gap-2 ${
                  active
                    ? "border-[#1d8263]/25 bg-[#1d8263]/6 text-[#1d8263]"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <ItIcon className={`w-4 h-4 ${active ? "text-[#1d8263]" : "text-slate-400"}`} />
                {it.label}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TestResults({ sectionRef }: { sectionRef?: React.RefObject<HTMLElement> }) {
  const results = [
    {
      company: "Energija24",
      revenue: "1,1M. apyvartos 2024m.",
      stat: "140%",
      desc: "padidėjęs pardavimų rodiklis",
      sub: "dėl greitesnio pardavimų proceso",
      logo: energija24Logo,
    },
    {
      company: "Veesla",
      revenue: "22M. apyvartos 2024m.",
      stat: "360+ val.",
      desc: "sutaupyta kiekvieną mėnesį",
      sub: "automatizavus rankinius procesus",
      logo: veeslaLogo,
    },
    {
      company: "Specdarbai",
      revenue: "1,2M. apyvartos 2024m.",
      stat: "2x",
      desc: "daugiau apdorojamų užklausų",
      sub: "be papildomų darbuotojų samdymo",
      logo: specdarbaiLogo,
    },
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section ref={sectionRef} className="space-y-8" style={{ backgroundColor: '#FFFFFF' }}>
      <SectionHeading
        badge="Rezultatai"
        title="Skaičiai kalba patys už save"
      />

      {/* Desktop grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-4 max-w-[820px] mx-auto" style={{ backgroundColor: '#FFFFFF' }}>
        {results.map((r) => (
          <div
            key={r.company}
            className="bg-gradient-to-br from-[#1d8263] via-[#167a5a] to-[#0f5f46] rounded-3xl border border-[#1d8263]/20 px-6 pt-6 pb-8 flex flex-col min-h-[300px] shadow-lg"
          >
            <div className="flex flex-col items-center gap-2 text-center shrink-0">
              <img
                src={r.logo}
                alt={r.company}
                className="h-8 w-auto object-contain brightness-0 invert"
              />
              <div className="text-[11px] text-white/80 font-medium whitespace-nowrap">
                {r.revenue}
              </div>
            </div>
            <div className="mt-4 h-px bg-white/30 shrink-0" />
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-[34px] leading-none font-extrabold text-white">
                {r.stat}
              </div>
              <div className="mt-3 text-[12px] font-bold text-white whitespace-nowrap">
                {r.desc}
              </div>
              <div className="mt-1 text-[10px] text-white/90 whitespace-nowrap">{r.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile swipe */}
      <div className="md:hidden -mx-4 py-2" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="overflow-hidden" ref={emblaRef} style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex gap-3 px-6" style={{ backgroundColor: '#FFFFFF' }}>
            {results.map((r, idx) => (
              <div key={r.company} className="flex-[0_0_82%] min-w-0 last:pr-6" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="bg-gradient-to-br from-[#1d8263] via-[#167a5a] to-[#0f5f46] rounded-3xl border border-[#1d8263]/20 px-6 pt-6 pb-10 flex flex-col min-h-[350px] shadow-lg">
                  <div className="flex flex-col items-center gap-2 text-center shrink-0">
                    <img
                      src={r.logo}
                      alt={r.company}
                      className="h-8 w-auto object-contain brightness-0 invert"
                    />
                    <div className="text-[10px] text-white/80 font-medium whitespace-nowrap">
                      {r.revenue}
                    </div>
                  </div>
                  <div className="mt-4 h-px bg-white/30 shrink-0" />
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="text-[11vw] sm:text-5xl font-extrabold text-white">
                      {r.stat}
                    </div>
                    <div className="mt-4 text-[3.5vw] sm:text-[15px] font-bold text-white whitespace-nowrap">
                      {r.desc}
                    </div>
                    <div className="mt-1 text-[3vw] sm:text-[13px] text-white/90 whitespace-nowrap">{r.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-5">
          {results.map((_, idx) => (
            <button
              key={idx}
              onClick={() => emblaApi?.scrollTo(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === selectedIndex ? "w-8 bg-[#1d8263]" : "w-2 bg-[#1d8263]/25"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function VSLSection({ handlePlayClick }: { handlePlayClick: () => void }) {
  const ref = useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <div className="bg-gradient-to-r from-[#1d8263] to-[#166b52] rounded-3xl py-3 px-3 md:py-3 md:px-3 shadow-md border-2 border-[#1d8263]/30 w-fit mx-auto">
        <div className="w-full max-w-md relative group">
          {/* GIF Image - using clip-path for reliable rounding on iOS */}
          <img 
            src={videoGif} 
            alt="Video presentation" 
            className="w-full h-auto block"
            style={{ 
              filter: 'blur(2.5px)',
              clipPath: 'inset(0 round 1rem)',
              WebkitClipPath: 'inset(0 round 1rem)', // iOS Safari support
              transform: 'translateZ(0)' // Force hardware acceleration
            }}
          />
          
          {/* Green border overlay - layered on top */}
          <div 
            className="absolute inset-0 rounded-2xl border-2 border-[#1d8263]/20 pointer-events-none z-10"
            style={{ 
              borderRadius: '1rem',
              // Ensure border renders nicely on top
              boxShadow: 'inset 0 0 0 1px rgba(29, 130, 99, 0.1)'
            }}
          />
          
          {/* Button text instead of play button */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayClick();
              }}
              className="cursor-pointer bg-gradient-to-r from-[#1d8263] to-[#166b52] hover:from-[#166b52] hover:to-[#1d8263] border-2 border-white/30 hover:border-white/50 text-white font-extrabold px-8 py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 animate-pulse-subtle"
              style={{
                animation: 'pulse-subtle 3s ease-in-out infinite',
              }}
            >
              Žiūrėti video pristatymą
            </button>
            <style>{`
              @keyframes pulse-subtle {
                0%, 100% { 
                  transform: scale(1); 
                  opacity: 1; 
                  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(29, 130, 99, 0.4);
                }
                50% { 
                  transform: scale(1.02); 
                  opacity: 0.95; 
                  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(29, 130, 99, 0);
                }
              }
            `}</style>
          </div>
          
          {/* Subtle overlay */}
          <div 
            className="absolute inset-0 bg-black/5 pointer-events-none z-10" 
            style={{ 
              borderRadius: '1rem',
              clipPath: 'inset(0 round 1rem)'
            }}
          />
        </div>
      </div>
    </motion.section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      <SectionHeading
        badge="4 žingsnių formulė"
        title="Kaip veikia AI pardavimų sistema"
      />

      <div className="grid grid-cols-1 gap-5 max-w-4xl mx-auto">
        <StepCard
          step="1"
          title="1. Užtikriname pastovų ir kokybišką užklausų srautą"
          description="Atliksime jūsų marketingo auditą ir jei matysime poreikį, sukursime naują strategiją pastoviam užklausų srautui."
          visual={<Step1Visual />}
          index={0}
        />
        <StepCard
          step="2"
          title="2. AI susisiekia su užklausomis"
          description="Mūsų AI iškarto parašo SMS žinutę naujai užklausai, užmezga žmogišką pokalbį ir išsiaiškina kliento situaciją bei poreikius."
          visual={<Step2Visual />}
          index={1}
        />
        <StepCard
          step="3"
          title="3. AI planuoja skambučius arba vizitus su kvalifikuotais klientais"
          description="Jei klientas kvalifikuotas, mūsų AI suderina laiką skambučiui arba vizitui pas jus, pagal jūsų komandos užimtumą."
          visual={<Step3Visual />}
          index={2}
        />
        <StepCard
          step="4"
          title='4. Nepasiruošę lieka "šildomi"'
          description='Jei klientas dar nepasiruošęs, sistema jį „šildo" informatyviu turiniu ir po kurio laiko vėl inicijuoja pokalbį ir veda link pardavimo.'
          visual={<Step4Visual />}
          index={3}
        />
      </div>
    </motion.section>
  );
}

export default function TestLandingPage() {
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLElement | null>(null);
  const finalCtaRef = useRef<HTMLElement | null>(null);
  const resultsSectionRef = useRef<HTMLElement | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [hideStickyOnFinal, setHideStickyOnFinal] = useState(false);
  
  // Video modal state
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const playerReadyRef = useRef(false);

  useEffect(() => {
    document.title = "Akseler | AI pardavimų sistema paslaugų teikėjams";
    trackPageView("/");
    initScrollTracking();
    initSessionDurationTracking();
  }, []);

  // Initialize Vimeo player on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (iframeRef.current && (window as any).Vimeo) {
        playerRef.current = new (window as any).Vimeo.Player(iframeRef.current);
        
        playerRef.current.ready().then(() => {
          playerReadyRef.current = true;
        });

        // Listen for fullscreen exit to pause and cleanup
        playerRef.current.on('fullscreenchange', (data: any) => {
          if (!data.fullscreen) {
            playerRef.current.pause();
            setShowFallbackModal(false);
          }
        });
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Handle fallback modal body scroll
  useEffect(() => {
    if (showFallbackModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFallbackModal]);

  // Handle play button click - try fullscreen immediately
  const handlePlayClick = useCallback(async () => {
    // Prevent double-click
    if (showFallbackModal) return;
    
    // Track video play event
    trackEvent('video_play', window.location.pathname, 'vsl_video');
    
    if (!playerRef.current || !playerReadyRef.current) {
      // Player not ready, show fallback modal
      setShowFallbackModal(true);
      return;
    }

    try {
      // Request fullscreen and play in one gesture
      await playerRef.current.setVolume(1);
      await playerRef.current.play();
      await playerRef.current.requestFullscreen();
    } catch (e) {
      // Fullscreen failed (iOS/Safari), show fallback modal
      setShowFallbackModal(true);
      
      // Try to play in modal
      if (playerRef.current) {
      try {
        await playerRef.current.setVolume(1);
        await playerRef.current.play();
      } catch (playError) {
        console.log('Video playback error:', playError);
      }
    }
    }
  }, [showFallbackModal]);

  const handleCloseFallback = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setShowFallbackModal(false);
  }, []);

  useEffect(() => {
    const resultsEl = resultsSectionRef.current;
    const finalEl = finalCtaRef.current;
    if (!resultsEl || !finalEl) return;

    const handleScroll = () => {
      const resultsRect = resultsEl.getBoundingClientRect();
      const finalRect = finalEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Show sticky CTA when results section enters viewport (top is above 80% of viewport)
      const reachedResults = resultsRect.top < viewportHeight * 0.8;
      
      // Hide when final CTA is visible (top is in viewport)
      const reachedFinal = finalRect.top < viewportHeight * 0.9;

      setShowStickyCta(reachedResults);
      setHideStickyOnFinal(reachedFinal);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 pt-16 pb-28 space-y-28">
        {/* HERO */}
        <section ref={heroRef} className="space-y-9 text-center">
          <div className="space-y-3 pt-8 pb-2">
            <div className="flex justify-center">
              <Badge variant="outline" className={badgeGreen}>
                paslaugų verslams
              </Badge>
            </div>
            <h1 className="text-[6vw] sm:text-[5vw] md:text-[36px] font-extrabold leading-[1.2] tracking-tight text-slate-900">
              <span className="md:hidden">
                Gaukite pastovų ir kvalifikuotą<br />
                klientų srautą su Dirbtinio<br />
                Intelekto pardavimų sistema
              </span>
              <span className="hidden md:inline">
                Gaukite pastovų ir kvalifikuotą klientų<br />
                srautą su AI Pardavimų sistema
              </span>
            </h1>
            <p className="text-[15px] sm:text-base md:text-[19px] text-slate-600 leading-relaxed">
              Jokių mėnesinių įsipareigojimų, mokate tik<br />
              už sugeneruotus rezultatus.
            </p>
          </div>

          <div className="mt-4">
            <div className="max-w-[640px] mx-auto bg-gradient-to-br from-[#1d8263] via-[#167a5a] to-[#0f5f46] rounded-3xl p-8 md:p-10 shadow-lg space-y-8">
              
              {/* VSL VIDEO SECTION - Moved inside the green box */}
              <div className="w-full max-w-md mx-auto relative group">
                {/* GIF Image - using mask-image for bulletproof iOS rounding */}
                <img 
                  src={videoGif} 
                  alt="Video presentation" 
                  className="w-full h-auto block"
                  style={{ 
                    filter: 'blur(2.5px)',
                    // "Nuclear option" for iOS rounding: mask-image
                    maskImage: 'radial-gradient(white, black)',
                    WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                    borderRadius: '1rem', // Standard backup
                    transform: 'translateZ(0)', // Hardware acceleration
                    overflow: 'hidden'
                  }}
                />
                
                {/* Green border overlay - layered on top */}
                <div 
                  className="absolute inset-0 rounded-2xl border-2 border-white/20 pointer-events-none z-10"
                  style={{ 
                    borderRadius: '1rem',
                    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
                  }}
                />
                
                {/* Button text instead of play button */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayClick();
                    }}
                    className="cursor-pointer bg-gradient-to-r from-[#1d8263] to-[#166b52] hover:from-[#166b52] hover:to-[#1d8263] border-2 border-white/30 hover:border-white/50 text-white font-extrabold px-6 py-3 md:px-8 md:py-4 text-sm md:text-base rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-black/30 hover:shadow-xl hover:shadow-black/40 animate-pulse-subtle whitespace-nowrap"
                    style={{
                      animation: 'pulse-subtle 3s ease-in-out infinite',
                    }}
                  >
                    Žiūrėti video pristatymą
                  </button>
                  <style>{`
                    @keyframes pulse-subtle {
                      0%, 100% { 
                        transform: scale(1); 
                        opacity: 1; 
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(29, 130, 99, 0.4);
                      }
                      50% { 
                        transform: scale(1.02); 
                        opacity: 0.95; 
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(29, 130, 99, 0);
                      }
                    }
                  `}</style>
                </div>
                
                {/* Subtle overlay */}
                <div 
                  className="absolute inset-0 bg-black/5 pointer-events-none z-10" 
                  style={{ 
                    borderRadius: '1rem',
                    clipPath: 'inset(0 round 1rem)'
                  }}
                />
              </div>

              <div>
                <h2 className="text-[4.4vw] sm:text-[3.7vw] md:text-xl font-extrabold text-white text-center whitespace-nowrap mb-6">
                  Ko trūksta jūsų paslaugų verslui?
                </h2>
                <div className="max-w-[580px] mx-auto grid grid-cols-2 gap-4">
                {/* Užklausų */}
                <div
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Track button click and wait for it
                    await trackButtonClick('button-uzklausos', '/');
                    // Navigate after tracking is complete
                    setLocation('/survey?type=uzklausos');
                  }}
                  className="group hero-button relative rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 p-7 md:p-10 flex flex-col items-center justify-center gap-3 md:gap-4 text-center active:scale-[0.98] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/15 border border-white/25 flex items-center justify-center mb-1 group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
                    <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <span className="font-bold text-base md:text-lg text-white leading-tight">
                    Užklausų
                  </span>
                </div>

                {/* Pardavimų */}
                <div
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Track button click and wait for it
                    await trackButtonClick('button-pardavimai', '/');
                    // Navigate after tracking is complete
                    setLocation('/survey?type=pardavimai');
                  }}
                  className="group hero-button relative rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 p-7 md:p-10 flex flex-col items-center justify-center gap-3 md:gap-4 text-center active:scale-[0.98] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/15 border border-white/25 flex items-center justify-center mb-1 group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
                    <Percent className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <span className="font-bold text-base md:text-lg text-white leading-tight">
                    Pardavimų
                  </span>
                </div>
              </div>

              </div>

              <div>
                <RotatingTrust whiteText />
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (4 steps) */}
        <HowItWorksSection />

        {/* RESULTS (same as old, restyled for /test) */}
        <TestResults sectionRef={resultsSectionRef} />

        {/* COMPARISON */}
        <section className="space-y-8">
          <SectionHeading
            badge="Palyginimas"
            title="Kaip šiandien vyksta pardavimai"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-b from-[#FEE2E2] to-[#FEE2E2] rounded-3xl overflow-hidden border border-red-200 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.18)]">
              <div className="px-6 pt-6 pb-4">
                <h3 className="text-xl font-extrabold text-slate-900 mb-4">Rankinis būdas</h3>
              </div>
              <div className="bg-[#FEE2E2] px-5 pt-0 pb-4">
                <div className="h-[190px] relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
                  {Array.from({ length: 9 }).map((_, i) => {
                    const left = (i * 17) % 85;
                    const top = (i * 23) % 70;
                    const rot = (i % 2 === 0 ? -1 : 1) * (6 + (i % 5));
                    return (
                      <motion.div
                        key={i}
                        className="absolute w-28 h-16 rounded-xl bg-slate-50 border border-slate-200 shadow-sm"
                        style={{ left: `${left}%`, top: `${top}%`, rotate: rot }}
                        animate={{ y: [0, i % 2 === 0 ? -3 : 3, 0] }}
                        transition={{ duration: 2.8 + (i % 3), repeat: Infinity }}
                      >
                        <div className="p-2 space-y-2">
                          <div className="h-2 w-14 bg-slate-200 rounded-full" />
                          <div className="h-2 w-20 bg-slate-100 rounded-full" />
                        </div>
                      </motion.div>
                    );
                  })}
                  <div className="absolute inset-x-0 bottom-3 text-center text-[11px] font-semibold text-slate-500 px-4">
                    Rankinio užklausų apdorojimo chaosas
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 pt-4">
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    Su užklausomis susisiekiama po kelių valandų arba net dienų
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    Sudegintos valandos bendraujant su nekvalifikuotais klientais
                  </li>
                  <li className="flex items-start gap-2.5">
                    <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    Pamiršti priminimai ir išmėtyti kontaktai tarp skirtingų platformų
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#E0F2E8] to-[#F0F9F4] rounded-3xl overflow-hidden border border-[#1d8263]/20 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.18)]">
              <div className="px-6 pt-6 pb-4">
                <h3 className="text-xl font-extrabold text-slate-900 mb-4">Su Dirbtiniu Intelektu</h3>
              </div>
              <div className="bg-gradient-to-b from-[#E0F2E8] to-[#F0F9F4] px-5 pt-0 pb-4">
                <div className="h-[190px] flex items-center justify-center">
                  <div className="rounded-2xl bg-white border border-[#1d8263]/20 shadow-sm p-3 w-full">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-slate-700">
                        Kalendorius
                      </div>
                      <div className="text-[11px] font-bold text-[#1d8263]">
                        3 įvykiai
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-7 gap-2">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-5 rounded-md ${
                            [4, 9, 12].includes(i)
                              ? "bg-[#1d8263]"
                              : "bg-slate-100"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-3 space-y-2">
                      {["Jonas • rytoj 11:00", "Aistė • ketv. 14:00"].map((t) => (
                        <div
                          key={t}
                          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#1d8263]" />
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 pt-4">
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1d8263] shrink-0 mt-0.5" />
                    Su kiekviena užklausa susisiekiama per vieną minutę, 24/7
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1d8263] shrink-0 mt-0.5" />
                    Klientai automatiškai atfiltruojami, karščiausi perduodami vadybai
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1d8263] shrink-0 mt-0.5" />
                    Visi kontaktai vienoje vietoje, aiškus pardavimų procesas
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* WHY US */}
        <section className="space-y-8">
          <SectionHeading 
            badge="Kodėl įmonės renkasi Akseler" 
            title={
              <>
                Siekiame didžiausios grąžos<br />
                iš kiekvieno kontakto
              </>
            }
          />
          <div className="bg-gradient-to-b from-[#E0F2E8] to-[#F0F9F4] rounded-3xl border border-[#1d8263]/20 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.14)]">
            {[
              {
                title: "Daugiau pardavimų",
                text: "Daugiau užklausų tampa pardavimais dėl greitos ir kokybiškos komunikacijos su kiekvienu kontaktu.",
                icon: TrendingUp,
              },
              {
                title: "Sutaupytas laikas",
                text: "Jums nebereikia skambinti visiems. AI pats bendrauja, užduoda klausimus ir perduoda tik rimtus klientus.",
                icon: Timer,
              },
              {
                title: "Prognozuojamas augimas",
                text: "Nesvarbu ar gausite 100 ar 1000 užklausų, automatizuota sistema išlaikys kokybišką aptarnavimą.",
                icon: Sprout,
              },
            ].map((c, idx, arr) => (
              <div key={c.title} className="p-5 md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#1d8263]/10 border border-[#1d8263]/15 flex items-center justify-center flex-shrink-0">
                      <c.icon className="w-5 h-5 text-[#1d8263]" />
                    </div>
                    <div className="font-extrabold text-slate-900 text-base md:text-lg">
                      {c.title}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-[15px] md:text-base text-slate-600 leading-relaxed">
                  {c.text}
                </div>
                {idx < arr.length - 1 ? (
                  <div className="mt-5 h-px bg-[#1d8263]/15" />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* MARKETS */}
        <section className="space-y-8">
          <SectionHeading
            badge="Kam tai skirta"
            title={
              <>
                Sprendimas pritaikytas įvairiems<br />
                paslaugų sektoriams
              </>
            }
          />
          <div className="rounded-3xl overflow-hidden">
            <MarketsScrolling hideTitle compact />
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          ref={finalCtaRef}
          className="bg-gradient-to-br from-[#1d8263] via-[#167a5a] to-[#0f5f46] rounded-3xl p-10 md:p-12 text-center text-white shadow-xl shadow-[#1d8263]/20 space-y-7 relative overflow-hidden"
          style={{ paddingTop: '60px', paddingBottom: '60px' }}
        >
          <div className="relative z-10 space-y-8">
            <div className="mx-auto w-fit px-4 py-2 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold uppercase tracking-widest">
              Paskutinis žingsnis
            </div>
            <h2 className="text-[5.5vw] sm:text-[4.5vw] md:text-[36px] font-extrabold tracking-tight leading-[1.2]">
              Kad gautūmėt pastovų ir<br />
              kokybišką klientų srautą,<br />
              jums reikia plano
            </h2>
            <div className="space-y-4">
              <Link href="/survey">
                <a className="block w-full bg-white text-[#1d8263] font-extrabold py-4 rounded-xl shadow-2xl hover:bg-slate-50 transition-colors active:scale-[0.98] text-base md:text-lg whitespace-nowrap">
                  Registruotis pokalbiui
                </a>
              </Link>
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-white/80 whitespace-nowrap">
                <motion.div
                  className="w-2 h-2 rounded-full bg-white"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <span>Kiekvieną mėnesį apsiemame po 2 klientus</span>
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </section>
      </main>

      {/* Hidden iframe for pre-loading - positioned off-screen */}
      {!showFallbackModal && (
      <div 
        className="fixed"
        style={{ 
          left: '-9999px', 
          top: '-9999px', 
          width: '1px', 
          height: '1px',
          overflow: 'hidden',
            visibility: 'hidden',
            pointerEvents: 'none'
        }}
      >
        <iframe
          ref={iframeRef}
          src="https://player.vimeo.com/video/1140626708?h=58a2a7ce8b&badge=0&autopause=0&quality=1080p&player_id=0&app_id=58479"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ width: '100%', height: '100%' }}
          title="AI Pardavimų ir marketingo sistema"
          allowFullScreen
        ></iframe>
      </div>
      )}

      {/* Fallback Modal - only shown when native fullscreen fails */}
      {showFallbackModal && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={handleCloseFallback}
        >
          <button 
            className="absolute top-4 right-4 text-white z-50 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            onClick={handleCloseFallback}
          >
            <X className="w-8 h-8" />
          </button>
          <div 
            className="w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '56.25% 0 0 0', position: 'relative' }} className="w-full max-w-4xl">
              <iframe
                key="modal-video" // Force reload to ensure fresh player
                src="https://player.vimeo.com/video/1140626708?h=58a2a7ce8b&badge=0&autopause=0&quality=1080p&autoplay=1&player_id=0&app_id=58479"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                title="AI Pardavimų ir marketingo sistema"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Sticky CTA (shows when Results section is visible) */}
      <AnimatePresence>
        {showStickyCta && !hideStickyOnFinal && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 z-50"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            <div className="pointer-events-none h-16 bg-gradient-to-t from-white via-white/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pointer-events-none" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
              <div className="w-full max-w-[720px] pointer-events-auto">
                <Link href="/survey">
                  <a className="block w-full bg-[#1d8263] text-white font-extrabold py-4 rounded-xl shadow-lg shadow-[#1d8263]/25 text-center active:scale-[0.98] transition-transform">
                    Registruotis strateginiui pokalbiui
                  </a>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
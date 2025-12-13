import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MarketsScrolling from "@/components/MarketsScrolling";
import { trackPageView } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Smartphone,
  Timer,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Link } from "wouter";
import useEmblaCarousel from "embla-carousel-react";
import { SiFacebook } from "react-icons/si";
import veeslaLogo from "@assets/2_1763670424934.png";
import energija24Logo from "@assets/energija transparent.png";
import specdarbaiLogo from "@assets/3_1763670424934.png";

const badgeGreen =
  "px-4 py-1.5 text-[10px] font-bold border-2 border-[#1d8263]/25 bg-[#1d8263]/5 text-[#1d8263] uppercase tracking-widest rounded-full";

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
      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
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
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="text-center space-y-3"
    >
      <div className="flex justify-center">
        <Badge variant="outline" className={badgeGreen}>
          {badge}
        </Badge>
      </div>
      <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
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

function RotatingTrust() {
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
    <div className="pt-2 flex flex-col items-center justify-center gap-2">
      <div className="text-[11px] font-semibold text-white/60">
        Mumis pasitiki rinkos lyderiai
      </div>
      <div className="h-9 w-[190px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={items[idx].name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <img
              src={items[idx].logo}
              alt={items[idx].name}
              className="h-8 w-auto object-contain opacity-70 brightness-0 invert"
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
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
      className="bg-gradient-to-b from-[#F3FBF6] to-white rounded-2xl overflow-hidden shadow-[0_18px_40px_-22px_rgba(0,0,0,0.14)] border border-[#1d8263]/12 relative"
    >
      <div className="relative bg-gradient-to-b from-[#F3FBF6] to-white px-5 pt-5 pb-4">
        <div className="absolute right-[-10px] bottom-[-30px] text-[160px] font-black text-slate-200/40 leading-none select-none pointer-events-none z-0">
          {step}
        </div>
        <div className="relative z-10">{visual}</div>
      </div>
      <div className="px-6 pb-6 pt-4 relative z-10">
        <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">{description}</p>
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
              Reklamos turinys
            </div>
            <div className="w-2 h-2 rounded-full bg-[#1d8263]/50" />
          </div>
          <div className="p-3 pt-3">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Video
            </div>
            <div className="mt-2 h-2 w-24 bg-slate-200 rounded-full" />
            <div className="mt-2 h-2 w-16 bg-slate-100 rounded-full" />
            <div className="mt-3 h-[74px] bg-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(29,130,99,0.18),transparent_50%)]" />
              <div className="relative w-10 h-10 rounded-full bg-white/80 border border-slate-200 flex items-center justify-center">
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-[#1d8263] border-b-[6px] border-b-transparent ml-0.5" />
              </div>
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
              Pardavimų svetainė
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
  // 0: FB Blink
  // 1: FB Dot Moving -> SMS msg
  // 2: Web Blink
  // 3: Web Dot Moving -> SMS msg
  // 4: Idle

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
              t = setTimeout(run, 2000);
            }, 1800);
          }, 800);
        }, 1800);
      }, 800);
    };
    run();
    return () => clearTimeout(t);
  }, []);

  const fbActive = stage === 0;
  const webActive = stage === 2;
  const fbDot = stage === 1;
  const webDot = stage === 3;
  const showMsg = stage === 1 || stage === 3 || stage === 4;

  return (
    <div className="h-[210px] flex items-center justify-center">
      <div className="w-full max-w-[360px]">
        <div className="relative rounded-2xl bg-white border border-slate-200 shadow-sm p-4 overflow-hidden h-[190px]">
          {/* Sources */}
          <div className="absolute left-4 top-4 flex flex-col gap-8">
            {/* Facebook Box */}
            <motion.div
              animate={{
                scale: fbActive ? 1.05 : 1,
                borderColor: fbActive ? "#1877F2" : "#e2e8f0",
                backgroundColor: fbActive ? "#F0F7FF" : "#F8FAFC",
              }}
              transition={{ duration: 0.3 }}
              className="w-[110px] rounded-xl border px-2 py-2 z-10 relative"
            >
              <div className="flex items-center justify-between">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                  Facebook
                </div>
                <SiFacebook className="w-3 h-3 text-[#1877F2]" />
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="h-1.5 rounded-full bg-slate-300 w-[70%]" />
                <div className="h-1.5 rounded-full bg-slate-200 w-[50%]" />
              </div>
            </motion.div>

            {/* Website Box */}
            <motion.div
              animate={{
                scale: webActive ? 1.05 : 1,
                borderColor: webActive ? "#1d8263" : "#e2e8f0",
                backgroundColor: webActive ? "#F3FBF6" : "#F8FAFC",
              }}
              transition={{ duration: 0.3 }}
              className="w-[110px] rounded-xl border px-2 py-2 z-10 relative"
            >
              <div className="flex items-center justify-between">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
                  Svetainė
                </div>
                <Globe className="w-3 h-3 text-[#1d8263]" />
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="h-1.5 rounded-full bg-slate-300 w-[60%]" />
                <div className="h-1.5 rounded-full bg-slate-200 w-[40%]" />
              </div>
            </motion.div>
          </div>

          {/* SMS */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-[130px] rounded-2xl bg-white border border-[#1d8263]/20 shadow-sm p-3 z-10">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#1d8263]">
                SMS
              </div>
              <Smartphone className="w-4 h-4 text-[#1d8263]" />
            </div>
            <div className="mt-2 rounded-xl border border-[#1d8263]/15 bg-[#1d8263]/8 p-2 text-[9px] text-slate-700 min-h-[40px] flex items-center">
              <AnimatePresence mode="wait">
                {showMsg ? (
                  <motion.div
                    key="msg"
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="font-medium leading-tight"
                  >
                    Sveiki! Gavome Jūsų užklausą.
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 0.4 }}
                  >
                    Laukiama...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Flow lines (Curved & Merging) */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="w-full h-full">
              <defs>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1d8263" stopOpacity="0" />
                  <stop offset="50%" stopColor="#1d8263" stopOpacity="1" />
                  <stop offset="100%" stopColor="#1d8263" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Background Paths */}
              <path
                d="M 125 50 C 160 50, 160 95, 190 95"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 125 140 C 160 140, 160 95, 190 95"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M 190 95 L 230 95"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Animated Electricity/Flow Effect */}
              {/* FB Flow */}
              <motion.path
                d="M 125 50 C 160 50, 160 95, 190 95"
                fill="none"
                stroke="#1d8263"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  fbActive || fbDot
                    ? { pathLength: [0, 1, 1], opacity: [0, 1, 0], pathOffset: [0, 0, 1] }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={{ duration: 1.5, ease: "linear", times: [0, 0.5, 1] }}
              />

              {/* Web Flow */}
              <motion.path
                d="M 125 140 C 160 140, 160 95, 190 95"
                fill="none"
                stroke="#1d8263"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  webActive || webDot
                    ? { pathLength: [0, 1, 1], opacity: [0, 1, 0], pathOffset: [0, 0, 1] }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={{ duration: 1.5, ease: "linear", times: [0, 0.5, 1] }}
              />

              {/* Common SMS Flow (Triggered by either) */}
              <motion.path
                d="M 190 95 L 230 95"
                fill="none"
                stroke="#1d8263"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={
                  fbDot || webDot
                    ? { pathLength: [0, 1, 1], opacity: [0, 1, 0], pathOffset: [0, 0, 1] }
                    : { pathLength: 0, opacity: 0 }
                }
                transition={{ duration: 1.5, ease: "linear", delay: 0.2, times: [0, 0.5, 1] }}
              />

              {/* Merge Dot */}
              <circle cx="190" cy="95" r="3" fill="#cbd5e1" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Visual() {
  const steps = useMemo(
    () => [
      { label: "Informacija surinkta" },
      { label: "Klientas rimtai nusiteikęs" },
      { label: "Pasiūlytas laikas" },
      { label: "Pokalbis arba vizitas suplanuotas" },
    ],
    []
  );

  const [s, setS] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setS((v) => (v + 1) % steps.length), 2000);
    return () => clearInterval(t);
  }, [steps.length]);

  return (
    <div className="h-[210px] flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-[360px] overflow-hidden">
        <AnimatePresence mode="wait">
          {s < 3 ? (
            <motion.div
              key={steps[s].label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="h-[190px] flex items-center justify-center"
            >
              <div className="w-full max-w-[320px] rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-700">
                    {s === 0 ? "Info surinkta" : s === 1 ? "Kvalifikacija" : "Pasiūlytas laikas"}
                  </div>
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {s + 1}
                  </div>
                </div>

                {s === 0 ? (
                  <div className="mt-3 space-y-2">
                    {["Poreikis", "Biudžetas", "Kontaktai"].map((t) => (
                      <div
                        key={t}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px]"
                      >
                        <span className="font-semibold text-slate-700">{t}</span>
                        <CheckCircle2 className="w-4 h-4 text-[#1d8263]" />
                      </div>
                    ))}
                  </div>
                ) : s === 1 ? (
                  <div className="mt-3 rounded-xl border border-[#1d8263]/20 bg-[#1d8263]/6 px-3 py-3">
                    <div className="text-[12px] font-bold text-[#1d8263]">
                      Klientas rimtai nusiteikęs
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">
                      Atitinka kriterijus, galima planuoti pokalbį / vizitą
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {["Rytoj 11:00", "Ket 14:00", "Pen 10:00"].map((t) => (
                      <div
                        key={t}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-700"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold">{t}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="h-[190px] rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-col"
            >
              <div className="flex items-center justify-between shrink-0">
                <div className="text-[11px] font-bold text-slate-700">
                  Mini kalendorius
                </div>
                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  4
                </div>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1.5 shrink-0">
                {Array.from({ length: 14 }).map((_, i) => {
                  const isEvent = i === 9;
                  return (
                    <div
                      key={i}
                      className={`h-4 rounded-md ${
                        isEvent ? "bg-[#1d8263]" : "bg-slate-100"
                      }`}
                    />
                  );
                })}
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 min-h-0 flex-1 flex flex-col justify-center">
                <div className="text-[11px] font-bold text-slate-800 truncate">
                  Jonas • Rytoj 11:00 • Pokalbis
                </div>
                <div className="mt-0.5 text-[10px] text-slate-600 truncate opacity-80">
                  Kontaktai + kriterijai patvirtinti
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-700 font-semibold shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1d8263]" />
                {steps[s].label}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
    <section ref={sectionRef} className="space-y-8">
      <SectionHeading
        badge="Rezultatai"
        title="Skaičiai kalba patys už save"
      />

      {/* Desktop grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {results.map((r) => (
          <div
            key={r.company}
            className="bg-gradient-to-b from-[#F3FBF6] to-white rounded-3xl border border-[#1d8263]/12 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.18)] p-6"
          >
            <div className="flex flex-col items-center gap-2 text-center">
              <img
                src={r.logo}
                alt={r.company}
                className="h-8 w-auto object-contain opacity-90"
              />
              <div className="text-[11px] text-slate-400 font-medium">
                {r.revenue}
              </div>
            </div>
            <div className="my-5 h-px bg-slate-100" />
            <div className="text-center">
              <div className="text-5xl font-extrabold text-[#1d8263]">
                {r.stat}
              </div>
              <div className="mt-3 text-base font-bold text-slate-900">
                {r.desc}
              </div>
              <div className="mt-1 text-sm text-slate-500">{r.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile swipe */}
      <div className="md:hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {results.map((r, idx) => (
              <div key={r.company} className="flex-[0_0_88%] min-w-0">
                <div className="bg-gradient-to-b from-[#F3FBF6] to-white rounded-3xl border border-[#1d8263]/12 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.18)] p-6">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <img
                      src={r.logo}
                      alt={r.company}
                      className="h-8 w-auto object-contain opacity-90"
                    />
                    <div className="text-[11px] text-slate-400 font-medium">
                      {r.revenue}
                    </div>
                  </div>
                  <div className="my-5 h-px bg-slate-100" />
                  <div className="text-center">
                    <div className="text-5xl font-extrabold text-[#1d8263]">
                      {r.stat}
                    </div>
                    <div className="mt-3 text-base font-bold text-slate-900">
                      {r.desc}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{r.sub}</div>
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

export default function TestLandingPage() {
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
    trackPageView("/test");
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
    if (!playerRef.current || !playerReadyRef.current) {
      // Player not ready, show fallback modal
      setShowFallbackModal(true);
      return;
    }

    try {
      // Set volume and play immediately in the click handler
      await playerRef.current.setVolume(1);
      await playerRef.current.play();
      
      // Request fullscreen immediately - this must be in the same user gesture
      await playerRef.current.requestFullscreen();
    } catch (e) {
      console.log('Fullscreen not available, using fallback modal:', e);
      // Fullscreen failed (iOS/Safari), show fallback modal
      setShowFallbackModal(true);
      
      // Try to play in modal
      try {
        await playerRef.current.setVolume(1);
        await playerRef.current.play();
      } catch (playError) {
        console.log('Video playback error:', playError);
      }
    }
  }, []);

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

      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 pt-24 pb-28 space-y-16">
        {/* HERO */}
        <section ref={heroRef} className="space-y-9 text-center">
          <div className="space-y-5 px-2 py-6">
            <div className="flex justify-center">
              <Badge variant="outline" className={badgeGreen}>
                Paslaugos teikėjai
              </Badge>
            </div>
            <h1 className="text-[24px] sm:text-3xl md:text-[40px] font-extrabold leading-[1.18] tracking-tight text-slate-900 max-w-[560px] mx-auto">
              Gaukite AI pardavimų sistemą,<br className="md:hidden" />{" "}
              kuri mūsų klientams atneša<br className="md:hidden" />{" "}
              10x grąžą iš reklamos biudžeto
            </h1>
            <p className="text-base text-slate-600 max-w-[500px] mx-auto leading-relaxed">
              Jokių mėnesinių įsipareigojimų, mokate tik už suplanuotus pokalbius arba vizitus.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#1d8263] via-[#167a5a] to-[#0f5f46] rounded-3xl p-6 md:p-8 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] space-y-6 relative overflow-hidden">
            <h2 className="text-lg font-extrabold text-white relative z-10">
              Kaip parduodate savo paslaugas?
            </h2>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <button className="group relative rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-200 p-5 flex flex-col items-center justify-center gap-3 text-center active:scale-[0.98]">
                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-inner">
                  <Phone className="w-7 h-7 text-white" />
                </div>
                <span className="font-bold text-sm text-white transition-colors">
                  Nuotoliniu būdu
                </span>
              </button>

              <button className="group relative rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-200 p-5 flex flex-col items-center justify-center gap-3 text-center active:scale-[0.98]">
                <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-inner">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <span className="font-bold text-sm text-white transition-colors">
                  Gyvai vietoje
                </span>
              </button>
            </div>

            <div className="relative z-10">
              <RotatingTrust />
            </div>

            {/* Background blur effects similar to footer */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />
          </div>
        </section>

        {/* VIDEO + HOW IT WORKS (4 steps) */}
        <section className="space-y-8">
          <AnimatedSectionHeading
            badge="4 žingsnių formulė"
            title="Kaip veikia AI pardavimų sistema"
          />

          <div className="bg-white rounded-3xl p-3 shadow-md border border-slate-100">
            <div 
              className="aspect-video w-full rounded-2xl overflow-hidden relative group cursor-pointer bg-gradient-to-br from-[#1d8263] via-[#167a5a] to-[#0f5f46]"
              onClick={handlePlayClick}
            >
              {/* Subtle geometric pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-1/4 right-0 w-24 h-24 border-2 border-white rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-1/3 w-20 h-20 border-2 border-white rounded-full translate-x-1/2 translate-y-1/2" />
              </div>
              
              {/* Subtle grid pattern */}
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} />
              
              {/* Button text instead of play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.button
                  className="bg-white/80 hover:bg-white/90 text-[#1d8263] font-extrabold px-8 py-4 rounded-xl shadow-2xl transition-all active:scale-[0.98]"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <span className="opacity-100">Žiūrėti pristatymą</span>
                </motion.button>
              </div>
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <StepCard
              step="1"
              title="Sutvarkome užklausų srautą"
              description="Atliksime detalų jūsų turinio ir svetainės auditą ir, jei reikės, sukursime naują strategiją pastoviam užklausų srautui."
              visual={<Step1Visual />}
              index={0}
            />
            <StepCard
              step="2"
              title="Ištreniruojame jūsų AI Agentą"
              description="Jis momentaliai susisieks su naujomis užklausomis, pasirūpins klientų kvalifikacija ir informacijos surinkimu."
              visual={<Step2Visual />}
              index={1}
            />
            <StepCard
              step="3"
              title="Gaunate pokalbius arba vizitus"
              description="Jei klientas rimtai nusiteikęs, pasiūlys jam pokalbį su jūsų komanda arba vizitą jūsų lokacijoje – ir suplanuos įvykį kalendoriuje."
              visual={<Step3Visual />}
              index={2}
            />
            <StepCard
              step="4"
              title='Nepasiruošę "šildomi"'
              description='Jei klientas dar nepasiruošęs, sistema jį „šildo" informatyviu turiniu ir po kurio laiko vėl inicijuoja pokalbį.'
              visual={<Step4Visual />}
              index={3}
            />
          </div>
        </section>

        {/* RESULTS (same as old, restyled for /test) */}
        <TestResults sectionRef={resultsSectionRef} />

        {/* COMPARISON */}
        <section className="space-y-8">
          <SectionHeading
            badge="Palyginimas"
            title="Kaip šiandien vyksta pardavimai"
          />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.18)]">
              <div className="bg-gradient-to-b from-[#EAF7F1] to-white px-5 pt-5 pb-4">
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
                    Rankinis užklausų apdorojimas greitai virsta chaosu
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 pt-4">
                <h3 className="text-xl font-extrabold text-slate-900">Rankinis būdas</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                    Atsakoma po kelių valandų ar dienų
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                    Kontaktai pasimeta tarp Excel, Messenger ir el. pašto
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                    Skambinama „kai yra laiko“, ne kai klientas karštas
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden border border-[#1d8263]/15 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.18)]">
              <div className="bg-gradient-to-b from-[#EAF7F1] to-white px-5 pt-5 pb-4">
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
                      {["Jonas • rytoj 11:00", "Aistė • ket 14:00"].map((t) => (
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
                <h3 className="text-xl font-extrabold text-slate-900">Su AI sistema</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1d8263] shrink-0 mt-0.5" />
                    Atsakymas per 60 sekundžių, 24/7
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1d8263] shrink-0 mt-0.5" />
                    AI kvalifikuoja ir renka informaciją automatiškai
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1d8263] shrink-0 mt-0.5" />
                    Mokate už suplanuotus pokalbius arba vizitus
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
          <div className="bg-gradient-to-b from-[#F3FBF6] to-white rounded-3xl border border-[#1d8263]/12 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.14)]">
            {[
              {
                title: "Didesnis pardavimų rodiklis",
                text: "Kai klientas palieka užklausą, sistema susisiekia iškart. Daugiau žmonių atsako ir ateina į pokalbį.",
                icon: TrendingUp,
              },
              {
                title: "Sutaupytas laikas",
                text: "Jums nebereikia skambinti visiems. AI pats bendrauja, užduoda klausimus ir perduoda tik rimtus klientus.",
                icon: Timer,
              },
              {
                title: "Mokate tik už rezultatus",
                text: "Mokate už suplanuotus strateginius pokalbius arba vizitus – kai realiai atsiranda įvykis jūsų kalendoriuje.",
                icon: Wallet,
              },
            ].map((c, idx, arr) => (
              <div key={c.title} className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#1d8263]/10 border border-[#1d8263]/15 flex items-center justify-center flex-shrink-0">
                      <c.icon className="w-5 h-5 text-[#1d8263]" />
                    </div>
                    <div className="font-extrabold text-slate-900 truncate">
                      {c.title}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-slate-500 leading-relaxed">
                  {c.text}
                </div>
                {idx < arr.length - 1 ? (
                  <div className="mt-6 h-px bg-slate-100" />
                ) : null}
              </div>
            ))}
          </div>
        </section>

        {/* MARKETS */}
        <section className="space-y-8">
          <SectionHeading
            badge="Kam tai skirta"
            title="Pritaikoma įvairiose rinkose"
          />
          <div className="bg-gradient-to-b from-[#F3FBF6] to-white rounded-3xl border border-[#1d8263]/12 shadow-[0_18px_40px_-22px_rgba(0,0,0,0.14)] p-2">
            <MarketsScrolling hideTitle compact />
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          ref={finalCtaRef}
          className="bg-gradient-to-br from-[#1d8263] via-[#167a5a] to-[#0f5f46] rounded-3xl p-10 md:p-12 text-center text-white shadow-xl shadow-[#1d8263]/20 space-y-7 relative overflow-hidden"
          style={{ paddingTop: '80px', paddingBottom: '80px' }}
        >
          <div className="relative z-10 space-y-8">
            <div className="mx-auto w-fit px-4 py-2 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold uppercase tracking-widest">
              Paskutinis žingsnis
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-[600px] mx-auto">
              Kad gautūmėt pastovų ir kokybišką klientų srauta, jums reikia plano
            </h2>
            <div className="space-y-4">
              <Link href="/survey">
                <a className="block w-full bg-white text-[#1d8263] font-extrabold py-4 rounded-xl shadow-2xl hover:bg-slate-50 transition-colors active:scale-[0.98] text-lg">
                  Registruotis strateginiui pokalbiui
                </a>
              </Link>
              <div className="flex items-center justify-center gap-2 text-sm text-white/80">
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
      <div 
        className="fixed"
        style={{ 
          left: '-9999px', 
          top: '-9999px', 
          width: '1px', 
          height: '1px',
          overflow: 'hidden',
          visibility: showFallbackModal ? 'hidden' : 'visible'
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
          >
            <div className="pointer-events-none h-20 bg-gradient-to-t from-white/75 via-white/35 to-transparent backdrop-blur-sm" />
            <div className="absolute inset-x-0 bottom-3 flex justify-center px-4 pointer-events-none">
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
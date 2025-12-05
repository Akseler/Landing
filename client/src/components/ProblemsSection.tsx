import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useInView } from "framer-motion";

// 1. Conversion Chart - Clean & Aligned
function ConversionChart() {
  return (
    <div className="h-48 flex flex-col justify-end items-center w-full px-4 pb-2">
      <div className="flex items-end justify-center gap-16 w-full relative h-32 border-b border-foreground/10">
        {/* Human Bar */}
        <div className="flex flex-col items-center w-16 relative z-10">
          <div className="relative w-full flex items-end justify-center h-32 group">
            <div className="absolute -top-6 text-[10px] text-foreground/40 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300">~15%</div>
            <div className="w-full bg-gradient-to-t from-foreground/10 to-foreground/5 rounded-t-sm animate-[grow-bar_1.5s_cubic-bezier(0.4,0,0.2,1)_forwards] origin-bottom backdrop-blur-sm border border-foreground/5" style={{ height: '30%' }}></div>
          </div>
        </div>
        
        {/* AI Bar */}
        <div className="flex flex-col items-center w-16 relative z-10">
          <div className="relative w-full flex items-end justify-center h-32 group">
             <div className="absolute -top-6 text-[10px] text-[#1d8263] font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300">~40%</div>
            <div className="w-full bg-gradient-to-t from-[#1d8263] to-[#2dd4a0] rounded-t-sm animate-[grow-bar_1.5s_cubic-bezier(0.4,0,0.2,1)_0.3s_forwards] origin-bottom shadow-[0_0_20px_rgba(29,130,99,0.2)]" style={{ height: '85%' }}></div>
          </div>
        </div>
      </div>
      
      {/* Labels below line */}
      <div className="flex justify-center gap-16 w-full mt-2">
        <span className="text-[11px] text-foreground/50 font-medium uppercase tracking-wider w-16 text-center">Žmogus</span>
        <span className="text-[11px] text-[#1d8263] font-bold uppercase tracking-wider w-16 text-center">AI</span>
      </div>
    </div>
  );
}

// 2. Costs Chart - Clean contrast
function CostsChart() {
  return (
    <div className="h-48 flex items-center justify-center w-full relative overflow-hidden">
      <svg className="w-full h-32" viewBox="0 0 200 100" preserveAspectRatio="none">
        {/* Grid lines */}
        <line x1="0" y1="20" x2="200" y2="20" stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />
        <line x1="0" y1="50" x2="200" y2="50" stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />
        <line x1="0" y1="80" x2="200" y2="80" stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />

        {/* Human Line - Volatile & High */}
        <path
          d="M0,30 C30,15 60,45 90,25 S150,40 200,20"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="2"
          className="animate-[draw-line_2s_ease-out_forwards]"
          strokeDasharray="300"
          strokeDashoffset="300"
        />
        
        {/* AI Line - Stable & Low - Thicker and Glowing */}
        <path
          d="M0,80 C50,80 100,80 200,80"
          fill="none"
          stroke="#1d8263"
          strokeWidth="3"
          className="animate-[draw-line_2s_ease-out_0.5s_forwards] drop-shadow-[0_0_8px_rgba(29,130,99,0.4)]"
          strokeDasharray="300"
          strokeDashoffset="300"
        />
        
        {/* Animated Dots at the end */}
        <circle cx="200" cy="20" r="3" className="fill-foreground/30 animate-[fade-in_0.5s_ease-out_2s_forwards] opacity-0" />
        <circle cx="200" cy="80" r="4" className="fill-[#1d8263] animate-[fade-in_0.5s_ease-out_2.5s_forwards] opacity-0 shadow-lg" />
      </svg>
      
      {/* Legend */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 bg-background/50 backdrop-blur-[2px] p-2 rounded-md border border-foreground/5">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-foreground/40 uppercase">Žmogus</span>
          <div className="w-2 h-0.5 bg-foreground/30"></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[#1d8263] uppercase font-bold">AI</span>
          <div className="w-2 h-0.5 bg-[#1d8263]"></div>
        </div>
      </div>
    </div>
  );
}

// 3. Growth Control - Updated text & number
function GrowthControlNetwork() {
  return (
    <div className="h-48 flex items-center justify-center w-full relative overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Central AI Hub */}
        <div className="relative z-10">
          <div className="w-6 h-6 bg-[#1d8263] rounded-full shadow-[0_0_25px_#1d8263] animate-[pulse-scale_3s_ease-in-out_infinite] flex items-center justify-center">
             <div className="w-2 h-2 bg-white/80 rounded-full"></div>
          </div>
          <div className="absolute -inset-6 border border-[#1d8263]/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
          <div className="absolute -inset-12 border border-[#1d8263]/10 rounded-full animate-[spin_25s_linear_infinite_reverse]"></div>
        </div>

        {/* Orbiting Particles */}
        <div className="absolute w-40 h-40 animate-[spin_30s_linear_infinite]">
           <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-[#1d8263] rounded-full -translate-x-1/2 shadow-[0_0_10px_#1d8263]"></div>
           <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-[#1d8263] rounded-full -translate-x-1/2"></div>
        </div>
        
        <div className="absolute w-28 h-28 animate-[spin_20s_linear_infinite_reverse] opacity-60">
           <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-[#2dd4a0] rounded-full -translate-y-1/2"></div>
           <div className="absolute right-0 top-1/2 w-1.5 h-1.5 bg-[#2dd4a0] rounded-full -translate-y-1/2"></div>
        </div>
        
         {/* Label */}
         <div className="absolute bottom-4 flex flex-col items-center bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-[#1d8263]/20">
            <span className="text-[10px] text-[#1d8263] font-bold uppercase tracking-wider">1000+ / dieną</span>
         </div>
      </div>
    </div>
  );
}

export default function ProblemsSection() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: "start",
    containScroll: "trimSnaps"
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const benefits = [
    {
      id: 1,
      title: "Aukštesnė konversija",
      visual: <ConversionChart />,
      description: "Aukštesnė konversija ir daugiau pardavimų dėl nuoseklaus, žmogiško ir ilgalaikio ryšio su kiekvienu kontaktu."
    },
    {
      id: 2,
      title: "Mažesnės išlaidos",
      visual: <CostsChart />,
      description: "Šimtai sutaupytų valandų kiekvieną mėnesį ir daugiau laiko tikram pardavimui, o ne rankiniams procesams ir administravimui."
    },
    {
      id: 3,
      title: "Augimo kontrolė",
      visual: <GrowthControlNetwork />,
      description: "Didesnės užklausų apimtys be reklamos biudžeto deginimo ir papildomų etatų samdymo, apmokymo bei priežiūros."
    }
  ];

  return (
    <section ref={sectionRef} className="pt-16 md:pt-20 pb-20 md:pb-24 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-block mb-4 md:mb-5">
            <Badge 
              variant="outline" 
              className="px-6 py-2 text-sm font-semibold border-2 border-[#1d8263]/30 bg-[#1d8263]/5 text-[#1d8263]"
              data-testid="badge-situation"
            >
              KODĖL AI DARBUOTOJAI
            </Badge>
          </div>
          
          <h2 className="text-[24px] sm:text-3xl md:text-[32px] lg:text-[36px] font-bold mb-0 leading-tight" data-testid="text-problems-title">
            Išgauname maksimalią grąžą<br className="hidden md:block" />
            <span className="inline-block relative">
              <span className="relative z-10 text-foreground px-4 py-1">iš kiekvieno kontakto.</span>
              <span className="absolute inset-0 bg-[#1d8263]/20 -skew-x-6 rounded-lg transform translate-y-1 -mx-2"></span>
            </span>
          </h2>
        </motion.div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.id}
                  className="flex-[0_0_85%] min-w-0"
                  data-testid={`benefit-card-mobile-${index + 1}`}
                >
                  <Card className="border-2 border-[#1d8263]/20 bg-gradient-to-br from-[#1d8263]/5 to-transparent h-full">
                    <CardContent className="p-5 flex flex-col h-full">
                      <h3 className="text-lg font-bold mb-2" data-testid={`text-problem-${index + 1}-title`}>
                        {benefit.title}
                      </h3>
                      
                      <div className="flex-grow flex items-center justify-center py-2 min-h-[200px]">
                        {benefit.visual}
                      </div>
                      
                      <p className="text-[14px] text-foreground/70 leading-relaxed mt-auto pt-2" data-testid={`text-problem-${index + 1}-description`}>
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {benefits.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? "w-8 bg-[#1d8263]"
                    : "w-2 bg-[#1d8263]/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => (
            <Card key={benefit.id} className="border-2 border-[#1d8263]/20 bg-gradient-to-br from-[#1d8263]/5 to-transparent h-full" data-testid={`problem-card-${index + 1}`}>
              <CardContent className="p-6 flex flex-col h-full">
                <h3 className="text-lg md:text-xl font-bold mb-4" data-testid={`text-problem-${index + 1}-title`}>
                  {benefit.title}
                </h3>
                
                <div className="flex-grow flex items-center justify-center py-4 min-h-[200px]">
                  {benefit.visual}
                </div>
                
                <p className="text-[14px] md:text-[15px] text-foreground/70 leading-relaxed mt-auto pt-4" data-testid={`text-problem-${index + 1}-description`}>
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

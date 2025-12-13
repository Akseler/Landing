import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, useInView } from "framer-motion";

// 1. Conversion Chart
function ConversionChart() {
  return (
    <div className="h-44 flex flex-col justify-end items-center w-full px-2 pb-2">
      <div className="flex items-end justify-center gap-12 w-full relative h-32 border-b border-foreground/10">
        {/* Human Bar */}
        <div className="flex flex-col items-center w-12 relative z-10">
          <div className="relative w-full flex items-end justify-center h-32 group">
            <div className="absolute -top-5 text-[9px] text-foreground/40 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300">~15%</div>
            <div className="w-full bg-gradient-to-t from-foreground/10 to-foreground/5 rounded-t-[2px] animate-[grow-bar_1.5s_cubic-bezier(0.4,0,0.2,1)_forwards] origin-bottom backdrop-blur-sm border border-foreground/5" style={{ height: '30%' }}></div>
          </div>
        </div>
        
        {/* AI Bar */}
        <div className="flex flex-col items-center w-12 relative z-10">
          <div className="relative w-full flex items-end justify-center h-32 group">
             <div className="absolute -top-5 text-[9px] text-[#1d8263] font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300">~40%</div>
            <div className="w-full bg-gradient-to-t from-[#1d8263] to-[#2dd4a0] rounded-t-[2px] animate-[grow-bar_1.5s_cubic-bezier(0.4,0,0.2,1)_0.3s_forwards] origin-bottom shadow-[0_0_15px_rgba(29,130,99,0.2)]" style={{ height: '85%' }}></div>
          </div>
        </div>
      </div>
      
      {/* Labels below line */}
      <div className="flex justify-center gap-12 w-full mt-1.5">
        <span className="text-[10px] text-foreground/50 font-medium uppercase tracking-wider w-12 text-center">Žmogus</span>
        <span className="text-[10px] text-[#1d8263] font-bold uppercase tracking-wider w-12 text-center">AI</span>
      </div>
    </div>
  );
}

// 2. Costs Chart - Labels below, Title above
function CostsChart() {
  return (
    <div className="h-44 flex flex-col items-center justify-center w-full relative">
       {/* Title indicating what this chart shows */}
       <div className="absolute top-0 left-0 w-full text-center">
          <span className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest">Išlaidos</span>
       </div>

      <div className="h-24 w-full relative flex items-center justify-center mt-4 border-b border-foreground/10">
        <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="20" x2="200" y2="20" stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />
            <line x1="0" y1="50" x2="200" y2="50" stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />
            <line x1="0" y1="80" x2="200" y2="80" stroke="currentColor" strokeOpacity="0.05" strokeDasharray="4 4" />

            {/* Human Line */}
            <path
            d="M0,30 C30,15 60,45 90,25 S150,40 200,20"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1.5"
            className="animate-[draw-line_2s_ease-out_forwards]"
            strokeDasharray="300"
            strokeDashoffset="300"
            />
            
            {/* AI Line */}
            <path
            d="M0,80 C50,80 100,80 200,80"
            fill="none"
            stroke="#1d8263"
            strokeWidth="2.5"
            className="animate-[draw-line_2s_ease-out_0.5s_forwards] drop-shadow-[0_0_6px_rgba(29,130,99,0.3)]"
            strokeDasharray="300"
            strokeDashoffset="300"
            />
            
            {/* Animated Dots */}
            <circle cx="200" cy="20" r="2.5" className="fill-foreground/30 animate-[fade-in_0.5s_ease-out_2s_forwards] opacity-0" />
            <circle cx="200" cy="80" r="3.5" className="fill-[#1d8263] animate-[fade-in_0.5s_ease-out_2.5s_forwards] opacity-0 shadow-lg" />
        </svg>
      </div>
      
      {/* Legend BELOW the line */}
      <div className="flex items-center justify-center gap-8 w-full mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-0.5 bg-foreground/30"></div>
          <span className="text-[9px] text-foreground/40 uppercase font-medium">Žmogus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-0.5 bg-[#1d8263]"></div>
          <span className="text-[9px] text-[#1d8263] uppercase font-bold">AI</span>
        </div>
      </div>
    </div>
  );
}

// 3. Growth Control Network
function GrowthControlNetwork() {
  return (
    <div className="h-44 flex items-center justify-center w-full relative overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Central AI Hub */}
        <div className="relative z-10">
          <div className="w-5 h-5 bg-[#1d8263] rounded-full shadow-[0_0_20px_#1d8263] animate-[pulse-scale_3s_ease-in-out_infinite] flex items-center justify-center">
             <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
          </div>
          <div className="absolute -inset-5 border border-[#1d8263]/20 rounded-full animate-[spin_15s_linear_infinite]"></div>
          <div className="absolute -inset-10 border border-[#1d8263]/10 rounded-full animate-[spin_25s_linear_infinite_reverse]"></div>
        </div>

        {/* Orbiting Particles */}
        <div className="absolute w-32 h-32 animate-[spin_30s_linear_infinite]">
           <div className="absolute top-0 left-1/2 w-1 h-1 bg-[#1d8263] rounded-full -translate-x-1/2 shadow-[0_0_8px_#1d8263]"></div>
           <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-[#1d8263] rounded-full -translate-x-1/2"></div>
        </div>
        
        <div className="absolute w-24 h-24 animate-[spin_20s_linear_infinite_reverse] opacity-60">
           <div className="absolute left-0 top-1/2 w-1 h-1 bg-[#2dd4a0] rounded-full -translate-y-1/2"></div>
           <div className="absolute right-0 top-1/2 w-1 h-1 bg-[#2dd4a0] rounded-full -translate-y-1/2"></div>
        </div>
        
         {/* Label */}
         <div className="absolute bottom-2 flex flex-col items-center bg-background/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-[#1d8263]/20">
            <span className="text-[9px] text-[#1d8263] font-bold uppercase tracking-wider">1000+ / dieną</span>
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
      description: "Šimtai sutaupytų valandų kiekvieną mėnesį ir daugiau laiko tikram pardavimui, o ne administravimui."
    },
    {
      id: 3,
      title: "Augimo kontrolė",
      visual: <GrowthControlNetwork />,
      description: "Didesnės užklausų apimtys be reklamos biudžeto deginimo ir papildomų etatų samdymo ir vadybos."
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
                      
                      <div className="flex items-center justify-center h-44 w-full mb-2">
                        {benefit.visual}
        </div>

                      <p className="text-[14px] text-foreground/70 leading-relaxed mt-auto" data-testid={`text-problem-${index + 1}-description`}>
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
                
                <div className="flex items-center justify-center h-44 w-full mb-4">
                  {benefit.visual}
                </div>
                
                <p className="text-[14px] md:text-[15px] text-foreground/70 leading-relaxed mt-auto" data-testid={`text-problem-${index + 1}-description`}>
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

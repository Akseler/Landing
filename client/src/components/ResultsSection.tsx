import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Badge } from "@/components/ui/badge";
import veeslaLogo from "@assets/2_1763670424934.png";
import energija24Logo from "@assets/1_1763670424934.png";
import specdarbaiLogo from "@assets/3_1763670424934.png";

export default function ResultsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: "start",
    containScroll: "trimSnaps"
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = [
    {
      company: "Energija24",
      revenue: "1,1M. apyvartos 2024m.",
      stat: "140%",
      description: "padidėjęs pardavimų rodiklis",
      subdescription: "dėl greitesnio pardavimų proceso",
      logo: energija24Logo
    },
    {
      company: "Veesla",
      revenue: "22M. apyvartos 2024m.",
      stat: "360+ val.",
      description: "sutaupyta kiekvieną mėnesį",
      subdescription: "automatizavus rankinius procesus",
      logo: veeslaLogo
    },
    {
      company: "Specdarbai",
      revenue: "1,2M. apyvartos 2024m.",
      stat: "2x",
      description: "daugiau apdorojamų užklausų",
      subdescription: "be papildomų darbuotojų samdymo",
      logo: specdarbaiLogo
    }
  ];

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

  return (
    <section className="pt-16 md:pt-20 pb-20 md:pb-24 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-16">
          <div className="mb-4 md:mb-5 flex justify-center">
            <Badge 
              variant="outline" 
              className="text-[#1d8263] border-[#1d8263]/30 bg-[#1d8263]/5 text-sm font-semibold px-6 py-2 uppercase tracking-wide border-2"
            >
              Rezultatai
            </Badge>
          </div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-[32px] lg:text-[36px] font-bold leading-tight"
          >Skaičiai kalba patys už save</motion.h2>
        </div>

        {/* Desktop Grid - Hidden on Mobile */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="border border-border rounded-2xl p-6 bg-white dark:bg-card h-full"
              data-testid={`result-card-${index + 1}`}
            >
              <div className="flex flex-col h-full">
                {/* Header - Company Logo and Revenue */}
                <div className="flex flex-col items-center gap-2 mb-6 text-center">
                  <img 
                    src={result.logo} 
                    alt={result.company}
                    className="h-8 object-contain"
                  />
                  <div className="text-xs text-muted-foreground">
                    {result.revenue}
                  </div>
                </div>

                {/* Divider */}
                <div className="mb-6 -mx-2">
                  <div className="h-px bg-border"></div>
                </div>

                {/* Stat */}
                <div className="flex-1 flex flex-col justify-center text-center">
                  <div className="text-5xl font-bold text-[#1d8263] mb-4">
                    {result.stat}
                  </div>
                  <div className="text-lg font-semibold text-foreground mb-2 leading-tight">
                    {result.description}
                  </div>
                  <div className="text-sm text-muted-foreground leading-snug">
                    {result.subdescription}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex-[0_0_85%] min-w-0"
                  data-testid={`result-card-mobile-${index + 1}`}
                >
                  <div className="border border-border rounded-2xl p-8 bg-white dark:bg-card h-full">
                    <div className="flex flex-col h-full">
                      {/* Header - Company Logo and Revenue */}
                      <div className="flex flex-col items-center gap-3 mb-6">
                        <img 
                          src={result.logo} 
                          alt={result.company}
                          className="h-9 object-contain"
                        />
                        <div className="text-sm text-muted-foreground text-center">
                          {result.revenue}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="mb-8 -mx-4">
                        <div className="h-px bg-border"></div>
                      </div>

                      {/* Stat */}
                      <div className="flex-1 flex flex-col justify-center text-center mb-6">
                        <div className="text-5xl font-bold text-[#1d8263] mb-4">
                          {result.stat}
                        </div>
                        <div className="text-base font-semibold text-foreground mb-2">
                          {result.description}
                        </div>
                        <div className="text-base text-muted-foreground">
                          {result.subdescription}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {results.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? "w-8 bg-foreground"
                    : "w-2 bg-foreground/20"
                }`}
                data-testid={`carousel-dot-${index}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

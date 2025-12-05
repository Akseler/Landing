import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";

export default function ProblemsSection() {
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
      icon: Zap,
      title: "Greita komunikacija",
      description: [
        "Nauji kontaktai gauna momentinį dėmesį – kiekviena užklausa apdorojama per 1 minutę, 24/7.",
        "Seni kontaktai neprarandami. Sistema palaiko ryšį iki pardavimo, net jei klientas nenusipirko iš karto."
      ]
    },
    {
      id: 2,
      icon: Clock,
      title: "Laiko taupymas",
      description: [
        "Jūsų vadybininkai daugiau nešvaisto valandų kalbėdami su šaltais ir nepasiruošusiais klientais.",
        "Sistema automatiškai administruoja, kvalifikuoja ir filtruoja jūsų kontaktus."
      ]
    },
    {
      id: 3,
      icon: TrendingUp,
      title: "Augimo kontrolė",
      description: [
        "Dabar galite drąsiai didinti reklamos biudžetą ir užklausų srautą.",
        "Jums nebūtina samdyti daugiau vadybininkų – sistema automatiškai apdoroja bet kokį užklausų kiekį."
      ]
    }
  ];

  return (
    <section className="pt-16 md:pt-20 pb-20 md:pb-24 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
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
            Išspausime maksimalią grąžą<br className="hidden md:block" />
            <span className="inline-block relative">
              <span className="relative z-10 text-foreground px-4 py-1">iš kiekvieno kontakto.</span>
              <span className="absolute inset-0 bg-[#1d8263]/20 -skew-x-6 rounded-lg transform translate-y-1 -mx-2"></span>
            </span>
          </h2>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={benefit.id}
                    className="flex-[0_0_85%] min-w-0"
                    data-testid={`benefit-card-mobile-${index + 1}`}
                  >
                    <Card className="border-2 border-[#1d8263]/20 bg-gradient-to-br from-[#1d8263]/5 to-transparent h-full">
                      <CardContent className="p-8">
                        <div className="flex gap-4 items-center mb-6">
                          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#1d8263] flex items-center justify-center">
                            <IconComponent className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="text-xl font-bold" data-testid={`text-problem-${index + 1}-title`}>
                            {benefit.title}
                          </h3>
                        </div>
                        
                        <div className="space-y-4 text-[17px] text-foreground/80 leading-relaxed" data-testid={`text-problem-${index + 1}-description`}>
                          {benefit.description.map((text, i) => (
                            <p key={i}>{text}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {benefits.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? "bg-[#1d8263] w-6"
                    : "bg-[#1d8263]/30"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid gap-6 md:grid-cols-1 lg:grid-cols-1 max-w-3xl mx-auto">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card key={benefit.id} className="border-2 border-[#1d8263]/20 bg-gradient-to-br from-[#1d8263]/5 to-transparent" data-testid={`problem-card-${index + 1}`}>
                <CardContent className="p-8">
                  <div className="flex gap-4 items-center mb-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#1d8263] flex items-center justify-center">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold" data-testid={`text-problem-${index + 1}-title`}>
                      {benefit.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-4 text-[17px] md:text-lg text-foreground/80 leading-relaxed" data-testid={`text-problem-${index + 1}-description`}>
                    {benefit.description.map((text, i) => (
                      <p key={i}>{text}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

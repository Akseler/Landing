import { Badge } from "@/components/ui/badge";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function HarvardResearchSection() {
  const chartRef = useRef(null);
  const isInView = useInView(chartRef, { once: true, amount: 0.3 });

  const chartData = [
    { time: "5min", percentage: 82, label: "5min" },
    { time: "15min", percentage: 40, label: "15min" },
    { time: "30min", percentage: 30, label: "30min" },
    { time: "45min", percentage: 25, label: "45min" },
    { time: "60min", percentage: 20, label: "60min" },
  ];

  const maxPercentage = 100;

  return (
    <section className="pt-16 md:pt-20 pb-20 md:pb-24 px-6 lg:px-12" data-testid="section-harvard-research">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="mb-4 md:mb-5 flex justify-center lg:justify-start">
              <Badge 
                variant="outline" 
                className="text-[#1d8263] border-[#1d8263]/30 bg-[#1d8263]/5 text-sm font-semibold px-6 py-2 uppercase tracking-wide border-2"
                data-testid="badge-harvard"
              >
                "Harvard Business" mokslinis tyrimas
              </Badge>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-[32px] lg:text-[36px] font-bold mb-6 md:mb-8 leading-tight" data-testid="text-harvard-title">
              Dėja, bet laikas nėra<br className="md:hidden" /> Jūsų pusėje...
            </h2>

            <div className="space-y-6 text-base md:text-lg text-foreground/80">
              <p data-testid="text-harvard-stat" className="text-[19px]">
                Duomenys rodo, kad naujos užklausos yra beveik{" "}
                <span className="font-bold text-[#1d8263]">395%</span> labiau linkusios tapti klientais, jei su jomis susisiekiama per{" "}
                <span className="underline decoration-[#1d8263] decoration-2 underline-offset-4">mažiau nei 5 minutes</span>.
              </p>

              <p className="text-foreground/70 text-[19px]" data-testid="text-harvard-future">
                <span className="font-bold">Ateinančiais metais</span>, automatinis užklausų apdorojimas nebebus konkurencinis pranašumas...
              </p>

              <p className="text-xl md:text-2xl font-bold" data-testid="text-harvard-necessity">
                Tai taps neišvengiama būtinybė.
              </p>
            </div>
          </div>

          <div className="relative" ref={chartRef}>
            <div className="bg-card border border-border/40 rounded-2xl p-6 sm:p-8">
              <div className="grid grid-cols-[auto_1fr] gap-3 sm:gap-6">
                {/* Y-axis label */}
                <div className="flex items-center justify-center" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                  <span className="text-xs sm:text-sm font-medium text-foreground/60">Kvalifikavimo tikimybė</span>
                </div>

                {/* Chart and labels */}
                <div className="flex flex-col gap-6">
                  {/* Chart area with Y-axis ticks and bars */}
                  <div className="grid grid-cols-[2.5rem_1fr] gap-2">
                    {/* Y-axis tick labels */}
                    <div className="h-64 sm:h-72 md:h-80 flex flex-col justify-between py-1 pr-2">
                      {[100, 80, 60, 40, 20, 0].map((value) => (
                        <div key={value} className="text-xs sm:text-sm font-medium text-foreground/60 text-right leading-none">
                          {value}%
                        </div>
                      ))}
                    </div>

                    {/* Chart plotting area */}
                    <div className="relative h-64 sm:h-72 md:h-80">
                      {/* Horizontal grid lines */}
                      {[100, 80, 60, 40, 20, 0].map((value) => (
                        <div 
                          key={value}
                          className="absolute w-full border-t border-dashed border-border/40"
                          style={{ bottom: `${value}%` }}
                        />
                      ))}

                      {/* Bars */}
                      <div className="absolute inset-0 flex items-end gap-3 sm:gap-4">
                        {chartData.map((item, index) => (
                          <div key={index} className="flex-1 relative h-full flex flex-col items-center justify-end">
                            {/* Percentage label - positioned just above bar top */}
                            <motion.div 
                              className="absolute left-1/2 font-bold text-sm sm:text-base whitespace-nowrap"
                              initial={{ opacity: 0 }}
                              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                              transition={{ 
                                delay: 0.3 + (index * 0.15),
                                duration: 0.4
                              }}
                              style={{ 
                                bottom: `${(item.percentage / maxPercentage) * 100}%`,
                                transform: 'translate(-50%, -6px)'
                              }}
                            >
                              {item.percentage}%
                            </motion.div>
                            
                            {/* Bar */}
                            <motion.div 
                              className="w-full bg-[#1d8263] rounded-t"
                              initial={{ height: 0 }}
                              animate={isInView ? { 
                                height: `${(item.percentage / maxPercentage) * 100}%` 
                              } : { 
                                height: 0 
                              }}
                              transition={{ 
                                delay: index * 0.15,
                                duration: 0.8,
                                ease: [0.4, 0, 0.2, 1]
                              }}
                              data-testid={`chart-bar-${item.time}`}
                            />
                            
                            {/* Time label directly under bar */}
                            <div className="absolute -bottom-8 w-full text-center">
                              <span className="text-xs sm:text-sm font-medium text-foreground/80">{item.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* X-axis label */}
                  <p className="text-center text-xs sm:text-sm font-medium text-foreground/60 mt-6" data-testid="text-chart-label">
                    Susisiekimo laikas nuo užklausos gavimo
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

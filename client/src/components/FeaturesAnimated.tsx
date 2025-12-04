import { motion } from "framer-motion";
import { Brain, Wrench, Lock } from "lucide-react";

export default function FeaturesAnimated() {
  const features = [
    {
      icon: Brain,
      title: "Prisitaiko prie verslo",
      description: "AI darbuotojai veikia pagal jūsų pardavimo procesus, taisykles ir gaires. Mokosi iš jūsų duomenų ir pritaiko bendravimą prie skirtingų klientų segmentų.",
      iconAnimation: {
        y: [0, -3, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    {
      icon: Wrench,
      title: "Integruojasi į sistemas",
      description: "Sklandžiai jungiasi su jūsų naudojamomis sistemomis: CRM, el. paštu, telefonu, svetaine. Dirba kaip papildoma komanda, nenaudodami jūsų įrankių.",
      iconAnimation: {
        rotate: [0, 15, -15, 0, 0],
        transition: {
          duration: 4,
          times: [0, 0.15, 0.3, 0.4, 1],
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    {
      icon: Lock,
      title: "Saugūs duomenys",
      description: "Visi duomenys saugiai šifruojami ir atitinka BDAR reikalavimus. Jūsų verslo informacija ir klientų duomenys lieka konfidencialūs ir apsaugoti.",
      iconAnimation: {
        rotate: [0, 12, -12, 0, 0],
        transition: {
          duration: 4,
          times: [0, 0.15, 0.3, 0.4, 1],
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
  ];

  return (
    <section className="pt-6 pb-24 md:py-16 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="border border-border rounded-2xl p-6 bg-background h-full"
                data-testid={`feature-${index + 1}`}
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1d8263]/10 to-[#1d8263]/5 rounded-xl flex items-center justify-center border border-[#1d8263]/20">
                    <motion.div
                      animate={feature.iconAnimation}
                    >
                      <Icon className="w-6 h-6 text-[#1d8263]" strokeWidth={1.5} />
                    </motion.div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" data-testid={`text-feature-title-${index + 1}`}>
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-feature-desc-${index + 1}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

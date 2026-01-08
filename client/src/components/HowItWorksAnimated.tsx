import { motion } from "framer-motion";
import { MessageSquare, Users, Calendar, BarChart3 } from "lucide-react";

export default function HowItWorksAnimated() {
  const steps = [
    {
      icon: MessageSquare,
      title: "Prijungia kanalus",
      delay: 0,
    },
    {
      icon: Users,
      title: "AI susisiekia",
      delay: 0.2,
    },
    {
      icon: Calendar,
      title: "Planuoja pokalbius",
      delay: 0.4,
    },
    {
      icon: BarChart3,
      title: "Stebi rezultatus",
      delay: 0.6,
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16 tracking-tight" data-testid="text-how-it-works-title">
          Kaip veikia AI darbuotojai
        </h2>
        
        <div className="relative bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl p-12 min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-5xl">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: step.delay,
                    duration: 0.5,
                  }}
                  className="flex flex-col items-center text-center"
                  data-testid={`animated-step-${index + 1}`}
                >
                  <motion.div
                    animate={{ 
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-20 h-20 bg-background rounded-xl flex items-center justify-center mb-4 shadow-lg"
                  >
                    <Icon className="w-10 h-10 text-foreground" strokeWidth={1.5} />
                  </motion.div>
                  <p className="text-sm font-medium text-foreground/80">{step.title}</p>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: "easeInOut"
            }}
            className="absolute inset-0 pointer-events-none"
          >
            <svg className="w-full h-full" viewBox="0 0 800 400" fill="none">
              <motion.path
                d="M 150 200 L 300 200 M 300 200 L 450 200 M 450 200 L 650 200"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="8 8"
                className="text-border"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            </svg>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

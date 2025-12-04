import { motion } from "framer-motion";
import { MessageCircle, Mail, Phone, Globe, Check } from "lucide-react";

export default function HowItWorksVisual() {
  const steps = [
    {
      number: "01.",
      title: "Prijungi savo kanalus",
      description: "Messenger, WhatsApp, forma, svetainė — AI pradeeta gatu užkluusas realiu laiku.",
    },
    {
      number: "02.",
      title: "AI susisiekia su užklausiomis",
      description: "Susirašinėja, klausia, renka info, filtruoja.",
    },
    {
      number: "03.",
      title: "Automitakki planuoja pokalbius ir užduotis",
      description: "Kai leadas pasiruošęs — AI pasiūlo laiž(ą pokalbiui.",
    },
    {
      number: "04.",
      title: "Viskas matoma vienonje vieje",
      description: "Matote, kiek atsakyta, kiek kwalifiuota, kiek suplanota.",
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-12 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-bold text-center mb-16 tracking-tight" data-testid="text-how-it-works-visual-title">
          Kaip veikia AI darbuotojai
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="space-y-2"
                data-testid={`visual-step-${index + 1}`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl font-light text-muted-foreground">{step.number}</span>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:sticky lg:top-32 space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-background border border-border rounded-2xl p-8 shadow-xl"
            >
              <div className="flex items-center justify-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="relative w-32 h-32"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold">AI</span>
                  </div>
                  
                  <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <MessageCircle className="w-8 h-8 text-blue-500" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    <Mail className="w-8 h-8 text-purple-500" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute bottom-0 left-1/4 -translate-x-1/2 translate-y-1/2"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  >
                    <Phone className="w-8 h-8 text-green-500" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/2"
                    animate={{ x: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  >
                    <Globe className="w-8 h-8 text-orange-500" />
                  </motion.div>
                </motion.div>
              </div>

              <div className="space-y-4 bg-muted/30 rounded-xl p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-start gap-3"
                >
                  <div className="bg-blue-500/20 px-3 py-1 rounded-lg text-sm">Sveiki, kuo domitės?</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="flex items-end gap-3 flex-row-reverse"
                >
                  <div className="bg-muted px-3 py-1 rounded-lg text-sm">Laba diena?</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="flex items-start gap-3"
                >
                  <div className="bg-blue-500/20 px-3 py-1 rounded-lg text-sm">Noriu pasikonsoluoti.</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.5 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mt-6"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">Meeting confirmed</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Rytoj, 14:00</p>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="bg-background border border-border rounded-2xl p-8 shadow-xl"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2, type: "spring" }}
                    className="text-3xl font-bold mb-1"
                  >
                    98%
                  </motion.div>
                  <div className="text-xs text-muted-foreground">Atsakyta</div>
                </div>
                <div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2.2, type: "spring" }}
                    className="text-3xl font-bold mb-1"
                  >
                    74%
                  </motion.div>
                  <div className="text-xs text-muted-foreground">Kvalifiouta</div>
                </div>
                <div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 2.4, type: "spring" }}
                    className="text-3xl font-bold mb-1"
                  >
                    62%
                  </motion.div>
                  <div className="text-xs text-muted-foreground">Bookinta</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { MessageSquare, Mail, Phone, Clipboard, Calendar, CheckCircle2, BarChart3 } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Prijungi savo kanalus",
      description: "Messenger, WhatsApp, forma, svetainė — AI pradeda gauti užklausas realiu laiku.",
      icon: MessageSquare,
    },
    {
      number: "02",
      title: "AI susisiekia su užklausiomis",
      description: "Susirašinėja, klausia, renka info, filtruja.",
      icon: Mail,
    },
    {
      number: "03",
      title: "Automatiškai planuoja pokalbius ir užduotis",
      description: "Planuoja, tvarkraštiai, priminimai.",
      icon: Calendar,
    },
    {
      number: "04",
      title: "Viskas matoma vienoje vietoje",
      description: "Stebėk rezultatus realiu laiku.",
      icon: BarChart3,
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div 
                key={index} 
                className="border border-border rounded-xl p-6 bg-background"
                data-testid={`step-${index + 1}`}
              >
                <div className="mb-4">
                  <span className="text-sm font-medium text-muted-foreground">{step.number}.</span>
                  <h3 className="text-base font-semibold mt-1" data-testid={`text-step-title-${index + 1}`}>
                    {step.title}
                  </h3>
                </div>
                
                <div className="aspect-square bg-muted/30 rounded-lg mb-4 flex items-center justify-center">
                  <Icon className="w-12 h-12 text-muted-foreground" strokeWidth={1.5} />
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-step-desc-${index + 1}`}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

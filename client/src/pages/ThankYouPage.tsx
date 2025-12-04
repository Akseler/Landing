import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Link } from "wouter";
import WebinarStickyHeader from "@/components/webinar/WebinarStickyHeader";
import { trackPageView } from "@/lib/analytics";

export default function ThankYouPage() {
  useEffect(() => {
    trackPageView('/thankyou');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <WebinarStickyHeader />
      
      <main className="py-24 px-6 lg:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-card border-2 border-border rounded-3xl p-12 md:p-16">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Info className="w-12 h-12 text-blue-600" data-testid="icon-info" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-thankyou-title">
              Dėkojame už susidomėjimą
            </h1>
            
            <p className="text-lg text-foreground/70 mb-8" data-testid="text-thankyou-message">
              Deja, šiuo metu šis webinaras skirtas įmonėms, kurios teikia aukštos vertės paslaugas (virš €1,000).
            </p>
            
            <p className="text-foreground/70 mb-8">
              Tačiau tai nereiškia, kad negalime padėti ateityje! Jei jūsų situacija pasikeis arba turite klausimų apie AKSELER platformą, nedvejodami susisiekite su mumis.
            </p>
            
            <div className="bg-muted/50 rounded-2xl p-6 mb-8">
              <p className="font-semibold mb-2">Susisiekite su mumis:</p>
              <p className="text-foreground/80">info@akseler.lt</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button
                  size="lg"
                  variant="outline"
                  data-testid="button-back-home"
                >
                  Grįžti į pradžią
                </Button>
              </Link>
              <Link href="/webinar">
                <Button
                  size="lg"
                  className="bg-[#1d8263] hover:bg-[#1d8263]/90"
                  data-testid="button-back-webinar"
                >
                  Grįžti į webinaro puslapį
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

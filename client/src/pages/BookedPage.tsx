import { useEffect } from "react";
import SimpleHeader from "@/components/SimpleHeader";
import Footer from "@/components/Footer";
import { CheckCircle2, Bot } from "lucide-react";
import { trackPageView } from "@/lib/analytics";

export default function BookedPage() {
  useEffect(() => {
    document.title = "Konsultacija suplanuota - AKSELER";
    trackPageView('/booked');
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SimpleHeader />
      
      <main className="pt-12 md:pt-24 pb-12 md:pb-24 px-6 lg:px-12 flex-1 flex items-center justify-center">
        <div className="max-w-xl mx-auto w-full">
          <div className="bg-white dark:bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#1d8263]/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#1d8263]" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-8" data-testid="text-booked-title">
              Konsultacija suplanuota
            </h1>
            
            <div className="bg-[#1d8263]/5 border border-[#1d8263]/20 rounded-xl p-5 mb-8 text-left">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#1d8263] flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <p className="text-foreground/80 leading-relaxed">
                  Su jumis susisieks m&#363;s&#371; AI darbuotojas, kuris u&#382;duos kelis klausimus apie J&#363;s&#371; veikl&#261; ir patvirtins pokalb&#303;.
                </p>
              </div>
            </div>
            
            <p className="text-foreground/60">
              Jei turite klausim&#371;, rašykite: <a href="mailto:info@akseler.lt" className="text-[#1d8263] hover:underline" data-testid="link-contact-email">info@akseler.lt</a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

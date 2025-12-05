import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import WebinarStickyHeader from "@/components/webinar/WebinarStickyHeader";
import Footer from "@/components/Footer";
import { trackPageView, initScrollTracking, initSessionDurationTracking } from "@/lib/analytics";

export default function DonePage() {
  useEffect(() => {
    document.title = "Akseler";
    trackPageView('/done');
    initScrollTracking();
    initSessionDurationTracking();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WebinarStickyHeader />
      <main className="pt-12 md:pt-12 pb-12 md:pb-24 px-6 lg:px-12 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-card border-2 border-border rounded-3xl p-8 md:p-12 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-[#1d8263]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-[#1d8263]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight" data-testid="success-title">
                J&#363;s&#371; vieta rezervuota, bet dar nepatvirtinta
              </h2>
            </div>
            
            <div className="space-y-6 text-center max-w-md mx-auto">
              <div className="bg-[#1d8263]/5 border-2 border-[#1d8263]/20 rounded-2xl p-6">
                <div className="flex items-start gap-3 text-left">
                  <div className="w-8 h-8 bg-[#1d8263] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">AI</span>
                  </div>
                  <div>
                    <p className="text-base md:text-lg text-foreground/90 leading-relaxed">Su jumis susisieks mūsų AI darbuotojas, kuris užduos kelis klausimus apie Jūsų veiklą ir atsiųs pakvietimą į vebinarą. </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-sm text-foreground/60">
                  Jei turite klausimu, rasykite:{" "}
                  <a 
                    href="mailto:info@akseler.lt" 
                    className="text-[#1d8263] hover:text-[#1d8263]/80 font-medium underline"
                    data-testid="link-support-email"
                  >
                    info@akseler.lt
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

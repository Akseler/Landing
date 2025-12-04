import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";
import WebinarStickyHeader from "@/components/webinar/WebinarStickyHeader";
import { trackPageView } from "@/lib/analytics";

export default function SuccessPage() {
  useEffect(() => {
    trackPageView('/success');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <WebinarStickyHeader />
      
      <main className="py-24 px-6 lg:px-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white dark:bg-card border-2 border-border rounded-3xl p-12 md:p-16">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" data-testid="icon-success" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-success-title">
              Sėkmingai užsiregistravote!
            </h1>
            
            <p className="text-lg text-foreground/70 mb-4" data-testid="text-success-message">
              Ačiū už registraciją į mūsų AI vebinarą.
            </p>
            
            <div className="bg-muted/50 rounded-2xl p-6 mb-8">
              <p className="font-semibold text-lg mb-2">Vebinaro detalės:</p>
              <div className="space-y-2 text-foreground/80">
                <p><strong>Data:</strong> Lapkričio 26d.</p>
                <p><strong>Laikas:</strong> 11:00 val.</p>
                <p><strong>Formatas:</strong> Internetu</p>
              </div>
            </div>
            
            <p className="text-foreground/70 mb-8">
              Išsiuntėme patvirtinimo laišką į jūsų el. paštą su prisijungimo nuoroda ir papildoma informacija.
            </p>
            
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
                  Grįžti į vebinaro puslapį
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

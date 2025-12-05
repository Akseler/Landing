import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { trackEvent } from "@/lib/analytics";

export default function CallFinalCTASection() {
  return (
    <section className="pt-16 md:pt-20 pb-20 md:pb-24 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="block md:hidden text-[24px] font-bold mb-6 leading-relaxed" data-testid="text-final-cta-title">
          Kiekviena diena su pasenusia sistema tai{" "}
          <span className="inline-block relative">
            <span className="relative z-10 text-foreground px-0.5 py-0.5">brangus chaosas.</span>
            <span className="absolute inset-0 bg-[#1d8263]/20 -skew-x-6 rounded-lg transform translate-y-1 -mx-0.5"></span>
          </span>
        </h2>

        <h2 className="hidden md:block text-[32px] lg:text-[36px] font-bold mb-10 md:mb-12 leading-tight" data-testid="text-final-cta-title-desktop">
          Kiekviena diena su pasenusia sistema
          <br />
          tai{" "}
          <span className="inline-block relative">
            <span className="relative z-10 text-foreground px-2 py-1">brangus chaosas.</span>
            <span className="absolute inset-0 bg-[#1d8263]/20 -skew-x-6 rounded-lg transform translate-y-1 -mx-1"></span>
          </span>
        </h2>

        <div className="flex justify-center">
          <Link href="/survey">
            <Button 
              size="lg" 
              variant="default"
              className="px-12 py-4 h-auto btn-gradient hover:opacity-95 border-0 min-w-[320px] md:min-w-[400px]"
              data-testid="button-survey-final"
              onClick={() => trackEvent('button_click', window.location.pathname, 'button-survey-final')}
            >
              <span className="text-lg md:text-xl font-semibold">Laikas tai pakeisti</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

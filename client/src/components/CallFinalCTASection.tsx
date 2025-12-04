import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";
import { Link } from "wouter";

export default function CallFinalCTASection() {
  return (
    <section className="pt-16 md:pt-20 pb-32 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="block md:hidden text-[24px] font-bold mb-6 leading-relaxed" data-testid="text-final-cta-title">
          Kiekviena diena su pasenusia sistema tai{" "}
          <span className="inline-block relative">
            <span className="relative z-10 text-foreground px-0.5 py-0.5">brangus chaosas.</span>
            <span className="absolute inset-0 bg-[#1d8263]/20 -skew-x-6 rounded-lg transform translate-y-1 -mx-0.5"></span>
          </span>
        </h2>

        <h2 className="hidden md:block text-[36px] font-bold mb-12 leading-tight" data-testid="text-final-cta-title-desktop">
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
              className="px-12 py-3 h-auto btn-gradient hover:opacity-95 border-0 min-w-[320px] md:min-w-[400px]"
              data-testid="button-survey-final"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-lg md:text-xl font-semibold">Kokių rezultatų galiu tikėtis?</span>
                <span className="text-xs opacity-80 flex items-center gap-1.5">
                  <ClipboardList className="w-3 h-3" />
                  Atsakykite į 4 klausimus ir sužinokite
                </span>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

import { useEffect } from "react";
import Header from "@/components/Header";
import CallHeroSection from "@/components/CallHeroSection";
import ProblemsSection from "@/components/ProblemsSection";
import HarvardResearchSection from "@/components/HarvardResearchSection";
import SolutionSection from "@/components/SolutionSection";
import CallHowItWorksApple from "@/components/CallHowItWorksApple";
import MarketsScrolling from "@/components/MarketsScrolling";
import ResultsSection from "@/components/ResultsSection";
import CallFinalCTASection from "@/components/CallFinalCTASection";
import Footer from "@/components/Footer";
import { trackPageView } from "@/lib/analytics";

export default function CallPage() {
  useEffect(() => {
    document.title = "Akseler — AI darbuotojai";
    trackPageView('/call');
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <CallHeroSection />
        <ProblemsSection />
        <SolutionSection />
        <CallHowItWorksApple />
        <ResultsSection />
        <MarketsScrolling />
        <HarvardResearchSection />
        <CallFinalCTASection />
      </main>
      <Footer />
    </div>
  );
}

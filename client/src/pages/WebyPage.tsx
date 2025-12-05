import { useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProblemsSection from "@/components/ProblemsSection";
import HarvardResearchSection from "@/components/HarvardResearchSection";
import SolutionSection from "@/components/SolutionSection";
import HowItWorksApple from "@/components/HowItWorksApple";
import MarketsScrolling from "@/components/MarketsScrolling";
import ResultsSection from "@/components/ResultsSection";
import FinalCTASection from "@/components/FinalCTASection";
import Footer from "@/components/Footer";
import { trackPageView, initScrollTracking, initSessionDurationTracking } from "@/lib/analytics";

export default function WebyPage() {
  useEffect(() => {
    document.title = "Akseler — AI darbuotojai";
    trackPageView('/weby');
    initScrollTracking();
    initSessionDurationTracking();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <ProblemsSection />
        <SolutionSection />
        <HowItWorksApple />
        <ResultsSection />
        <MarketsScrolling />
        <HarvardResearchSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}

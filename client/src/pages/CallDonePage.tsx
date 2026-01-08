import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import SimpleHeader from "@/components/SimpleHeader";
import Footer from "@/components/Footer";
import BookingCalendar from "@/components/BookingCalendar";
import { trackPageView, initScrollTracking, initSessionDurationTracking } from "@/lib/analytics";

type SurveyResults = {
  service?: string;
  value?: number;
  branch?: 'A' | 'B';
  [key: string]: any;
};

export default function CallDonePage() {
  const [, setLocation] = useLocation();
  const [surveyData, setSurveyData] = useState<SurveyResults | null>(null);

  useEffect(() => {
    document.title = "Rezervacija";
    // Track page view immediately
    trackPageView('/booking');
    initScrollTracking();
    initSessionDurationTracking();
    
    // Scroll to top when page loads
    window.scrollTo(0, 0);
    
    const stored = sessionStorage.getItem('surveyResults');
    if (stored) {
      const data = JSON.parse(stored) as SurveyResults;
      setSurveyData(data);
    }
    // Don't redirect if no survey data - allow direct access
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SimpleHeader />
      <main className="pt-8 md:pt-12 pb-12 md:pb-24 px-4 md:px-6 lg:px-12 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              Pradėkime kurti jūsų<br />
              AI pardavimų sistemą
            </h1>
            <p className="text-lg md:text-xl text-foreground/70 mt-4">
              Pasirinkite laiką strateginiam pokalbiui
            </p>
          </div>
          
          <BookingCalendar 
            surveyData={surveyData || {}}
            moneyLost={0}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

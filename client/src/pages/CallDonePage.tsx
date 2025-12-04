import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import SimpleHeader from "@/components/SimpleHeader";
import Footer from "@/components/Footer";
import { TrendingUp, Clock, Zap, RefreshCcw, Trophy, HelpCircle, Filter } from "lucide-react";
import { trackPageView } from "@/lib/analytics";

type SurveyResults = {
  leads: number;
  value: number;
  closeRate: number;
  speed: string;
  email: string;
};

type CalculatedResults = {
  salesNow: number;
  revNow: number;
  salesSpeed: number;
  revSpeed: number;
  salesNurture: number;
  revNurture: number;
  salesTotal: number;
  revTotal: number;
  newCloseRate: number;
  moneyLost: number;
  moneyLostYear: number;
  timeQualifyHours: number;
  timeFollowupHours: number;
  totalTime: number;
  daysSaved: string;
};

function calculateResults(data: SurveyResults): CalculatedResults {
  const leads = data.leads;
  const value = data.value;
  const closeRate = data.closeRate / 100;

  const salesNow = Math.round(leads * closeRate);
  const revNow = salesNow * value;

  const boostSpeed = 0.04;
  const salesSpeed = Math.round(leads * boostSpeed);
  const revSpeed = salesSpeed * value;

  const remainingLeads = leads - (salesNow + salesSpeed);
  const boostNurture = 0.025;
  const salesNurture = Math.round(remainingLeads * boostNurture);
  const revNurture = salesNurture * value;

  const salesTotal = salesNow + salesSpeed + salesNurture;
  const revTotal = salesTotal * value;
  const newCloseRate = Math.round((salesTotal / leads) * 100);

  const moneyLost = revTotal - revNow;
  const moneyLostYear = moneyLost * 12;

  const timeQualifyHours = Math.round((leads * 10) / 60);
  const timeFollowupHours = Math.round((leads * 0.9 * 15) / 60);
  const totalTime = timeQualifyHours + timeFollowupHours;
  const daysSaved = (totalTime / 40).toFixed(1);

  return {
    salesNow,
    revNow,
    salesSpeed,
    revSpeed,
    salesNurture,
    revNurture,
    salesTotal,
    revTotal,
    newCloseRate,
    moneyLost,
    moneyLostYear,
    timeQualifyHours,
    timeFollowupHours,
    totalTime,
    daysSaved,
  };
}

function formatNumber(num: number): string {
  return num.toLocaleString('lt-LT');
}

export default function CallDonePage() {
  const [, setLocation] = useLocation();
  const [surveyData, setSurveyData] = useState<SurveyResults | null>(null);
  const [results, setResults] = useState<CalculatedResults | null>(null);

  useEffect(() => {
    document.title = "Akseler";
    trackPageView('/calldone');
    
    const stored = sessionStorage.getItem('surveyResults');
    if (stored) {
      const data = JSON.parse(stored) as SurveyResults;
      setSurveyData(data);
      setResults(calculateResults(data));
    } else {
      setLocation('/survey');
    }
  }, [setLocation]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://link.msgsndr.com/js/form_embed.js';
    script.type = 'text/javascript';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!surveyData || !results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#1d8263] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SimpleHeader />
      <main className="pt-8 md:pt-12 pb-12 md:pb-24 px-4 md:px-6 lg:px-12 flex-1">
        <div className="max-w-5xl mx-auto">
          
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12">
            <span className="md:hidden">Štai kiek pajamų ir laiko<br />galite susigrąžinti:</span>
            <span className="hidden md:inline">Štai kiek pajamų ir laiko galite susigrąžinti:</span>
          </h1>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-16 md:mb-20">
            
            <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-foreground/60" />
                <h3 className="font-semibold text-lg">Pardavimų augimas</h3>
              </div>

              <div className="space-y-4">
                <div className="border border-border rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-foreground/70">Dabartinė situacija</span>
                    <span className="font-semibold">{surveyData.closeRate}% Konversija</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/60">Pardavimai: ~{results.salesNow}</span>
                    <span className="font-bold text-lg">~{formatNumber(results.revNow)} &#8364;</span>
                  </div>
                </div>

                <div className="border-2 border-[#1d8263]/30 bg-[#1d8263]/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-[#1d8263]" />
                    <span className="font-medium text-[#1d8263]">Greita komunikacija</span>
                    <span className="ml-auto text-[#1d8263] font-semibold">+4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/60">Papildomi pardavimai: +{results.salesSpeed}</span>
                    <span className="font-bold text-[#1d8263]">+{formatNumber(results.revSpeed)} &#8364;</span>
                  </div>
                </div>

                <div className="border-2 border-[#1d8263]/30 bg-[#1d8263]/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCcw className="w-4 h-4 text-[#1d8263]" />
                    <span className="font-medium text-[#1d8263]">Nepasiruošusių reaktyvacija</span>
                    <span className="ml-auto text-[#1d8263] font-semibold">+3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/60">Papildomi pardavimai: +{results.salesNurture}</span>
                    <span className="font-bold text-[#1d8263]">+{formatNumber(results.revNurture)} &#8364;</span>
                  </div>
                </div>

                <div className="bg-[#1d8263] text-white rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">SU AKSELER</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                      {results.newCloseRate}% Konversija
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white/80 text-sm">Viso pardavimų</div>
                      <div className="text-2xl font-bold">{results.salesTotal} / mėn.</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/80 text-sm">Viso pajamų</div>
                      <div className="text-2xl font-bold">{formatNumber(results.revTotal)} &#8364;</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-foreground/60 text-sm">PINIGAI, KURIUOS PALIEKATE ANT STALO</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{formatNumber(results.moneyLost)} &#8364;</span>
                    <span className="text-foreground/60">/ mėn.</span>
                  </div>
                  <div className="text-foreground/60">
                    ~ {formatNumber(results.moneyLostYear)} &#8364; / metus
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-foreground/40" />
                    <span className="text-foreground/60 text-sm">Kaip tai veikia?</span>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/70">
                    <li className="flex items-start gap-2">
                      <span className="text-[#1d8263] mt-1">&#8226;</span>
                      <span>Susisiekimas su nauja užklausa per 1 min. pakelia konversiją apie 3-4%.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#1d8263] mt-1">&#8226;</span>
                      <span>Likusius nepirkusius lead'us sistema "šildo" edukaciniu turiniu, susigrąžindama dar ~3% klientų.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-card border border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-foreground/60" />
                <h3 className="font-semibold text-lg">Sutaupytas laikas</h3>
              </div>

              <div className="space-y-6">
                <div className="border border-border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <Filter className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm md:text-base leading-tight">Naujų užklausų filtravimas, kvalifikavimas ir duomenų suvedimas</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-xs text-foreground/60 mb-1">Dabar:</div>
                      <div className="font-semibold">Rankinis</div>
                    </div>
                    <div className="bg-[#1d8263]/10 rounded-lg p-3 text-center">
                      <div className="text-xs text-foreground/60 mb-1">Su AI:</div>
                      <div className="font-semibold text-[#1d8263]">Automatinis</div>
                    </div>
                  </div>
                  <div className="text-[#1d8263] text-sm font-medium">
                    Sutaupoma: ~{results.timeQualifyHours} val.
                  </div>
                </div>

                <div className="border border-border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <RefreshCcw className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm md:text-base leading-tight">Senų kontaktų filtravimas, sekimas ir priminimų darymas</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="text-xs text-foreground/60 mb-1">Dabar:</div>
                      <div className="font-semibold">Pamirštami</div>
                    </div>
                    <div className="bg-[#1d8263]/10 rounded-lg p-3 text-center">
                      <div className="text-xs text-foreground/60 mb-1">Su AI:</div>
                      <div className="font-semibold text-[#1d8263]">Automatinis</div>
                    </div>
                  </div>
                  <div className="text-[#1d8263] text-sm font-medium">
                    Sutaupoma: ~{results.timeFollowupHours} val.
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-foreground/80">SUTAUPYTAS LAIKAS</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {results.totalTime} val. <span className="text-lg font-normal text-foreground/60">/ mėn.</span>
                  </div>
                  <p className="text-sm text-foreground/70">
                    Kurią jūsų pardavėjai galėtų skirti deryboms ir pardavimams.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="ml-[0px] mr-[0px] mt-[0px] mb-[0px] pt-[60px] pb-[60px]">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-2xl font-bold mb-2">
                Norite įsidiegti šią sistemą ir pasiimti prarastus <span className="text-[#1d8263]">{formatNumber(results.moneyLost)} &#8364;</span>?
              </h2>
              <p className="text-foreground/60">
                <span className="md:hidden">Pasirinkite laiką trumpam nuotoliniam<br />sistemos pristatymui.</span>
                <span className="hidden md:inline">Pasirinkite laiką trumpam nuotoliniam sistemos pristatymui.</span>
              </p>
            </div>
            
            <div className="w-full min-h-[700px] md:min-h-[750px]">
              <iframe 
                src="https://api.leadconnectorhq.com/widget/booking/FRJ4lHXLI749ZrbpIr2X" 
                style={{ width: '100%', height: '700px', border: 'none' }}
                id="CUG1QngP0G3ULV9R9xrp_1764282875043"
                title="Booking Calendar"
                data-testid="booking-calendar"
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

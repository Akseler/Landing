import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLocation } from "wouter";
import SimpleHeader from "@/components/SimpleHeader";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { trackPageView, trackQuizResponse, trackEvent } from "@/lib/analytics";

type SurveyData = {
  leads: number;
  value: number;
  closeRate: number;
  speed: string;
  email: string;
};

export default function SurveyPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState<SurveyData>({
    leads: 0,
    value: 0,
    closeRate: 0,
    speed: "",
    email: "",
  });
  const [validationErrors, setValidationErrors] = useState<{ 
    leads?: string;
    value?: string;
    closeRate?: string;
    speed?: string;
    email?: string;
  }>({});

  useEffect(() => {
    document.title = "Kvalifikacija";
    trackPageView('/survey');
  }, []);

  useEffect(() => {
    if (step > 1) {
      trackEvent('survey_step_view', '/survey', undefined, { step });
    }
  }, [step]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const validateEmail = (email: string): boolean => {
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed);
  };

  const handleLeadsNext = () => {
    if (formData.leads === 0 || formData.leads <= 0) {
      setValidationErrors({ leads: "Prašome pasirinkti skaičių" });
      return;
    }
    trackQuizResponse(1, 'Kiek naujų užklausų gaunate per mėnesį?', String(formData.leads));
    setValidationErrors({});
    setStep(2);
  };

  const handleValueNext = () => {
    if (formData.value === 0 || formData.value <= 0) {
      setValidationErrors({ value: "Prašome pasirinkti sumą" });
      return;
    }
    trackQuizResponse(2, 'Kokia yra vidutinė vieno kliento vertė?', String(formData.value));
    setValidationErrors({});
    setStep(3);
  };

  const handleCloseRateNext = () => {
    if (formData.closeRate === 0 || formData.closeRate < 0) {
      setValidationErrors({ closeRate: "Prašome pasirinkti skaičių" });
      return;
    }
    trackQuizResponse(3, 'Kiek realistiškai iš 10 užklausų tampa klientais?', String(formData.closeRate));
    setValidationErrors({});
    setStep(4);
  };

  const handleSpeedNext = () => {
    if (!formData.speed) {
      setValidationErrors({ speed: "Prašome pasirinkti atsakymą" });
      return;
    }
    trackQuizResponse(4, 'Per kiek laiko susisiekiate su nauja užklausa?', formData.speed);
    trackEvent('survey_completed', '/survey');
    setValidationErrors({});
    
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
      setStep(5);
    }, 2500);
  };

  const handleEmailSubmit = async () => {
    if (!formData.email.trim()) {
      setValidationErrors({ email: "Prašome įvesti el. paštą" });
      return;
    }
    if (!validateEmail(formData.email)) {
      setValidationErrors({ email: "Neteisingas el. paštas (turi turėti @)" });
      return;
    }

    const surveyResults = {
      leads: formData.leads,
      value: formData.value,
      closeRate: formData.closeRate,
      speed: formData.speed,
      email: formData.email.trim(),
    };
    
    // Save to backend database
    try {
      const response = await fetch('/api/call-funnel/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyResults),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save survey results:', response.status, errorData);
      }
    } catch (error) {
      console.error('Failed to save survey results:', error);
    }
    
    sessionStorage.setItem('surveyResults', JSON.stringify(surveyResults));
    trackEvent('survey_email_submitted', '/survey', undefined, { email: formData.email.trim() });
    setLocation('/calldone');
  };

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  if (isCalculating) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SimpleHeader />
        
        <main className="pt-12 md:pt-24 pb-12 md:pb-24 px-6 lg:px-12 flex-1 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <Loader2 className="w-16 h-16 text-[#1d8263] animate-spin mx-auto" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              Skaičiuojama konversija...
            </h2>
            <p className="text-foreground/60">
              Lyginama su rinkos standartais...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SimpleHeader />
      
      <main className="pt-12 md:pt-12 pb-12 md:pb-24 px-6 lg:px-12 flex-1">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12">
            <div className="w-full bg-muted border border-border rounded-full h-2.5">
              <div
                className="bg-[#1d8263] h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
                data-testid="survey-progress"
              />
            </div>
            <p className="text-sm text-foreground/60 mt-2 text-center">
              Žingsnis {step} iš {totalSteps}
            </p>
          </div>

          <div className="bg-white dark:bg-card border-2 border-border rounded-3xl p-10 md:p-16 mb-6">
            
            {step === 1 && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed" data-testid="survey-question-1">
                    Kiek naujų užklausų gaunate per mėnesį?
                  </h2>
                </div>
                
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-[#1d8263]">
                      {formData.leads >= 1000 ? "1,000+" : formData.leads}
                    </span>
                  </div>
                  <Slider
                    value={[formData.leads]}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, leads: value[0] }));
                      setValidationErrors({});
                    }}
                    min={0}
                    max={1000}
                    step={10}
                    className="w-full"
                    data-testid="slider-leads"
                  />
                  <div className="flex justify-between text-sm text-foreground/60">
                    <span>0</span>
                    <span>1,000+</span>
                  </div>
                  {validationErrors.leads && (
                    <p className="text-sm text-destructive text-center">{validationErrors.leads}</p>
                  )}
                </div>

                <div className="max-w-sm mx-auto flex justify-center mt-8">
                  <Button
                    onClick={handleLeadsNext}
                    className="bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white px-8 py-2.5 text-sm font-semibold focus-visible:ring-[#2da87a]"
                    data-testid="button-leads-next"
                  >
                    Toliau
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed" data-testid="survey-question-2">
                    Kokia yra vidutinė vieno kliento vertė?
                  </h2>
                </div>
                
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-[#1d8263]">
                      {formData.value >= 20000 ? "20,000+" : formData.value.toLocaleString()} &#8364;
                    </span>
                  </div>
                  <Slider
                    value={[formData.value]}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, value: value[0] }));
                      setValidationErrors({});
                    }}
                    min={0}
                    max={20000}
                    step={100}
                    className="w-full"
                    data-testid="slider-value"
                  />
                  <div className="flex justify-between text-sm text-foreground/60">
                    <span>0 &#8364;</span>
                    <span>20,000+ &#8364;</span>
                  </div>
                  {validationErrors.value && (
                    <p className="text-sm text-destructive text-center">{validationErrors.value}</p>
                  )}
                </div>

                <div className="max-w-sm mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-[#1d8263] text-[#1d8263] hover:bg-[#1d8263]/10 py-2.5 text-sm font-semibold focus-visible:ring-[#2da87a]"
                    data-testid="button-value-back"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atgal
                  </Button>
                  <Button
                    onClick={handleValueNext}
                    className="flex-1 bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white py-2.5 text-sm font-semibold focus-visible:ring-[#2da87a]"
                    data-testid="button-value-next"
                  >
                    Toliau
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed" data-testid="survey-question-3">
                    Kiek realistiškai iš 10 užklausų tampa klientais?
                  </h2>
                </div>
                
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-[#1d8263]">{formData.closeRate}</span>
                  </div>
                  <Slider
                    value={[formData.closeRate]}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, closeRate: value[0] }));
                      setValidationErrors({});
                    }}
                    min={0}
                    max={10}
                    step={1}
                    className="w-full"
                    data-testid="slider-close-rate"
                  />
                  <div className="flex justify-between text-sm text-foreground/60">
                    <span>0</span>
                    <span>10</span>
                  </div>
                  {validationErrors.closeRate && (
                    <p className="text-sm text-destructive text-center">{validationErrors.closeRate}</p>
                  )}
                </div>

                <div className="max-w-sm mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 border-2 border-[#1d8263] text-[#1d8263] hover:bg-[#1d8263]/10 py-2.5 text-sm font-semibold focus-visible:ring-[#2da87a]"
                    data-testid="button-rate-back"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atgal
                  </Button>
                  <Button
                    onClick={handleCloseRateNext}
                    className="flex-1 bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white py-2.5 text-sm font-semibold focus-visible:ring-[#2da87a]"
                    data-testid="button-rate-next"
                  >
                    Toliau
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed" data-testid="survey-question-4">
                    Per kiek laiko susisiekiate su nauja užklausa?
                  </h2>
                </div>
                
                <div className="max-w-md mx-auto space-y-3">
                  {[
                    { value: "per_5min", label: "Per 5 min." },
                    { value: "per_1val", label: "Per 1 val." },
                    { value: "tos_pacios_dienos", label: "Tos pačios dienos bėgyje" },
                    { value: "kita_diena", label: "Kitą darbo dieną arba vėliau" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, speed: option.value }));
                        setValidationErrors({});
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1d8263] focus-visible:ring-offset-2 ${
                        formData.speed === option.value
                          ? "border-[#1d8263] bg-[#1d8263]/10"
                          : "border-border hover:border-[#1d8263]/50"
                      }`}
                      data-testid={`option-speed-${option.value}`}
                    >
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                  {validationErrors.speed && (
                    <p className="text-sm text-destructive text-center">{validationErrors.speed}</p>
                  )}
                </div>

                <div className="max-w-md mx-auto flex justify-center mt-8">
                  <Button
                    onClick={handleSpeedNext}
                    className="bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white px-8 py-2.5 text-sm font-semibold focus-visible:ring-[#2da87a]"
                    data-testid="button-generate-report"
                  >
                    Generuoti rezultatus
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 leading-relaxed" data-testid="survey-question-5">
                    Rezultatai paruošti
                  </h2>
                  <p className="text-foreground/60 mb-4">
                    Gausite detalią potencialių pajamų ir sutaupyto laiko ataskaitą.
                  </p>
                  <p className="text-foreground/60">
                    Kur galime ją atsiųsti?
                  </p>
                </div>
                
                <div className="max-w-sm mx-auto space-y-4">
                  <Label htmlFor="email" className="sr-only">El. paštas</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      setValidationErrors({});
                    }}
                    placeholder="jusu@elpastas.lt"
                    className={`text-center text-lg h-14 ${validationErrors.email ? "border-destructive" : ""}`}
                    data-testid="input-email"
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-destructive text-center">{validationErrors.email}</p>
                  )}
                </div>

                <div className="max-w-sm mx-auto flex justify-center mt-8">
                  <Button
                    onClick={handleEmailSubmit}
                    className="bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white px-8 py-2.5 text-sm font-semibold focus-visible:ring-[#2da87a]"
                    data-testid="button-show-results"
                  >
                    Rodyti Mano Rezultatus
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

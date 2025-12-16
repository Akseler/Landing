import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLocation } from "wouter";
import SimpleHeader from "@/components/SimpleHeader";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { trackPageView, trackQuizResponse, trackEvent, initScrollTracking, initSessionDurationTracking, getSessionId } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";

type SurveyData = {
  service: string;
  value: number;
  // Branch A (Užklausos)
  leadSource?: string;
  currentLeads?: number;
  desiredLeads?: number;
  // Branch B (Pardavimai)
  usesCRM?: string;
  conversionRate?: number; // Changed from conversionIssue to conversionRate (1-10)
  salesPeople?: number;
};

export default function SurveyPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get type from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const initialType = urlParams.get('type'); // 'uzklausos' or 'pardavimai'
  
  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState<'A' | 'B' | null>(null);
  const [formData, setFormData] = useState<SurveyData>({
    service: "",
    value: 0,
  });
  const [validationErrors, setValidationErrors] = useState<{ 
    [key: string]: string;
  }>({});

  useEffect(() => {
    document.title = "Kvalifikacija";
    trackPageView('/survey');
    initScrollTracking();
    initSessionDurationTracking();
  }, []);

  useEffect(() => {
    if (step > 1) {
      trackEvent('survey_step_view', '/survey', undefined, { step });
    }
  }, [step]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // If coming from hero with type, auto-select branch and skip to step 2
  useEffect(() => {
    if (initialType === 'uzklausos' || initialType === 'pardavimai') {
      const selectedBranch = initialType === 'uzklausos' ? 'A' : 'B';
      setBranch(selectedBranch);
      trackQuizResponse(1, 'Ko trūksta jūsų paslaugų verslui?', selectedBranch === 'A' ? 'Užklausų' : 'Pardavimų');
      // Auto-advance to step 2 (service question)
      setStep(2);
    }
  }, [initialType]);

  const handleBranchSelect = (selectedBranch: 'A' | 'B') => {
    // Only track if branch wasn't already set (i.e., not from initialType)
    if (!branch) {
      trackQuizResponse(1, 'Ko trūksta jūsų paslaugų verslui?', selectedBranch === 'A' ? 'Užklausų' : 'Pardavimų');
    }
    setBranch(selectedBranch);
    setValidationErrors({});
    // Don't auto-advance, let user click "Toliau" button
  };

  const handleServiceNext = () => {
    if (!formData.service.trim()) {
      setValidationErrors({ service: "Prašome įvesti paslaugą" });
      return;
    }
    trackQuizResponse(2, 'Kokią paslaugą labiausiai parduodate?', formData.service);
    setValidationErrors({});
    setStep(3);
  };

  const handleValueNext = () => {
    if (formData.value === 0 || formData.value <= 0) {
      setValidationErrors({ value: "Prašome pasirinkti sumą" });
      return;
    }
    trackQuizResponse(3, 'Kokia vidutinė vieno kliento vertė (€)?', String(formData.value));
    setValidationErrors({});
    setStep(4);
  };

  // Branch A handlers
  const handleLeadSourceNext = () => {
    if (!formData.leadSource) {
      setValidationErrors({ leadSource: "Prašome pasirinkti atsakymą" });
      return;
    }
    trackQuizResponse(4, 'Iš kur šiandien gaunate daugiausia užklausų?', formData.leadSource);
    setValidationErrors({});
    setStep(5);
  };

  const handleCurrentLeadsNext = () => {
    if (!formData.currentLeads || formData.currentLeads <= 0) {
      setValidationErrors({ currentLeads: "Prašome pasirinkti skaičių" });
      return;
    }
    trackQuizResponse(5, 'Kiek maždaug užklausų gaunate per mėnesį?', String(formData.currentLeads));
    setValidationErrors({});
    setStep(6);
  };

  const handleDesiredLeadsNext = () => {
    if (!formData.desiredLeads || formData.desiredLeads <= 0) {
      setValidationErrors({ desiredLeads: "Prašome pasirinkti skaičių" });
      return;
    }
    trackQuizResponse(6, 'Kiek norėtumėte gauti užklausų per mėnesį?', String(formData.desiredLeads));
    setValidationErrors({});
    handleSubmit();
  };

  // Branch B handlers
  const handleCRMNext = () => {
    if (!formData.usesCRM) {
      setValidationErrors({ usesCRM: "Prašome pasirinkti atsakymą" });
      return;
    }
    trackQuizResponse(4, 'Ar naudojate CRM sistemą?', formData.usesCRM);
    setValidationErrors({});
    setStep(5);
  };

  const handleConversionRateNext = () => {
    if (!formData.conversionRate || formData.conversionRate <= 0) {
      setValidationErrors({ conversionRate: "Prašome pasirinkti skaičių" });
      return;
    }
    trackQuizResponse(5, 'Kiek iš 10 užklausų tampa pardavimais?', String(formData.conversionRate));
    setValidationErrors({});
    setStep(6);
  };

  const handleSalesPeopleNext = () => {
    if (!formData.salesPeople || formData.salesPeople <= 0) {
      setValidationErrors({ salesPeople: "Prašome pasirinkti skaičių" });
      return;
    }
    trackQuizResponse(6, 'Kiek žmonių pas jus dirba su pardavimais?', String(formData.salesPeople));
    setValidationErrors({});
    handleSubmit();
  };

  const handleSubmit = async () => {
    trackEvent('survey_completed', '/survey');
    
    const surveyResults = {
      ...formData,
      sessionId: getSessionId(),
      branch: branch,
    };
    
    // Save to sessionStorage
    sessionStorage.setItem('surveyResults', JSON.stringify(surveyResults));
    
    // Save to backend (non-blocking)
    fetch('/api/call-funnel/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(surveyResults),
    }).catch((error) => {
      console.error('[SurveyPage] Error saving survey results:', error);
    });
    
    // Go directly to booking
    setLocation('/booking');
  };

  const getTotalSteps = () => {
    if (branch === 'A') {
      // If came with type, step 1 is skipped, so total is 5 (service, value, source, current, desired)
      return initialType ? 5 : 6; // branch, service, value, source, current, desired
    }
    if (branch === 'B') {
      // If came with type, step 1 is skipped, so total is 5 (service, value, crm, rate, people)
      return initialType ? 5 : 6; // branch, service, value, crm, rate, people
    }
    return 1; // branch selection only
  };

  const totalSteps = getTotalSteps();
  // If came with type, step 1 is skipped, so adjust progress calculation
  const adjustedStep = initialType && step > 1 ? step - 1 : step;
  const progress = (adjustedStep / totalSteps) * 100;

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
              />
            </div>
            <p className="text-sm text-foreground/60 mt-2 text-center">
              Žingsnis {adjustedStep} iš {totalSteps}
            </p>
          </div>

          <div className="bg-white dark:bg-card border-2 border-border rounded-3xl p-10 md:p-16 mb-6">
            
            {/* Step 1: Branch Selection (Ko trūksta) */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Ko trūksta jūsų paslaugų verslui?
                  </h2>
                </div>
                
                <div className="max-w-md mx-auto space-y-3">
                  <button
                    onClick={() => handleBranchSelect('A')}
                    className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                      branch === 'A'
                        ? "border-[#1d8263] bg-[#1d8263]/10"
                        : "border-border hover:border-[#1d8263]/50"
                    }`}
                  >
                    <span className="font-medium text-lg">Užklausų</span>
                  </button>
                  <button
                    onClick={() => handleBranchSelect('B')}
                    className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                      branch === 'B'
                        ? "border-[#1d8263] bg-[#1d8263]/10"
                        : "border-border hover:border-[#1d8263]/50"
                    }`}
                  >
                    <span className="font-medium text-lg">Pardavimų</span>
                  </button>
                </div>

                {branch && (
                  <div className="max-w-md mx-auto flex justify-center mt-8">
                    <Button
                      onClick={() => setStep(2)}
                      className="bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white px-8 py-2.5 text-sm font-semibold"
                    >
                      Toliau
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Service */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Kokią paslaugą labiausiai parduodate?
                  </h2>
                </div>
                
                <div className="max-w-sm mx-auto space-y-4">
                  <Label htmlFor="service" className="sr-only">Paslauga</Label>
                  <Input
                    id="service"
                    type="text"
                    value={formData.service}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, service: e.target.value }));
                      setValidationErrors({});
                    }}
                    placeholder="Pvz. kreditas verslui"
                    className={`text-center text-lg h-14 ${validationErrors.service ? "border-destructive" : ""}`}
                  />
                  {validationErrors.service && (
                    <p className="text-sm text-destructive text-center">{validationErrors.service}</p>
                  )}
                </div>

                <div className="max-w-sm mx-auto flex justify-center mt-8">
                  <Button
                    onClick={handleServiceNext}
                    className="bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white px-8 py-2.5 text-sm font-semibold"
                  >
                    Toliau
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Value */}
            {step === 3 && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Kokia vidutinė vieno kliento vertė (€)?
                  </h2>
                </div>
                
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-[#1d8263]">
                      {formData.value >= 20000 ? "20,000+" : formData.value.toLocaleString()} €
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
                  />
                  <div className="flex justify-between text-sm text-foreground/60">
                    <span>0 €</span>
                    <span>20,000+ €</span>
                  </div>
                  {validationErrors.value && (
                    <p className="text-sm text-destructive text-center">{validationErrors.value}</p>
                  )}
                </div>

                <div className="max-w-sm mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 border-2 border-[#1d8263] text-[#1d8263] hover:bg-[#1d8263]/10 py-2.5 text-sm font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atgal
                  </Button>
                  <Button
                    onClick={handleValueNext}
                    className="flex-1 bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white py-2.5 text-sm font-semibold"
                  >
                    Toliau
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Branch A - Step 4: Lead Source */}
            {step === 4 && branch === 'A' && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Iš kur šiandien gaunate daugiausia užklausų?
                  </h2>
                </div>
                
                <div className="max-w-md mx-auto space-y-3">
                  {[
                    { value: "facebook_instagram", label: "Facebook / Instagram" },
                    { value: "google", label: "Google" },
                    { value: "svetaine", label: "Svetainė" },
                    { value: "rekomendacijos", label: "Rekomendacijos" },
                    { value: "kita", label: "Kita" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, leadSource: option.value }));
                        setValidationErrors({});
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        formData.leadSource === option.value
                          ? "border-[#1d8263] bg-[#1d8263]/10"
                          : "border-border hover:border-[#1d8263]/50"
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                  {validationErrors.leadSource && (
                    <p className="text-sm text-destructive text-center">{validationErrors.leadSource}</p>
                  )}
                </div>

                <div className="max-w-md mx-auto flex justify-center mt-8">
                  <Button
                    onClick={handleLeadSourceNext}
                    className="bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white px-8 py-2.5 text-sm font-semibold"
                  >
                    Toliau
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Branch A - Step 5: Current Leads */}
            {step === 5 && branch === 'A' && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Kiek maždaug užklausų gaunate per mėnesį?
                  </h2>
                </div>
                
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-[#1d8263]">
                      {formData.currentLeads && formData.currentLeads >= 1000 ? "1,000+" : formData.currentLeads || 0}
                    </span>
                  </div>
                  <Slider
                    value={[formData.currentLeads || 0]}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, currentLeads: value[0] }));
                      setValidationErrors({});
                    }}
                    min={0}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-foreground/60">
                    <span>0</span>
                    <span>1,000+</span>
                  </div>
                  {validationErrors.currentLeads && (
                    <p className="text-sm text-destructive text-center">{validationErrors.currentLeads}</p>
                  )}
                </div>

                <div className="max-w-sm mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(4)}
                    className="flex-1 border-2 border-[#1d8263] text-[#1d8263] hover:bg-[#1d8263]/10 py-2.5 text-sm font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atgal
                  </Button>
                  <Button
                    onClick={handleCurrentLeadsNext}
                    className="flex-1 bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white py-2.5 text-sm font-semibold"
                  >
                    Toliau
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Branch A - Step 6: Desired Leads */}
            {step === 6 && branch === 'A' && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Kiek norėtumėte gauti užklausų per mėnesį?
                  </h2>
                </div>
                
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-[#1d8263]">
                      {formData.desiredLeads && formData.desiredLeads >= 1000 ? "1,000+" : formData.desiredLeads || 0}
                    </span>
                  </div>
                  <Slider
                    value={[formData.desiredLeads || 0]}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, desiredLeads: value[0] }));
                      setValidationErrors({});
                    }}
                    min={0}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-foreground/60">
                    <span>0</span>
                    <span>1,000+</span>
                  </div>
                  {validationErrors.desiredLeads && (
                    <p className="text-sm text-destructive text-center">{validationErrors.desiredLeads}</p>
                  )}
                </div>

                <div className="max-w-sm mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(5)}
                    className="flex-1 border-2 border-[#1d8263] text-[#1d8263] hover:bg-[#1d8263]/10 py-2.5 text-sm font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atgal
                  </Button>
                  <Button
                    onClick={handleDesiredLeadsNext}
                    className="flex-1 bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white py-2.5 text-sm font-semibold"
                  >
                    Toliau
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Branch B - Step 4: CRM */}
            {step === 4 && branch === 'B' && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Ar naudojate CRM sistemą?
                  </h2>
                </div>
                
                <div className="max-w-md mx-auto space-y-3">
                  {[
                    { value: "taip", label: "Taip" },
                    { value: "ne", label: "Ne" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, usesCRM: option.value }));
                        setValidationErrors({});
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        formData.usesCRM === option.value
                          ? "border-[#1d8263] bg-[#1d8263]/10"
                          : "border-border hover:border-[#1d8263]/50"
                      }`}
                    >
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                  {validationErrors.usesCRM && (
                    <p className="text-sm text-destructive text-center">{validationErrors.usesCRM}</p>
                  )}
                </div>

                <div className="max-w-md mx-auto flex justify-center mt-8">
                  <Button
                    onClick={handleCRMNext}
                    className="bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white px-8 py-2.5 text-sm font-semibold"
                  >
                    Toliau
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Branch B - Step 5: Conversion Rate (Slider) */}
            {step === 5 && branch === 'B' && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Kiek iš 10 užklausų tampa pardavimais?
                  </h2>
                </div>
                
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-[#1d8263]">{formData.conversionRate || 0}</span>
                  </div>
                  <Slider
                    value={[formData.conversionRate || 0]}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, conversionRate: value[0] }));
                      setValidationErrors({});
                    }}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-foreground/60">
                    <span>1</span>
                    <span>10</span>
                  </div>
                  {validationErrors.conversionRate && (
                    <p className="text-sm text-destructive text-center">{validationErrors.conversionRate}</p>
                  )}
                </div>

                <div className="max-w-sm mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(4)}
                    className="flex-1 border-2 border-[#1d8263] text-[#1d8263] hover:bg-[#1d8263]/10 py-2.5 text-sm font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atgal
                  </Button>
                  <Button
                    onClick={handleConversionRateNext}
                    className="flex-1 bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white py-2.5 text-sm font-semibold"
                  >
                    Toliau
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Branch B - Step 6: Sales People */}
            {step === 6 && branch === 'B' && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Kiek žmonių pas jus dirba su pardavimais?
                  </h2>
                </div>
                
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-[#1d8263]">
                      {formData.salesPeople && formData.salesPeople >= 20 ? "20+" : formData.salesPeople || 0}
                    </span>
                  </div>
                  <Slider
                    value={[formData.salesPeople || 0]}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, salesPeople: value[0] }));
                      setValidationErrors({});
                    }}
                    min={1}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-foreground/60">
                    <span>1</span>
                    <span>20+</span>
                  </div>
                  {validationErrors.salesPeople && (
                    <p className="text-sm text-destructive text-center">{validationErrors.salesPeople}</p>
                  )}
                </div>

                <div className="max-w-sm mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(5)}
                    className="flex-1 border-2 border-[#1d8263] text-[#1d8263] hover:bg-[#1d8263]/10 py-2.5 text-sm font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atgal
                  </Button>
                  <Button
                    onClick={handleSalesPeopleNext}
                    className="flex-1 bg-[#1d8263] hover:bg-[#166b52] border-2 border-[#1d8263] text-white py-2.5 text-sm font-semibold"
                  >
                    Toliau
                    <ArrowRight className="w-4 h-4 ml-2" />
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

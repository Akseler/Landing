import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useLocation } from "wouter";
import SimpleHeader from "@/components/SimpleHeader";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, Mail, Percent, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { trackPageView, trackQuizResponse, trackEvent, initScrollTracking, initSessionDurationTracking, getSessionId } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";

type SurveyData = {
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
  const [formData, setFormData] = useState<SurveyData>({});
  const [validationErrors, setValidationErrors] = useState<{ 
    [key: string]: string;
  }>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

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
      // Auto-advance to step 2 (first branch-specific question)
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


  // Branch A handlers
  const handleLeadSourceNext = () => {
    if (!formData.leadSource) {
      setValidationErrors({ leadSource: "Prašome pasirinkti atsakymą" });
      return;
    }
    trackQuizResponse(2, 'Iš kur šiandien gaunate daugiausia užklausų?', formData.leadSource);
    setValidationErrors({});
    setStep(3);
  };

  const handleCurrentLeadsNext = () => {
    if (!formData.currentLeads || formData.currentLeads <= 0) {
      setValidationErrors({ currentLeads: "Prašome pasirinkti skaičių" });
      return;
    }
    trackQuizResponse(3, 'Kiek maždaug užklausų gaunate per mėnesį?', String(formData.currentLeads));
    setValidationErrors({});
    setStep(4);
  };

  const handleDesiredLeadsNext = () => {
    if (!formData.desiredLeads || formData.desiredLeads <= 0) {
      setValidationErrors({ desiredLeads: "Prašome pasirinkti skaičių" });
      return;
    }
    trackQuizResponse(4, 'Kiek norėtumėte gauti užklausų per mėnesį?', String(formData.desiredLeads));
    setValidationErrors({});
    handleSubmit();
  };

  // Branch B handlers
  const handleCRMNext = () => {
    if (!formData.usesCRM) {
      setValidationErrors({ usesCRM: "Prašome pasirinkti atsakymą" });
      return;
    }
    trackQuizResponse(2, 'Ar naudojate CRM sistemą?', formData.usesCRM);
    setValidationErrors({});
    setStep(3);
  };

  const handleConversionRateNext = () => {
    if (!formData.conversionRate || formData.conversionRate <= 0) {
      setValidationErrors({ conversionRate: "Prašome pasirinkti skaičių" });
      return;
    }
    trackQuizResponse(3, 'Kiek iš 10 užklausų tampa pardavimais?', String(formData.conversionRate));
    setValidationErrors({});
    setStep(4);
  };

  const handleSalesPeopleNext = () => {
    if (!formData.salesPeople || formData.salesPeople <= 0) {
      setValidationErrors({ salesPeople: "Prašome pasirinkti skaičių" });
      return;
    }
    trackQuizResponse(4, 'Kiek žmonių pas jus dirba su pardavimais?', String(formData.salesPeople));
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
    setIsTransitioning(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setLocation('/booking'), 280);
  };

  // Total steps after removing service question
  const totalSteps = 4;
  // If came with type, step 1 is skipped, so adjust progress calculation
  const adjustedStep = initialType && step > 1 ? step - 1 : step;
  const progress = (adjustedStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SimpleHeader />
      
      <main className="pt-8 md:pt-10 pb-12 md:pb-24 px-6 lg:px-12 flex-1">
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isTransitioning ? 0 : 1 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="max-w-2xl mx-auto"
        >
          <div className="mb-6">
            <div className="w-full bg-[#E0F2E8]/50 border border-[#1d8263]/20 rounded-full h-2.5">
              <div
                className="bg-[#1d8263] h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-foreground/60 mt-2 text-center">
              Žingsnis {adjustedStep} iš {totalSteps}
            </p>
          </div>

          <div
            key={step}
            className="bg-white dark:bg-card border-2 border-border rounded-3xl p-10 md:p-16 mb-6 overflow-hidden transform-gpu"
          >
            
            {/* Step 1: Branch Selection (Ko trūksta) */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Ko labiausiai trūksta jūsų paslaugų verslui?
                  </h2>
                </div>
                
                <div className="max-w-md mx-auto space-y-4">
                  <button
                    onClick={() => handleBranchSelect('A')}
                    className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 group ${
                      branch === 'A'
                        ? "border-[#1d8263] bg-gradient-to-br from-[#1d8263]/15 to-[#1d8263]/5 shadow-lg shadow-[#1d8263]/20 scale-[1.02]"
                        : "border-[#1d8263]/20 bg-[#E0F2E8]/25 hover:border-[#1d8263]/50 hover:bg-[#E0F2E8]/35 hover:scale-[1.01]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 border border-[#1d8263]/15 ${
                        branch === 'A'
                          ? "bg-[#1d8263] text-white shadow-lg"
                          : "bg-[#E0F2E8]/60 text-[#1d8263] group-hover:bg-[#E0F2E8]/75"
                      }`}>
                        <Users className="w-7 h-7" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className={`font-bold text-sm md:text-base block transition-colors ${
                          branch === 'A' ? "text-[#1d8263]" : "text-slate-900"
                        }`}>
                          Reikia pastovaus užklausų srauto
                        </span>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleBranchSelect('B')}
                    className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 group ${
                      branch === 'B'
                        ? "border-[#1d8263] bg-gradient-to-br from-[#1d8263]/15 to-[#1d8263]/5 shadow-lg shadow-[#1d8263]/20 scale-[1.02]"
                        : "border-[#1d8263]/20 bg-[#E0F2E8]/25 hover:border-[#1d8263]/50 hover:bg-[#E0F2E8]/35 hover:scale-[1.01]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 border border-[#1d8263]/15 ${
                        branch === 'B'
                          ? "bg-[#1d8263] text-white shadow-lg"
                          : "bg-[#E0F2E8]/60 text-[#1d8263] group-hover:bg-[#E0F2E8]/75"
                      }`}>
                        <Percent className="w-7 h-7" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className={`font-bold text-sm md:text-base block transition-colors ${
                          branch === 'B' ? "text-[#1d8263]" : "text-slate-900"
                        }`}>
                          Reikia didesnio pardavimų rodiklio
                        </span>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="max-w-md mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/')}
                    className={`${branch ? 'flex-1' : 'w-full'} border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 py-6 text-base font-semibold rounded-xl transition-all duration-300`}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Atgal
                  </Button>
                  {branch && (
                    <Button
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gradient-to-r from-[#1d8263] to-[#166b52] hover:from-[#166b52] hover:to-[#1d8263] border-2 border-[#1d8263] text-white py-6 text-base font-bold rounded-xl shadow-lg shadow-[#1d8263]/30 hover:shadow-xl hover:shadow-[#1d8263]/40 transition-all duration-300 active:scale-100"
                    >
                      Toliau
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Branch A - Step 2: Lead Source */}
            {step === 2 && branch === 'A' && (
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
                    { value: "rekomendacijos", label: "Rekomendacijos" },
                    { value: "kita", label: "Kita" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, leadSource: option.value }));
                        setValidationErrors({});
                      }}
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-300 group ${
                        formData.leadSource === option.value
                          ? "border-[#1d8263] bg-gradient-to-br from-[#1d8263]/15 to-[#1d8263]/5 shadow-md shadow-[#1d8263]/20 scale-[1.02]"
                        : "border-[#1d8263]/20 bg-[#E0F2E8]/25 hover:border-[#1d8263]/50 hover:bg-[#E0F2E8]/35 hover:scale-[1.01]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-base ${
                          formData.leadSource === option.value ? "text-[#1d8263]" : "text-slate-900"
                        }`}>
                          {option.label}
                        </span>
                        {formData.leadSource === option.value && (
                          <CheckCircle2 className="w-5 h-5 text-[#1d8263]" />
                        )}
                      </div>
                    </button>
                  ))}
                  {validationErrors.leadSource && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive text-center"
                    >
                      {validationErrors.leadSource}
                    </motion.p>
                  )}
                </div>

                <div className="max-w-md mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 py-6 text-base font-semibold rounded-xl transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Atgal
                  </Button>
                  <Button
                    onClick={handleLeadSourceNext}
                    className="flex-1 bg-gradient-to-r from-[#1d8263] to-[#166b52] hover:from-[#166b52] hover:to-[#1d8263] border-2 border-[#1d8263] text-white py-6 text-base font-bold rounded-xl shadow-lg shadow-[#1d8263]/30 hover:shadow-xl hover:shadow-[#1d8263]/40 transition-all duration-300 hover:scale-105 active:scale-100"
                  >
                    Toliau
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Branch A - Step 3: Current Leads */}
            {step === 3 && branch === 'A' && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Kiek maždaug užklausų gaunate per mėnesį?
                  </h2>
                </div>
                
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="text-center p-6 rounded-2xl bg-[#E0F2E8]/35 border-2 border-[#1d8263]/20 overflow-hidden transform-gpu">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="w-6 h-6 text-[#1d8263]" />
                      <span className="text-5xl font-extrabold text-[#1d8263]">
                        {formData.currentLeads && formData.currentLeads >= 1000 ? "1,000+" : formData.currentLeads || 0}
                      </span>
                    </div>
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

                <div className="max-w-md mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 py-6 text-base font-semibold rounded-xl transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Atgal
                  </Button>
                  <Button
                    onClick={handleCurrentLeadsNext}
                    className="flex-1 bg-gradient-to-r from-[#1d8263] to-[#166b52] hover:from-[#166b52] hover:to-[#1d8263] border-2 border-[#1d8263] text-white py-6 text-base font-bold rounded-xl shadow-lg shadow-[#1d8263]/30 hover:shadow-xl hover:shadow-[#1d8263]/40 transition-all duration-300 active:scale-100"
                  >
                    Toliau
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Branch A - Step 4: Desired Leads */}
            {step === 4 && branch === 'A' && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Kiek norėtumėte gauti užklausų per mėnesį?
                  </h2>
                </div>
                
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="text-center p-6 rounded-2xl bg-[#E0F2E8]/35 border-2 border-[#1d8263]/20 overflow-hidden transform-gpu">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="w-6 h-6 text-[#1d8263]" />
                      <span className="text-5xl font-extrabold text-[#1d8263]">
                        {formData.desiredLeads && formData.desiredLeads >= 1000 ? "1,000+" : formData.desiredLeads || 0}
                      </span>
                    </div>
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

                <div className="max-w-md mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 py-6 text-base font-semibold rounded-xl transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Atgal
                  </Button>
                  <Button
                    onClick={handleDesiredLeadsNext}
                    className="flex-1 bg-gradient-to-r from-[#1d8263] to-[#166b52] hover:from-[#166b52] hover:to-[#1d8263] border-2 border-[#1d8263] text-white py-6 text-base font-bold rounded-xl shadow-lg shadow-[#1d8263]/30 hover:shadow-xl hover:shadow-[#1d8263]/40 transition-all duration-300 active:scale-100"
                  >
                    Toliau
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Branch B - Step 2: CRM */}
            {step === 2 && branch === 'B' && (
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
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-300 group ${
                        formData.usesCRM === option.value
                          ? "border-[#1d8263] bg-gradient-to-br from-[#1d8263]/15 to-[#1d8263]/5 shadow-md shadow-[#1d8263]/20 scale-[1.02]"
                        : "border-[#1d8263]/20 bg-[#E0F2E8]/25 hover:border-[#1d8263]/50 hover:bg-[#E0F2E8]/35 hover:scale-[1.01]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-base ${
                          formData.usesCRM === option.value ? "text-[#1d8263]" : "text-slate-900"
                        }`}>
                          {option.label}
                        </span>
                        {formData.usesCRM === option.value && (
                          <CheckCircle2 className="w-5 h-5 text-[#1d8263]" />
                        )}
                      </div>
                    </button>
                  ))}
                  {validationErrors.usesCRM && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive text-center"
                    >
                      {validationErrors.usesCRM}
                    </motion.p>
                  )}
                </div>

                <div className="max-w-md mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 py-6 text-base font-semibold rounded-xl transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Atgal
                  </Button>
                  <Button
                    onClick={handleCRMNext}
                    className="flex-1 bg-gradient-to-r from-[#1d8263] to-[#166b52] hover:from-[#166b52] hover:to-[#1d8263] border-2 border-[#1d8263] text-white py-6 text-base font-bold rounded-xl shadow-lg shadow-[#1d8263]/30 hover:shadow-xl hover:shadow-[#1d8263]/40 transition-all duration-300 hover:scale-105 active:scale-100"
                  >
                    Toliau
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Branch B - Step 3: Conversion Rate (Slider) */}
            {step === 3 && branch === 'B' && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Kiek iš 10 užklausų tampa pardavimais?
                  </h2>
                </div>
                
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="text-center p-6 rounded-2xl bg-[#E0F2E8]/35 border-2 border-[#1d8263]/20 overflow-hidden transform-gpu">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="w-6 h-6 text-[#1d8263]" />
                      <span className="text-5xl font-extrabold text-[#1d8263]">{formData.conversionRate || 0}</span>
                    </div>
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

                <div className="max-w-md mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 py-6 text-base font-semibold rounded-xl transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Atgal
                  </Button>
                  <Button
                    onClick={handleConversionRateNext}
                    className="flex-1 bg-gradient-to-r from-[#1d8263] to-[#166b52] hover:from-[#166b52] hover:to-[#1d8263] border-2 border-[#1d8263] text-white py-6 text-base font-bold rounded-xl shadow-lg shadow-[#1d8263]/30 hover:shadow-xl hover:shadow-[#1d8263]/40 transition-all duration-300 active:scale-100"
                  >
                    Toliau
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Branch B - Step 4: Sales People */}
            {step === 4 && branch === 'B' && (
              <div className="space-y-8 animate-fade-in-slide">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 leading-relaxed">
                    Kiek žmonių pas jus dirba su pardavimais?
                  </h2>
                </div>
                
                <div className="max-w-sm mx-auto space-y-6">
                  <div className="text-center p-6 rounded-2xl bg-[#E0F2E8]/35 border-2 border-[#1d8263]/20 overflow-hidden transform-gpu">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="w-6 h-6 text-[#1d8263]" />
                      <span className="text-5xl font-extrabold text-[#1d8263]">
                        {formData.salesPeople && formData.salesPeople >= 20 ? "20+" : formData.salesPeople || 0}
                      </span>
                    </div>
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

                <div className="max-w-md mx-auto flex justify-between gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 py-6 text-base font-semibold rounded-xl transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Atgal
                  </Button>
                  <Button
                    onClick={handleSalesPeopleNext}
                    className="flex-1 bg-gradient-to-r from-[#1d8263] to-[#166b52] hover:from-[#166b52] hover:to-[#1d8263] border-2 border-[#1d8263] text-white py-6 text-base font-bold rounded-xl shadow-lg shadow-[#1d8263]/30 hover:shadow-xl hover:shadow-[#1d8263]/40 transition-all duration-300 active:scale-100"
                  >
                    Toliau
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

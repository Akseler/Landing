import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import WebinarStickyHeader from "@/components/webinar/WebinarStickyHeader";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";
import { trackPageView, trackQuizResponse, trackEvent, linkRegistrationToSession, initScrollTracking, initSessionDurationTracking } from "@/lib/analytics";

type QuizData = {
  servicesOver1000: boolean | null;
  budgetOver1000: boolean | null;
  usesFacebookAds: boolean | null;
  noAdsReason: string;
  name: string;
  phone: string;
  email: string;
};

export default function QuizPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showSuccessThankYou, setShowSuccessThankYou] = useState(false);
  const [formData, setFormData] = useState<QuizData>({
    servicesOver1000: null,
    budgetOver1000: null,
    usesFacebookAds: null,
    noAdsReason: "",
    name: "",
    phone: "",
    email: "",
  });
  const [validationErrors, setValidationErrors] = useState<{ 
    name?: string; 
    phone?: string; 
    email?: string;
    noAdsReason?: string;
  }>({});

  // Track initial page view
  useEffect(() => {
    document.title = "Kvalifikacija";
    trackPageView('/quiz');
    initScrollTracking();
    initSessionDurationTracking();
  }, []);

  // Track step changes
  useEffect(() => {
    if (step > 1) {
      trackEvent('quiz_step_view', '/quiz', undefined, { step });
    }
  }, [step]);

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/quiz/submit", data);
      return await res.json();
    },
    onSuccess: (data) => {
      // Quiz completion is tracked when reaching step 5, not on registration
      if (data?.registration?.id) {
        linkRegistrationToSession(data.registration.id);
      }
      setLocation('/done');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Klaida",
        description: error.message || "Įvyko klaida registruojantis",
      });
    },
  });

  // Validate Lithuanian phone number
  const validatePhone = (phone: string): boolean => {
    const trimmed = phone.trim();
    const phoneRegex = /^(\+370|8)[0-9]{8,9}$/;
    return phoneRegex.test(trimmed);
  };

  // Validate email
  const validateEmail = (email: string): boolean => {
    const trimmed = email.trim();
    return trimmed.includes("@") && trimmed.length > 2;
  };

  // Step 1: Services over €1000
  const handleServicesAnswer = (value: boolean) => {
    setFormData((prev) => ({ ...prev, servicesOver1000: value }));
    trackQuizResponse(1, 'Ar teikiate paslaugas, kurių suma viršija €1,000?', value ? 'Taip' : 'Ne');
    
    if (!value) {
      // Non-qualified lead → show thank you
      setTimeout(() => {
        setShowThankYou(true);
      }, 300);
    } else {
      // Move to budget question
      setTimeout(() => {
        setStep(2);
      }, 300);
    }
  };

  // Step 2: Budget over €1000
  const handleBudgetAnswer = (value: boolean) => {
    setFormData((prev) => ({ ...prev, budgetOver1000: value }));
    trackQuizResponse(2, 'Ar išleidžiate bent €1,000 ant reklamos?', value ? 'Taip' : 'Ne');
    
    if (value) {
      // Has budget → skip to contact form
      trackEvent('quiz_completed', '/quiz'); // Track quiz completion when reaching contact form
      setTimeout(() => {
        setStep(5);
      }, 300);
    } else {
      // No budget → ask about Facebook ads
      setTimeout(() => {
        setStep(3);
      }, 300);
    }
  };

  // Step 3: Facebook/Instagram ads
  const handleFacebookAdsAnswer = (value: boolean) => {
    setFormData((prev) => ({ ...prev, usesFacebookAds: value }));
    trackQuizResponse(3, 'Ar leidžiate reklamą Facebook/Instagram?', value ? 'Taip' : 'Ne');
    
    if (value) {
      // Uses ads → skip to contact form
      trackEvent('quiz_completed', '/quiz'); // Track quiz completion when reaching contact form
      setTimeout(() => {
        setStep(5);
      }, 300);
    } else {
      // Doesn't use ads → ask why
      setTimeout(() => {
        setStep(4);
      }, 300);
    }
  };

  // Step 4: Why no Facebook ads → then go to contacts
  const handleNoAdsReasonSubmit = () => {
    const errors: { noAdsReason?: string } = {};
    
    if (!formData.noAdsReason.trim()) {
      errors.noAdsReason = "Prašome įvesti priežastį";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    trackQuizResponse(4, 'Kodėl neleidžiate reklamos Facebook platformose?', formData.noAdsReason);
    trackEvent('quiz_completed', '/quiz'); // Track quiz completion when reaching contact form
    setStep(5);
  };

  const handleInputChange = (field: keyof QuizData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = () => {
    const errors: { name?: string; phone?: string; email?: string } = {};

    // Validate name
    if (!formData.name.trim()) {
      errors.name = "Prašome įvesti vardą ir pavardę";
    }

    // Validate phone
    if (!formData.phone.trim()) {
      errors.phone = "Prašome įvesti telefono numerį";
    } else if (!validatePhone(formData.phone)) {
      errors.phone = "Neteisingas telefono numeris (pvz., +37062200200)";
    }

    // Validate email
    if (!formData.email.trim()) {
      errors.email = "Prašome įvesti el. paštą";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Neteisingas el. paštas (turi turėti @)";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast({
        variant: "destructive",
        title: "Prašome pataisyti klaidas",
        description: "Patikrinkite įvestus duomenis",
      });
      return;
    }

    // Submit - coerce nullable booleans to false and empty strings to ""
    const registrationData = {
      servicesOver1000: formData.servicesOver1000!,
      budgetOver1000: formData.budgetOver1000 ?? false,
      usesFacebookAds: formData.usesFacebookAds ?? false,
      noAdsReason: formData.noAdsReason.trim() || "",
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
    };

    registerMutation.mutate(registrationData);
  };

  // Calculate visual progress (simplified 3-step display)
  const getVisualStep = () => {
    if (step === 1) return 1; // First question
    if (step === 2 || step === 3 || step === 4) return 2; // Middle questions
    if (step === 5) return 3; // Contact form
    return 1;
  };

  const visualStep = getVisualStep();
  const totalSteps = 3; // Always show 3 steps for simplicity
  const progress = (visualStep / totalSteps) * 100;

  // Success Thank You page after registration
  if (showSuccessThankYou) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <WebinarStickyHeader />
        
        <main className="pt-12 md:pt-12 pb-12 md:pb-24 px-6 lg:px-12 flex-1">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-card border-2 border-border rounded-3xl p-8 md:p-12 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-[#1d8263]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-[#1d8263]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight" data-testid="success-title">
                  Jūsų vieta rezervuota,<br />bet dar nepatvirtinta
                </h2>
              </div>
              
              <div className="space-y-6 text-center max-w-md mx-auto">
                <div className="bg-[#1d8263]/5 border-2 border-[#1d8263]/20 rounded-2xl p-6">
                  <div className="flex items-start gap-3 text-left">
                    <div className="w-8 h-8 bg-[#1d8263] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">AI</span>
                    </div>
                    <div>
                      <p className="text-base md:text-lg text-foreground/90 leading-relaxed">
                        Su jumis susisieks mūsų AI darbuotojas, kuris patvirtins Jūsų vietą vebinare ir užduos keleta klausimų.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 text-center">
                  <p className="text-sm text-foreground/60">
                    Jei turite klausimų, rašykite:{" "}
                    <a 
                      href="mailto:info@akseler.lt" 
                      className="text-[#1d8263] hover:text-[#1d8263]/80 font-medium underline"
                      data-testid="link-support-email"
                    >
                      info@akseler.lt
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Unqualified page - for those who don't meet criteria
  if (showThankYou) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <WebinarStickyHeader />
        
        <main className="pt-12 md:pt-12 pb-12 md:pb-24 px-6 lg:px-12 flex-1">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-card border-2 border-border rounded-3xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-6" data-testid="unqualified-title">
                Ačiū už jūsų susidomėjimą!
              </h2>
              <p className="text-lg text-foreground/70 mb-6 leading-relaxed">
                Deja, šis vebinaras skirtas tik aukštos vertės paslaugų teikėjams.
                <br />
                <br />
                Kitais klausimais galite susisiekti su mumis el.paštu:
                <br />
                <a 
                  href="mailto:info@akseler.lt" 
                  className="text-[#1d8263] hover:text-[#1d8263]/80 font-medium underline"
                  data-testid="link-contact-email"
                >
                  info@akseler.lt
                </a>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <WebinarStickyHeader />
      
      <main className="pt-12 md:pt-12 pb-12 md:pb-24 px-6 lg:px-12 flex-1">
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-12">
            <div className="w-full bg-muted border border-border rounded-full h-2.5">
              <div
                className="bg-[#1d8263] h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
                data-testid="quiz-progress"
              />
            </div>
            <p className="text-sm text-foreground/60 mt-2 text-center">
              Žingsnis {visualStep} iš {totalSteps}
            </p>
          </div>

          <div className="bg-white dark:bg-card border-2 border-border rounded-3xl p-10 md:p-16 mb-6">
            {/* Step 1: Services over €1000 */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-in-slide">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 leading-relaxed" data-testid="quiz-question-1">
                  Ar teikiate paslaugas,<br /> kurių suma viršyja €1,000?
                </h2>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleServicesAnswer(true)}
                    className="w-full bg-[#1d8263]/10 border-[#1d8263]/30"
                    data-testid="button-services-yes"
                  >
                    Taip
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleServicesAnswer(false)}
                    className="w-full bg-red-500/10 border-red-500/30"
                    data-testid="button-services-no"
                  >
                    Ne
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Budget over €1000 */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in-slide">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 leading-relaxed" data-testid="quiz-question-2">
                  Ar išleidžiate bent €1,000<br /> ant reklamos?
                </h2>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleBudgetAnswer(true)}
                    className="w-full bg-[#1d8263]/10 border-[#1d8263]/30"
                    data-testid="button-budget-yes"
                  >
                    Taip
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleBudgetAnswer(false)}
                    className="w-full bg-red-500/10 border-red-500/30"
                    data-testid="button-budget-no"
                  >
                    Ne
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Facebook/Instagram ads */}
            {step === 3 && (
              <div className="space-y-8 animate-fade-in-slide">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 leading-relaxed" data-testid="quiz-question-3">
                  Ar leidžiate reklamą<br /> Facebook/Instagram?
                </h2>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleFacebookAdsAnswer(true)}
                    className="w-full bg-[#1d8263]/10 border-[#1d8263]/30"
                    data-testid="button-facebook-yes"
                  >
                    Taip
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleFacebookAdsAnswer(false)}
                    className="w-full bg-red-500/10 border-red-500/30"
                    data-testid="button-facebook-no"
                  >
                    Ne
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Why no Facebook ads */}
            {step === 4 && (
              <div className="space-y-8 animate-fade-in-slide">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 leading-relaxed" data-testid="quiz-question-4">
                  Kodėl neleidžiate reklamos<br /> Facebook platformose?
                </h2>
                <div className="space-y-4">
                  <Textarea
                    value={formData.noAdsReason}
                    onChange={(e) => handleInputChange("noAdsReason", e.target.value)}
                    placeholder="Įveskite priežastį..."
                    className={validationErrors.noAdsReason ? "border-destructive min-h-[120px]" : "min-h-[120px]"}
                    data-testid="input-no-ads-reason"
                  />
                  {validationErrors.noAdsReason && (
                    <p className="text-sm text-destructive">{validationErrors.noAdsReason}</p>
                  )}
                </div>
                <div className="flex justify-center mt-8">
                  <Button
                    size="lg"
                    onClick={handleNoAdsReasonSubmit}
                    className="bg-[#1d8263] hover:bg-[#1d8263]/90"
                    data-testid="button-reason-next"
                  >
                    Toliau
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Contact Form */}
            {step === 5 && (
              <div className="space-y-8 animate-fade-in-slide">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 leading-relaxed" data-testid="quiz-question-5">
                  Registracija
                </h2>

                <div className="space-y-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Vardas ir pavardė *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Vardas Pavardė"
                      data-testid="input-name"
                      className={validationErrors.name ? "border-destructive" : ""}
                    />
                    {validationErrors.name && (
                      <p className="text-sm text-destructive">{validationErrors.name}</p>
                    )}
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefono numeris *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+370 62 200 200"
                      data-testid="input-phone"
                      className={validationErrors.phone ? "border-destructive" : ""}
                    />
                    {validationErrors.phone && (
                      <p className="text-sm text-destructive">{validationErrors.phone}</p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <Label htmlFor="email">El. paštas *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="vardas@pavyzdys.lt"
                      data-testid="input-email"
                      className={validationErrors.email ? "border-destructive" : ""}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-destructive">{validationErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={registerMutation.isPending}
                    className="px-12 bg-gradient-to-r from-[#1d8263] to-[#066b5a] hover:shadow-xl shadow-lg border-2 border-[#1d8263]/20 transition-all"
                    data-testid="button-submit"
                  >
                    {registerMutation.isPending ? "Siunčiama..." : "Patvirtinti"}
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

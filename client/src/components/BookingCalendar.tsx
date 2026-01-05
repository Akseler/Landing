import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, ArrowRight, Check, Calendar, Clock, User, Building2, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { lt } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';
import { trackEvent, getSessionId } from '@/lib/analytics';

const TIMEZONE = 'Europe/Vilnius';

// Types
interface TimeSlot {
  datetime: string;
  available: boolean;
}

interface DayAvailability {
  date: string;
  dayName: string;
  slots: TimeSlot[];
  hasAvailableSlots: boolean;
}

interface ContactInfo {
  name: string;
  company: string;
  phone: string;
  email: string;
}

interface SurveyData {
  leads: number;
  value: number;
  closeRate: number;
  speed: string;
}

interface BookingCalendarProps {
  surveyData?: SurveyData;
  moneyLost?: number;
}

type Step = 'contact' | 'date' | 'time' | 'confirm' | 'success';

export default function BookingCalendar({ surveyData, moneyLost }: BookingCalendarProps) {
  const [step, setStep] = useState<Step>('date');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  
  // Form state
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    company: '',
    phone: '',
    email: '',
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch availability on mount
  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/calendar/availability');
      if (!response.ok) {
        throw new Error('Nepavyko gauti laisvų laikų');
      }
      const data = await response.json();
      setAvailability(data);
    } catch (err: any) {
      setError(err.message || 'Įvyko klaida');
    } finally {
      setIsLoading(false);
    }
  };

  // Validate contact info
  const validateContactInfo = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!contactInfo.name.trim() || contactInfo.name.trim().length < 2) {
      errors.name = 'Įveskite vardą (bent 2 simboliai)';
    }
    
    if (!contactInfo.company.trim() || contactInfo.company.trim().length < 2) {
      errors.company = 'Įveskite įmonės pavadinimą';
    }
    
    const phoneClean = contactInfo.phone.replace(/\s/g, '');
    if (!phoneClean || !/^[+]?[0-9-]{6,20}$/.test(phoneClean)) {
      errors.phone = 'Įveskite teisingą telefono numerį';
    }
    
    if (!contactInfo.email.trim() || !contactInfo.email.includes('@')) {
      errors.email = 'Įveskite teisingą el. pašto adresą';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Send contact info to webhook
  const sendContactWebhook = async () => {
    try {
      const response = await fetch('/api/calendar/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactInfo.name,
          company: contactInfo.company,
          phone: contactInfo.phone,
          email: contactInfo.email,
          surveyData: surveyData || undefined,
        }),
      });
      
      if (response.ok) {
        console.log('[Booking] Contact webhook sent successfully');
      } else {
        console.error('[Booking] Contact webhook failed');
      }
    } catch (error) {
      console.error('[Booking] Error sending contact webhook:', error);
      // Don't block the flow if webhook fails
    }
  };

  // Handle step navigation
  const goToNextStep = () => {
    if (step === 'date') {
      if (selectedDate) {
        trackEvent('booking_date_selected', '/booking', 'booking-date-picker', { date: selectedDate });
        setStep('time');
      }
    } else if (step === 'time') {
      if (selectedSlot) {
        trackEvent('booking_time_selected', '/booking', 'booking-time-picker', { datetime: selectedSlot.datetime });
        setStep('contact');
      }
    } else if (step === 'contact') {
      if (validateContactInfo()) {
        trackEvent('booking_contact_submitted', '/booking', 'booking-contact-form');
        // Send contact info to webhook
        sendContactWebhook();
        setStep('confirm');
      }
    }
  };

  const goToPreviousStep = () => {
    if (step === 'time') setStep('date');
    else if (step === 'contact') setStep('time');
    else if (step === 'confirm') setStep('contact');
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!selectedSlot) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const bookingData = {
        ...contactInfo,
        datetime: selectedSlot.datetime,
        surveyData,
        sessionId: getSessionId(),
      };
      
      const response = await fetch('/api/calendar/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.errors?.join(', ') || result.error || 'Nepavyko užregistruoti rezervacijos');
      }
      
      // Track successful booking
      trackEvent('booking_completed', '/booking', 'booking-submit', {
        email: contactInfo.email,
        datetime: selectedSlot.datetime,
      });
      
      // Fire Facebook Pixel event if available
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Schedule', {
          content_name: 'Akseler Demo Call',
          value: moneyLost || 0,
          currency: 'EUR',
        });
      }
      
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Įvyko klaida');
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected day's slots
  const selectedDaySlots = selectedDate 
    ? availability.find(d => d.date === selectedDate)?.slots || []
    : [];

  // Format time for display (convert to Vilnius timezone)
  const formatTime = (isoString: string) => {
    const date = parseISO(isoString);
    const vilniusTime = toZonedTime(date, TIMEZONE);
    return format(vilniusTime, 'HH:mm');
  };

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, 'MMMM d, EEEE', { locale: lt });
  };

  // Short numeric date for confirmation (e.g. 2025-12-16)
  const formatDateShort = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, 'yyyy-MM-dd', { locale: lt });
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { key: 'date', label: 'Data', icon: Calendar },
      { key: 'time', label: 'Laikas', icon: Clock },
      { key: 'contact', label: 'Kontaktai', icon: User },
      { key: 'confirm', label: 'Patvirtinimas', icon: Check },
    ];
    
    const currentIndex = steps.findIndex(s => s.key === step);
    
    return (
      <div className="mb-6">
        <div className="relative">
          {/* Progress line behind bubbles */}
          <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-white/25 border border-white/35" />
          <div
            className="absolute left-0 top-5 h-1 rounded-full bg-white transition-all duration-300"
            style={{ width: `${Math.max(1, ((currentIndex + 1) / steps.length) * 100)}%` }}
          />

          <div className="grid grid-cols-4 gap-2 relative z-10">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = s.key === step;
              const isCompleted = index < currentIndex;

              return (
                <div key={s.key} className="flex flex-col items-center min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border shadow-sm ${
                      isActive
                        ? 'bg-white/18 text-white border-white/30 backdrop-blur'
                        : isCompleted
                        ? 'bg-white text-[#1d8263] border-white/40'
                        : 'bg-white/10 text-white/70 border-white/20 backdrop-blur'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-[#1d8263]" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div
                    className={`mt-1 text-[10px] font-semibold text-center leading-tight truncate w-full ${
                      isActive ? 'text-white' : 'text-white/80'
                    }`}
                    title={s.label}
                  >
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render contact form step
  const renderContactStep = () => (
    <div className="space-y-5">
      <h3 className="text-2xl font-bold text-center mb-6 text-white">Jūsų kontaktai</h3>
      
      <div className="space-y-5">
        <div>
          <Label htmlFor="name" className="flex items-center gap-2 mb-2.5 text-white/90 font-semibold">
            <User className="w-4 h-4 text-white" />
            Vardas *
          </Label>
          <Input
            id="name"
            value={contactInfo.name}
            onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
            placeholder="Jonas Jonaitis"
            className={`h-12 rounded-xl border-2 bg-white/10 text-white placeholder:text-white/40 backdrop-blur ${
              validationErrors.name ? 'border-red-400' : 'border-white/20 focus:border-white/40'
            } focus:ring-2 focus:ring-white/15`}
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1.5">{validationErrors.name}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="company" className="flex items-center gap-2 mb-2.5 text-white/90 font-semibold">
            <Building2 className="w-4 h-4 text-white" />
            Įmonė *
          </Label>
          <Input
            id="company"
            value={contactInfo.company}
            onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })}
            placeholder="UAB Įmonė"
            className={`h-12 rounded-xl border-2 bg-white/10 text-white placeholder:text-white/40 backdrop-blur ${
              validationErrors.company ? 'border-red-400' : 'border-white/20 focus:border-white/40'
            } focus:ring-2 focus:ring-white/15`}
          />
          {validationErrors.company && (
            <p className="text-red-500 text-sm mt-1.5">{validationErrors.company}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="phone" className="flex items-center gap-2 mb-2.5 text-white/90 font-semibold">
            <Phone className="w-4 h-4 text-white" />
            Telefonas *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={contactInfo.phone}
            onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
            placeholder="+370 600 00000"
            className={`h-12 rounded-xl border-2 bg-white/10 text-white placeholder:text-white/40 backdrop-blur ${
              validationErrors.phone ? 'border-red-400' : 'border-white/20 focus:border-white/40'
            } focus:ring-2 focus:ring-white/15`}
          />
          {validationErrors.phone && (
            <p className="text-red-500 text-sm mt-1.5">{validationErrors.phone}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email" className="flex items-center gap-2 mb-2.5 text-white/90 font-semibold">
            <Mail className="w-4 h-4 text-white" />
            El. paštas *
          </Label>
          <Input
            id="email"
            type="email"
            value={contactInfo.email}
            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
            placeholder="jonas@imone.lt"
            className={`h-12 rounded-xl border-2 bg-white/10 text-white placeholder:text-white/40 backdrop-blur ${
              validationErrors.email ? 'border-red-400' : 'border-white/20 focus:border-white/40'
            } focus:ring-2 focus:ring-white/15`}
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1.5">{validationErrors.email}</p>
          )}
        </div>
      </div>
      
      <Button
        onClick={goToNextStep}
        className="w-full mt-8 bg-white hover:bg-white/90 text-[#1d8263] font-extrabold py-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-300"
        size="lg"
      >
        Toliau
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );

  // Render date selection step
  const renderDateStep = () => (
    <div className="space-y-5">
      <h3 className="text-2xl font-bold text-center mb-5 text-white">Pasirinkite datą</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1d8263]" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchAvailability} variant="outline" className="border-2 border-slate-300">
            Bandyti dar kartą
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {availability.map((day) => (
            <button
              key={day.date}
              onClick={() => day.hasAvailableSlots && setSelectedDate(day.date)}
              disabled={!day.hasAvailableSlots}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                selectedDate === day.date
                  ? 'border-white/40 bg-white/90 shadow-lg shadow-black/20 scale-105'
                  : day.hasAvailableSlots
                  ? 'border-white/20 bg-white/10 hover:bg-white/14 hover:border-white/35 hover:shadow-md cursor-pointer backdrop-blur'
                  : 'border-white/10 bg-white/5 cursor-not-allowed opacity-50'
              }`}
            >
              <div className={`text-xs font-semibold mb-1 ${
                selectedDate === day.date ? 'text-[#1d8263]' : day.hasAvailableSlots ? 'text-white/80' : 'text-white/50'
              }`}>
                {day.dayName}
              </div>
              <div className={`font-bold text-sm ${
                selectedDate === day.date ? 'text-[#1d8263]' : day.hasAvailableSlots ? 'text-white' : 'text-white/60'
              }`}>
                {format(parseISO(day.date), 'MMMM d', { locale: lt })}
              </div>
              {!day.hasAvailableSlots && (
                <div className="text-xs text-white/60 mt-1">Užimta</div>
              )}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex gap-3 mt-6">
        <Button
          onClick={goToNextStep}
          className="w-full bg-white hover:bg-white/90 text-[#1d8263] font-extrabold py-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          disabled={!selectedDate}
        >
          Toliau
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Render time selection step
  const renderTimeStep = () => (
    <div className="space-y-5">
      <h3 className="text-2xl font-bold text-center mb-1 text-white">Pasirinkite laiką</h3>
      <p className="text-center text-white/85 mb-5 font-medium text-sm md:text-base">
        {selectedDate && formatDateDisplay(selectedDate)}
      </p>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {selectedDaySlots.map((slot) => (
          <button
            key={slot.datetime}
            onClick={() => slot.available && setSelectedSlot(slot)}
            disabled={!slot.available}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              selectedSlot?.datetime === slot.datetime
                ? 'border-white/40 bg-white/90 shadow-lg shadow-black/20 scale-105'
                : slot.available
                ? 'border-white/20 bg-white/10 hover:bg-white/14 hover:border-white/35 hover:shadow-md cursor-pointer backdrop-blur'
                : 'border-white/10 bg-white/5 cursor-not-allowed opacity-50 line-through'
            }`}
          >
            <Clock className={`w-5 h-5 mx-auto mb-2 ${
              selectedSlot?.datetime === slot.datetime
                ? 'text-[#1d8263]'
                : slot.available
                ? 'text-white/70'
                : 'text-white/40'
            }`} />
            <div className={`font-bold text-sm ${
              selectedSlot?.datetime === slot.datetime
                ? 'text-[#1d8263]'
                : slot.available
                ? 'text-white'
                : 'text-white/55'
            }`}>
              {formatTime(slot.datetime)}
            </div>
          </button>
        ))}
      </div>
      
      <div className="flex gap-3 mt-6">
        <Button
          onClick={goToPreviousStep}
          className="flex-1 bg-[#1d8263] hover:bg-[#166b52] text-white border-2 border-white/25 font-extrabold py-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Atgal
        </Button>
        <Button
          onClick={goToNextStep}
          className="flex-1 bg-white hover:bg-white/90 text-[#1d8263] font-extrabold py-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          disabled={!selectedSlot}
        >
          Toliau
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Render confirmation step
  const renderConfirmStep = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-center mb-5 text-white">Patvirtinkite rezervaciją</h3>
      
      <div className="bg-white/10 rounded-2xl border border-white/20 backdrop-blur shadow-lg shadow-black/15 p-5 space-y-3 text-white">
        <div className="flex items-start gap-3">
          <User className="w-4 h-4 text-white mt-0.5" />
          <div className="min-w-0">
            <div className="text-[11px] text-white/70 font-semibold">Vardas</div>
            <div className="text-sm font-bold text-white break-words">{contactInfo.name}</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Building2 className="w-4 h-4 text-white mt-0.5" />
          <div className="min-w-0">
            <div className="text-[11px] text-white/70 font-semibold">Įmonė</div>
            <div className="text-sm font-bold text-white break-words">{contactInfo.company}</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Phone className="w-4 h-4 text-white mt-0.5" />
          <div className="min-w-0">
            <div className="text-[11px] text-white/70 font-semibold">Telefonas</div>
            <div className="text-sm font-bold text-white break-words">{contactInfo.phone}</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Mail className="w-4 h-4 text-white mt-0.5" />
          <div className="min-w-0">
            <div className="text-[11px] text-white/70 font-semibold">El. paštas</div>
            <div className="text-sm font-bold text-white break-all">{contactInfo.email}</div>
          </div>
        </div>

        <div className="mt-2 rounded-2xl border border-white/20 bg-white/10 backdrop-blur px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-white/75">Data ir laikas</div>
            <div className="text-base font-extrabold text-white truncate">
              {selectedDate && formatDateShort(selectedDate)} {selectedSlot && formatTime(selectedSlot.datetime)}
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-3 mt-8">
        <Button
          onClick={goToPreviousStep}
          className="flex-1 bg-[#1d8263] hover:bg-[#166b52] text-white border-2 border-white/25 font-extrabold py-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          disabled={isLoading}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Atgal
        </Button>
        <Button
          onClick={handleBooking}
          className="flex-1 bg-white hover:bg-white/90 text-[#1d8263] font-extrabold py-6 rounded-xl shadow-lg shadow-black/20 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Registruojama...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Patvirtinti
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Render success step
  const renderSuccessStep = () => (
    <div className="text-center py-6 md:py-8">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-white/18 border border-white/25 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-lg shadow-black/20 backdrop-blur">
        <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
      </div>
      
      <h3 className="text-2xl md:text-3xl font-extrabold mb-3 text-white whitespace-nowrap">
        Rezervacija gauta
      </h3>
      <p className="text-white/85 mb-6 md:mb-8 text-base md:text-lg">
        Patvirtinimo laiškas išsiųstas į{" "}
        <strong className="text-white">{contactInfo.email}</strong>
      </p>
      
      <div className="bg-white/10 rounded-2xl border border-white/20 backdrop-blur shadow-lg shadow-black/15 p-5 md:p-6 max-w-sm mx-auto text-white">
        <div className="flex items-center justify-center gap-2 text-slate-900 font-extrabold whitespace-nowrap">
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-base md:text-lg text-white">
            {selectedDate && formatDateShort(selectedDate)}{" "}
            {selectedSlot && formatTime(selectedSlot.datetime)}
          </span>
        </div>

        <div className="h-px bg-white/15 my-4" />

        <div className="text-left space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/18 border border-white/20 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
              1
            </div>
            <div className="text-sm md:text-[15px] text-white/90 font-semibold leading-snug">
              Patvirtinkite el. paštu atsiųstą pakvietimą į mūsų pokalbį
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/18 border border-white/20 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
              2
            </div>
            <div className="text-sm md:text-[15px] text-white/90 font-semibold leading-snug">
              Su jumis SMS žinute susisieks mūsų komanda
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1d8263] via-[#167a5a] to-[#0f5f46] border border-white/15 rounded-2xl p-6 md:p-8 shadow-xl shadow-[#1d8263]/25">
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-black/20 blur-3xl" />
        <div className="relative z-10">
        {step !== 'success' && renderStepIndicator()}
        
        {step === 'date' && renderDateStep()}
        {step === 'time' && renderTimeStep()}
        {step === 'contact' && renderContactStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
}


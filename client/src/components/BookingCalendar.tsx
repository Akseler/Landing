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
  const [step, setStep] = useState<Step>('contact');
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
    if (step === 'contact') {
      if (validateContactInfo()) {
        trackEvent('booking_contact_submitted', '/booking', 'booking-contact-form');
        // Send contact info to webhook
        sendContactWebhook();
        setStep('date');
      }
    } else if (step === 'date') {
      if (selectedDate) {
        trackEvent('booking_date_selected', '/booking', 'booking-date-picker', { date: selectedDate });
        setStep('time');
      }
    } else if (step === 'time') {
      if (selectedSlot) {
        trackEvent('booking_time_selected', '/booking', 'booking-time-picker', { datetime: selectedSlot.datetime });
        setStep('confirm');
      }
    }
  };

  const goToPreviousStep = () => {
    if (step === 'date') setStep('contact');
    else if (step === 'time') setStep('date');
    else if (step === 'confirm') setStep('time');
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

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { key: 'contact', label: 'Kontaktai', icon: User },
      { key: 'date', label: 'Data', icon: Calendar },
      { key: 'time', label: 'Laikas', icon: Clock },
      { key: 'confirm', label: 'Patvirtinimas', icon: Check },
    ];
    
    const currentIndex = steps.findIndex(s => s.key === step);
    
    return (
      <div className="mb-6">
        <div className="grid grid-cols-4 gap-2">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = s.key === step;
            const isCompleted = index < currentIndex;

            return (
              <div key={s.key} className="flex flex-col items-center min-w-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border shadow-sm ${
                    isActive
                      ? 'bg-[#1d8263] text-white border-[#1d8263]'
                      : isCompleted
                      ? 'bg-white text-[#1d8263] border-[#1d8263]/30'
                      : 'bg-white/80 text-slate-400 border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div
                  className={`mt-1 text-[10px] font-semibold text-center leading-tight truncate w-full ${
                    isActive ? 'text-[#1d8263]' : 'text-slate-500'
                  }`}
                  title={s.label}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 h-1 w-full rounded-full bg-white/60 border border-[#1d8263]/15 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1d8263] to-[#166b52] rounded-full transition-all duration-300"
            style={{ width: `${Math.max(1, ((currentIndex + 1) / steps.length) * 100)}%` }}
          />
        </div>
      </div>
    );
  };

  // Render contact form step
  const renderContactStep = () => (
    <div className="space-y-5">
      <h3 className="text-2xl font-bold text-center mb-6 text-slate-900">Jūsų kontaktai</h3>
      
      <div className="space-y-5">
        <div>
          <Label htmlFor="name" className="flex items-center gap-2 mb-2.5 text-slate-700 font-semibold">
            <User className="w-4 h-4 text-[#1d8263]" />
            Vardas *
          </Label>
          <Input
            id="name"
            value={contactInfo.name}
            onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
            placeholder="Jonas Jonaitis"
            className={`h-12 bg-white border-2 ${validationErrors.name ? 'border-red-500' : 'border-slate-200 focus:border-[#1d8263]'} rounded-xl`}
          />
          {validationErrors.name && (
            <p className="text-red-500 text-sm mt-1.5">{validationErrors.name}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="company" className="flex items-center gap-2 mb-2.5 text-slate-700 font-semibold">
            <Building2 className="w-4 h-4 text-[#1d8263]" />
            Įmonė *
          </Label>
          <Input
            id="company"
            value={contactInfo.company}
            onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })}
            placeholder="UAB Įmonė"
            className={`h-12 bg-white border-2 ${validationErrors.company ? 'border-red-500' : 'border-slate-200 focus:border-[#1d8263]'} rounded-xl`}
          />
          {validationErrors.company && (
            <p className="text-red-500 text-sm mt-1.5">{validationErrors.company}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="phone" className="flex items-center gap-2 mb-2.5 text-slate-700 font-semibold">
            <Phone className="w-4 h-4 text-[#1d8263]" />
            Telefonas *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={contactInfo.phone}
            onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
            placeholder="+370 600 00000"
            className={`h-12 bg-white border-2 ${validationErrors.phone ? 'border-red-500' : 'border-slate-200 focus:border-[#1d8263]'} rounded-xl`}
          />
          {validationErrors.phone && (
            <p className="text-red-500 text-sm mt-1.5">{validationErrors.phone}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email" className="flex items-center gap-2 mb-2.5 text-slate-700 font-semibold">
            <Mail className="w-4 h-4 text-[#1d8263]" />
            El. paštas *
          </Label>
          <Input
            id="email"
            type="email"
            value={contactInfo.email}
            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
            placeholder="jonas@imone.lt"
            className={`h-12 bg-white border-2 ${validationErrors.email ? 'border-red-500' : 'border-slate-200 focus:border-[#1d8263]'} rounded-xl`}
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1.5">{validationErrors.email}</p>
          )}
        </div>
      </div>
      
      <Button
        onClick={goToNextStep}
        className="w-full mt-8 bg-gradient-to-r from-[#1d8263] to-[#166b52] hover:from-[#166b52] hover:to-[#1d8263] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#1d8263]/30 hover:shadow-xl transition-all duration-300"
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
      <h3 className="text-2xl font-bold text-center mb-5 text-slate-900">Pasirinkite datą</h3>
      
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
                  ? 'border-[#1d8263] bg-white shadow-lg shadow-[#1d8263]/20 scale-105'
                  : day.hasAvailableSlots
                  ? 'border-slate-200 bg-white hover:border-[#1d8263]/50 hover:shadow-md cursor-pointer'
                  : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-50'
              }`}
            >
              <div className={`text-xs font-semibold mb-1 ${
                selectedDate === day.date ? 'text-[#1d8263]' : day.hasAvailableSlots ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {day.dayName}
              </div>
              <div className={`font-bold text-sm ${
                selectedDate === day.date ? 'text-[#1d8263]' : 'text-slate-900'
              }`}>
                {format(parseISO(day.date), 'MMMM d', { locale: lt })}
              </div>
              {!day.hasAvailableSlots && (
                <div className="text-xs text-slate-400 mt-1">Užimta</div>
              )}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex gap-3 mt-6">
        <Button onClick={goToPreviousStep} variant="outline" className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 py-6 rounded-xl font-semibold">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Atgal
        </Button>
        <Button
          onClick={goToNextStep}
          className="flex-1 bg-gradient-to-r from-[#1d8263] to-[#166b52] hover:from-[#166b52] hover:to-[#1d8263] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#1d8263]/30 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
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
      <h3 className="text-2xl font-bold text-center mb-1 text-slate-900">Pasirinkite laiką</h3>
      <p className="text-center text-slate-600 mb-5 font-medium text-sm md:text-base">
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
                ? 'border-[#1d8263] bg-white shadow-lg shadow-[#1d8263]/20 scale-105'
                : slot.available
                ? 'border-slate-200 bg-white hover:border-[#1d8263]/50 hover:shadow-md cursor-pointer'
                : 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-50 line-through'
            }`}
          >
            <Clock className={`w-5 h-5 mx-auto mb-2 ${
              selectedSlot?.datetime === slot.datetime
                ? 'text-[#1d8263]'
                : slot.available
                ? 'text-slate-400'
                : 'text-slate-300'
            }`} />
            <div className={`font-bold text-sm ${
              selectedSlot?.datetime === slot.datetime
                ? 'text-[#1d8263]'
                : slot.available
                ? 'text-slate-900'
                : 'text-slate-400'
            }`}>
              {formatTime(slot.datetime)}
            </div>
          </button>
        ))}
      </div>
      
      <div className="flex gap-3 mt-6">
        <Button onClick={goToPreviousStep} variant="outline" className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 py-6 rounded-xl font-semibold">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Atgal
        </Button>
        <Button
          onClick={goToNextStep}
          className="flex-1 bg-gradient-to-r from-[#1d8263] to-[#166b52] hover:from-[#166b52] hover:to-[#1d8263] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#1d8263]/30 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
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
      <h3 className="text-2xl font-bold text-center mb-5 text-slate-900">Patvirtinkite rezervaciją</h3>
      
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-5 space-y-3">
        <div className="flex items-start gap-3">
          <User className="w-4 h-4 text-[#1d8263] mt-0.5" />
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 font-semibold">Vardas</div>
            <div className="text-sm font-bold text-slate-900 break-words">{contactInfo.name}</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Building2 className="w-4 h-4 text-[#1d8263] mt-0.5" />
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 font-semibold">Įmonė</div>
            <div className="text-sm font-bold text-slate-900 break-words">{contactInfo.company}</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Phone className="w-4 h-4 text-[#1d8263] mt-0.5" />
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 font-semibold">Telefonas</div>
            <div className="text-sm font-bold text-slate-900 break-words">{contactInfo.phone}</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Mail className="w-4 h-4 text-[#1d8263] mt-0.5" />
          <div className="min-w-0">
            <div className="text-[11px] text-slate-500 font-semibold">El. paštas</div>
            <div className="text-sm font-bold text-slate-900 break-all">{contactInfo.email}</div>
          </div>
        </div>

        <div className="mt-2 rounded-2xl border border-[#1d8263]/20 bg-gradient-to-br from-[#E0F2E8] to-[#F0F9F4] px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1d8263] flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-600">Data ir laikas</div>
            <div className="text-base font-extrabold text-slate-900 truncate">
              {selectedDate && formatDateDisplay(selectedDate)}, {selectedSlot && formatTime(selectedSlot.datetime)}
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
        <Button onClick={goToPreviousStep} variant="outline" className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 py-6 rounded-xl font-semibold" disabled={isLoading}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Atgal
        </Button>
        <Button
          onClick={handleBooking}
          className="flex-1 bg-gradient-to-r from-[#1d8263] to-[#166b52] hover:from-[#166b52] hover:to-[#1d8263] text-white font-bold py-6 rounded-xl shadow-lg shadow-[#1d8263]/30 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
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
    <div className="text-center py-8">
      <div className="w-24 h-24 bg-gradient-to-br from-[#1d8263] to-[#166b52] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#1d8263]/30">
        <CheckCircle2 className="w-12 h-12 text-white" />
      </div>
      
      <h3 className="text-3xl font-bold mb-4 text-slate-900">Rezervacija sėkminga!</h3>
      <p className="text-slate-600 mb-8 text-lg">
        Patvirtinimo laiškas išsiųstas į <strong className="text-slate-900">{contactInfo.email}</strong>
      </p>
      
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-8 max-w-sm mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1d8263]/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#1d8263]" />
          </div>
          <span className="font-bold text-lg text-slate-900">
            {selectedDate && formatDateDisplay(selectedDate)}
          </span>
        </div>
        <div className="h-px bg-slate-200 mb-4" />
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d8263] to-[#166b52] flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-2xl text-[#1d8263]">
            {selectedSlot && formatTime(selectedSlot.datetime)}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-slate-500 mt-8">
        Jei turite klausimų, susisiekite: <a href="mailto:info@akseler.lt" className="text-[#1d8263] font-semibold underline hover:text-[#166b52]">info@akseler.lt</a>
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-gradient-to-br from-[#E0F2E8] to-[#F0F9F4] border-2 border-[#1d8263]/20 rounded-2xl p-6 md:p-8 shadow-lg">
        {step !== 'success' && renderStepIndicator()}
        
        {step === 'contact' && renderContactStep()}
        {step === 'date' && renderDateStep()}
        {step === 'time' && renderTimeStep()}
        {step === 'confirm' && renderConfirmStep()}
        {step === 'success' && renderSuccessStep()}
      </div>
    </div>
  );
}


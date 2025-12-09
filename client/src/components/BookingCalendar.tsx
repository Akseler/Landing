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

  // Handle step navigation
  const goToNextStep = () => {
    if (step === 'contact') {
      if (validateContactInfo()) {
        trackEvent('booking_contact_submitted', '/booking', 'booking-contact-form');
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
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isActive = s.key === step;
          const isCompleted = index < currentIndex;
          
          return (
            <div key={s.key} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#1d8263] text-white'
                    : isCompleted
                    ? 'bg-[#1d8263]/20 text-[#1d8263]'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-1 ${
                    isCompleted ? 'bg-[#1d8263]' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render contact form step
  const renderContactStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center mb-6">Jūsų kontaktinė informacija</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4" />
            Vardas *
          </Label>
          <Input
            id="name"
            value={contactInfo.name}
            onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
            placeholder="Jonas Jonaitis"
            className={validationErrors.name ? 'border-destructive' : ''}
          />
          {validationErrors.name && (
            <p className="text-destructive text-sm mt-1">{validationErrors.name}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="company" className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4" />
            Įmonė *
          </Label>
          <Input
            id="company"
            value={contactInfo.company}
            onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })}
            placeholder="UAB Įmonė"
            className={validationErrors.company ? 'border-destructive' : ''}
          />
          {validationErrors.company && (
            <p className="text-destructive text-sm mt-1">{validationErrors.company}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4" />
            Telefonas *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={contactInfo.phone}
            onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
            placeholder="+370 600 00000"
            className={validationErrors.phone ? 'border-destructive' : ''}
          />
          {validationErrors.phone && (
            <p className="text-destructive text-sm mt-1">{validationErrors.phone}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email" className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4" />
            El. paštas *
          </Label>
          <Input
            id="email"
            type="email"
            value={contactInfo.email}
            onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
            placeholder="jonas@imone.lt"
            className={validationErrors.email ? 'border-destructive' : ''}
          />
          {validationErrors.email && (
            <p className="text-destructive text-sm mt-1">{validationErrors.email}</p>
          )}
        </div>
      </div>
      
      <Button
        onClick={goToNextStep}
        className="w-full mt-6 bg-[#1d8263] hover:bg-[#1d8263]/90"
        size="lg"
      >
        Toliau
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  // Render date selection step
  const renderDateStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center mb-6">Pasirinkite datą</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1d8263]" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchAvailability} variant="outline">
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
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                selectedDate === day.date
                  ? 'border-[#1d8263] bg-[#1d8263]/10'
                  : day.hasAvailableSlots
                  ? 'border-border hover:border-[#1d8263]/50 cursor-pointer'
                  : 'border-border/50 bg-muted/50 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-xs text-[#1d8263] font-medium mb-1">{day.dayName}</div>
              <div className="font-semibold">
                {format(parseISO(day.date), 'MMMM d', { locale: lt })}
              </div>
              {!day.hasAvailableSlots && (
                <div className="text-xs text-muted-foreground mt-1">Užimta</div>
              )}
            </button>
          ))}
        </div>
      )}
      
      <div className="flex gap-3 mt-6">
        <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atgal
        </Button>
        <Button
          onClick={goToNextStep}
          className="flex-1 bg-[#1d8263] hover:bg-[#1d8263]/90"
          disabled={!selectedDate}
        >
          Toliau
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Render time selection step
  const renderTimeStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-center mb-2">Pasirinkite laiką</h3>
      <p className="text-center text-muted-foreground mb-6">
        {selectedDate && formatDateDisplay(selectedDate)}
      </p>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {selectedDaySlots.map((slot) => (
          <button
            key={slot.datetime}
            onClick={() => slot.available && setSelectedSlot(slot)}
            disabled={!slot.available}
            className={`p-3 rounded-lg border-2 text-center transition-all ${
              selectedSlot?.datetime === slot.datetime
                ? 'border-[#1d8263] bg-[#1d8263]/10'
                : slot.available
                ? 'border-border hover:border-[#1d8263]/50 cursor-pointer'
                : 'border-border/50 bg-muted/50 cursor-not-allowed opacity-50 line-through'
            }`}
          >
            <Clock className={`w-4 h-4 mx-auto mb-1 ${
              slot.available ? 'text-[#1d8263]' : 'text-muted-foreground'
            }`} />
            <div className="font-semibold">{formatTime(slot.datetime)}</div>
          </button>
        ))}
      </div>
      
      <div className="flex gap-3 mt-6">
        <Button onClick={goToPreviousStep} variant="outline" className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atgal
        </Button>
        <Button
          onClick={goToNextStep}
          className="flex-1 bg-[#1d8263] hover:bg-[#1d8263]/90"
          disabled={!selectedSlot}
        >
          Toliau
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Render confirmation step
  const renderConfirmStep = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-center mb-6">Patvirtinkite rezervaciją</h3>
      
      <div className="bg-muted/30 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <User className="w-5 h-5 text-[#1d8263] mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Vardas</div>
            <div className="font-medium">{contactInfo.name}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-[#1d8263] mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Įmonė</div>
            <div className="font-medium">{contactInfo.company}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-[#1d8263] mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Telefonas</div>
            <div className="font-medium">{contactInfo.phone}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-[#1d8263] mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">El. paštas</div>
            <div className="font-medium">{contactInfo.email}</div>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#1d8263] mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Data ir laikas</div>
              <div className="font-medium">
                {selectedDate && formatDateDisplay(selectedDate)}, {selectedSlot && formatTime(selectedSlot.datetime)}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-destructive text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-3">
        <Button onClick={goToPreviousStep} variant="outline" className="flex-1" disabled={isLoading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atgal
        </Button>
        <Button
          onClick={handleBooking}
          className="flex-1 bg-[#1d8263] hover:bg-[#1d8263]/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registruojama...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
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
      <div className="w-20 h-20 bg-[#1d8263]/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-[#1d8263]" />
      </div>
      
      <h3 className="text-2xl font-bold mb-3">Rezervacija sėkminga!</h3>
      <p className="text-muted-foreground mb-6">
        Patvirtinimo laiškas išsiųstas į <strong>{contactInfo.email}</strong>
      </p>
      
      <div className="bg-[#1d8263]/10 rounded-xl p-6 max-w-sm mx-auto">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Calendar className="w-5 h-5 text-[#1d8263]" />
          <span className="font-semibold">
            {selectedDate && formatDateDisplay(selectedDate)}
          </span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Clock className="w-5 h-5 text-[#1d8263]" />
          <span className="font-semibold text-xl">
            {selectedSlot && formatTime(selectedSlot.datetime)}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mt-6">
        Jei turite klausimų, susisiekite: <a href="mailto:info@akseler.lt" className="text-[#1d8263] underline">info@akseler.lt</a>
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg">
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


import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, XCircle, Trash2, Calendar, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { RegistrationWithSession, CallFunnelSubmission } from '@shared/schema';

type CallFunnelSubmissionWithVSL = CallFunnelSubmission & { watchedVSL?: boolean };
import akselerLogo from '@assets/akseler black_1762808480376.png';

interface AnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  webinarViewSessions: number;
  webinarConversionRate: number;
  quizStarts: number;
  quizStartRate: number;
  quizStartFromWebinar: number;
  quizCompletions: number;
  quizCompletionRate: number;
  quizCompletionFromStarts: number;
  registrations: number;
  registrationRate: number;
  registrationFromCompletions: number;
  averageSessionDuration: number;
  averageScrollDepth: number;
}

interface CallFunnelSummary {
  landingPageVisitors: number;
  videoViews: number;
  videoToLandingRate: number;
  surveyPageVisitors: number;
  surveyToLandingRate: number;
  bookingPageVisitors: number;
  bookingPageToLandingRate: number;
  bookings: number;
  bookingRate: number;
  overallConversionRate: number;
  uzklausosClicks: number;
  pardavimaiClicks: number;
}

interface BookingWithSurvey {
  bookingEvent: {
    id: string;
    sessionId: string;
    timestamp: string;
    metadata: any;
  };
  submission: {
    id: string;
    email: string;
    leads: number;
    value: number;
    closeRate: number;
    speed: string;
    createdAt: string;
  } | null;
  surveyAnswers: Array<{ question: string; answer: string }>;
}

interface Session {
  id: string;
  ipAddress: string;
  userAgent: string | null;
  firstVisit: string;
  lastVisit: string;
  totalPageViews: number;
  registrationId: string | null;
  eventCount: number;
}

type DateFilter = 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'custom';

// Calculate results function (same as CallDonePage)
function calculateResults(leads: number, value: number, closeRate: number) {
  const closeRateDecimal = closeRate / 100;

  const salesNow = Math.round(leads * closeRateDecimal);
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
  };
}

function formatNumber(num: number): string {
  return num.toLocaleString('lt-LT');
}

export default function AnalyticsPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [expandedCallLeads, setExpandedCallLeads] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    const savedToken = localStorage.getItem('analytics_auth_token');
    if (savedToken) {
      setAuthToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('analytics_auth_token');
    setAuthToken('');
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const response = await fetch('/api/analytics/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setAuthToken(password);
        localStorage.setItem('analytics_auth_token', password);
      } else {
        setAuthError('Neteisingas slaptažodis');
      }
    } catch (error) {
      setAuthError('Klaida jungiantis');
    }
  };

  const getDateRange = (filter: DateFilter): { start: Date; end: Date } | null => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return { start: yesterday, end: today };
      case '7days':
        return { start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case '30days':
        return { start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'custom':
        if (customStartDate && customEndDate) {
          return { start: customStartDate, end: new Date(customEndDate.getTime() + 24 * 60 * 60 * 1000) };
        }
        return null;
      default:
        return null;
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
    queryClient.invalidateQueries({ queryKey: ['/api/analytics/sessions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/analytics/registrations'] });
    queryClient.invalidateQueries({ queryKey: ['/api/analytics/call-funnel'] });
    queryClient.invalidateQueries({ queryKey: ['/api/analytics/call-funnel-submissions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/analytics/bookings'] });
    toast({ title: "Atnaujinta", description: "Duomenys atnaujinti" });
  };

  const dateRange = getDateRange(dateFilter);
  const dateParams = dateRange 
    ? `?startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
    : '';

  const { data: summary, error: summaryError } = useQuery<AnalyticsSummary>({
    queryKey: ['/api/analytics/summary', dateFilter],
    enabled: isAuthenticated,
    queryFn: async () => {
      try {
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch(`/api/analytics/summary${dateParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        throw new Error('Sesija baigėsi. Prašome prisijungti iš naujo.');
      }
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('[AnalyticsPage] Error fetching summary:', res.status, errorData);
          throw new Error('Nepavyko įkelti statistikos');
        }
      return res.json();
      } catch (error: any) {
        console.error('[AnalyticsPage] Error in summary query:', error);
        throw error;
    }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const { data: sessions, error: sessionsError } = useQuery<Session[]>({
    queryKey: ['/api/analytics/sessions'],
    enabled: isAuthenticated,
    queryFn: async () => {
      try {
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch('/api/analytics/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        throw new Error('Sesija baigėsi. Prašome prisijungti iš naujo.');
      }
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('[AnalyticsPage] Error fetching sessions:', res.status, errorData);
          throw new Error('Nepavyko įkelti sesijų');
        }
      return res.json();
      } catch (error: any) {
        console.error('[AnalyticsPage] Error in sessions query:', error);
        throw error;
    }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const { data: registrations, error: registrationsError } = useQuery<RegistrationWithSession[]>({
    queryKey: ['/api/analytics/registrations'],
    enabled: isAuthenticated,
    queryFn: async () => {
      try {
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch('/api/analytics/registrations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        throw new Error('Sesija baigėsi. Prašome prisijungti iš naujo.');
      }
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('[AnalyticsPage] Error fetching registrations:', res.status, errorData);
          throw new Error('Nepavyko įkelti registracijų');
        }
      return res.json();
      } catch (error: any) {
        console.error('[AnalyticsPage] Error in registrations query:', error);
        throw error;
    }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const { data: callFunnel, error: callFunnelError } = useQuery<CallFunnelSummary>({
    queryKey: ['/api/analytics/call-funnel', dateFilter],
    enabled: isAuthenticated,
    queryFn: async () => {
      try {
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch(`/api/analytics/call-funnel${dateParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        throw new Error('Sesija baigėsi. Prašome prisijungti iš naujo.');
      }
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('[AnalyticsPage] Error fetching call funnel:', res.status, errorData);
          throw new Error('Nepavyko įkelti Call funnel statistikos');
        }
      return res.json();
      } catch (error: any) {
        console.error('[AnalyticsPage] Error in callFunnel query:', error);
        throw error;
    }
    },
    retry: 1,
    retryDelay: 1000,
  });

  const { data: callFunnelSubmissions, error: callFunnelSubmissionsError } = useQuery<CallFunnelSubmissionWithVSL[]>({
    queryKey: ['/api/analytics/call-funnel-submissions'],
    enabled: isAuthenticated,
    queryFn: async () => {
      try {
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch('/api/analytics/call-funnel-submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
        
      if (res.status === 401) {
        handleLogout();
        throw new Error('Sesija baigėsi. Prašome prisijungti iš naujo.');
      }
        
        if (!res.ok) {
          // If server returns error, try to parse it, but return empty array to keep page functional
          const errorData = await res.json().catch(() => ({}));
          console.error('[AnalyticsPage] Error fetching call funnel submissions:', res.status, errorData);
          return []; // Return empty array instead of throwing
        }
        
        const data = await res.json();
        // Ensure we always return an array
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        console.error('[AnalyticsPage] Error in callFunnelSubmissions query:', error);
        // Return empty array instead of throwing to keep page functional
        return [];
      }
    },
    // Retry configuration
    retry: 1,
    retryDelay: 1000,
    // Default to empty array while loading
    placeholderData: [],
  });

  const { data: bookings, error: bookingsError } = useQuery<BookingWithSurvey[]>({
    queryKey: ['/api/analytics/bookings'],
    enabled: isAuthenticated,
    queryFn: async () => {
      try {
        const token = authToken || localStorage.getItem('analytics_auth_token') || '';
        const res = await fetch('/api/analytics/bookings', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.status === 401) {
          handleLogout();
          throw new Error('Sesija baigėsi. Prašome prisijungti iš naujo.');
        }
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('[AnalyticsPage] Error fetching bookings:', res.status, errorData);
          return [];
        }
        
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        console.error('[AnalyticsPage] Error in bookings query:', error);
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000,
    placeholderData: [],
  });

  const filteredRegistrations = useMemo(() => {
    if (!registrations) return [];
    const range = getDateRange(dateFilter);
    if (!range) return registrations;
    
    return registrations.filter(reg => {
      const date = new Date(reg.createdAt);
      return date >= range.start && date < range.end;
    });
  }, [registrations, dateFilter]);

  const filteredCallSubmissions = useMemo(() => {
    if (!callFunnelSubmissions) return [];
    const range = getDateRange(dateFilter);
    if (!range) return callFunnelSubmissions;
    
    return callFunnelSubmissions.filter(sub => {
      const date = new Date(sub.createdAt);
      return date >= range.start && date < range.end;
    });
  }, [callFunnelSubmissions, dateFilter]);

  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    const range = getDateRange(dateFilter);
    if (!range) return bookings;
    
    return bookings.filter(booking => {
      const date = new Date(booking.bookingEvent.timestamp);
      return date >= range.start && date < range.end;
    });
  }, [bookings, dateFilter]);

  const clearDataMutation = useMutation({
    mutationFn: async () => {
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch('/api/analytics/clear-data', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Nepavyko ištrinti duomenų');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/registrations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/call-funnel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/call-funnel-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/bookings'] });
      toast({ title: "Sėkmingai ištrinta", description: "Visi analitikos duomenys buvo ištrinti" });
    },
    onError: (error: Error) => {
      toast({ title: "Klaida", description: error.message, variant: "destructive" });
    },
  });

  const deleteRegistrationMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch(`/api/analytics/registration/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Nepavyko ištrinti registracijos');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/registrations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary', dateFilter] });
      toast({ title: "Ištrinta", description: "Registracija ištrinta" });
    },
    onError: (error: Error) => {
      toast({ title: "Klaida", description: error.message, variant: "destructive" });
    },
  });

  const deleteCallSubmissionMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch(`/api/analytics/call-funnel-submission/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
        
        if (res.status === 401) {
          handleLogout();
          throw new Error('Sesija baigėsi. Prašome prisijungti iš naujo.');
        }
        
        if (!res.ok) {
          let errorData;
          try {
            const text = await res.text();
            errorData = text ? JSON.parse(text) : { error: 'Unknown error' };
          } catch {
            errorData = { error: `Server error: ${res.status}` };
          }
          console.error('[AnalyticsPage] Delete submission error:', res.status, errorData);
          throw new Error(errorData.error || 'Nepavyko ištrinti įrašo');
        }
        
        // Try to parse JSON, but handle empty responses
        const text = await res.text();
        if (!text || text.trim() === '') {
          return { success: true };
        }
        
        try {
          return JSON.parse(text);
        } catch {
          return { success: true };
        }
      } catch (error: any) {
        console.error('[AnalyticsPage] Error deleting submission:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/call-funnel-submissions'] });
    queryClient.invalidateQueries({ queryKey: ['/api/analytics/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/call-funnel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/call-funnel', dateFilter] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary', dateFilter] });
      toast({ title: "Ištrinta", description: "Įrašas ir visi susiję duomenys ištrinti" });
    },
    onError: (error: Error) => {
      console.error('[AnalyticsPage] Delete submission mutation error:', error);
      toast({ title: "Klaida", description: error.message, variant: "destructive" });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Analitikos Prieiga</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Įveskite slaptažodį"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-analytics-password"
                  className="text-center"
                />
              </div>
              {authError && (
                <p className="text-sm text-destructive text-center" data-testid="text-auth-error">
                  {authError}
                </p>
              )}
              <Button 
                type="submit" 
                className="w-full bg-[#1d8263] hover:bg-[#1d8263]/90"
                data-testid="button-analytics-login"
              >
                Prisijungti
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col gap-3">
          {/* Header with clear actions */}
          <div className="flex items-center justify-between mb-4">
          <img 
            src={akselerLogo} 
            alt="AKSELER" 
              className="h-8 md:h-12"
            data-testid="img-akseler-logo"
          />
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                data-testid="button-refresh"
                className="h-9 px-3"
                title="Atnaujinti duomenis"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Atnaujinti</span>
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm" data-testid="button-back-home" className="h-9 px-3" title="Grįžti į pagrindinį">
                  <span className="hidden sm:inline">Grįžti</span>
                  <span className="sm:hidden">←</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout} 
                data-testid="button-logout" 
                className="h-9 px-3"
                title="Atsijungti"
              >
                <span className="hidden sm:inline">Atsijungti</span>
                <span className="sm:hidden">✕</span>
              </Button>
            </div>
          </div>

          {/* Date filter and clear data */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select value={dateFilter} onValueChange={(v) => {
                setDateFilter(v as DateFilter);
                if (v === 'custom') {
                  setShowCustomDatePicker(true);
                } else {
                  setShowCustomDatePicker(false);
                }
              }}>
                <SelectTrigger className="w-[140px] md:w-[160px] h-9" data-testid="select-date-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Visi laikai</SelectItem>
                  <SelectItem value="today">Šiandien</SelectItem>
                  <SelectItem value="yesterday">Vakar</SelectItem>
                  <SelectItem value="7days">7 dienos</SelectItem>
                  <SelectItem value="30days">30 dienų</SelectItem>
                  <SelectItem value="custom">Pasirinkti datą</SelectItem>
                </SelectContent>
              </Select>
            </div>
              {showCustomDatePicker && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-[140px] h-9"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="date"
                    value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-[140px] h-9"
                  />
                </div>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    data-testid="button-clear-data"
                    disabled={clearDataMutation.isPending}
                  className="h-9 px-3 ml-auto"
                  title="Ištrinti visus duomenis"
                  >
                  <Trash2 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Ištrinti duomenis</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Ar tikrai norite ištrinti visus duomenis?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Šis veiksmas negrįžtamas. Bus ištrinti visi analitikos duomenys, sesijos ir registracijos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-clear">Atšaukti</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => clearDataMutation.mutate()}
                      className="bg-destructive hover:bg-destructive/90"
                      data-testid="button-confirm-clear"
                    >
                      Taip, ištrinti viską
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </div>
        </div>

        {(summaryError || sessionsError || registrationsError || callFunnelError || callFunnelSubmissionsError || bookingsError) && (
          <Card className="border-2 border-destructive">
            <CardContent className="p-6">
              <p className="text-destructive font-medium">
                {summaryError?.message || sessionsError?.message || registrationsError?.message || callFunnelError?.message || callFunnelSubmissionsError?.message || bookingsError?.message || 'Įvyko klaida įkeliant duomenis'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Money Printer Section */}
          <Card className="border-2 border-[#1d8263]">
            <CardHeader className="bg-[#1d8263]/5 pb-2 px-3 md:px-6">
              <CardTitle className="text-sm md:text-lg flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1d8263] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1d8263]"></span>
                </span>
                Money Printer
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 px-3 md:px-6">
            {/* Funnel Steps 1-4 - Larger boxes */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                <div className="p-4 md:p-5 bg-gradient-to-br from-slate-50 to-white rounded-lg border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-xs md:text-sm text-muted-foreground mb-2">1. Visitors</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-4xl font-bold text-[#1d8263]">{callFunnel?.landingPageVisitors || 0}</span>
                      <span className="text-xs md:text-sm text-muted-foreground font-medium">100%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-5 bg-gradient-to-br from-slate-50 to-white rounded-lg border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-xs md:text-sm text-muted-foreground mb-2">2. Watched VSL</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-4xl font-bold text-[#1d8263]">{callFunnel?.videoViews || 0}</span>
                      <span className="text-xs md:text-sm text-muted-foreground font-medium">{callFunnel?.videoToLandingRate || 0}%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-5 bg-gradient-to-br from-slate-50 to-white rounded-lg border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-xs md:text-sm text-muted-foreground mb-2">3. Survey page</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-4xl font-bold text-[#1d8263]">{callFunnel?.surveyPageVisitors || 0}</span>
                      <span className="text-xs md:text-sm text-muted-foreground font-medium">{callFunnel?.surveyToLandingRate || 0}%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-5 bg-gradient-to-br from-slate-50 to-white rounded-lg border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-xs md:text-sm text-muted-foreground mb-2">4. Booking page</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-4xl font-bold text-[#1d8263]">{callFunnel?.bookingPageVisitors || 0}</span>
                      <span className="text-xs md:text-sm text-muted-foreground font-medium">{callFunnel?.bookingPageToLandingRate || 0}%</span>
                    </div>
                  </div>
                </div>
                  </div>
              
              {/* Combined Bookings & Conversion Box */}
              <div className="p-4 md:p-5 bg-gradient-to-br from-[#1d8263]/10 via-[#1d8263]/5 to-white rounded-lg border-2 border-[#1d8263]/30 shadow-sm">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-sm md:text-base text-muted-foreground mb-2">5. Bookings</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl md:text-4xl font-bold text-[#1d8263]">{callFunnel?.bookings || 0}</span>
                      <span className="text-xs md:text-sm text-muted-foreground font-medium">{callFunnel?.bookingRate || 0}%</span>
                </div>
              </div>
                  <div className="flex flex-col border-l border-[#1d8263]/20 pl-4 md:pl-6">
                    <h3 className="font-semibold text-sm md:text-base text-muted-foreground mb-2">Konversija</h3>
                    <div className="text-2xl md:text-4xl font-bold text-[#1d8263]">{callFunnel?.overallConversionRate || 0}%</div>
                  </div>
                </div>
              </div>

            {/* Border separator */}
            <div className="border-t-2 border-[#1d8263]/30 my-6"></div>

            {/* Bookings */}
            <div className="flex flex-col mt-4">
              <h3 className="text-sm md:text-base font-semibold mb-3">📅 Bookings ({filteredBookings.length})</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto overflow-x-hidden">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => {
                    const email = booking.bookingEvent.metadata?.email || 'N/A';
                    const datetime = booking.bookingEvent.metadata?.datetime || '';
                    const submission = booking.submission;
                    const surveyAnswers = booking.surveyAnswers || [];
                    const isExpanded = expandedBookingId === booking.bookingEvent.id;

                    return (
                      <div 
                        key={booking.bookingEvent.id} 
                        className="text-xs p-2 md:p-3 rounded-lg border border-[#1d8263]/30 bg-[#1d8263]/5 cursor-pointer transition-all hover:border-[#1d8263]/50"
                        onClick={() => setExpandedBookingId(isExpanded ? null : booking.bookingEvent.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2 min-w-0">
                            <span className="font-semibold text-[#1d8263] truncate text-[11px] md:text-xs">{email}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <span>{new Date(booking.bookingEvent.timestamp).toLocaleString('lt-LT', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                              {datetime && (
                                <>
                                  <span>→</span>
                                  <span className="font-medium text-[#1d8263]">
                                    {new Date(datetime).toLocaleString('lt-LT', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </>
                              )}
                            </div>
                            </div>
                          {surveyAnswers.length > 0 && (
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                          )}
                          </div>
                        {isExpanded && surveyAnswers.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#1d8263]/20">
                            <div className="text-[10px] text-muted-foreground mb-2 font-medium">Survey atsakymai:</div>
                            <div className="flex flex-col gap-1.5">
                              {surveyAnswers.map((qa, idx) => (
                                <div key={idx} className="text-[10px] sm:text-xs bg-white/50 rounded p-2">
                                  <span className="text-muted-foreground">{qa.question}:</span>{' '}
                                  <strong className="text-foreground">{qa.answer}</strong>
                        </div>
                              ))}
                                  </div>
                                </div>
                        )}
                        {isExpanded && submission && (
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-muted-foreground text-[10px] sm:text-xs mt-3 pt-3 border-t border-[#1d8263]/20">
                            <span>Užkl: <strong className="text-foreground">{submission.leads}</strong></span>
                            <span>Vertė: <strong className="text-foreground">{submission.value.toLocaleString()}€</strong></span>
                            <span>Pard: <strong className="text-foreground">{submission.closeRate}%</strong></span>
                            <span className="hidden sm:inline">Laikas: <strong className="text-foreground">
                              {submission.speed === 'per_5min' ? '5min' : 
                               submission.speed === 'per_1val' ? '1val' : 
                               submission.speed === 'tos_pacios_dienos' ? 'Tą pačią d.' : 
                               submission.speed === 'kita_diena' ? 'Kitą d.' : submission.speed}
                            </strong></span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">Dar nėra bookings</p>
                )}
              </div>
            </div>
            </CardContent>
          </Card>

        {/* Užklausos vs Pardavimai - Black with opacity */}
        <Card className="border-2 border-[#1d8263]">
          <CardHeader className="bg-[#1d8263]/5 pb-3 px-4 md:px-6">
            <CardTitle className="text-sm md:text-lg flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1d8263] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1d8263]"></span>
              </span>
              Užklausos vs Pardavimai
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-4 md:px-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 md:p-6 bg-black/80 rounded-lg border-2 border-black/30 shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <h3 className="font-semibold text-sm md:text-base text-white/90 uppercase tracking-wide mb-3">Užklausos</h3>
                  <div className="text-3xl md:text-5xl font-bold text-white">{callFunnel?.uzklausosClicks || 0}</div>
                </div>
              </div>
              <div className="p-5 md:p-6 bg-black/80 rounded-lg border-2 border-black/30 shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <h3 className="font-semibold text-sm md:text-base text-white/90 uppercase tracking-wide mb-3">Pardavimai</h3>
                  <div className="text-3xl md:text-5xl font-bold text-white">{callFunnel?.pardavimaiClicks || 0}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vidutinė Elgsena */}
        <Card className="border-2">
          <CardHeader className="pb-2 px-3 md:px-6">
            <CardTitle className="text-sm md:text-lg">Vidutinė Elgsena</CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="p-2 md:p-3 bg-card rounded-md border">
                <div className="flex flex-col">
                  <h3 className="font-medium text-[10px] md:text-xs text-muted-foreground">Sesijos Laikas</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg md:text-2xl font-bold text-[#1d8263]">
                      {summary?.averageSessionDuration ? `${Math.floor(summary.averageSessionDuration / 60)}:${String(summary.averageSessionDuration % 60).padStart(2, '0')}` : '0:00'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">min</span>
                    </div>
                  </div>
                </div>
              <div className="p-2 md:p-3 bg-card rounded-md border">
                <div className="flex flex-col">
                  <h3 className="font-medium text-[10px] md:text-xs text-muted-foreground">Scroll Depth</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-lg md:text-2xl font-bold text-[#1d8263]">{summary?.averageScrollDepth || 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-2 px-3 md:px-6">
            <CardTitle className="text-sm md:text-lg">Visi Lankytojai</CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="overflow-x-auto -mx-3 md:mx-0">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-1.5 md:p-2">IP</th>
                    <th className="text-left p-1.5 md:p-2 hidden sm:table-cell">Pirmas</th>
                    <th className="text-left p-1.5 md:p-2 hidden md:table-cell">Paskutinis</th>
                    <th className="text-right p-1.5 md:p-2">Pusl.</th>
                    <th className="text-right p-1.5 md:p-2 hidden sm:table-cell">Įvyk.</th>
                    <th className="text-center p-1.5 md:p-2">Reg.</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions?.map((session) => (
                    <tr key={session.id} className="border-b hover-elevate" data-testid={`row-session-${session.id}`}>
                      <td className="p-2 font-mono text-xs">{session.ipAddress}</td>
                      <td className="p-2 hidden sm:table-cell text-xs">{new Date(session.firstVisit).toLocaleString('lt-LT', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="p-2 hidden md:table-cell text-xs">{new Date(session.lastVisit).toLocaleString('lt-LT', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="p-2 text-right">{session.totalPageViews}</td>
                      <td className="p-2 text-right hidden sm:table-cell">{session.eventCount}</td>
                      <td className="p-2 text-center">
                        {session.registrationId ? (
                          <CheckCircle2 className="h-4 w-4 text-[#1d8263] inline-block" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground inline-block" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

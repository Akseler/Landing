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
  callPageVisitors: number;
  videoViews: number;
  videoToLandingRate: number;
  surveyPageVisitors: number;
  surveyToVideoRate: number;
  emailSubmissions: number;
  emailToSurveyRate: number;
  overallConversionRate: number;
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
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch(`/api/analytics/summary${dateParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        throw new Error('Sesija baigėsi. Prašome prisijungti iš naujo.');
      }
      if (!res.ok) throw new Error('Nepavyko įkelti statistikos');
      return res.json();
    }
  });

  const { data: sessions, error: sessionsError } = useQuery<Session[]>({
    queryKey: ['/api/analytics/sessions'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch('/api/analytics/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        throw new Error('Sesija baigėsi. Prašome prisijungti iš naujo.');
      }
      if (!res.ok) throw new Error('Nepavyko įkelti sesijų');
      return res.json();
    }
  });

  const { data: registrations, error: registrationsError } = useQuery<RegistrationWithSession[]>({
    queryKey: ['/api/analytics/registrations'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch('/api/analytics/registrations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        throw new Error('Sesija baigėsi. Prašome prisijungti iš naujo.');
      }
      if (!res.ok) throw new Error('Nepavyko įkelti registracijų');
      return res.json();
    }
  });

  const { data: callFunnel, error: callFunnelError } = useQuery<CallFunnelSummary>({
    queryKey: ['/api/analytics/call-funnel', dateFilter],
    enabled: isAuthenticated,
    queryFn: async () => {
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch(`/api/analytics/call-funnel${dateParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        throw new Error('Sesija baigėsi. Prašome prisijungti iš naujo.');
      }
      if (!res.ok) throw new Error('Nepavyko įkelti Call funnel statistikos');
      return res.json();
    }
  });

  const { data: callFunnelSubmissions, error: callFunnelSubmissionsError } = useQuery<CallFunnelSubmission[]>({
    queryKey: ['/api/analytics/call-funnel-submissions'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch('/api/analytics/call-funnel-submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        handleLogout();
        throw new Error('Sesija baigėsi. Prašome prisijungti iš naujo.');
      }
      if (!res.ok) throw new Error('Nepavyko įkelti call funnel registracijų');
      return res.json();
    }
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
      const token = authToken || localStorage.getItem('analytics_auth_token') || '';
      const res = await fetch(`/api/analytics/call-funnel-submission/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Nepavyko ištrinti įrašo');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/call-funnel-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/call-funnel'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/call-funnel', dateFilter] });
      toast({ title: "Ištrinta", description: "Įrašas ištrintas" });
    },
    onError: (error: Error) => {
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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <img 
            src={akselerLogo} 
            alt="AKSELER" 
            className="h-10 md:h-12"
            data-testid="img-akseler-logo"
          />
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground hidden sm:block" />
              <Select value={dateFilter} onValueChange={(v) => {
                setDateFilter(v as DateFilter);
                if (v === 'custom') {
                  setShowCustomDatePicker(true);
                } else {
                  setShowCustomDatePicker(false);
                }
              }}>
                <SelectTrigger className="w-[130px]" data-testid="select-date-filter">
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
              {showCustomDatePicker && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                    className="w-[140px] text-xs"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="date"
                    value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                    className="w-[140px] text-xs"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                data-testid="button-refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    data-testid="button-clear-data"
                    disabled={clearDataMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Ištrinti viską</span>
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
              <Button variant="outline" size="sm" onClick={handleLogout} data-testid="button-logout">
                <span className="hidden sm:inline">Atsijungti</span>
                <span className="sm:hidden">X</span>
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm" data-testid="button-back-home">
                  Grįžti
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {(summaryError || sessionsError || registrationsError || callFunnelError || callFunnelSubmissionsError) && (
          <Card className="border-2 border-destructive">
            <CardContent className="p-6">
              <p className="text-destructive font-medium">
                {summaryError?.message || sessionsError?.message || registrationsError?.message || callFunnelError?.message || callFunnelSubmissionsError?.message || 'Įvyko klaida įkeliant duomenis'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Call Funnel Section */}
        <Card className="border-2 border-[#1d8263]">
          <CardHeader className="bg-[#1d8263]/5 pb-3">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <span className="w-3 h-3 bg-[#1d8263] rounded-full"></span>
              Call Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Analytics */}
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-card rounded-md border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">1. Landing</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1d8263]">{callFunnel?.callPageVisitors || 0}</div>
                    <div className="text-xs text-muted-foreground">100%</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-card rounded-md border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">2. Video peržiūros</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1d8263]">{callFunnel?.videoViews || 0}</div>
                    <div className="text-xs text-muted-foreground">{callFunnel?.videoToLandingRate || 0}%</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-card rounded-md border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">3. Survey</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1d8263]">{callFunnel?.surveyPageVisitors || 0}</div>
                    <div className="text-xs text-muted-foreground">{callFunnel?.surveyToVideoRate || 0}%</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-card rounded-md border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">4. Email</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1d8263]">{callFunnel?.emailSubmissions || 0}</div>
                    <div className="text-xs text-muted-foreground">{callFunnel?.emailToSurveyRate || 0}%</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-[#1d8263]/10 rounded-md border border-[#1d8263]/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Konversija</h3>
                  <div className="text-2xl font-bold text-[#1d8263]">{callFunnel?.overallConversionRate || 0}%</div>
                </div>
              </div>
            </div>

            {/* Border separator */}
            <div className="border-t-2 border-[#1d8263]/30 my-6"></div>

            {/* Leads */}
            <div className="flex flex-col">
              <h3 className="text-base md:text-lg font-semibold mb-4">Leads ({filteredCallSubmissions.length})</h3>
              <div className="space-y-2 max-h-[180px] overflow-y-auto overflow-x-hidden">
                {filteredCallSubmissions.length > 0 ? (
                  filteredCallSubmissions.map((sub) => {
                    const isExpanded = expandedCallLeads.has(sub.id);
                    const results = calculateResults(sub.leads, sub.value, sub.closeRate);
                    const closeRateIncrease = results.newCloseRate - sub.closeRate;
                    const salesIncrease = results.salesTotal - results.salesNow;
                    const revenueIncrease = results.revTotal - results.revNow;

                    return (
                      <div key={sub.id}>
                        <div 
                          className="text-xs p-3 rounded-md border-2 border-[#1d8263]/30 bg-[#1d8263]/5 hover-elevate flex items-start justify-between gap-2 cursor-pointer"
                          onClick={() => {
                            setExpandedCallLeads(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(sub.id)) {
                                newSet.delete(sub.id);
                              } else {
                                newSet.add(sub.id);
                              }
                              return newSet;
                            });
                          }}
                          data-testid={`call-submission-${sub.id}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="font-semibold text-[#1d8263] truncate">{sub.email}</span>
                              <span className="text-muted-foreground hidden sm:inline">|</span>
                              <span className="text-muted-foreground text-[10px] sm:text-xs">
                                {new Date(sub.createdAt).toLocaleString('lt-LT', { 
                                  month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-muted-foreground text-[10px] sm:text-xs">
                              <span>Užkl: <strong className="text-foreground">{sub.leads}</strong></span>
                              <span>Vertė: <strong className="text-foreground">{sub.value.toLocaleString()}€</strong></span>
                              <span>Pard: <strong className="text-foreground">{sub.closeRate}%</strong></span>
                              <span className="hidden sm:inline">Laikas: <strong className="text-foreground">
                                {sub.speed === 'per_5min' ? '5min' : 
                                 sub.speed === 'per_1val' ? '1val' : 
                                 sub.speed === 'tos_pacios_dienos' ? 'Tą pačią d.' : 
                                 sub.speed === 'kita_diena' ? 'Kitą d.' : sub.speed}
                              </strong></span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-foreground/60 hover:text-foreground hover:bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedCallLeads(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(sub.id)) {
                                    newSet.delete(sub.id);
                                  } else {
                                    newSet.add(sub.id);
                                  }
                                  return newSet;
                                });
                              }}
                              data-testid={`button-expand-call-submission-${sub.id}`}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCallSubmissionMutation.mutate(sub.id);
                              }}
                              disabled={deleteCallSubmissionMutation.isPending}
                              data-testid={`button-delete-call-submission-${sub.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-2 p-4 bg-muted/30 rounded-md border border-[#1d8263]/20">
                            <div className="space-y-3">
                              <div className="text-xs font-semibold text-foreground/80 mb-2">Galime atnešti:</div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-[#1d8263]/10 rounded-lg p-3 border border-[#1d8263]/20">
                                  <div className="text-[10px] text-muted-foreground mb-1">Konversijos padidėjimas</div>
                                  <div className="text-lg font-bold text-[#1d8263]">+{closeRateIncrease}%</div>
                                  <div className="text-[10px] text-muted-foreground mt-1">
                                    {sub.closeRate}% → {results.newCloseRate}%
                                  </div>
                                </div>
                                <div className="bg-[#1d8263]/10 rounded-lg p-3 border border-[#1d8263]/20">
                                  <div className="text-[10px] text-muted-foreground mb-1">Papildomi pardavimai</div>
                                  <div className="text-lg font-bold text-[#1d8263]">+{salesIncrease} kl / mėn.</div>
                                  <div className="text-[10px] text-muted-foreground mt-1">
                                    {results.salesNow} → {results.salesTotal}
                                  </div>
                                </div>
                                <div className="bg-[#1d8263]/10 rounded-lg p-3 border border-[#1d8263]/20">
                                  <div className="text-[10px] text-muted-foreground mb-1">Papildomos pajamos</div>
                                  <div className="text-lg font-bold text-[#1d8263]">+{formatNumber(revenueIncrease)}€</div>
                                  <div className="text-[10px] text-muted-foreground mt-1">
                                    {formatNumber(results.revNow)}€ → {formatNumber(results.revTotal)}€
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">Dar nėra registracijų</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webinar Funnel Section */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <span className="w-3 h-3 bg-foreground/50 rounded-full"></span>
              Webinar Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Analytics */}
            <div className="space-y-3 mb-6">
              <div className="p-3 bg-card rounded-md border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">1. Landing</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1d8263]">{summary?.uniqueVisitors || 0}</div>
                    <div className="text-xs text-muted-foreground">100%</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-card rounded-md border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">2. Webinar</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1d8263]">{summary?.webinarViewSessions || 0}</div>
                    <div className="text-xs text-muted-foreground">{summary?.webinarConversionRate || 0}%</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-card rounded-md border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">3. Form</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1d8263]">{summary?.quizStarts || 0}</div>
                    <div className="text-xs text-muted-foreground">{summary?.quizStartRate || 0}%</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-card rounded-md border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">4. Filled Form</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1d8263]">{summary?.quizCompletions || 0}</div>
                    <div className="text-xs text-muted-foreground">{summary?.quizCompletionRate || 0}%</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-card rounded-md border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">5. Registration</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1d8263]">{summary?.registrations || 0}</div>
                    <div className="text-xs text-muted-foreground">{summary?.registrationRate || 0}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Border separator */}
            <div className="border-t-2 border-border my-6"></div>

            {/* Leads */}
            <div className="flex flex-col">
              <h3 className="text-base md:text-lg font-semibold mb-4">Leads ({filteredRegistrations.length})</h3>
              <div className="space-y-2 max-h-[180px] overflow-y-auto overflow-x-hidden">
                {filteredRegistrations.length > 0 ? (
                  filteredRegistrations.map((reg) => (
                    <div 
                      key={reg.id} 
                      className="text-xs p-2 rounded-md border hover-elevate flex items-center gap-2 flex-wrap"
                      data-testid={`registration-${reg.id}`}
                    >
                      {reg.qualified ? (
                        <CheckCircle2 className="h-4 w-4 text-[#1d8263] flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      )}
                      <span className="font-semibold truncate max-w-[100px] sm:max-w-none">{reg.name}</span>
                      <span className="text-muted-foreground hidden sm:inline">|</span>
                      <span className="whitespace-nowrap hidden sm:inline">{reg.phone}</span>
                      <span className="text-muted-foreground hidden sm:inline">|</span>
                      <span className="truncate max-w-[120px] sm:max-w-none">{reg.email}</span>
                      <span className="text-muted-foreground hidden md:inline">|</span>
                      <span className="hidden md:flex items-center gap-1 whitespace-nowrap">
                        <span className="text-muted-foreground">Pasl:</span>
                        {reg.servicesOver1000 ? (
                          <CheckCircle2 className="h-3 w-3 text-[#1d8263] flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                        )}
                      </span>
                      <span className="hidden md:flex items-center gap-1 whitespace-nowrap">
                        <span className="text-muted-foreground">Biudž:</span>
                        {reg.budgetOver1000 ? (
                          <CheckCircle2 className="h-3 w-3 text-[#1d8263] flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                        )}
                      </span>
                      <span className="hidden lg:flex items-center gap-1 whitespace-nowrap">
                        <span className="text-muted-foreground">FB:</span>
                        {reg.usesFacebookAds ? (
                          <CheckCircle2 className="h-3 w-3 text-[#1d8263] flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                        )}
                      </span>
                      <span className="text-muted-foreground ml-auto">
                        {new Date(reg.createdAt).toLocaleString('lt-LT', { 
                          month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
                        })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        onClick={() => deleteRegistrationMutation.mutate(reg.id)}
                        disabled={deleteRegistrationMutation.isPending}
                        data-testid={`button-delete-registration-${reg.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">Dar nėra registracijų</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vidutinė Elgsena */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Vidutinė Elgsena</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-card rounded-md border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Vidutinis Sesijos Laikas</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1d8263]">
                      {summary?.averageSessionDuration ? `${Math.floor(summary.averageSessionDuration / 60)}:${String(summary.averageSessionDuration % 60).padStart(2, '0')}` : '0:00'}
                    </div>
                    <div className="text-xs text-muted-foreground">min:sek</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-card rounded-md border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Vidutinis Scroll Depth</h3>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1d8263]">{summary?.averageScrollDepth || 0}%</div>
                    <div className="text-xs text-muted-foreground">nuo viršaus iki apačios</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg">Visi Lankytojai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">IP Adresas</th>
                    <th className="text-left p-2 hidden sm:table-cell">Pirmas</th>
                    <th className="text-left p-2 hidden md:table-cell">Paskutinis</th>
                    <th className="text-right p-2">Pusl.</th>
                    <th className="text-right p-2 hidden sm:table-cell">Įvyk.</th>
                    <th className="text-center p-2">Reg.</th>
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

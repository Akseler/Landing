import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import WaitlistPage from "@/pages/WaitlistPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import TestLandingPage from "@/pages/TestLandingPage";
// import Home from "@/pages/Home";
// import CallPage from "@/pages/CallPage";
// import WebyPage from "@/pages/WebyPage";
// import WebinarPage from "@/pages/WebinarPage";
// import QuizPage from "@/pages/QuizPage";
// import SurveyPage from "@/pages/SurveyPage";
// import DonePage from "@/pages/DonePage";
// import BookingPage from "@/pages/CallDonePage";
// import BookedPage from "@/pages/BookedPage";
// import SuccessPage from "@/pages/SuccessPage";
// import ThankYouPage from "@/pages/ThankYouPage";
// import NotFound from "@/pages/not-found";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

// Protected Landing Page - requires same password as analytics
function ProtectedLandingPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('analytics_auth_token');
    if (savedToken) {
      setIsAuthenticated(true);
    }
  }, []);

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
        localStorage.setItem('analytics_auth_token', password);
      } else {
        setAuthError('Neteisingas slaptažodis');
      }
    } catch (error) {
      setAuthError('Klaida jungiantis');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Landing Prieiga</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Įveskite slaptažodį"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center"
                />
              </div>
              {authError && (
                <p className="text-sm text-destructive text-center">
                  {authError}
                </p>
              )}
              <Button 
                type="submit" 
                className="w-full bg-[#1d8263] hover:bg-[#1d8263]/90"
              >
                Prisijungti
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <TestLandingPage />;
}

// WAITLIST MODE: Most routes redirect to waitlist, but analytics and landing accessible
function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/landing" component={ProtectedLandingPage} />
        <Route path="/" component={WaitlistPage} />
        <Route component={WaitlistPage} />
      </Switch>
    </>
  );
}

/* ORIGINAL ROUTES - Uncomment when ready to launch
function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={TestLandingPage} />
        <Route path="/call" component={CallPage} />
        <Route path="/weby" component={WebyPage} />
        <Route path="/webinar" component={WebinarPage} />
        <Route path="/quiz" component={QuizPage} />
        <Route path="/survey" component={SurveyPage} />
        <Route path="/done" component={DonePage} />
        <Route path="/booking" component={BookingPage} />
        <Route path="/booked" component={BookedPage} />
        <Route path="/success" component={SuccessPage} />
        <Route path="/thank-you" component={ThankYouPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/test" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}
*/

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

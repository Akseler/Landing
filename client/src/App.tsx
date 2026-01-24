import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import WaitlistPage from "@/pages/WaitlistPage";
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
// import AnalyticsPage from "@/pages/AnalyticsPage";
// import NotFound from "@/pages/not-found";
// import TestLandingPage from "@/pages/TestLandingPage";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

// WAITLIST MODE: All routes redirect to waitlist page
function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        {/* All routes blocked - showing waitlist only */}
        <Route path="/:rest*" component={WaitlistPage} />
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

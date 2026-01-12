// Simple UUID v4 generator (without external dependency)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const SESSION_KEY = 'analytics_session_id';

// Get or create session ID
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

// Track an event
export async function trackEvent(
  eventType: string,
  page: string,
  buttonId?: string,
  metadata?: any
): Promise<void> {
  try {
    const sessionId = getSessionId();
    const payload = {
        sessionId,
        eventType,
        page,
        buttonId,
        metadata,
    };
    
    // Use fetch with keepalive for reliable tracking
    // Try to await it for button clicks to ensure it's sent
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // Keep the request alive even after page unload
    });
    
    if (!response.ok) {
      console.error('Analytics tracking failed:', response.status, response.statusText);
    }
  } catch (error) {
    // Silently fail - analytics should not block user experience
    console.error('Analytics tracking error:', error);
  }
}

// Webinar funnel pages (starts from /weby)
const WEBINAR_FUNNEL_PAGES = ['/weby', '/webinar', '/quiz'];

// Call funnel pages (starts from / or /call)
const CALL_FUNNEL_PAGES = ['/', '/call', '/survey', '/booking', '/booked'];

// All tracked pages
const TRACKED_PAGES = [...WEBINAR_FUNNEL_PAGES, ...CALL_FUNNEL_PAGES];

function shouldTrackPage(page: string): boolean {
  return TRACKED_PAGES.includes(page);
}

function getFunnel(page: string): 'webinar' | 'call' | null {
  if (WEBINAR_FUNNEL_PAGES.includes(page)) return 'webinar';
  if (CALL_FUNNEL_PAGES.includes(page)) return 'call';
  return null;
}

// Track page view
export function trackPageView(page: string): void {
  if (!shouldTrackPage(page)) {
    console.log(`[Analytics] Skipping page view tracking for ${page} - not a tracked page`);
    return; // Don't track internal/success pages
  }
  const funnel = getFunnel(page);
  console.log(`[Analytics] Tracking page view: ${page} (funnel: ${funnel})`);
  trackEvent('page_view', page, undefined, { funnel });
}

// Track button click
export async function trackButtonClick(buttonId: string, page: string): Promise<void> {
  if (!shouldTrackPage(page)) {
    console.log(`[Analytics] Skipping button click tracking for ${buttonId} on ${page} - not a tracked page`);
    return; // Don't track clicks on internal pages
  }
  // Ensure the event is sent before navigation
  try {
    console.log(`[Analytics] Tracking button click: ${buttonId} on ${page}`);
    await trackEvent('button_click', page, buttonId);
    console.log(`[Analytics] Button click tracked successfully: ${buttonId}`);
  } catch (error) {
    console.error('Button click tracking error:', error);
  }
}

// Track quiz response
export async function trackQuizResponse(
  step: number,
  question: string,
  answer: string
): Promise<void> {
  try {
    const sessionId = getSessionId();
    
    await fetch('/api/analytics/quiz-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        step,
        question,
        answer,
      }),
    });
  } catch (error) {
    console.error('Quiz response tracking error:', error);
  }
}

// Link registration to session
export async function linkRegistrationToSession(registrationId: string): Promise<void> {
  try {
    const sessionId = getSessionId();
    
    await fetch('/api/analytics/link-registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        registrationId,
      }),
    });
  } catch (error) {
    console.error('Link registration error:', error);
  }
}

// Track scroll depth - simple and reliable
let maxScrollDepth = 0;
let scrollDepthTracked = false;
let currentPagePath = '';
let scrollInterval: ReturnType<typeof setInterval> | null = null;

export function initScrollTracking(): void {
  if (typeof window === 'undefined') return;
  
  // Reset for new page
  const pagePath = window.location.pathname;
  if (currentPagePath !== pagePath) {
    // Clean up old interval
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
    
    maxScrollDepth = 0;
    scrollDepthTracked = false;
    currentPagePath = pagePath;
  }
  
  const updateScrollDepth = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollableHeight = documentHeight - windowHeight;
    
    if (scrollableHeight > 0) {
      const scrollPercent = Math.round((scrollTop / scrollableHeight) * 100);
    if (scrollPercent > maxScrollDepth) {
      maxScrollDepth = scrollPercent;
      }
    }
  };

  // Update scroll depth on scroll
  window.addEventListener('scroll', updateScrollDepth, { passive: true });
  
  // Track scroll depth on page unload - send final depth
  const handleUnload = () => {
    if (maxScrollDepth > 0 && !scrollDepthTracked) {
      const page = window.location.pathname;
      // Use fetch with keepalive for unload events
      trackEvent('scroll_depth', page, undefined, { depth: maxScrollDepth });
      scrollDepthTracked = true;
    }
  };
  
  window.addEventListener('beforeunload', handleUnload);
  window.addEventListener('pagehide', handleUnload);
  
  // Track scroll depth every 5 seconds so we capture it even without page unload
  scrollInterval = setInterval(() => {
    if (window.location.pathname === currentPagePath) {
      updateScrollDepth();
      
      // Send scroll depth event every 5 seconds if user has scrolled
      if (maxScrollDepth > 0) {
      const page = window.location.pathname;
      trackEvent('scroll_depth', page, undefined, { depth: maxScrollDepth });
      }
    }
  }, 5000);
}

// Track session duration
let sessionStartTime = Date.now();
let sessionDurationTracked = false;

export function initSessionDurationTracking(): void {
  if (typeof window === 'undefined') return;
  
  sessionStartTime = Date.now();
  
  // Track session duration on page unload
  window.addEventListener('beforeunload', () => {
    if (!sessionDurationTracked) {
      const duration = Math.round((Date.now() - sessionStartTime) / 1000); // in seconds
      const page = window.location.pathname;
      trackEvent('session_duration', page, undefined, { duration });
      sessionDurationTracked = true;
    }
  });
  
  // Track session duration when navigating away
  window.addEventListener('pagehide', () => {
    if (!sessionDurationTracked) {
      const duration = Math.round((Date.now() - sessionStartTime) / 1000); // in seconds
      const page = window.location.pathname;
      trackEvent('session_duration', page, undefined, { duration });
      sessionDurationTracked = true;
    }
  });
}

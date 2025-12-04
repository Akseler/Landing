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
    
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        eventType,
        page,
        buttonId,
        metadata,
      }),
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

// Webinar funnel pages (starts from /weby)
const WEBINAR_FUNNEL_PAGES = ['/weby', '/webinar', '/quiz'];

// Call funnel pages (starts from / or /call)
const CALL_FUNNEL_PAGES = ['/', '/call', '/survey', '/calldone', '/booked'];

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
    return; // Don't track internal/success pages
  }
  const funnel = getFunnel(page);
  trackEvent('page_view', page, undefined, { funnel });
}

// Track button click
export function trackButtonClick(buttonId: string, page: string): void {
  if (!shouldTrackPage(page)) {
    return; // Don't track clicks on internal pages
  }
  trackEvent('button_click', page, buttonId);
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

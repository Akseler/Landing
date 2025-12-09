import { google } from 'googleapis';
import { addDays, startOfDay, format, parseISO, isWeekend, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import fs from 'fs';
import path from 'path';

const TIMEZONE = 'Europe/Vilnius';
const SLOT_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18]; // 10:00 to 18:00 (last slot ends at 19:00)
const DAYS_AHEAD = 14; // 2 weeks

// OAuth Configuration - credentials from environment variables
const OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

// Auto-detect redirect URI based on environment
const isProduction = process.env.NODE_ENV === 'production';
const OAUTH_REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI || 
  (isProduction 
    ? 'https://akseler.lt/api/calendar/oauth/callback'
    : 'http://localhost:3000/api/calendar/oauth/callback');

// Token file path - use data directory in production for persistence
const TOKEN_FILE_PATH = isProduction 
  ? path.join(process.cwd(), 'data', 'google-calendar-token.json')
  : path.join(process.cwd(), '.google-calendar-token.json');

// Types
export interface TimeSlot {
  datetime: string; // ISO string in Europe/Vilnius timezone
  available: boolean;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  dayName: string;
  slots: TimeSlot[];
  hasAvailableSlots: boolean;
}

export interface BookingData {
  name: string;
  company: string;
  phone: string;
  email: string;
  datetime: string; // ISO string
  surveyData?: {
    leads: number;
    value: number;
    closeRate: number;
    speed: string;
  };
}

interface StoredTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

// Check if OAuth is configured
export function isOAuthConfigured(): boolean {
  return !!(OAUTH_CLIENT_ID && OAUTH_CLIENT_SECRET);
}

// Create OAuth2 client
function createOAuth2Client() {
  if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials not configured. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET environment variables.');
  }
  return new google.auth.OAuth2(
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    OAUTH_REDIRECT_URI
  );
}

// Load stored tokens
function loadStoredTokens(): StoredTokens | null {
  try {
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      const data = fs.readFileSync(TOKEN_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[Calendar] Error loading stored tokens:', error);
  }
  return null;
}

// Save tokens to file
function saveTokens(tokens: StoredTokens) {
  try {
    fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokens, null, 2));
    console.log('[Calendar] Tokens saved successfully');
  } catch (error) {
    console.error('[Calendar] Error saving tokens:', error);
  }
}

// Get authorization URL for OAuth
export function getAuthUrl(): string {
  console.log('[Calendar] Using redirect URI:', OAUTH_REDIRECT_URI);
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    prompt: 'consent', // Force to get refresh token
  });
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.refresh_token) {
      return { success: false, error: 'No refresh token received. Please try again.' };
    }
    
    saveTokens({
      access_token: tokens.access_token || '',
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date || 0,
    });
    
    console.log('[Calendar] OAuth tokens obtained and saved successfully');
    return { success: true };
  } catch (error: any) {
    console.error('[Calendar] Error exchanging code for tokens:', error);
    return { success: false, error: error.message };
  }
}

// Check if calendar is authorized
export function isCalendarAuthorized(): boolean {
  const tokens = loadStoredTokens();
  return tokens !== null && !!tokens.refresh_token;
}

// Initialize Google Calendar API client with OAuth
async function getCalendarClient() {
  // Check if OAuth is configured
  if (!isOAuthConfigured()) {
    console.warn('[Calendar] Google OAuth not configured. Calendar will show all slots as available.');
    return null;
  }
  
  const tokens = loadStoredTokens();
  
  if (!tokens || !tokens.refresh_token) {
    console.warn('[Calendar] Google Calendar not authorized. Please authorize at /api/calendar/auth');
    return null;
  }
  
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);
  
  // Refresh token if expired
  if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      saveTokens({
        access_token: credentials.access_token || '',
        refresh_token: credentials.refresh_token || tokens.refresh_token,
        expiry_date: credentials.expiry_date || 0,
      });
      oauth2Client.setCredentials(credentials);
    } catch (error) {
      console.error('[Calendar] Error refreshing access token:', error);
      return null;
    }
  }
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

// Fetch busy times from Google Calendar
async function getBusyTimes(startDate: Date, endDate: Date): Promise<{ start: string; end: string }[]> {
  const calendar = await getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
  
  if (!calendar) {
    console.warn('[Calendar] Google Calendar not authorized, returning empty busy times');
    return [];
  }
  
  try {
    console.log('[Calendar] Fetching busy times from', startDate.toISOString(), 'to', endDate.toISOString());
    
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        timeZone: TIMEZONE,
        items: [{ id: calendarId }],
      },
    });
    
    const busyTimes = response.data.calendars?.[calendarId]?.busy || [];
    console.log('[Calendar] Found', busyTimes.length, 'busy time blocks');
    
    return busyTimes.map(busy => ({
      start: busy.start || '',
      end: busy.end || '',
    })).filter(b => b.start && b.end);
  } catch (error: any) {
    console.error('[Calendar] Error fetching busy times:', error.message);
    // If unauthorized, clear tokens
    if (error.code === 401 || error.code === 403) {
      console.warn('[Calendar] Token may be invalid. Please re-authorize at /api/calendar/auth');
    }
    return [];
  }
}

// Check if a slot is busy
function isSlotBusy(slotStart: Date, slotEnd: Date, busyTimes: { start: string; end: string }[]): boolean {
  return busyTimes.some(busy => {
    const busyStart = new Date(busy.start);
    const busyEnd = new Date(busy.end);
    // Slot overlaps with busy time if:
    // - Slot starts before busy ends AND slot ends after busy starts
    return slotStart < busyEnd && slotEnd > busyStart;
  });
}

// Get available slots for a date range
export async function getAvailability(startDateStr?: string, endDateStr?: string): Promise<DayAvailability[]> {
  const now = new Date();
  const vilniusNow = toZonedTime(now, TIMEZONE);
  
  // Start from tomorrow (no same-day bookings)
  const tomorrow = addDays(startOfDay(vilniusNow), 1);
  
  // Default to next 2 weeks starting from tomorrow
  const startDate = startDateStr ? parseISO(startDateStr) : tomorrow;
  const endDate = endDateStr ? parseISO(endDateStr) : addDays(tomorrow, DAYS_AHEAD);
  
  // Fetch busy times from Google Calendar
  const busyTimes = await getBusyTimes(
    fromZonedTime(startDate, TIMEZONE),
    fromZonedTime(endDate, TIMEZONE)
  );
  
  const availability: DayAvailability[] = [];
  let currentDate = startDate;
  
  while (currentDate < endDate) {
    // Skip weekends
    if (!isWeekend(currentDate)) {
      const daySlots: TimeSlot[] = [];
      
      for (const hour of SLOT_HOURS) {
        // Create slot time in Vilnius timezone
        // currentDate is already a Date object representing a day in Vilnius timezone (from toZonedTime)
        // We need to set the hour while keeping it in Vilnius timezone context
        const dayStart = startOfDay(currentDate);
        let slotTimeVilnius = setHours(dayStart, hour);
        slotTimeVilnius = setMinutes(slotTimeVilnius, 0);
        slotTimeVilnius = setSeconds(slotTimeVilnius, 0);
        slotTimeVilnius = setMilliseconds(slotTimeVilnius, 0);
        
        // Convert Vilnius time to UTC for comparison with Google Calendar (which returns UTC)
        // fromZonedTime treats the Date as if it's in the specified timezone and converts to UTC
        const slotStartUTC = fromZonedTime(slotTimeVilnius, TIMEZONE);
        const slotEndUTC = new Date(slotStartUTC.getTime() + 60 * 60 * 1000); // 1 hour slot
        
        // Check if slot is in the past (compare UTC times)
        const isPast = slotStartUTC < now;
        
        // Check if slot is busy (busyTimes from Google are in UTC)
        const isBusy = isSlotBusy(slotStartUTC, slotEndUTC, busyTimes);
        
        daySlots.push({
          datetime: slotStartUTC.toISOString(),
          available: !isPast && !isBusy,
        });
      }
      
      const dayName = format(currentDate, 'EEEE');
      const dayNameLt = translateDayName(dayName);
      
      availability.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        dayName: dayNameLt,
        slots: daySlots,
        hasAvailableSlots: daySlots.some(s => s.available),
      });
    }
    
    currentDate = addDays(currentDate, 1);
  }
  
  return availability;
}

// Translate day names to Lithuanian
function translateDayName(englishName: string): string {
  const translations: Record<string, string> = {
    'Monday': 'Pirmadienis',
    'Tuesday': 'Antradienis',
    'Wednesday': 'Trečiadienis',
    'Thursday': 'Ketvirtadienis',
    'Friday': 'Penktadienis',
    'Saturday': 'Šeštadienis',
    'Sunday': 'Sekmadienis',
  };
  return translations[englishName] || englishName;
}

// Send booking to GoHighLevel webhook
export async function sendBookingWebhook(booking: BookingData): Promise<{ success: boolean; error?: string }> {
  // Webhook URL from environment variable (with fallback for development)
  const webhookUrl = process.env.GHL_BOOKING_WEBHOOK_URL || 'https://services.leadconnectorhq.com/hooks/VOJnJpYkp9TeABP2pBiV/webhook-trigger/fb6953ac-7c3e-40be-af6c-4dab8af4c266';
  
  if (!webhookUrl) {
    console.error('[Calendar] GHL_BOOKING_WEBHOOK_URL not configured');
    return { success: false, error: 'Webhook URL not configured' };
  }
  
  try {
    // Parse name into first and last name
    const nameParts = booking.name.trim().split(' ');
    const firstName = nameParts[0] || booking.name;
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Format datetime for GHL - using recommended format: YYYY-MM-DD HH:MM AM/PM
    const bookingDate = new Date(booking.datetime);
    
    // Convert to Vilnius timezone for display
    const vilniusDate = toZonedTime(bookingDate, TIMEZONE);
    
    // Format: YYYY-MM-DD HH:MM AM (GHL recommended format)
    const year = vilniusDate.getFullYear();
    const month = String(vilniusDate.getMonth() + 1).padStart(2, '0');
    const day = String(vilniusDate.getDate()).padStart(2, '0');
    const hours = vilniusDate.getHours();
    const minutes = String(vilniusDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const formattedHours = String(hours12).padStart(2, '0');
    
    // GHL recommended format: YYYY-MM-DD HH:MM AM
    const appointmentDateTime = `${year}-${month}-${day} ${formattedHours}:${minutes} ${ampm}`;
    
    // GoHighLevel compatible payload
    const payload = {
      // Contact fields (GHL standard)
      firstName: firstName,
      lastName: lastName,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      companyName: booking.company,
      
      // Booking details - GHL recommended format
      selected_slot: appointmentDateTime,
      selectedSlot: appointmentDateTime,
      appointmentDate: appointmentDateTime,
      selected_timezone: TIMEZONE,
      timezone: TIMEZONE,
      
      // Survey data (custom fields)
      leads: booking.surveyData?.leads || 0,
      dealValue: booking.surveyData?.value || 0,
      closeRate: booking.surveyData?.closeRate || 0,
      responseSpeed: booking.surveyData?.speed || '',
      
      // Metadata
      source: 'akseler.lt',
      formName: 'Booking Calendar',
      timestamp: new Date().toISOString(),
    };
    
    console.log('[Calendar] Sending booking webhook:', { 
      email: booking.email, 
      datetime: booking.datetime 
    });
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Calendar] Webhook failed:', response.status, errorText);
      return { success: false, error: `Webhook failed: ${response.status}` };
    }
    
    console.log('[Calendar] Booking webhook sent successfully');
    return { success: true };
  } catch (error: any) {
    console.error('[Calendar] Error sending webhook:', error.message);
    return { success: false, error: error.message };
  }
}

// Send survey data to webhook
export async function sendSurveyWebhook(surveyData: {
  email: string;
  leads: number;
  value: number;
  closeRate: number;
  speed: string;
}): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.GHL_SURVEY_WEBHOOK_URL || 'https://services.leadconnectorhq.com/hooks/VOJnJpYkp9TeABP2pBiV/webhook-trigger/0xIGwKvdzFHSCg7M4jje';
  
  if (!webhookUrl) {
    console.error('[Calendar] GHL_SURVEY_WEBHOOK_URL not configured');
    return { success: false, error: 'Webhook URL not configured' };
  }
  
  try {
    // Extract name from email if possible, or use email as name
    const emailParts = surveyData.email.split('@');
    const emailName = emailParts[0] || 'Survey User';
    const nameParts = emailName.split('.');
    const firstName = nameParts[0] || emailName;
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const payload = {
      // Required contact fields (GHL standard)
      email: surveyData.email,
      firstName: firstName,
      lastName: lastName,
      name: emailName,
      // Survey data
      leads: surveyData.leads,
      dealValue: surveyData.value,
      closeRate: surveyData.closeRate,
      responseSpeed: surveyData.speed,
      // Calculated fields
      salesNow: Math.round(surveyData.leads * (surveyData.closeRate / 100)),
      revNow: Math.round(surveyData.leads * (surveyData.closeRate / 100) * surveyData.value),
      // Metadata
      source: 'akseler.lt',
      formName: 'Survey Submission',
      timestamp: new Date().toISOString(),
    };
    
    console.log('[Calendar] Sending survey webhook payload:', JSON.stringify(payload, null, 2));
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('[Calendar] Survey webhook failed:', response.status, errorText);
        return { success: false, error: `Webhook failed: ${response.status}` };
      }
      
      console.log('[Calendar] Survey webhook sent successfully');
      return { success: true };
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Handle DNS errors and network errors gracefully
      if (fetchError.name === 'AbortError') {
        console.error('[Calendar] Survey webhook timeout');
        return { success: false, error: 'Webhook timeout' };
      }
      
      // DNS errors (EAI_AGAIN, ENOTFOUND, etc.) should not crash
      if (fetchError.code === 'EAI_AGAIN' || fetchError.code === 'ENOTFOUND' || fetchError.code === 'ECONNREFUSED') {
        console.error('[Calendar] Survey webhook network error (DNS/Connection):', fetchError.code, fetchError.message);
        return { success: false, error: `Network error: ${fetchError.code}` };
      }
      
      throw fetchError; // Re-throw unexpected errors
    }
  } catch (error: any) {
    console.error('[Calendar] Error sending survey webhook:', error.message || error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

// Send contact info to lead capture webhook
export async function sendContactWebhook(contactInfo: {
  name: string;
  company: string;
  phone: string;
  email: string;
  surveyData?: {
    leads: number;
    value: number;
    closeRate: number;
    speed: string;
  };
}): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.GHL_CONTACT_WEBHOOK_URL || 'https://services.leadconnectorhq.com/hooks/VOJnJpYkp9TeABP2pBiV/webhook-trigger/oDItvATLqhyJAv3lhPyv';
  
  if (!webhookUrl) {
    console.error('[Calendar] GHL_CONTACT_WEBHOOK_URL not configured');
    return { success: false, error: 'Webhook URL not configured' };
  }
  
  try {
    // Parse name into first and last name
    const nameParts = contactInfo.name.trim().split(' ');
    const firstName = nameParts[0] || contactInfo.name;
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const payload = {
      firstName: firstName,
      lastName: lastName,
      name: contactInfo.name,
      email: contactInfo.email,
      phone: contactInfo.phone,
      companyName: contactInfo.company,
      company: contactInfo.company,
      source: 'akseler.lt',
      formName: 'Booking Contact Form',
      timestamp: new Date().toISOString(),
      // Survey data
      ...(contactInfo.surveyData && {
        leads: contactInfo.surveyData.leads,
        dealValue: contactInfo.surveyData.value,
        closeRate: contactInfo.surveyData.closeRate,
        responseSpeed: contactInfo.surveyData.speed,
        // Calculated fields
        salesNow: Math.round(contactInfo.surveyData.leads * (contactInfo.surveyData.closeRate / 100)),
        revNow: Math.round(contactInfo.surveyData.leads * (contactInfo.surveyData.closeRate / 100) * contactInfo.surveyData.value),
      }),
    };
    
    console.log('[Calendar] Sending contact webhook:', { 
      email: contactInfo.email,
      name: contactInfo.name 
    });
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Calendar] Contact webhook failed:', response.status, errorText);
      return { success: false, error: `Webhook failed: ${response.status}` };
    }
    
    console.log('[Calendar] Contact webhook sent successfully');
    return { success: true };
  } catch (error: any) {
    console.error('[Calendar] Error sending contact webhook:', error.message);
    return { success: false, error: error.message };
  }
}

// Validate booking data
export function validateBookingData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Vardas yra privalomas (bent 2 simboliai)');
  }
  
  if (!data.company || typeof data.company !== 'string' || data.company.trim().length < 2) {
    errors.push('Įmonės pavadinimas yra privalomas');
  }
  
  if (!data.phone || typeof data.phone !== 'string' || !/^[+]?[0-9\s-]{6,20}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.push('Neteisingas telefono numeris');
  }
  
  if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
    errors.push('Neteisingas el. pašto adresas');
  }
  
  if (!data.datetime || typeof data.datetime !== 'string') {
    errors.push('Pasirinkite laiką');
  } else {
    const bookingDate = new Date(data.datetime);
    if (isNaN(bookingDate.getTime())) {
      errors.push('Neteisingas datos formatas');
    } else if (bookingDate < new Date()) {
      errors.push('Negalima rezervuoti praeities laiko');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}


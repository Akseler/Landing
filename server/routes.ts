import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema, insertAnalyticsEventSchema, insertQuizResponseSchema, insertCallFunnelSubmissionSchema } from "@shared/schema";
import crypto from "crypto";
import { getAvailability, sendBookingWebhook, sendContactWebhook, sendSurveyWebhook, validateBookingData, type BookingData, getAuthUrl, exchangeCodeForTokens, isCalendarAuthorized, isOAuthConfigured } from "./calendar";

// Get real IP address from request (handles proxies)
function getClientIP(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

// Mask IP address to show only last 2 segments (GDPR-friendly)
// IPv4: "185.123.45.67" -> "xxx.xxx.45.67"
// IPv6: "2001:0db8:85a3::8a2e:0370:7334" -> "xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:7334"
// IPv6-mapped IPv4: "::ffff:192.168.1.1" -> "xxx.xxx.1.1"
function maskIP(ip: string): string {
  if (ip === 'unknown' || !ip) return 'xxx.xxx.xxx.xxx';
  
  // Remove leading ::ffff: for IPv6-mapped IPv4 addresses
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }
  
  // Handle IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `xxx.xxx.${parts[2]}.${parts[3]}`;
    }
  }
  
  // Handle IPv6 (including ::1 localhost)
  if (ip.includes(':')) {
    // For ::1 or other short IPv6, just mask it completely
    if (ip === '::1' || ip.length < 10) {
      return 'xxx:xxx:xxx:xxx';
    }
    
    // For full IPv6, keep only last hextet
    const parts = ip.split(':');
    const lastPart = parts[parts.length - 1];
    return `xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:${lastPart}`;
  }
  
  // Fallback for unknown format
  return 'xxx.xxx.xxx.xxx';
}

// Analytics access validation helper
function validateAnalyticsAccess(req: any, res: any): boolean {
  const authHeader = req.headers['authorization'];
  const correctPassword = process.env.ANALYTICS_PASSWORD || "Akseler500*";
  
  if (!authHeader || authHeader !== `Bearer ${correctPassword}`) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Quiz submission API - accepts both qualified and unqualified registrations
  app.post("/api/quiz/submit", async (req, res) => {
    try {
      const validatedData = insertRegistrationSchema.parse(req.body);
      
      // Server-side qualification logic
      const isQualified = validatedData.servicesOver1000 === true;
      
      // Store ALL registrations (both qualified and unqualified)
      const registration = await storage.createRegistration({
        ...validatedData,
        qualified: isQualified,
      });
      
      res.json({ 
        success: true, 
        qualified: isQualified,
        registration 
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/registrations", async (_req, res) => {
    try {
      const registrations = await storage.getRegistrations();
      res.json(registrations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get registrations with session data (for analytics dashboard)
  app.get("/api/analytics/registrations", async (req, res) => {
    if (!validateAnalyticsAccess(req, res)) return;
    
    try {
      const registrations = await storage.getRegistrationsWithSessionData();
      res.json(registrations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics tracking endpoints - handle both JSON (fetch) and Blob (sendBeacon)
  app.post("/api/analytics/track", async (req, res) => {
    try {
      // Handle both JSON and Blob (sendBeacon) requests
      let bodyData = req.body;
      
      // Check if we have rawBody (from express.json verify) which might be a Buffer from sendBeacon
      const rawBody = (req as any).rawBody;
      if (rawBody && Buffer.isBuffer(rawBody)) {
        try {
          bodyData = JSON.parse(rawBody.toString('utf-8'));
        } catch (e) {
          // If rawBody parsing fails, try req.body (might already be parsed)
          if (req.body && typeof req.body === 'object' && req.body.sessionId) {
            bodyData = req.body;
          } else {
            console.error('[API] /api/analytics/track - Error parsing rawBody buffer:', e);
            return res.status(400).json({ error: "Invalid request body" });
          }
        }
      } else if (Buffer.isBuffer(req.body)) {
        // Direct buffer from sendBeacon (if express.json didn't process it)
        try {
          bodyData = JSON.parse(req.body.toString('utf-8'));
        } catch (e) {
          console.error('[API] /api/analytics/track - Error parsing Buffer:', e);
          return res.status(400).json({ error: "Invalid request body" });
        }
      } else if (typeof req.body === 'string') {
        try {
          bodyData = JSON.parse(req.body);
        } catch (e) {
          console.error('[API] /api/analytics/track - Error parsing string body:', e);
          return res.status(400).json({ error: "Invalid request body" });
        }
      }
      
      const { sessionId, eventType, page, buttonId, metadata } = bodyData;
      
      if (!sessionId || !eventType || !page) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const ip = getClientIP(req);
      const partialIP = maskIP(ip);
      const userAgent = req.headers['user-agent'] || null;

      // Get or create session
      await storage.getOrCreateSession(sessionId, partialIP, userAgent);
      
      // Update session activity
      await storage.updateSessionActivity(sessionId);

      // Create event
      const event = await storage.createEvent({
        sessionId,
        eventType,
        page,
        buttonId: buttonId || null,
        metadata: metadata || null,
      });

      // Log button clicks and page views for debugging
      if (eventType === 'button_click') {
        console.log(`[TRACK] Button click: ${buttonId} on ${page} (session: ${sessionId.substring(0, 8)}...)`);
      } else if (eventType === 'page_view') {
        console.log(`[TRACK] Page view: ${page} (session: ${sessionId.substring(0, 8)}...)`);
      }

      res.json({ success: true, event });
    } catch (error: any) {
      console.error('Analytics tracking error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/analytics/quiz-response", async (req, res) => {
    try {
      const validatedData = insertQuizResponseSchema.parse(req.body);
      const response = await storage.createQuizResponse(validatedData);
      res.json({ success: true, response });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/analytics/link-registration", async (req, res) => {
    try {
      const { sessionId, registrationId } = req.body;
      if (!sessionId || !registrationId) {
        return res.status(400).json({ error: "Missing sessionId or registrationId" });
      }
      await storage.linkRegistrationToSession(sessionId, registrationId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics dashboard endpoints (password protected)
  app.post("/api/analytics/auth", async (req, res) => {
    try {
      const { password } = req.body;
      const correctPassword = process.env.ANALYTICS_PASSWORD || "Akseler500*";
      
      if (password === correctPassword) {
        res.json({ success: true });
      } else {
        res.status(401).json({ error: "Invalid password" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics data endpoints (password protected via header)

  app.get("/api/analytics/summary", async (req, res) => {
    if (!validateAnalyticsAccess(req, res)) return;
    
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const summary = await storage.getAnalyticsSummary(start, end);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Call funnel analytics summary
  app.get("/api/analytics/call-funnel", async (req, res) => {
    if (!validateAnalyticsAccess(req, res)) return;
    
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const summary = await storage.getCallFunnelSummary(start, end);
      console.log(`[API] /api/analytics/call-funnel - uzklausos: ${summary.uzklausosClicks}, pardavimai: ${summary.pardavimaiClicks}, bookingPage: ${summary.bookingPageVisitors}`);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/sessions", async (req, res) => {
    if (!validateAnalyticsAccess(req, res)) return;
    
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/session/:id", async (req, res) => {
    if (!validateAnalyticsAccess(req, res)) return;
    
    try {
      const { id } = req.params;
      const events = await storage.getEventsBySession(id);
      const quizResponses = await storage.getQuizResponsesBySession(id);
      res.json({ events, quizResponses });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Clear all analytics data (password protected)
  app.delete("/api/analytics/clear-data", async (req, res) => {
    if (!validateAnalyticsAccess(req, res)) return;
    
    try {
      await storage.clearAllAnalyticsData();
      res.json({ success: true, message: "All data cleared successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Call funnel submission (survey email submit)
  app.post("/api/call-funnel/submit", async (req, res) => {
    try {
      console.log('[API] /api/call-funnel/submit - Received request body:', JSON.stringify(req.body, null, 2));
      
      // Extract sessionId and ipAddress first, keep everything else
      const { sessionId, ipAddress, ...data } = req.body;
      
      // Validate email is present and not empty
      if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
        console.error('[API] /api/call-funnel/submit - Email validation failed:', data.email);
        return res.status(400).json({ error: 'Email is required and cannot be empty' });
      }
      
      // Trim email
      data.email = data.email.trim();
      
      // Validate the data against schema
      let validatedData;
      try {
        validatedData = insertCallFunnelSubmissionSchema.parse(data);
      } catch (validationError: any) {
        console.error('[API] /api/call-funnel/submit - Schema validation failed:', validationError.errors || validationError.message);
        return res.status(400).json({ 
          error: 'Invalid submission data', 
          details: validationError.errors || validationError.message 
        });
      }
      
      // Ensure email is still present after validation
      if (!validatedData.email || !validatedData.email.trim()) {
        console.error('[API] /api/call-funnel/submit - Email missing after validation');
        return res.status(400).json({ error: 'Email is required' });
      }
      
      const ip = getClientIP(req);
      const partialIP = ipAddress || maskIP(ip);
      
      console.log('[API] /api/call-funnel/submit - Creating submission with:', { 
        email: validatedData.email,
        leads: validatedData.leads,
        value: validatedData.value,
        closeRate: validatedData.closeRate,
        speed: validatedData.speed,
        sessionId: sessionId || null, 
        ipAddress: partialIP 
      });
      
      const submission = await storage.createCallFunnelSubmission({
        ...validatedData,
        sessionId: sessionId || null,
        ipAddress: partialIP
      });
      
      console.log('[API] /api/call-funnel/submit - Submission created successfully:', { 
        id: submission.id, 
        email: submission.email 
      });
      
      // Send response immediately, don't wait for webhook
      res.json({ success: true, submission });
      
      // Send survey data to webhook in background (fire-and-forget, non-blocking)
      sendSurveyWebhook({
        email: validatedData.email,
        leads: validatedData.leads,
        value: validatedData.value,
        closeRate: validatedData.closeRate,
        speed: validatedData.speed,
      }).then((webhookResult) => {
        if (!webhookResult.success) {
          console.error('[API] /api/call-funnel/submit - Survey webhook failed:', webhookResult.error);
        } else {
          console.log('[API] /api/call-funnel/submit - Survey webhook sent for:', validatedData.email);
        }
      }).catch((webhookError: any) => {
        console.error('[API] /api/call-funnel/submit - Survey webhook error:', webhookError);
      });
    } catch (error: any) {
      console.error('[API] /api/call-funnel/submit - Error:', error);
      res.status(500).json({ error: error.message || 'Failed to create submission' });
    }
  });

  // Get call funnel submissions (password protected)
  app.get("/api/analytics/call-funnel-submissions", async (req, res) => {
    if (!validateAnalyticsAccess(req, res)) return;
    
    try {
      console.log('[API] /api/analytics/call-funnel-submissions - Fetching submissions...');
      
      // getCallFunnelSubmissions should never throw - it returns empty array on error
      // But we'll wrap it in try-catch just to be safe
      const submissions = await storage.getCallFunnelSubmissions();
      
      // Ensure we always return an array, even if something went wrong
      const result = Array.isArray(submissions) ? submissions : [];
      
      console.log(`[API] /api/analytics/call-funnel-submissions - Returning ${result.length} submissions`);
      res.json(result);
    } catch (error: any) {
      // This should rarely happen since getCallFunnelSubmissions returns [] on error
      // But if it does, return empty array to prevent breaking the analytics page
      console.error('[API] /api/analytics/call-funnel-submissions - Unexpected error:', error);
      res.json([]); // Return empty array instead of error to keep page functional
    }
  });

  // Get bookings with survey data (password protected)
  app.get("/api/analytics/bookings", async (req, res) => {
    if (!validateAnalyticsAccess(req, res)) return;
    
    try {
      const bookings = await storage.getBookingsWithSurveyData();
      res.json(bookings);
    } catch (error: any) {
      console.error('[API] /api/analytics/bookings - Error:', error);
      res.json([]); // Return empty array instead of error
    }
  });

  // Delete individual registration (password protected)
  app.delete("/api/analytics/registration/:id", async (req, res) => {
    if (!validateAnalyticsAccess(req, res)) return;
    
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: "Invalid registration ID" });
      }
      await storage.deleteRegistration(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete individual call funnel submission (password protected)
  app.delete("/api/analytics/call-funnel-submission/:id", async (req, res) => {
    if (!validateAnalyticsAccess(req, res)) return;
    
    try {
      const id = req.params.id;
      if (!id) {
        console.error('[API] /api/analytics/call-funnel-submission/:id - Invalid ID');
        return res.status(400).json({ error: "Invalid submission ID" });
      }
      
      console.log(`[API] /api/analytics/call-funnel-submission/${id} - Deleting submission...`);
      await storage.deleteCallFunnelSubmission(id);
      console.log(`[API] /api/analytics/call-funnel-submission/${id} - Successfully deleted`);
      
      res.json({ success: true, message: "Submission and all related events deleted" });
    } catch (error: any) {
      console.error(`[API] /api/analytics/call-funnel-submission/${req.params.id} - Error:`, error);
      res.status(500).json({ error: error.message || 'Failed to delete submission' });
    }
  });

  // ============================================
  // CALENDAR BOOKING ENDPOINTS
  // ============================================

  // Check if Google Calendar is authorized
  app.get("/api/calendar/status", async (req, res) => {
    const configured = isOAuthConfigured();
    const authorized = configured && isCalendarAuthorized();
    res.json({ 
      configured,
      authorized,
      message: !configured 
        ? 'OAuth credentials not configured. Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.'
        : authorized 
        ? 'Google Calendar is connected' 
        : 'Google Calendar not connected. Visit /api/calendar/auth to authorize.'
    });
  });

  // Start OAuth authorization flow
  app.get("/api/calendar/auth", async (req, res) => {
    if (!isOAuthConfigured()) {
      return res.status(500).send(`
        <html>
          <head><title>OAuth Not Configured</title></head>
          <body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1 style="color: #dc2626;">⚠️ OAuth Not Configured</h1>
            <p>Please set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET environment variables.</p>
          </body>
        </html>
      `);
    }
    const authUrl = getAuthUrl();
    res.redirect(authUrl);
  });

  // OAuth callback - receives the authorization code
  app.get("/api/calendar/oauth/callback", async (req, res) => {
    const code = req.query.code as string;
    
    if (!code) {
      return res.status(400).send(`
        <html>
          <head><title>Authorization Failed</title></head>
          <body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1 style="color: #dc2626;">❌ Authorization Failed</h1>
            <p>No authorization code received.</p>
            <a href="/api/calendar/auth">Try again</a>
          </body>
        </html>
      `);
    }
    
    const result = await exchangeCodeForTokens(code);
    
    if (result.success) {
      res.send(`
        <html>
          <head><title>Authorization Successful</title></head>
          <body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1 style="color: #1d8263;">✅ Google Calendar Connected!</h1>
            <p>Your calendar is now connected. The booking system will show real availability.</p>
            <p style="margin-top: 20px;">
              <a href="/booking" style="background: #1d8263; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
                Go to Booking Page
              </a>
            </p>
          </body>
        </html>
      `);
    } else {
      res.status(500).send(`
        <html>
          <head><title>Authorization Failed</title></head>
          <body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1 style="color: #dc2626;">❌ Authorization Failed</h1>
            <p>${result.error}</p>
            <a href="/api/calendar/auth">Try again</a>
          </body>
        </html>
      `);
    }
  });

  // Get available time slots from Google Calendar
  app.get("/api/calendar/availability", async (req, res) => {
    try {
      const { start, end } = req.query;
      
      console.log('[API] /api/calendar/availability - Fetching availability');
      
      const availability = await getAvailability(
        start as string | undefined,
        end as string | undefined
      );
      
      console.log(`[API] /api/calendar/availability - Found ${availability.length} days with slots`);
      res.json(availability);
    } catch (error: any) {
      console.error('[API] /api/calendar/availability - Error:', error);
      res.status(500).json({ error: 'Failed to fetch availability' });
    }
  });

  // Send contact info to lead capture webhook
  app.post("/api/calendar/contact", async (req, res) => {
    try {
      console.log('[API] /api/calendar/contact - Received contact info');
      
      const { name, company, phone, email, surveyData } = req.body;
      
      // Basic validation
      if (!name || !company || !phone || !email) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['name', 'company', 'phone', 'email']
        });
      }
      
      // Send webhook to GoHighLevel
      const webhookResult = await sendContactWebhook({ 
        name, 
        company, 
        phone, 
        email,
        surveyData: surveyData || undefined
      });
      
      if (!webhookResult.success) {
        console.error('[API] /api/calendar/contact - Webhook failed:', webhookResult.error);
        // Don't fail the request - just log it
      } else {
        console.log('[API] /api/calendar/contact - Contact webhook sent for:', email);
      }
      
      // Always return success - webhook is fire-and-forget
      res.json({ 
        success: true, 
        message: 'Kontaktinė informacija gauta' 
      });
    } catch (error: any) {
      console.error('[API] /api/calendar/contact - Error:', error);
      // Don't fail - just return success
      res.json({ success: true });
    }
  });

  // Book a time slot and send webhook to GHL
  app.post("/api/calendar/book", async (req, res) => {
    try {
      console.log('[API] /api/calendar/book - Received booking request');
      
      const bookingData: BookingData = req.body;
      
      // Validate booking data
      const validation = validateBookingData(bookingData);
      if (!validation.valid) {
        console.log('[API] /api/calendar/book - Validation failed:', validation.errors);
        return res.status(400).json({ 
          error: 'Validation failed', 
          errors: validation.errors 
        });
      }
      
      // Send webhook to GoHighLevel
      const webhookResult = await sendBookingWebhook(bookingData);
      
      if (!webhookResult.success) {
        console.error('[API] /api/calendar/book - Webhook failed:', webhookResult.error);
        return res.status(500).json({ 
          error: 'Failed to complete booking', 
          details: webhookResult.error 
        });
      }
      
      console.log('[API] /api/calendar/book - Booking successful for:', bookingData.email);
      
      // Track booking event for analytics
      // Note: booking_completed event is tracked client-side in BookingCalendar.tsx
      // No need to track again here to avoid duplicates
      
      res.json({ 
        success: true, 
        message: 'Rezervacija sėkmingai užregistruota!' 
      });
    } catch (error: any) {
      console.error('[API] /api/calendar/book - Error:', error);
      res.status(500).json({ error: 'Failed to process booking' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

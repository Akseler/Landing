import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema, insertAnalyticsEventSchema, insertQuizResponseSchema, insertCallFunnelSubmissionSchema } from "@shared/schema";
import crypto from "crypto";

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

  // Analytics tracking endpoints
  app.post("/api/analytics/track", async (req, res) => {
    try {
      const { sessionId, eventType, page, buttonId, metadata } = req.body;
      
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
      const validatedData = insertCallFunnelSubmissionSchema.parse(req.body);
      const submission = await storage.createCallFunnelSubmission(validatedData);
      res.json({ success: true, submission });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get call funnel submissions (password protected)
  app.get("/api/analytics/call-funnel-submissions", async (req, res) => {
    if (!validateAnalyticsAccess(req, res)) return;
    
    try {
      const submissions = await storage.getCallFunnelSubmissions();
      res.json(submissions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
        return res.status(400).json({ error: "Invalid submission ID" });
      }
      await storage.deleteCallFunnelSubmission(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

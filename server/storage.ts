import { 
  users, registrations, analyticsSessions, analyticsEvents, quizResponses, callFunnelSubmissions,
  type User, type InsertUser, type Registration, type InsertRegistration,
  type AnalyticsSession, type InsertAnalyticsSession,
  type AnalyticsEvent, type InsertAnalyticsEvent,
  type QuizResponse, type InsertQuizResponse,
  type RegistrationWithSession,
  type CallFunnelSubmission, type InsertCallFunnelSubmission
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql as drizzleSql, inArray, and, or } from "drizzle-orm";

function getDb() {
  if (!db) {
    throw new Error("Database is not available. Please check DATABASE_URL configuration.");
  }
  return db;
}

// IStorage interface defines all CRUD operations needed
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createRegistration(registration: InsertRegistration & { qualified: boolean }): Promise<Registration>;
  getRegistrations(): Promise<Registration[]>;
  getRegistrationsWithSessionData(): Promise<RegistrationWithSession[]>;
  
  // Analytics methods
  getOrCreateSession(sessionId: string, ipAddress: string, userAgent: string | null): Promise<AnalyticsSession>;
  updateSessionActivity(sessionId: string): Promise<void>;
  createEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  createQuizResponse(response: InsertQuizResponse): Promise<QuizResponse>;
  linkRegistrationToSession(sessionId: string, registrationId: string): Promise<void>;
  
  // Call funnel analytics
  getCallFunnelSummary(startDate?: Date, endDate?: Date): Promise<{
    callPageVisitors: number;
    videoViews: number;
    videoToLandingRate: number;
    surveyPageVisitors: number;
    surveyToVideoRate: number;
    emailSubmissions: number;
    emailToSurveyRate: number;
    overallConversionRate: number;
  }>;
  
  // Webinar funnel analytics with date filter
  getAnalyticsSummary(startDate?: Date, endDate?: Date): Promise<{
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
  }>;
  
  getEventsBySession(sessionId: string): Promise<AnalyticsEvent[]>;
  getQuizResponsesBySession(sessionId: string): Promise<QuizResponse[]>;
  getAllSessions(): Promise<(AnalyticsSession & { eventCount: number })[]>;
  clearAllAnalyticsData(): Promise<void>;
  
  // Call funnel submissions
  createCallFunnelSubmission(submission: InsertCallFunnelSubmission): Promise<CallFunnelSubmission>;
  getCallFunnelSubmissions(): Promise<(CallFunnelSubmission & { watchedVSL: boolean })[]>;
  
  // Delete individual items
  deleteRegistration(id: string): Promise<void>;
  deleteCallFunnelSubmission(id: string): Promise<void>;
}

// DatabaseStorage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const database = getDb();
    const [user] = await database.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const database = getDb();
    const [user] = await database.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const database = getDb();
    const [user] = await database
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createRegistration(insertRegistration: InsertRegistration & { qualified: boolean }): Promise<Registration> {
    const database = getDb();
    const [registration] = await database
      .insert(registrations)
      .values(insertRegistration)
      .returning();
    return registration;
  }

  async getRegistrations(): Promise<Registration[]> {
    const database = getDb();
    return await database.select().from(registrations).orderBy(desc(registrations.createdAt));
  }

  // Get registrations with session data (IP address, etc.)
  async getRegistrationsWithSessionData(): Promise<RegistrationWithSession[]> {
    const database = getDb();
    const results = await database
      .select({
        id: registrations.id,
        servicesOver1000: registrations.servicesOver1000,
        budgetOver1000: registrations.budgetOver1000,
        usesFacebookAds: registrations.usesFacebookAds,
        noAdsReason: registrations.noAdsReason,
        name: registrations.name,
        phone: registrations.phone,
        email: registrations.email,
        qualified: registrations.qualified,
        createdAt: registrations.createdAt,
        sessionIp: analyticsSessions.ipAddress,
      })
      .from(registrations)
      .leftJoin(analyticsSessions, eq(analyticsSessions.registrationId, registrations.id))
      .orderBy(desc(registrations.createdAt));
    
    return results as RegistrationWithSession[];
  }

  async getOrCreateSession(sessionId: string, ipAddress: string, userAgent: string | null): Promise<AnalyticsSession> {
    const database = getDb();
    const [existing] = await database.select().from(analyticsSessions).where(eq(analyticsSessions.id, sessionId));
    
    if (existing) {
      return existing;
    }

    const [session] = await database
      .insert(analyticsSessions)
      .values({ id: sessionId, ipAddress, userAgent })
      .returning();
    return session;
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    const database = getDb();
    await database
      .update(analyticsSessions)
      .set({ 
        lastVisit: drizzleSql`CURRENT_TIMESTAMP`,
        totalPageViews: drizzleSql`${analyticsSessions.totalPageViews} + 1`
      })
      .where(eq(analyticsSessions.id, sessionId));
  }

  async createEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const database = getDb();
    const [created] = await database
      .insert(analyticsEvents)
      .values(event)
      .returning();
    return created;
  }

  async createQuizResponse(response: InsertQuizResponse): Promise<QuizResponse> {
    const database = getDb();
    const [created] = await database
      .insert(quizResponses)
      .values(response)
      .returning();
    return created;
  }

  async linkRegistrationToSession(sessionId: string, registrationId: string): Promise<void> {
    const database = getDb();
    await database
      .update(analyticsSessions)
      .set({ registrationId })
      .where(eq(analyticsSessions.id, sessionId));
  }

  async getAnalyticsSummary(startDate?: Date, endDate?: Date): Promise<{
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
  }> {
    const database = getDb();
    
    // Build date filter condition
    const dateCondition = startDate && endDate 
      ? drizzleSql`AND ${analyticsEvents.timestamp} >= ${startDate.toISOString()} AND ${analyticsEvents.timestamp} < ${endDate.toISOString()}`
      : drizzleSql``;
    
    // Count unique visitors who started at /weby (webinar funnel landing)
    const [webyVisitors] = await database
      .select({ count: drizzleSql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` })
      .from(analyticsEvents)
      .where(drizzleSql`${analyticsEvents.page} = '/weby' ${dateCondition}`);

    const uniqueVisitors = webyVisitors?.count || 0;

    const [webinarViewSessions] = await database
      .select({ count: drizzleSql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` })
      .from(analyticsEvents)
      .where(drizzleSql`${analyticsEvents.page} = '/webinar' ${dateCondition}`);

    const [quizStarts] = await database
      .select({ count: drizzleSql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` })
      .from(analyticsEvents)
      .where(drizzleSql`${analyticsEvents.page} = '/quiz' ${dateCondition}`);

    // Quiz completions WITHOUT registration (Stage 4: completed quiz but didn't register)
    const quizCompletionsQuery = startDate && endDate
      ? drizzleSql`${analyticsEvents.eventType} = 'quiz_completed' AND ${analyticsEvents.timestamp} >= ${startDate.toISOString()} AND ${analyticsEvents.timestamp} < ${endDate.toISOString()}`
      : eq(analyticsEvents.eventType, 'quiz_completed');
      
    const quizCompletionsResult = await database
      .select({ 
        sessionId: analyticsEvents.sessionId,
        registrationId: analyticsSessions.registrationId 
      })
      .from(analyticsEvents)
      .leftJoin(analyticsSessions, eq(analyticsEvents.sessionId, analyticsSessions.id))
      .where(quizCompletionsQuery);
    
    // Count unique sessions with quiz_completed but no registration
    const uniqueCompletedSessions = new Set(
      quizCompletionsResult
        .filter(r => r.registrationId === null)
        .map(r => r.sessionId)
    );
    const quizCompleteCount = uniqueCompletedSessions.size;

    // Count registrations with date filter
    const registrationDateCondition = startDate && endDate
      ? drizzleSql`${registrations.createdAt} >= ${startDate.toISOString()} AND ${registrations.createdAt} < ${endDate.toISOString()}`
      : drizzleSql`1=1`;
      
    const [registrationCount] = await database
      .select({ count: drizzleSql<number>`COUNT(*)` })
      .from(registrations)
      .where(registrationDateCondition);

    const webinarSessions = webinarViewSessions?.count || 0;
    const quizStartCount = quizStarts?.count || 0;
    const registrationCountValue = registrationCount?.count || 0;

    // Calculate percentages (avoid division by zero)
    const webinarConversionRate = uniqueVisitors > 0 ? (webinarSessions / uniqueVisitors) * 100 : 0;
    const quizStartRate = uniqueVisitors > 0 ? (quizStartCount / uniqueVisitors) * 100 : 0;
    const quizStartFromWebinar = webinarSessions > 0 ? (quizStartCount / webinarSessions) * 100 : 0;
    const quizCompletionRate = uniqueVisitors > 0 ? (quizCompleteCount / uniqueVisitors) * 100 : 0;
    const quizCompletionFromStarts = quizStartCount > 0 ? (quizCompleteCount / quizStartCount) * 100 : 0;
    const registrationRate = uniqueVisitors > 0 ? (registrationCountValue / uniqueVisitors) * 100 : 0;
    const registrationFromCompletions = quizCompleteCount > 0 ? (registrationCountValue / quizCompleteCount) * 100 : 0;

    // Calculate average session duration
    const sessionDurationCondition = startDate && endDate
      ? drizzleSql`${analyticsEvents.eventType} = 'session_duration' AND ${analyticsEvents.timestamp} >= ${startDate.toISOString()} AND ${analyticsEvents.timestamp} < ${endDate.toISOString()}`
      : eq(analyticsEvents.eventType, 'session_duration');
    
    const sessionDurationEvents = await database
      .select({ metadata: analyticsEvents.metadata })
      .from(analyticsEvents)
      .where(sessionDurationCondition);
    
    const durations = sessionDurationEvents
      .map(e => e.metadata && typeof e.metadata === 'object' && 'duration' in e.metadata ? Number(e.metadata.duration) : null)
      .filter((d): d is number => d !== null && !isNaN(d));
    
    const averageSessionDuration = durations.length > 0 
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    // Calculate average scroll depth
    const scrollDepthCondition = startDate && endDate
      ? drizzleSql`${analyticsEvents.eventType} = 'scroll_depth' AND ${analyticsEvents.timestamp} >= ${startDate.toISOString()} AND ${analyticsEvents.timestamp} < ${endDate.toISOString()}`
      : eq(analyticsEvents.eventType, 'scroll_depth');
    
    const scrollDepthEvents = await database
      .select({ metadata: analyticsEvents.metadata })
      .from(analyticsEvents)
      .where(scrollDepthCondition);
    
    const scrollDepths = scrollDepthEvents
      .map(e => e.metadata && typeof e.metadata === 'object' && 'depth' in e.metadata ? Number(e.metadata.depth) : null)
      .filter((d): d is number => d !== null && !isNaN(d));
    
    const averageScrollDepth = scrollDepths.length > 0 
      ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length)
      : 0;

    return {
      totalVisits: uniqueVisitors,
      uniqueVisitors,
      webinarViewSessions: webinarSessions,
      webinarConversionRate: Math.round(webinarConversionRate * 10) / 10,
      quizStarts: quizStartCount,
      quizStartRate: Math.round(quizStartRate * 10) / 10,
      quizStartFromWebinar: Math.round(quizStartFromWebinar * 10) / 10,
      quizCompletions: quizCompleteCount,
      quizCompletionRate: Math.round(quizCompletionRate * 10) / 10,
      quizCompletionFromStarts: Math.round(quizCompletionFromStarts * 10) / 10,
      registrations: registrationCountValue,
      registrationRate: Math.round(registrationRate * 10) / 10,
      registrationFromCompletions: Math.round(registrationFromCompletions * 10) / 10,
      averageSessionDuration,
      averageScrollDepth,
    };
  }

  async getCallFunnelSummary(startDate?: Date, endDate?: Date): Promise<{
    callPageVisitors: number;
    videoViews: number;
    videoToLandingRate: number;
    surveyPageVisitors: number;
    surveyToVideoRate: number;
    emailSubmissions: number;
    emailToSurveyRate: number;
    overallConversionRate: number;
  }> {
    const database = getDb();
    
    // Build date filter condition
    const dateCondition = startDate && endDate 
      ? drizzleSql`AND ${analyticsEvents.timestamp} >= ${startDate.toISOString()} AND ${analyticsEvents.timestamp} < ${endDate.toISOString()}`
      : drizzleSql``;
    
    // Count unique sessions that visited / or /call page (Call funnel landing)
    const [callPageVisitors] = await database
      .select({ count: drizzleSql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` })
      .from(analyticsEvents)
      .where(drizzleSql`${analyticsEvents.page} IN ('/', '/call') ${dateCondition}`);

    // Count unique sessions that visited landing page (/) only
    const [landingPageVisitors] = await database
      .select({ count: drizzleSql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` })
      .from(analyticsEvents)
      .where(drizzleSql`${analyticsEvents.page} = '/' ${dateCondition}`);

    // Count unique sessions that clicked video play button
    const [videoViews] = await database
      .select({ count: drizzleSql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` })
      .from(analyticsEvents)
      .where(drizzleSql`${analyticsEvents.eventType} = 'video_play' AND ${analyticsEvents.page} IN ('/', '/call') ${dateCondition}`);

    // Count unique sessions that visited /survey page (all survey visitors)
    const [surveyPageVisitors] = await database
      .select({ count: drizzleSql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` })
      .from(analyticsEvents)
      .where(drizzleSql`${analyticsEvents.page} = '/survey' ${dateCondition}`);

    // Count email submissions from landing page visitors only
    // Use analyticsEvents with 'survey_email_submitted' eventType to find email submissions
    // that are linked to sessions that visited landing page (/)
    const landingDateCondition = startDate && endDate 
      ? drizzleSql`AND ${analyticsEvents.timestamp} >= ${startDate.toISOString()} AND ${analyticsEvents.timestamp} < ${endDate.toISOString()}`
      : drizzleSql``;
    
    // Get all session IDs that visited landing page (/)
    const landingSessionsResult = await database
      .select({ sessionId: analyticsEvents.sessionId })
      .from(analyticsEvents)
      .where(drizzleSql`${analyticsEvents.page} = '/' ${landingDateCondition}`);
    
    // Get unique session IDs
    const landingSessionIds = [...new Set(landingSessionsResult.map(s => s.sessionId))];
    
    // Count email submissions (survey_email_submitted events) from landing page sessions
    let emailSubmissions;
    if (landingSessionIds.length > 0) {
      const emailEventConditions = [
        eq(analyticsEvents.eventType, 'survey_email_submitted'),
        inArray(analyticsEvents.sessionId, landingSessionIds)
      ];
      
      if (startDate && endDate) {
        emailEventConditions.push(
          drizzleSql`${analyticsEvents.timestamp} >= ${startDate.toISOString()} AND ${analyticsEvents.timestamp} < ${endDate.toISOString()}`
        );
      }
      
      const [emailEvents] = await database
        .select({ count: drizzleSql<number>`COUNT(*)` })
        .from(analyticsEvents)
        .where(and(...emailEventConditions));
      
      emailSubmissions = emailEvents;
    } else {
      // No landing visitors, so no email submissions from landing
      emailSubmissions = { count: 0 };
    }

    const callCount = callPageVisitors?.count || 0;
    const landingCount = landingPageVisitors?.count || 0;
    const videoCount = videoViews?.count || 0;
    const surveyCount = surveyPageVisitors?.count || 0;
    const emailCount = emailSubmissions?.count || 0;

    // Calculate conversion rates
    const videoToLandingRate = callCount > 0 ? (videoCount / callCount) * 100 : 0;
    const surveyToLandingRate = landingCount > 0 ? (surveyCount / landingCount) * 100 : 0; // Survey % from landing page (/) visitors
    const emailToSurveyRate = surveyCount > 0 ? (emailCount / surveyCount) * 100 : 0;
    const overallConversionRate = landingCount > 0 ? (emailCount / landingCount) * 100 : 0; // Email % from landing page (/) visitors

    return {
      callPageVisitors: callCount,
      videoViews: videoCount,
      videoToLandingRate: Math.round(videoToLandingRate * 10) / 10,
      surveyPageVisitors: surveyCount,
      surveyToVideoRate: Math.round(surveyToLandingRate * 10) / 10, // Actually surveyToLandingRate, but keeping field name for compatibility
      emailSubmissions: emailCount,
      emailToSurveyRate: Math.round(emailToSurveyRate * 10) / 10,
      overallConversionRate: Math.round(overallConversionRate * 10) / 10,
    };
  }

  async getEventsBySession(sessionId: string): Promise<AnalyticsEvent[]> {
    const database = getDb();
    return await database
      .select()
      .from(analyticsEvents)
      .where(eq(analyticsEvents.sessionId, sessionId))
      .orderBy(desc(analyticsEvents.timestamp));
  }

  async getQuizResponsesBySession(sessionId: string): Promise<QuizResponse[]> {
    const database = getDb();
    return await database
      .select()
      .from(quizResponses)
      .where(eq(quizResponses.sessionId, sessionId))
      .orderBy(quizResponses.step);
  }

  async getAllSessions(): Promise<(AnalyticsSession & { eventCount: number })[]> {
    const database = getDb();
    const sessions = await database
      .select({
        session: analyticsSessions,
        eventCount: drizzleSql<number>`COUNT(${analyticsEvents.id})`
      })
      .from(analyticsSessions)
      .leftJoin(analyticsEvents, eq(analyticsSessions.id, analyticsEvents.sessionId))
      .groupBy(analyticsSessions.id)
      .orderBy(desc(analyticsSessions.lastVisit));

    return sessions.map(s => ({ ...s.session, eventCount: s.eventCount || 0 }));
  }

  async clearAllAnalyticsData(): Promise<void> {
    const database = getDb();
    // Delete in correct order to respect foreign key constraints
    await database.delete(quizResponses);
    await database.delete(analyticsEvents);
    await database.delete(analyticsSessions);
    await database.delete(registrations);
    await database.delete(callFunnelSubmissions);
  }

  async createCallFunnelSubmission(submission: InsertCallFunnelSubmission): Promise<CallFunnelSubmission> {
    try {
    const database = getDb();
      
      // Validate required fields
      if (!submission.email || !submission.email.trim()) {
        throw new Error('Email is required');
      }
      if (typeof submission.leads !== 'number' || submission.leads < 0) {
        throw new Error('Leads must be a non-negative number');
      }
      if (typeof submission.value !== 'number' || submission.value < 0) {
        throw new Error('Value must be a non-negative number');
      }
      if (typeof submission.closeRate !== 'number' || submission.closeRate < 0) {
        throw new Error('Close rate must be a non-negative number');
      }
      if (!submission.speed || typeof submission.speed !== 'string') {
        throw new Error('Speed is required');
      }
      
      console.log('[createCallFunnelSubmission] Inserting submission:', {
        email: submission.email,
        leads: submission.leads,
        value: submission.value,
        closeRate: submission.closeRate,
        speed: submission.speed,
        sessionId: submission.sessionId || null,
        ipAddress: submission.ipAddress || null
      });
      
      const result = await database
      .insert(callFunnelSubmissions)
        .values({
          ...submission,
          email: submission.email.trim() // Ensure email is trimmed
        })
      .returning();
      
      if (!result || result.length === 0) {
        throw new Error('Failed to create submission - no data returned from database');
      }
      
      const created = result[0];
      console.log('[createCallFunnelSubmission] Submission created successfully:', {
        id: created.id,
        email: created.email
      });
      
    return created;
    } catch (error: any) {
      console.error('[createCallFunnelSubmission] Error creating submission:', error);
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('A submission with this email already exists');
      }
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Invalid session ID reference');
      }
      throw new Error(error.message || 'Failed to create submission');
    }
  }

  async getCallFunnelSubmissions(): Promise<(CallFunnelSubmission & { watchedVSL: boolean })[]> {
    try {
    const database = getDb();
      if (!database) {
        console.error('[getCallFunnelSubmissions] Database not available');
        return [];
      }
      
      console.log('[getCallFunnelSubmissions] Starting to fetch submissions...');
      
      // Fetch submissions - this is the critical part, must not fail
      let submissions: CallFunnelSubmission[];
      try {
        submissions = await database
          .select()
          .from(callFunnelSubmissions)
          .orderBy(desc(callFunnelSubmissions.createdAt));
        console.log(`[getCallFunnelSubmissions] Found ${submissions.length} submissions`);
      } catch (error) {
        console.error('[getCallFunnelSubmissions] Error fetching submissions:', error);
        return []; // Return empty array if we can't fetch submissions
      }
      
      // If no submissions, return early
      if (submissions.length === 0) {
        console.log('[getCallFunnelSubmissions] No submissions found, returning empty array');
        return [];
      }
      
      // For each submission, check if there's a video_play event
      // Use Promise.allSettled to handle individual failures gracefully
      // VSL checking is optional - if it fails, we still return the submission with watchedVSL = false
      const submissionsWithVSL = await Promise.allSettled(
        submissions.map(async (sub) => {
          let watchedVSL = false;
          
          // VSL checking is completely optional - wrap in try-catch to never fail
          try {
            if (sub.sessionId) {
              try {
                // Check if this session has a video_play event
                const videoEvents = await database
                  .select({ id: analyticsEvents.id })
                  .from(analyticsEvents)
                  .where(
                    and(
                      eq(analyticsEvents.sessionId, sub.sessionId),
                      eq(analyticsEvents.eventType, 'video_play'),
                      or(eq(analyticsEvents.page, '/'), eq(analyticsEvents.page, '/call'))
                    )
                  )
                  .limit(1);
                
                watchedVSL = videoEvents.length > 0;
              } catch (error) {
                console.error(`[getCallFunnelSubmissions] Error checking VSL by sessionId for ${sub.id}:`, error);
                // Continue with watchedVSL = false
              }
            } else if (sub.ipAddress && sub.ipAddress.trim() !== '') {
              try {
                // If no sessionId, find sessions with this IP and check for video_play events
                const sessionsWithIP = await database
                  .select({ id: analyticsSessions.id })
                  .from(analyticsSessions)
                  .where(eq(analyticsSessions.ipAddress, sub.ipAddress));
                
                const sessionIds = sessionsWithIP.map(s => s.id);
                
                if (sessionIds.length > 0) {
                  const videoEvents = await database
                    .select({ id: analyticsEvents.id })
                    .from(analyticsEvents)
                    .where(
                      and(
                        inArray(analyticsEvents.sessionId, sessionIds),
                        eq(analyticsEvents.eventType, 'video_play'),
                        or(eq(analyticsEvents.page, '/'), eq(analyticsEvents.page, '/call'))
                      )
                    )
                    .limit(1);
                  
                  watchedVSL = videoEvents.length > 0;
                }
              } catch (error) {
                console.error(`[getCallFunnelSubmissions] Error checking VSL by IP for ${sub.id}:`, error);
                // Continue with watchedVSL = false
              }
            }
          } catch (error) {
            console.error(`[getCallFunnelSubmissions] Unexpected error checking VSL for submission ${sub.id}:`, error);
            // Continue with watchedVSL = false
          }
          
          return { ...sub, watchedVSL };
        })
      );
      
      // Filter out rejected promises and extract values
      // Even if VSL checking fails, we still return the submission
      const results = submissionsWithVSL
        .filter((result): result is PromiseFulfilledResult<CallFunnelSubmission & { watchedVSL: boolean }> => result.status === 'fulfilled')
        .map(result => result.value);
      
      // If some promises were rejected, log but still return what we have
      const rejected = submissionsWithVSL.filter(r => r.status === 'rejected');
      if (rejected.length > 0) {
        console.warn(`[getCallFunnelSubmissions] ${rejected.length} submissions failed VSL check, but returning ${results.length} successful ones`);
      }
      
      console.log(`[getCallFunnelSubmissions] Returning ${results.length} submissions with VSL data`);
      return results;
    } catch (error) {
      console.error('[getCallFunnelSubmissions] Fatal error:', error);
      // Return empty array instead of throwing to prevent breaking the analytics page
      return [];
    }
  }

  async deleteRegistration(id: string): Promise<void> {
    const database = getDb();
    // First unlink from sessions to avoid FK constraints and maintain session history
    await database
      .update(analyticsSessions)
      .set({ registrationId: null })
      .where(eq(analyticsSessions.registrationId, id));
      
    await database.delete(registrations).where(eq(registrations.id, id));
  }

  async deleteCallFunnelSubmission(id: string): Promise<void> {
    const database = getDb();
    
    console.log(`[deleteCallFunnelSubmission] Starting deletion for ID: ${id}`);
    
    // First, get the submission to find its sessionId and ipAddress
    const [submission] = await database
      .select({ 
        sessionId: callFunnelSubmissions.sessionId,
        ipAddress: callFunnelSubmissions.ipAddress,
        email: callFunnelSubmissions.email
      })
      .from(callFunnelSubmissions)
      .where(eq(callFunnelSubmissions.id, id));
    
    if (!submission) {
      // Submission not found, nothing to delete
      console.warn(`[deleteCallFunnelSubmission] Submission ${id} not found`);
      return;
    }
    
    console.log(`[deleteCallFunnelSubmission] Found submission:`, {
      id,
      email: submission.email,
      sessionId: submission.sessionId,
      ipAddress: submission.ipAddress
    });
    
    // Delete all call funnel related events for this submission
    // Strategy: Delete ALL events for the session(s) that are related to call funnel
    // This must match getCallFunnelSummary logic exactly:
    // - Landing: page IN ('/', '/call') - counts ALL events with these pages (any eventType)
    // - Video: eventType = 'video_play' AND page IN ('/', '/call')
    // - Survey: page = '/survey' - counts ALL events with this page (any eventType)
    // - Email: eventType = 'survey_email_submitted'
    
    // Build condition for call funnel pages/events
    // We need to delete ALL events on these pages to remove them from statistics
    const callFunnelPagesCondition = or(
      eq(analyticsEvents.page, '/'),
      eq(analyticsEvents.page, '/call'),
      eq(analyticsEvents.page, '/survey')
    );
    
    const emailSubmissionCondition = eq(analyticsEvents.eventType, 'survey_email_submitted');
    
    const callFunnelEventsCondition = or(
      callFunnelPagesCondition,
      emailSubmissionCondition
    );
    
    if (submission.sessionId) {
      // Delete all call funnel related events for this specific session
      // This will remove the session from:
      // - Landing count (page = '/' or '/call')
      // - Survey count (page = '/survey')
      // - Video count (if there was a video_play event on '/' or '/call')
      // - Email count (eventType = 'survey_email_submitted')
      
      // First, count how many events will be deleted
      const eventsToDelete = await database
        .select({ count: drizzleSql<number>`count(*)` })
        .from(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.sessionId, submission.sessionId),
            callFunnelEventsCondition
          )
        );
      
      const eventCount = eventsToDelete[0]?.count || 0;
      console.log(`[deleteCallFunnelSubmission] Found ${eventCount} events to delete for sessionId: ${submission.sessionId}`);
      
      const deleteResult = await database
        .delete(analyticsEvents)
        .where(
          and(
            eq(analyticsEvents.sessionId, submission.sessionId),
            callFunnelEventsCondition
          )
        );
      
      console.log(`[deleteCallFunnelSubmission] Deleted ${eventCount} events for sessionId: ${submission.sessionId}`);
    } else if (submission.ipAddress) {
      // If no sessionId, find all sessions with this IP address
      const sessionsWithIP = await database
        .select({ id: analyticsSessions.id })
        .from(analyticsSessions)
        .where(eq(analyticsSessions.ipAddress, submission.ipAddress));
      
      const sessionIds = sessionsWithIP.map(s => s.id);
      
      if (sessionIds.length > 0) {
        // Delete all call funnel related events for these sessions
        // First, count how many events will be deleted
        const eventsToDelete = await database
          .select({ count: drizzleSql<number>`count(*)` })
          .from(analyticsEvents)
          .where(
            and(
              inArray(analyticsEvents.sessionId, sessionIds),
              callFunnelEventsCondition
            )
          );
        
        const eventCount = eventsToDelete[0]?.count || 0;
        console.log(`[deleteCallFunnelSubmission] Found ${eventCount} events to delete for ${sessionIds.length} sessions with IP: ${submission.ipAddress}`);
        
        const deleteResult = await database
          .delete(analyticsEvents)
          .where(
            and(
              inArray(analyticsEvents.sessionId, sessionIds),
              callFunnelEventsCondition
            )
          );
        
        console.log(`[deleteCallFunnelSubmission] Deleted ${eventCount} events for ${sessionIds.length} sessions with IP: ${submission.ipAddress}`);
      } else {
        console.warn(`[deleteCallFunnelSubmission] No sessions found for IP: ${submission.ipAddress}`);
      }
    } else {
      console.warn(`[deleteCallFunnelSubmission] No sessionId or ipAddress found for submission ${id}`);
    }
    
    // Finally, delete the submission itself
    await database.delete(callFunnelSubmissions).where(eq(callFunnelSubmissions.id, id));
    console.log(`[deleteCallFunnelSubmission] Successfully deleted submission ${id}`);
  }
}

export const storage = new DatabaseStorage();

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
import { eq, desc, sql as drizzleSql } from "drizzle-orm";

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
  getCallFunnelSubmissions(): Promise<CallFunnelSubmission[]>;
  
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

    // Count unique sessions that clicked video play button
    const [videoViews] = await database
      .select({ count: drizzleSql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` })
      .from(analyticsEvents)
      .where(drizzleSql`${analyticsEvents.eventType} = 'video_play' AND ${analyticsEvents.page} IN ('/', '/call') ${dateCondition}`);

    // Count unique sessions that visited /survey page
    const [surveyPageVisitors] = await database
      .select({ count: drizzleSql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` })
      .from(analyticsEvents)
      .where(drizzleSql`${analyticsEvents.page} = '/survey' ${dateCondition}`);

    // Count unique sessions that visited /calldone page (submitted email - last step)
    const [emailSubmissions] = await database
      .select({ count: drizzleSql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` })
      .from(analyticsEvents)
      .where(drizzleSql`${analyticsEvents.page} = '/calldone' ${dateCondition}`);

    const callCount = callPageVisitors?.count || 0;
    const videoCount = videoViews?.count || 0;
    const surveyCount = surveyPageVisitors?.count || 0;
    const emailCount = emailSubmissions?.count || 0;

    // Calculate conversion rates
    const videoToLandingRate = callCount > 0 ? (videoCount / callCount) * 100 : 0;
    const surveyToVideoRate = videoCount > 0 ? (surveyCount / videoCount) * 100 : 0;
    const emailToSurveyRate = surveyCount > 0 ? (emailCount / surveyCount) * 100 : 0;
    const overallConversionRate = callCount > 0 ? (emailCount / callCount) * 100 : 0;

    return {
      callPageVisitors: callCount,
      videoViews: videoCount,
      videoToLandingRate: Math.round(videoToLandingRate * 10) / 10,
      surveyPageVisitors: surveyCount,
      surveyToVideoRate: Math.round(surveyToVideoRate * 10) / 10,
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
    const database = getDb();
    const [created] = await database
      .insert(callFunnelSubmissions)
      .values(submission)
      .returning();
    return created;
  }

  async getCallFunnelSubmissions(): Promise<CallFunnelSubmission[]> {
    const database = getDb();
    return await database.select().from(callFunnelSubmissions).orderBy(desc(callFunnelSubmissions.createdAt));
  }

  async deleteRegistration(id: string): Promise<void> {
    const database = getDb();
    await database.delete(registrations).where(eq(registrations.id, id));
  }

  async deleteCallFunnelSubmission(id: string): Promise<void> {
    const database = getDb();
    await database.delete(callFunnelSubmissions).where(eq(callFunnelSubmissions.id, id));
  }
}

export const storage = new DatabaseStorage();

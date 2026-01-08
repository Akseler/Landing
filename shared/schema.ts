import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const registrations = pgTable("registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  servicesOver1000: boolean("services_over_1000").notNull(),
  budgetOver1000: boolean("budget_over_1000").default(false),
  usesFacebookAds: boolean("uses_facebook_ads").default(false),
  noAdsReason: text("no_ads_reason").default(""),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  qualified: boolean("qualified").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRegistrationSchema = createInsertSchema(registrations).omit({
  id: true,
  createdAt: true,
  qualified: true, // Server computes this
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrations.$inferSelect;

export const analyticsSessions = pgTable("analytics_sessions", {
  id: varchar("id").primaryKey(),
  ipAddress: text("ip_address").notNull(), // Partial IP: xxx.xxx.123.45
  userAgent: text("user_agent"),
  firstVisit: timestamp("first_visit").defaultNow().notNull(),
  lastVisit: timestamp("last_visit").defaultNow().notNull(),
  totalPageViews: integer("total_page_views").default(0).notNull(),
  registrationId: varchar("registration_id").references(() => registrations.id),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => analyticsSessions.id).notNull(),
  eventType: text("event_type").notNull(),
  page: text("page").notNull(),
  buttonId: text("button_id"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const quizResponses = pgTable("quiz_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => analyticsSessions.id).notNull(),
  step: integer("step").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertAnalyticsSessionSchema = createInsertSchema(analyticsSessions).omit({
  firstVisit: true,
  lastVisit: true,
  totalPageViews: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  timestamp: true,
});

export const insertQuizResponseSchema = createInsertSchema(quizResponses).omit({
  id: true,
  timestamp: true,
});

export type InsertAnalyticsSession = z.infer<typeof insertAnalyticsSessionSchema>;
export type AnalyticsSession = typeof analyticsSessions.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertQuizResponse = z.infer<typeof insertQuizResponseSchema>;
export type QuizResponse = typeof quizResponses.$inferSelect;

// Combined type for analytics dashboard
export type RegistrationWithSession = Registration & {
  sessionIp: string | null;
};

// Call funnel submissions (survey -> email)
export const callFunnelSubmissions = pgTable("call_funnel_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  leads: integer("leads").notNull(),
  value: integer("value").notNull(),
  closeRate: integer("close_rate").notNull(),
  speed: text("speed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCallFunnelSubmissionSchema = createInsertSchema(callFunnelSubmissions).omit({
  id: true,
  createdAt: true,
});

export type InsertCallFunnelSubmission = z.infer<typeof insertCallFunnelSubmissionSchema>;
export type CallFunnelSubmission = typeof callFunnelSubmissions.$inferSelect;

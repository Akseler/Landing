CREATE TABLE "analytics_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"page" text NOT NULL,
	"button_id" text,
	"metadata" jsonb,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_sessions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"first_visit" timestamp DEFAULT now() NOT NULL,
	"last_visit" timestamp DEFAULT now() NOT NULL,
	"total_page_views" integer DEFAULT 0 NOT NULL,
	"registration_id" varchar
);
--> statement-breakpoint
CREATE TABLE "call_funnel_submissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"leads" integer NOT NULL,
	"value" integer NOT NULL,
	"close_rate" integer NOT NULL,
	"speed" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"step" integer NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"services_over_1000" boolean NOT NULL,
	"budget_over_1000" boolean DEFAULT false,
	"uses_facebook_ads" boolean DEFAULT false,
	"no_ads_reason" text DEFAULT '',
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"qualified" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_session_id_analytics_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."analytics_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_sessions" ADD CONSTRAINT "analytics_sessions_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_responses" ADD CONSTRAINT "quiz_responses_session_id_analytics_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."analytics_sessions"("id") ON DELETE no action ON UPDATE no action;
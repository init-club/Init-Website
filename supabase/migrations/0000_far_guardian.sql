CREATE TYPE "public"."blog_status" AS ENUM('pending', 'published', 'rejected');--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text,
	CONSTRAINT "attendance_records_session_id_user_id_pk" PRIMARY KEY("session_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "attendance_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"session_date" date,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"performed_by_id" uuid,
	"action_type" text NOT NULL,
	"target_id" text,
	"old_value" jsonb,
	"new_value" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"table_name" text,
	"old_data" jsonb,
	"new_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"author_id" uuid,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp with time zone,
	"roll_no" text,
	"phone_number" text,
	"tags" text[],
	"author_name" text,
	"status" "blog_status" DEFAULT 'pending',
	"cover_image_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contribution_stats" (
	"user_id" uuid NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"commit_count" integer DEFAULT 0,
	"pr_count" integer DEFAULT 0,
	"score" integer DEFAULT 0,
	"last_updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "contribution_stats_user_id_month_year_pk" PRIMARY KEY("user_id","month","year")
);
--> statement-breakpoint
CREATE TABLE "pull_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"github_pr_id" bigint NOT NULL,
	"repo_id" bigint,
	"author_id" uuid,
	"title" text,
	"state" text,
	"merged_at" timestamp with time zone,
	"created_at" timestamp with time zone,
	CONSTRAINT "pull_requests_github_pr_id_unique" UNIQUE("github_pr_id")
);
--> statement-breakpoint
CREATE TABLE "repositories" (
	"id" bigint PRIMARY KEY NOT NULL,
	"github_repo_id" bigint NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"html_url" text NOT NULL,
	"is_archived" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"stars" integer DEFAULT 0,
	"forks" integer DEFAULT 0,
	"pushed_at" timestamp with time zone,
	"last_synced_at" timestamp with time zone,
	"archival_reason" text,
	"is_revivable" boolean DEFAULT true,
	"topics" jsonb,
	"difficulty" text,
	"project_status" text,
	"video_url" text,
	"homepage" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid,
	"github_id" bigint NOT NULL,
	"username" text NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"bio" text,
	"role" text DEFAULT 'member',
	"is_core_member" boolean DEFAULT false,
	"team_name" text,
	"is_team_leader" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"profile_completed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"last_seen_at" timestamp with time zone,
	"linkedin_url" text,
	"instagram_url" text,
	"github_url" text,
	"roll_no" text,
	"custom_title" text,
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_session_id_attendance_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."attendance_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performed_by_id_users_id_fk" FOREIGN KEY ("performed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contribution_stats" ADD CONSTRAINT "contribution_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_repo_id_repositories_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pull_requests" ADD CONSTRAINT "pull_requests_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
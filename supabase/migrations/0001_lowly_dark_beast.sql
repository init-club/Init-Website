-- 1. Create forms table
CREATE TABLE IF NOT EXISTS "public"."forms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "status" text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  "fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_by" uuid,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "forms_slug_unique" UNIQUE("slug")
);

-- 2. Create form_responses table
CREATE TABLE IF NOT EXISTS "public"."form_responses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "form_id" uuid NOT NULL,
  "answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "respondent" jsonb DEFAULT '{}'::jsonb,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "submitted_at" timestamp with time zone DEFAULT now()
);

-- 3. Add foreign key constraints and indexes
ALTER TABLE "public"."forms" 
  ADD CONSTRAINT "forms_created_by_users_id_fk" 
  FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;

ALTER TABLE "public"."form_responses" 
  ADD CONSTRAINT "form_responses_form_id_forms_id_fk" 
  FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "idx_form_responses_form_id" ON "public"."form_responses" ("form_id");
CREATE INDEX IF NOT EXISTS "idx_form_responses_submitted_at" ON "public"."form_responses" ("submitted_at" DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE "public"."forms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."form_responses" ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for forms
DROP POLICY IF EXISTS "Public read published forms" ON "public"."forms";
CREATE POLICY "Public read published forms"
  ON "public"."forms" FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Admin full access on forms" ON "public"."forms";
CREATE POLICY "Admin full access on forms"
  ON "public"."forms" FOR ALL
  USING (public.is_admin());

-- 6. RLS Policies for form_responses
DROP POLICY IF EXISTS "Public insert to published forms" ON "public"."form_responses";
CREATE POLICY "Public insert to published forms"
  ON "public"."form_responses" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms 
      WHERE forms.id = form_responses.form_id AND forms.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Admin read all responses" ON "public"."form_responses";
CREATE POLICY "Admin read all responses"
  ON "public"."form_responses" FOR SELECT
  USING (public.is_admin());
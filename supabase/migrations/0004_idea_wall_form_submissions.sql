-- Approved Project Creation form submissions shown on the public Idea Wall.
CREATE TABLE IF NOT EXISTS public.idea_wall_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  response_id uuid NOT NULL UNIQUE
    REFERENCES public.form_responses(id) ON DELETE CASCADE,

  full_name text NOT NULL,
  repository_name text NOT NULL,
  repository_link text NOT NULL,
  repository_description text,
  phone_number text,

  is_visible boolean NOT NULL DEFAULT false,

  approved_at timestamptz,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_idea_wall_entries_visible
  ON public.idea_wall_entries (is_visible, approved_at DESC);

ALTER TABLE public.idea_wall_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read visible idea wall entries"
  ON public.idea_wall_entries;

CREATE POLICY "Public read visible idea wall entries"
  ON public.idea_wall_entries
  FOR SELECT
  USING (is_visible = true);

DROP POLICY IF EXISTS "Admin manage idea wall entries"
  ON public.idea_wall_entries;

CREATE POLICY "Admin manage idea wall entries"
  ON public.idea_wall_entries
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
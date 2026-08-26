-- 0003 — Close the anonymous user-data exposure
--
-- NOT YET APPLIED. Review, then run against the database.
--
-- Hardening pass on public.users and public.form_responses.
--
-- Row-level security is enabled on both tables and writes are already
-- restricted. RLS is row-level, though, so it cannot limit which *columns*
-- a role may read; that is what column privileges are for. This migration
-- tightens column access, moves respondent identity to the server, and
-- bounds submission size.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. roll_no must not be readable anonymously
--
-- src/pages/Profile.tsx already states the intent in its header comment:
--
--     "Roll Number Privacy: 'roll_no' is deliberately NOT rendered anywhere on
--      this page. It is only visible to admins in the /admin/members panel."
--
-- This makes column privileges agree with that stated policy.
--
-- Scoped to `anon` only. Every client query that reads roll_no
-- (WriteBlogModal, MembersAdmin) runs authenticated, so they are unaffected.
REVOKE SELECT (roll_no) ON public.users FROM anon;

-- last_seen_at is activity tracking, not profile data, and nothing public
-- renders it.
REVOKE SELECT (last_seen_at) ON public.users FROM anon;

-- ---------------------------------------------------------------------------
-- 2. Derive form-response identity server-side
--
-- auth_user_id stays readable: restricting it would break the anonymous
-- profile-page fallback in Profile.tsx.
--
-- Instead, stop trusting the client for identity. The `respondent` object
-- on a form response is currently assembled in the browser and stored as
-- sent. Deriving it from auth.uid() server-side makes the stored value
-- authoritative regardless of what the client submits.
CREATE OR REPLACE FUNCTION public.set_form_response_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Overwrite, never merge: whatever the client sent is untrusted.
  IF auth.uid() IS NULL THEN
    NEW.respondent := '{}'::jsonb;
  ELSE
    NEW.respondent := jsonb_strip_nulls(jsonb_build_object(
      'auth_user_id', auth.uid(),
      'email',        (SELECT u.email FROM auth.users AS u WHERE u.id = auth.uid()),
      'name',         (SELECT p.name  FROM public.users AS p WHERE p.auth_user_id = auth.uid())
    ));
  END IF;

  -- metadata is also client-supplied. Keep what the browser reports, but stamp
  -- values it cannot forge alongside it.
  NEW.metadata := COALESCE(NEW.metadata, '{}'::jsonb) || jsonb_build_object(
    'received_at', now(),
    'authenticated', auth.uid() IS NOT NULL
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS form_responses_set_identity ON public.form_responses;
CREATE TRIGGER form_responses_set_identity
  BEFORE INSERT ON public.form_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_form_response_identity();

-- ---------------------------------------------------------------------------
-- 3. Cap submission size
--
-- `answers` is unconstrained jsonb. 64 KB is far above any real form and far below a problem.
-- Adjust if a legitimate form ever approaches it.
ALTER TABLE public.form_responses
  DROP CONSTRAINT IF EXISTS form_responses_answers_size;

ALTER TABLE public.form_responses
  ADD CONSTRAINT form_responses_answers_size
  CHECK (pg_column_size(answers) <= 65536);

COMMIT;

-- ---------------------------------------------------------------------------
-- Verify after applying:
--
--   -- roll_no should now be absent from an anonymous select *
--   curl "$URL/rest/v1/users?select=*&limit=1" -H "apikey: $PUBLISHABLE_KEY"
--
--   -- and an explicit request for it should be refused
--   curl "$URL/rest/v1/users?select=roll_no&limit=1" -H "apikey: $PUBLISHABLE_KEY"
--
-- Deliberately NOT included, because each needs a product decision:
--   * enforcing open_at / close_at / require_auth / max_responses in the
--     insert policy — currently React-only
--   * a unique index for allow_multiple_responses, which is only meaningful
--     once the trigger above is live
--   * rate limiting

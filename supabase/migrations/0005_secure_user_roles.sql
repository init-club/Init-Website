-- 0005 — Prevent member self-promotion to admin

BEGIN;

REVOKE UPDATE (
  auth_user_id,
  github_id,
  username,
  avatar_url,
  role,
  is_core_member,
  team_name,
  is_team_leader,
  is_active,
  created_at,
  last_seen_at,
  custom_title
)
ON public.users
FROM authenticated;

REVOKE UPDATE (
  auth_user_id,
  github_id,
  username,
  avatar_url,
  role,
  is_core_member,
  team_name,
  is_team_leader,
  is_active,
  created_at,
  last_seen_at,
  custom_title
)
ON public.users
FROM anon;


CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_admin_id uuid;
  admin_profile_id uuid;
  old_role text;
  updated_user public.users;
BEGIN
  current_admin_id := auth.uid();

  IF current_admin_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '42501';
  END IF;

  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can change user roles'
      USING ERRCODE = '42501';
  END IF;

  IF lower(trim(new_role)) NOT IN ('member', 'admin') THEN
    RAISE EXCEPTION 'Invalid role. Allowed roles are member and admin'
      USING ERRCODE = '22023';
  END IF;

  SELECT
    id,
    role
  INTO
    admin_profile_id,
    old_role
  FROM public.users
  WHERE id = target_user_id;

  IF admin_profile_id IS NULL THEN
    RAISE EXCEPTION 'Target user not found'
      USING ERRCODE = 'P0002';
  END IF;

  -- Resolve the caller's own users.id.
  SELECT id
  INTO admin_profile_id
  FROM public.users
  WHERE auth_user_id = current_admin_id
  LIMIT 1;

  -- Prevent self-demotion.
  IF target_user_id = admin_profile_id
     AND lower(trim(new_role)) <> 'admin' THEN
    RAISE EXCEPTION 'Administrators cannot remove their own admin role'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.users
  SET role = lower(trim(new_role))
  WHERE id = target_user_id
  RETURNING *
  INTO updated_user;

  INSERT INTO public.audit_logs (
    performed_by_id,
    action_type,
    table_name,
    target_id,
    old_value,
    new_value
  )
  VALUES (
    admin_profile_id,
    'UPDATE_USER_ROLE',
    'users',
    target_user_id::text,
    jsonb_build_object(
      'role',
      old_role
    ),
    jsonb_build_object(
      'role',
      updated_user.role
    )
  );

  RETURN updated_user;
END;
$$;

REVOKE ALL
ON FUNCTION public.admin_update_user_role(uuid, text)
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.admin_update_user_role(uuid, text)
TO authenticated;

COMMIT;
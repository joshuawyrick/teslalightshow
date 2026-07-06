/*
# Fix mutable search_path on admin role functions

## Security Changes
- Set search_path to '' on sync_admin_role_flag() to prevent search path manipulation
- Set search_path to '' on set_admin_role() to prevent search path manipulation
- Both functions now use schema-qualified references internally
*/

CREATE OR REPLACE FUNCTION public.sync_admin_role_flag()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.is_admin := (NEW.admin_role IS NOT NULL);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_admin_role(
  p_admin_uid uuid,
  p_target_email text,
  p_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_admin_role text;
  v_target_id uuid;
  v_target_current_role text;
BEGIN
  SELECT admin_role INTO v_admin_role FROM public.profiles WHERE id = p_admin_uid;
  IF v_admin_role IS DISTINCT FROM 'owner' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only the owner can manage admin roles');
  END IF;

  IF p_role IS NOT NULL AND p_role NOT IN ('owner', 'editor', 'viewer') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid role. Must be owner, editor, viewer, or null to revoke.');
  END IF;

  SELECT id, admin_role INTO v_target_id, v_target_current_role
  FROM public.profiles WHERE email = p_target_email;

  IF v_target_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found with that email');
  END IF;

  IF v_target_id = p_admin_uid AND (p_role IS NULL OR p_role != 'owner') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot demote yourself from owner');
  END IF;

  UPDATE public.profiles SET admin_role = p_role WHERE id = v_target_id;

  RETURN jsonb_build_object(
    'success', true,
    'target_email', p_target_email,
    'new_role', COALESCE(p_role, 'none'),
    'previous_role', COALESCE(v_target_current_role, 'none')
  );
END;
$$;

REVOKE ALL ON FUNCTION public.set_admin_role(uuid, text, text) FROM public;
REVOKE ALL ON FUNCTION public.set_admin_role(uuid, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.set_admin_role(uuid, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.set_admin_role(uuid, text, text) TO service_role;

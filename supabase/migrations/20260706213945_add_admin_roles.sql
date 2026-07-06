/*
# Add Admin Role System

## Summary
Adds a tiered admin role system (owner, editor, viewer) to replace the simple boolean is_admin flag.
The owner can manage other admins, editors can make changes, viewers are read-only.

## Modified Tables
- `profiles`
  - Added `admin_role` column (text, nullable) with CHECK constraint for allowed values: 'owner', 'editor', 'viewer'
  - The existing `is_admin` boolean is kept in sync via trigger (is_admin = admin_role IS NOT NULL)

## New Functions
- `sync_admin_role_flag()` — trigger function that keeps is_admin in sync with admin_role
- `set_admin_role(p_admin_uid uuid, p_target_email text, p_role text)` — SECURITY DEFINER function
  that only the owner can call to promote/demote/revoke admin access for other users

## Security
- Only users with admin_role = 'owner' can call set_admin_role
- The function validates the role value and prevents self-demotion
- RLS is unchanged (profiles already has RLS enabled)
*/

-- Add admin_role column
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'admin_role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN admin_role text DEFAULT NULL;
    ALTER TABLE profiles ADD CONSTRAINT profiles_admin_role_check
      CHECK (admin_role IS NULL OR admin_role IN ('owner', 'editor', 'viewer'));
  END IF;
END $$;

-- Trigger to keep is_admin in sync with admin_role
CREATE OR REPLACE FUNCTION sync_admin_role_flag()
RETURNS TRIGGER AS $$
BEGIN
  NEW.is_admin := (NEW.admin_role IS NOT NULL);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_admin_role ON profiles;
CREATE TRIGGER trg_sync_admin_role
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_admin_role_flag();

-- Backfill: any existing is_admin=true rows get 'owner' if they don't already have a role
UPDATE profiles SET admin_role = 'owner' WHERE is_admin = true AND admin_role IS NULL;

-- Function: set_admin_role (owner-only)
CREATE OR REPLACE FUNCTION set_admin_role(
  p_admin_uid uuid,
  p_target_email text,
  p_role text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_role text;
  v_target_id uuid;
  v_target_current_role text;
BEGIN
  -- Verify caller is owner
  SELECT admin_role INTO v_admin_role FROM profiles WHERE id = p_admin_uid;
  IF v_admin_role IS DISTINCT FROM 'owner' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only the owner can manage admin roles');
  END IF;

  -- Validate role value
  IF p_role IS NOT NULL AND p_role NOT IN ('owner', 'editor', 'viewer') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid role. Must be owner, editor, viewer, or null to revoke.');
  END IF;

  -- Find target user
  SELECT id, admin_role INTO v_target_id, v_target_current_role
  FROM profiles WHERE email = p_target_email;

  IF v_target_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found with that email');
  END IF;

  -- Prevent self-demotion
  IF v_target_id = p_admin_uid AND (p_role IS NULL OR p_role != 'owner') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot demote yourself from owner');
  END IF;

  -- Apply role change
  UPDATE profiles SET admin_role = p_role WHERE id = v_target_id;

  RETURN jsonb_build_object(
    'success', true,
    'target_email', p_target_email,
    'new_role', COALESCE(p_role, 'none'),
    'previous_role', COALESCE(v_target_current_role, 'none')
  );
END;
$$;

-- Grant execute to service_role only
REVOKE ALL ON FUNCTION set_admin_role(uuid, text, text) FROM public;
REVOKE ALL ON FUNCTION set_admin_role(uuid, text, text) FROM anon;
REVOKE ALL ON FUNCTION set_admin_role(uuid, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION set_admin_role(uuid, text, text) TO service_role;

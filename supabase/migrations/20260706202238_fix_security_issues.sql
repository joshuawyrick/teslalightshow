/*
# Security Hardening

## Summary
Fixes multiple security vulnerabilities flagged by Supabase security advisor.

## Changes

### 1. Immutable search_path on all functions
All SECURITY DEFINER functions now set `search_path = ''` to prevent
search-path hijacking attacks where a malicious schema could shadow
standard objects.

### 2. Revoke EXECUTE from anon and authenticated on SECURITY DEFINER functions
All 6 functions are called exclusively by:
- Triggers (handle_new_user — fired by auth.users INSERT)
- Edge functions using the service_role key (spend_credit, refund_credit,
  use_snippet, add_credits_for_session, admin_grant_credits)

The service_role bypasses these grants, so revoking from anon/authenticated
prevents direct PostgREST exploitation via /rest/v1/rpc/... while keeping
edge functions and triggers working.

### 3. Drop overly broad gallery storage SELECT policy
The `public_read_gallery_storage` SELECT policy on storage.objects allowed
anon/authenticated to list ALL files in the gallery bucket. Public buckets
already serve objects by direct URL without needing a SELECT policy, so this
just exposed the file listing unnecessarily.

## Security Impact
- Prevents privilege escalation via search_path manipulation
- Blocks direct RPC calls to sensitive functions from client-side code
- Removes unnecessary file-listing exposure on the gallery bucket
*/

-- ============================================================
-- 1. SET search_path = '' on all SECURITY DEFINER functions
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits, snippet_used, is_admin)
  VALUES (NEW.id, COALESCE(NEW.email, ''), 0, false, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.spend_credit(uid uuid)
RETURNS boolean AS $$
DECLARE
  rows_updated integer;
BEGIN
  UPDATE public.profiles SET credits = credits - 1
  WHERE id = uid AND credits > 0;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.refund_credit(uid uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles SET credits = credits + 1 WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.use_snippet(uid uuid)
RETURNS boolean AS $$
DECLARE
  rows_updated integer;
BEGIN
  UPDATE public.profiles SET snippet_used = true
  WHERE id = uid AND snippet_used = false;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.add_credits_for_session(
  p_user_id uuid,
  p_session_id text,
  p_package_name text,
  p_credits integer,
  p_amount_cents integer
)
RETURNS boolean AS $$
DECLARE
  rows_inserted integer;
BEGIN
  INSERT INTO public.purchases (user_id, stripe_session_id, package_name, credits_purchased, amount_cents)
  VALUES (p_user_id, p_session_id, p_package_name, p_credits, p_amount_cents)
  ON CONFLICT (stripe_session_id) DO NOTHING;
  GET DIAGNOSTICS rows_inserted = ROW_COUNT;
  IF rows_inserted > 0 THEN
    UPDATE public.profiles SET credits = credits + p_credits WHERE id = p_user_id;
    RETURN true;
  END IF;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.admin_grant_credits(
  p_admin_uid uuid,
  p_recipient_email text,
  p_credits integer,
  p_note text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_recipient_id uuid;
  v_recipient_email text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_admin_uid AND is_admin = true) THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  SELECT id, email INTO v_recipient_id, v_recipient_email
  FROM public.profiles WHERE email = p_recipient_email LIMIT 1;

  IF v_recipient_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  UPDATE public.profiles SET credits = credits + p_credits WHERE id = v_recipient_id;

  INSERT INTO public.credit_grants (admin_user_id, recipient_user_id, credits_granted, note)
  VALUES (p_admin_uid, v_recipient_id, p_credits, p_note);

  RETURN json_build_object('success', true, 'recipient_email', v_recipient_email, 'credits', p_credits);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================
-- 2. REVOKE EXECUTE from anon and authenticated on all functions
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.spend_credit(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refund_credit(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.use_snippet(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_credits_for_session(uuid, text, text, integer, integer) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_grant_credits(uuid, text, integer, text) FROM anon, authenticated;

-- ============================================================
-- 3. DROP overly broad gallery storage SELECT policy
--    Public buckets serve objects by URL without needing this.
-- ============================================================

DROP POLICY IF EXISTS "public_read_gallery_storage" ON storage.objects;
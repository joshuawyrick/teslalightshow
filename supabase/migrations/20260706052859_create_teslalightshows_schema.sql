/*
# TeslaLightShows.com — Full Schema

## Summary
Creates all tables, RLS policies, storage buckets, triggers, and helper functions
needed to run TeslaLightShows.com as a paid SaaS.

## New Tables
- `profiles` — one row per auth user; tracks credits, snippet usage, and admin flag
- `purchases` — one row per completed Stripe Checkout; idempotent on stripe_session_id
- `downloads` — every generated .fseq stored in Supabase Storage
- `gallery_videos` — user-uploaded showcase videos
- `credit_grants` — admin-issued credit grants separate from paid purchases

## Storage Buckets
- `downloads` (private) — .fseq files keyed by user_id/download_id.fseq
- `gallery` (public) — video files keyed by user_id/video_id.ext

## Security
- RLS enabled on all tables
- Users can SELECT their own profile/purchases/downloads only
- Credits, snippet_used, and is_admin are mutated only via SECURITY DEFINER functions
- gallery_videos are publicly readable; owners + admins can delete
- Storage policies restrict uploads/downloads to the owning user

## Helper Functions
- handle_new_user() — trigger, auto-creates profile on signup
- spend_credit(uuid) — atomically decrements credits by 1, returns true on success
- refund_credit(uuid) — increments credits by 1 (rollback on failed upload)
- use_snippet(uuid) — atomically marks snippet_used=true, returns true on first call only
- add_credits_for_session(...) — idempotent credit top-up keyed on stripe_session_id
- admin_grant_credits(admin_uid, recipient_email, amount, note) — admin credit grant
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  credits integer NOT NULL DEFAULT 0,
  snippet_used boolean NOT NULL DEFAULT false,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

-- ============================================================
-- PURCHASES
-- ============================================================
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id text UNIQUE NOT NULL,
  package_name text NOT NULL,
  credits_purchased integer NOT NULL,
  amount_cents integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_purchases" ON purchases;
CREATE POLICY "select_own_purchases" ON purchases FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- DOWNLOADS
-- ============================================================
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_name text NOT NULL,
  rendition_id text NOT NULL,
  rendition_name text NOT NULL,
  vehicle_model text NOT NULL,
  storage_path text NOT NULL,
  is_snippet boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_downloads" ON downloads;
CREATE POLICY "select_own_downloads" ON downloads FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- GALLERY VIDEOS
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_gallery_videos" ON gallery_videos;
CREATE POLICY "public_read_gallery_videos" ON gallery_videos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_gallery_videos" ON gallery_videos;
CREATE POLICY "insert_own_gallery_videos" ON gallery_videos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_or_admin_gallery_videos" ON gallery_videos;
CREATE POLICY "delete_own_or_admin_gallery_videos" ON gallery_videos FOR DELETE
  TO authenticated USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================
-- CREDIT GRANTS (admin-issued, separate from purchases)
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL REFERENCES auth.users(id),
  recipient_user_id uuid NOT NULL REFERENCES auth.users(id),
  credits_granted integer NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE credit_grants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_read_grants" ON credit_grants;
CREATE POLICY "admin_read_grants" ON credit_grants FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_videos_created_at ON gallery_videos(created_at DESC);

-- ============================================================
-- AUTO-CREATE PROFILE TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits, snippet_used, is_admin)
  VALUES (NEW.id, COALESCE(NEW.email, ''), 0, false, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ATOMIC CREDIT FUNCTIONS
-- ============================================================

-- Spend 1 credit atomically; returns true on success, false if 0 credits
CREATE OR REPLACE FUNCTION public.spend_credit(uid uuid)
RETURNS boolean AS $$
DECLARE
  rows_updated integer;
BEGIN
  UPDATE profiles SET credits = credits - 1
  WHERE id = uid AND credits > 0;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refund 1 credit (called on storage/insert failure after spend_credit succeeded)
CREATE OR REPLACE FUNCTION public.refund_credit(uid uuid)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET credits = credits + 1 WHERE id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark snippet_used=true; returns true on first call, false if already used
CREATE OR REPLACE FUNCTION public.use_snippet(uid uuid)
RETURNS boolean AS $$
DECLARE
  rows_updated integer;
BEGIN
  UPDATE profiles SET snippet_used = true
  WHERE id = uid AND snippet_used = false;
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Idempotent credit top-up via Stripe session; returns true only if this session was new
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
  INSERT INTO purchases (user_id, stripe_session_id, package_name, credits_purchased, amount_cents)
  VALUES (p_user_id, p_session_id, p_package_name, p_credits, p_amount_cents)
  ON CONFLICT (stripe_session_id) DO NOTHING;
  GET DIAGNOSTICS rows_inserted = ROW_COUNT;
  IF rows_inserted > 0 THEN
    UPDATE profiles SET credits = credits + p_credits WHERE id = p_user_id;
    RETURN true;
  END IF;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin grant credits (records in credit_grants, adds to profile)
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
  -- Verify caller is admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_admin_uid AND is_admin = true) THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  -- Find recipient by email
  SELECT id, email INTO v_recipient_id, v_recipient_email
  FROM profiles WHERE email = p_recipient_email LIMIT 1;

  IF v_recipient_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Grant credits
  UPDATE profiles SET credits = credits + p_credits WHERE id = v_recipient_id;

  -- Record grant
  INSERT INTO credit_grants (admin_user_id, recipient_user_id, credits_granted, note)
  VALUES (p_admin_uid, v_recipient_id, p_credits, p_note);

  RETURN json_build_object('success', true, 'recipient_email', v_recipient_email, 'credits', p_credits);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('downloads', 'downloads', false, 209715200, ARRAY['application/octet-stream']),
  ('gallery',   'gallery',   true,  104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: downloads bucket (private, owner-only)
DROP POLICY IF EXISTS "owner_read_downloads" ON storage.objects;
CREATE POLICY "owner_read_downloads" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'downloads' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "owner_upload_downloads" ON storage.objects;
CREATE POLICY "owner_upload_downloads" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'downloads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: gallery bucket (public read, owner upload, owner+admin delete)
DROP POLICY IF EXISTS "public_read_gallery_storage" ON storage.objects;
CREATE POLICY "public_read_gallery_storage" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "owner_upload_gallery_storage" ON storage.objects;
CREATE POLICY "owner_upload_gallery_storage" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "owner_or_admin_delete_gallery_storage" ON storage.objects;
CREATE POLICY "owner_or_admin_delete_gallery_storage" ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'gallery' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    )
  );

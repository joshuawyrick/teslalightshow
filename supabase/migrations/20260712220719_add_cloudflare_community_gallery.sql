
/*
  Community Gallery: Cloudflare Stream Integration
  Extends gallery_videos for multi-source support, adds moderation/likes/views/reports tables.
  Preserves existing YouTube and Supabase Storage entries.
*/

-- ============================================================
-- 1. ADD NEW COLUMNS TO gallery_videos
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='gallery_videos' AND column_name='source_type') THEN
    ALTER TABLE gallery_videos
      ADD COLUMN source_type text,
      ADD COLUMN cloudflare_video_uid text,
      ADD COLUMN slug text,
      ADD COLUMN song_title text,
      ADD COLUMN artist_name text,
      ADD COLUMN vehicle_model text,
      ADD COLUMN occasion text,
      ADD COLUMN genre text,
      ADD COLUMN story text,
      ADD COLUMN thumbnail_url text,
      ADD COLUMN duration_seconds numeric,
      ADD COLUMN input_width integer,
      ADD COLUMN input_height integer,
      ADD COLUMN upload_status text NOT NULL DEFAULT 'ready',
      ADD COLUMN moderation_status text NOT NULL DEFAULT 'approved',
      ADD COLUMN is_public boolean NOT NULL DEFAULT true,
      ADD COLUMN featured boolean NOT NULL DEFAULT false,
      ADD COLUMN view_count bigint NOT NULL DEFAULT 0,
      ADD COLUMN like_count bigint NOT NULL DEFAULT 0,
      ADD COLUMN approved_at timestamptz,
      ADD COLUMN approved_by uuid,
      ADD COLUMN rejected_at timestamptz,
      ADD COLUMN rejection_reason text,
      ADD COLUMN processing_error_code text,
      ADD COLUMN processing_error_message text,
      ADD COLUMN copyright_attested_at timestamptz,
      ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- ============================================================
-- 2. BACKFILL EXISTING ROWS
-- ============================================================

UPDATE gallery_videos
SET source_type = CASE
  WHEN youtube_id IS NOT NULL THEN 'youtube'
  WHEN storage_path IS NOT NULL THEN 'supabase_storage'
  ELSE 'youtube'
END
WHERE source_type IS NULL;

UPDATE gallery_videos
SET upload_status = 'ready',
    moderation_status = 'approved',
    is_public = true,
    updated_at = now()
WHERE upload_status = 'ready' AND moderation_status = 'approved';

-- Generate slug for existing rows
UPDATE gallery_videos
SET slug = LOWER(
  TRIM(BOTH '-' FROM
    regexp_replace(
      regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'),
      '-+', '-', 'g'
    )
  )
) || '-' || LEFT(id::text, 8)
WHERE slug IS NULL AND title IS NOT NULL;

-- Make source_type NOT NULL now that backfill is complete
ALTER TABLE gallery_videos ALTER COLUMN source_type SET NOT NULL;

-- ============================================================
-- 3. DROP OLD CONSTRAINT, ADD NEW CONSTRAINTS
-- ============================================================

ALTER TABLE gallery_videos DROP CONSTRAINT IF EXISTS gallery_videos_source_check;

-- Source type enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_videos_source_type_check') THEN
    ALTER TABLE gallery_videos ADD CONSTRAINT gallery_videos_source_type_check
      CHECK (source_type IN ('youtube', 'supabase_storage', 'cloudflare_stream'));
  END IF;
END $$;

-- Upload status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_videos_upload_status_check') THEN
    ALTER TABLE gallery_videos ADD CONSTRAINT gallery_videos_upload_status_check
      CHECK (upload_status IN ('pending_upload', 'uploading', 'processing', 'ready', 'error', 'cancelled'));
  END IF;
END $$;

-- Moderation status enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_videos_moderation_status_check') THEN
    ALTER TABLE gallery_videos ADD CONSTRAINT gallery_videos_moderation_status_check
      CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'removed'));
  END IF;
END $$;

-- Source validity: UID required only for uploading/processing/ready states
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gallery_videos_source_valid_check') THEN
    ALTER TABLE gallery_videos ADD CONSTRAINT gallery_videos_source_valid_check
      CHECK (
        CASE source_type
          WHEN 'youtube' THEN youtube_id IS NOT NULL
          WHEN 'supabase_storage' THEN storage_path IS NOT NULL
          WHEN 'cloudflare_stream' THEN
            CASE
              WHEN upload_status IN ('uploading', 'processing', 'ready') THEN cloudflare_video_uid IS NOT NULL
              ELSE true
            END
          ELSE false
        END
      );
  END IF;
END $$;

-- ============================================================
-- 4. INDEXES
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_videos_slug
  ON gallery_videos(slug) WHERE slug IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_videos_cf_uid
  ON gallery_videos(cloudflare_video_uid) WHERE cloudflare_video_uid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gallery_videos_public_feed
  ON gallery_videos(moderation_status, is_public, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gallery_videos_user
  ON gallery_videos(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gallery_videos_occasion
  ON gallery_videos(occasion) WHERE occasion IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gallery_videos_vehicle
  ON gallery_videos(vehicle_model) WHERE vehicle_model IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gallery_videos_genre
  ON gallery_videos(genre) WHERE genre IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gallery_videos_featured
  ON gallery_videos(featured, created_at DESC) WHERE featured = true;

-- ============================================================
-- 5. UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_gallery_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gallery_videos_updated_at ON gallery_videos;
CREATE TRIGGER trg_gallery_videos_updated_at
  BEFORE UPDATE ON gallery_videos
  FOR EACH ROW EXECUTE FUNCTION public.set_gallery_updated_at();

-- ============================================================
-- 6. RLS POLICY REPLACEMENT
-- ============================================================

DROP POLICY IF EXISTS "public_read_gallery_videos" ON gallery_videos;
DROP POLICY IF EXISTS "insert_own_gallery_videos" ON gallery_videos;
DROP POLICY IF EXISTS "delete_own_or_admin_gallery_videos" ON gallery_videos;

-- Public select: approved + public + ready only
CREATE POLICY "gallery_public_select" ON gallery_videos FOR SELECT
  TO anon, authenticated
  USING (
    moderation_status = 'approved' AND is_public = true AND upload_status = 'ready'
  );

-- Owner select: own rows regardless of status
CREATE POLICY "gallery_owner_select" ON gallery_videos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin select: all rows
CREATE POLICY "gallery_admin_select" ON gallery_videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ============================================================
-- 7. REVOKE MUTATION PRIVILEGES
-- ============================================================

REVOKE INSERT ON gallery_videos FROM anon;
REVOKE INSERT ON gallery_videos FROM authenticated;
REVOKE INSERT ON gallery_videos FROM PUBLIC;
REVOKE UPDATE ON gallery_videos FROM anon;
REVOKE UPDATE ON gallery_videos FROM authenticated;
REVOKE UPDATE ON gallery_videos FROM PUBLIC;
REVOKE DELETE ON gallery_videos FROM anon;
REVOKE DELETE ON gallery_videos FROM authenticated;
REVOKE DELETE ON gallery_videos FROM PUBLIC;

-- ============================================================
-- 8. ATOMIC SUBMISSION RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_gallery_submission(
  p_user_id uuid,
  p_title text,
  p_vehicle_model text,
  p_occasion text DEFAULT NULL,
  p_song_title text DEFAULT NULL,
  p_artist_name text DEFAULT NULL,
  p_genre text DEFAULT NULL,
  p_story text DEFAULT NULL,
  p_rights_attested boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_utc_day date;
  v_daily_count integer;
  v_new_id uuid;
BEGIN
  IF NOT p_rights_attested THEN
    RETURN json_build_object('success', false, 'error', 'Rights attestation required');
  END IF;

  v_utc_day := (timezone('utc', now()))::date;

  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text || v_utc_day::text));

  SELECT COUNT(*) INTO v_daily_count
  FROM gallery_videos
  WHERE user_id = p_user_id
    AND source_type = 'cloudflare_stream'
    AND created_at >= (v_utc_day::text || 'T00:00:00Z')::timestamptz
    AND created_at < ((v_utc_day + 1)::text || 'T00:00:00Z')::timestamptz;

  IF v_daily_count >= 3 THEN
    RETURN json_build_object('success', false, 'error', 'Daily submission limit reached (3 per day)');
  END IF;

  INSERT INTO gallery_videos (
    user_id, title, vehicle_model, occasion, song_title, artist_name, genre, story,
    source_type, upload_status, moderation_status, is_public, copyright_attested_at
  ) VALUES (
    p_user_id, p_title, p_vehicle_model, p_occasion, p_song_title, p_artist_name, p_genre, p_story,
    'cloudflare_stream', 'pending_upload', 'pending', false, now()
  )
  RETURNING id INTO v_new_id;

  RETURN json_build_object('success', true, 'submissionId', v_new_id);
END;
$$;

REVOKE ALL ON FUNCTION public.create_gallery_submission FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_gallery_submission FROM anon;
REVOKE ALL ON FUNCTION public.create_gallery_submission FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_gallery_submission TO service_role;

-- ============================================================
-- 9. GALLERY MODERATION LOG (nullable FK, ON DELETE SET NULL)
-- ============================================================

CREATE TABLE IF NOT EXISTS gallery_moderation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_video_id uuid REFERENCES gallery_videos(id) ON DELETE SET NULL,
  target_video_id uuid NOT NULL,
  admin_user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL CHECK (action IN ('submitted','metadata_edited','approved','rejected','removed','restored','deleted')),
  previous_status text,
  new_status text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gallery_moderation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modlog_admin_select" ON gallery_moderation_log FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

REVOKE INSERT, UPDATE, DELETE ON gallery_moderation_log FROM anon;
REVOKE INSERT, UPDATE, DELETE ON gallery_moderation_log FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON gallery_moderation_log FROM PUBLIC;

-- ============================================================
-- 10. GALLERY LIKES
-- ============================================================

CREATE TABLE IF NOT EXISTS gallery_likes (
  gallery_video_id uuid NOT NULL REFERENCES gallery_videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (gallery_video_id, user_id)
);

ALTER TABLE gallery_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_own_select" ON gallery_likes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE ON gallery_likes FROM anon;
REVOKE INSERT, UPDATE, DELETE ON gallery_likes FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON gallery_likes FROM PUBLIC;

-- ============================================================
-- 11. GALLERY VIEWS (two partial unique indexes)
-- ============================================================

CREATE TABLE IF NOT EXISTS gallery_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_video_id uuid NOT NULL REFERENCES gallery_videos(id) ON DELETE CASCADE,
  viewer_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  viewer_hash text,
  view_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gallery_views_viewer_check CHECK (
    (viewer_user_id IS NOT NULL AND viewer_hash IS NULL) OR
    (viewer_user_id IS NULL AND viewer_hash IS NOT NULL)
  )
);

ALTER TABLE gallery_views ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_views_auth
  ON gallery_views(gallery_video_id, viewer_user_id, view_date)
  WHERE viewer_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_views_anon
  ON gallery_views(gallery_video_id, viewer_hash, view_date)
  WHERE viewer_hash IS NOT NULL;

REVOKE ALL ON gallery_views FROM anon;
REVOKE ALL ON gallery_views FROM authenticated;
REVOKE ALL ON gallery_views FROM PUBLIC;
GRANT SELECT, INSERT ON gallery_views TO service_role;

-- ============================================================
-- 12. GALLERY REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS gallery_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_video_id uuid NOT NULL REFERENCES gallery_videos(id) ON DELETE CASCADE,
  reporter_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_hash text,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE gallery_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_admin_select" ON gallery_reports FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

REVOKE INSERT, UPDATE, DELETE ON gallery_reports FROM anon;
REVOKE INSERT, UPDATE, DELETE ON gallery_reports FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON gallery_reports FROM PUBLIC;

-- ============================================================
-- 13. AGGREGATE COUNT FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_gallery_view(p_video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE gallery_videos SET view_count = view_count + 1 WHERE id = p_video_id;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_gallery_view FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_gallery_view FROM anon;
REVOKE ALL ON FUNCTION public.increment_gallery_view FROM authenticated;
GRANT EXECUTE ON FUNCTION public.increment_gallery_view TO service_role;

CREATE OR REPLACE FUNCTION public.toggle_gallery_like(p_video_id uuid, p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_exists boolean;
  v_new_count bigint;
BEGIN
  SELECT EXISTS(SELECT 1 FROM gallery_likes WHERE gallery_video_id = p_video_id AND user_id = p_user_id) INTO v_exists;

  IF v_exists THEN
    DELETE FROM gallery_likes WHERE gallery_video_id = p_video_id AND user_id = p_user_id;
    UPDATE gallery_videos SET like_count = GREATEST(like_count - 1, 0) WHERE id = p_video_id RETURNING like_count INTO v_new_count;
    RETURN json_build_object('liked', false, 'likeCount', v_new_count);
  ELSE
    INSERT INTO gallery_likes (gallery_video_id, user_id) VALUES (p_video_id, p_user_id);
    UPDATE gallery_videos SET like_count = like_count + 1 WHERE id = p_video_id RETURNING like_count INTO v_new_count;
    RETURN json_build_object('liked', true, 'likeCount', v_new_count);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.toggle_gallery_like FROM PUBLIC;
REVOKE ALL ON FUNCTION public.toggle_gallery_like FROM anon;
REVOKE ALL ON FUNCTION public.toggle_gallery_like FROM authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_gallery_like TO service_role;

CREATE OR REPLACE FUNCTION public.recalculate_gallery_like_count(p_video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE gallery_videos SET like_count = (SELECT COUNT(*) FROM gallery_likes WHERE gallery_video_id = p_video_id) WHERE id = p_video_id;
END;
$$;

REVOKE ALL ON FUNCTION public.recalculate_gallery_like_count FROM PUBLIC;
REVOKE ALL ON FUNCTION public.recalculate_gallery_like_count FROM anon;
REVOKE ALL ON FUNCTION public.recalculate_gallery_like_count FROM authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_gallery_like_count TO service_role;

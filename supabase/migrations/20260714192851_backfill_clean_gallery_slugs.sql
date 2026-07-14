
DO $$
DECLARE
  r RECORD;
  base_slug text;
  candidate text;
  n integer;
BEGIN
  FOR r IN
    SELECT id, title
    FROM gallery_videos
    WHERE moderation_status = 'approved'
    ORDER BY created_at
  LOOP
    -- Build clean base slug from title
    base_slug := lower(trim(both '-' from regexp_replace(regexp_replace(r.title, '[^a-zA-Z0-9]+', '-', 'g'), '-+', '-', 'g')));
    IF base_slug = '' THEN base_slug := 'show'; END IF;

    -- Find a free slug: try base, then base-2, base-3, ...
    candidate := base_slug;
    n := 2;
    WHILE EXISTS (
      SELECT 1 FROM gallery_videos WHERE slug = candidate AND id <> r.id
    ) LOOP
      candidate := base_slug || '-' || n;
      n := n + 1;
    END LOOP;

    UPDATE gallery_videos SET slug = candidate WHERE id = r.id;
  END LOOP;
END $$;

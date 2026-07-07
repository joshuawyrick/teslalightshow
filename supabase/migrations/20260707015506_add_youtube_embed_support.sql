/*
# Add YouTube Embed Support to Gallery Videos

1. Modified Tables
   - `gallery_videos`
     - Added `youtube_id` (text, nullable) - stores the YouTube video ID for embedded videos
     - Added `description` (text, nullable) - optional description for gallery entries
     - Made `storage_path` nullable - allows YouTube-only entries without file storage

2. Constraints
   - Added CHECK constraint ensuring at least one of `youtube_id` or `storage_path` is populated

3. Important Notes
   - Existing videos with storage_path remain unaffected
   - New YouTube entries will have storage_path = NULL and youtube_id set
   - The constraint prevents rows with both fields null (orphan entries)
*/

-- Add youtube_id column
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery_videos' AND column_name = 'youtube_id'
  ) THEN
    ALTER TABLE gallery_videos ADD COLUMN youtube_id text;
  END IF;
END $$;

-- Add description column
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery_videos' AND column_name = 'description'
  ) THEN
    ALTER TABLE gallery_videos ADD COLUMN description text;
  END IF;
END $$;

-- Make storage_path nullable (it may already be nullable, but ensure it is)
ALTER TABLE gallery_videos ALTER COLUMN storage_path DROP NOT NULL;

-- Add constraint: at least one of youtube_id or storage_path must be non-null
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'gallery_videos' AND constraint_name = 'gallery_videos_source_check'
  ) THEN
    ALTER TABLE gallery_videos ADD CONSTRAINT gallery_videos_source_check
      CHECK (youtube_id IS NOT NULL OR storage_path IS NOT NULL);
  END IF;
END $$;

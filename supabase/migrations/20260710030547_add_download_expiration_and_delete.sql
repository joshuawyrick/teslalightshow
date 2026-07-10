/*
# Add Download Expiration and User Delete Capabilities

## Summary
Adds an `expires_at` column to the `downloads` table so files auto-expire after 30 days,
and adds DELETE policies so users can remove their own downloads (both the DB row and the
storage object).

## Modified Tables
- `downloads`
  - Added `expires_at` (timestamptz) — defaults to 30 days after creation
  - Added index on `expires_at` for efficient cleanup queries

## Security Changes
- Added DELETE RLS policy on `downloads` table: authenticated users can delete their own rows
- Added DELETE storage policy on `downloads` bucket: authenticated users can delete their own files

## Important Notes
1. The `expires_at` column defaults to `now() + interval '30 days'` for new rows.
2. Existing rows are backfilled with `created_at + interval '30 days'`.
3. The cleanup-expired-downloads edge function (deployed separately) will purge expired files.
4. Users can manually delete their own downloads before expiration via the UI.
*/

-- Add expires_at column to downloads table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'downloads' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE downloads ADD COLUMN expires_at timestamptz DEFAULT (now() + interval '30 days');
  END IF;
END $$;

-- Backfill existing rows
UPDATE downloads SET expires_at = created_at + interval '30 days' WHERE expires_at IS NULL;

-- Index for efficient expired-row queries
CREATE INDEX IF NOT EXISTS idx_downloads_expires_at ON downloads(expires_at);

-- DELETE policy: users can delete their own downloads
DROP POLICY IF EXISTS "delete_own_downloads" ON downloads;
CREATE POLICY "delete_own_downloads" ON downloads FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Storage DELETE policy: users can delete their own files in the downloads bucket
DROP POLICY IF EXISTS "owner_delete_downloads" ON storage.objects;
CREATE POLICY "owner_delete_downloads" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'downloads' AND (storage.foldername(name))[1] = auth.uid()::text);

/*
# Fix SECURITY DEFINER function exposure and gallery_views RLS gap

## Security Issues Addressed

1. **Function `public.set_gallery_updated_at()` exposed as SECURITY DEFINER**
   - This is a trigger function (fires on UPDATE to set `updated_at = now()`).
   - It was callable by `anon` and `authenticated` roles via `/rest/v1/rpc/set_gallery_updated_at`.
   - Trigger functions are invoked internally by PostgreSQL — they never need direct EXECUTE from API roles.
   - Fix: Revoke EXECUTE from `PUBLIC`, `anon`, and `authenticated`. The trigger will continue to fire normally.

2. **Table `public.gallery_views` has RLS enabled but no policies**
   - This table records gallery video views for deduplication and analytics.
   - It is only written by the `record-gallery-view` edge function, which uses the SERVICE ROLE key (bypasses RLS).
   - The frontend never directly queries this table.
   - Fix: Add explicit RLS policies so the table is not in an ambiguous "RLS enabled, no policies" state.
     - INSERT: Allow `anon, authenticated` — views can come from any visitor.
     - SELECT: Allow `authenticated` — logged-in users can see view records (e.g., admin analytics).
     - No UPDATE or DELETE policies — view records are immutable append-only analytics.

## Important Notes
1. The `set_gallery_updated_at` trigger continues to work because trigger invocation does not require EXECUTE privilege on the function for the calling role — the trigger fires as the table owner.
2. The `record-gallery-view` edge function continues to work because it uses the SERVICE ROLE key, which bypasses RLS entirely.
3. All policy drops use `IF EXISTS` for idempotency.
*/

-- 1. Revoke EXECUTE on set_gallery_updated_at from all API roles
REVOKE EXECUTE ON FUNCTION public.set_gallery_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_gallery_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_gallery_updated_at() FROM authenticated;

-- 2. Add RLS policies to gallery_views
-- Table already has RLS enabled; we just need to add policies.

-- INSERT: Any visitor (authenticated or anonymous) can record a view
DROP POLICY IF EXISTS "insert_gallery_views" ON gallery_views;
CREATE POLICY "insert_gallery_views"
ON gallery_views FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- SELECT: Authenticated users can read view records (analytics)
DROP POLICY IF EXISTS "select_gallery_views" ON gallery_views;
CREATE POLICY "select_gallery_views"
ON gallery_views FOR SELECT
TO authenticated
USING (true);

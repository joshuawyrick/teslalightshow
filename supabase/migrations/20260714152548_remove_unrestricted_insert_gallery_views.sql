/*
# Remove unrestricted INSERT policy on gallery_views

## Security Issue Addressed

1. **Table `public.gallery_views` had an INSERT policy with `WITH CHECK (true)`**
   - The `insert_gallery_views` policy allowed `anon` and `authenticated` roles to insert
     arbitrary rows via the REST API, effectively bypassing row-level security.
   - The `gallery_views` table is only written by the `record-gallery-view` edge function,
     which uses the SERVICE ROLE key (bypasses RLS entirely).
   - The frontend never directly inserts into this table.
   - Fix: Drop the `insert_gallery_views` policy. With no INSERT policy, direct REST API
     inserts are blocked for `anon` and `authenticated`. The edge function continues to work
     normally because the service role key bypasses RLS.

## Important Notes
1. The `record-gallery-view` edge function is unaffected — it uses the SERVICE ROLE key.
2. The `select_gallery_views` SELECT policy remains for authenticated analytics access.
3. No data is lost or modified — this only removes a permissive policy.
*/

DROP POLICY IF EXISTS "insert_gallery_views" ON gallery_views;

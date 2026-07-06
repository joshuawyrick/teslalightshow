/*
# Revoke public EXECUTE on all SECURITY DEFINER functions

## Summary
The previous migration revoked EXECUTE from anon and authenticated individually,
but PostgreSQL's default grant to PUBLIC still allows access. This migration
revokes from PUBLIC to fully close the RPC endpoint exposure.

## Changes
- Revoke EXECUTE from PUBLIC on all 6 SECURITY DEFINER functions
- Re-grant EXECUTE to postgres (function owner) to ensure triggers and
  service_role calls continue working

## Security Impact
- Blocks all direct /rest/v1/rpc/... calls from anon and authenticated
- Edge functions using service_role key are unaffected (superuser bypasses)
- The handle_new_user trigger is unaffected (triggers run as owner)
*/

-- Revoke from PUBLIC (covers anon, authenticated, and any other role)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.spend_credit(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refund_credit(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.use_snippet(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.add_credits_for_session(uuid, text, text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_grant_credits(uuid, text, integer, text) FROM PUBLIC;

-- Ensure the function owner (postgres) retains execute for triggers and service_role
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.spend_credit(uuid) TO postgres;
GRANT EXECUTE ON FUNCTION public.refund_credit(uuid) TO postgres;
GRANT EXECUTE ON FUNCTION public.use_snippet(uuid) TO postgres;
GRANT EXECUTE ON FUNCTION public.add_credits_for_session(uuid, text, text, integer, integer) TO postgres;
GRANT EXECUTE ON FUNCTION public.admin_grant_credits(uuid, text, integer, text) TO postgres;
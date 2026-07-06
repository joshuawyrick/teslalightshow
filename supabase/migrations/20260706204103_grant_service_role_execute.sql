-- Grant EXECUTE to service_role so edge functions (using SUPABASE_SERVICE_ROLE_KEY) can call these
GRANT EXECUTE ON FUNCTION public.add_credits_for_session(uuid, text, text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.spend_credit(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_credit(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.use_snippet(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_grant_credits(uuid, text, integer, text) TO service_role;
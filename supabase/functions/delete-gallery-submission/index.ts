import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing auth" }, 401);

    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const { submissionId } = body;
    if (!submissionId) return json({ error: "submissionId required" }, 400);

    const { data: submission, error: fetchErr } = await supabase
      .from("gallery_videos")
      .select("id, user_id, source_type, cloudflare_video_uid, upload_status, moderation_status")
      .eq("id", submissionId)
      .single();

    if (fetchErr || !submission) return json({ error: "Submission not found" }, 404);

    const isOwner = submission.user_id === user.id;
    let isAdminOwner = false;

    if (!isOwner) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, admin_role")
        .eq("id", user.id)
        .maybeSingle();
      isAdminOwner = profile?.is_admin === true && profile?.admin_role === "owner";
    }

    // Users can delete own pending/rejected/error/cancelled
    if (isOwner && !isAdminOwner) {
      if (!["pending", "rejected", "error", "cancelled"].includes(submission.moderation_status) &&
          !["pending_upload", "error", "cancelled"].includes(submission.upload_status)) {
        return json({ error: "Cannot delete an approved submission. Contact support." }, 403);
      }
      // Users cannot delete admin-created YouTube entries
      if (submission.source_type === "youtube") {
        return json({ error: "Cannot delete gallery entries managed by admins" }, 403);
      }
    }

    if (!isOwner && !isAdminOwner) {
      return json({ error: "Only submission owners or admin owners can delete" }, 403);
    }

    // Write moderation log BEFORE deletion (Correction 6)
    await supabase.from("gallery_moderation_log").insert({
      gallery_video_id: submission.id,
      target_video_id: submission.id,
      admin_user_id: user.id,
      action: "deleted",
      previous_status: submission.moderation_status,
      new_status: "deleted",
      note: isAdminOwner && !isOwner ? "Admin permanent deletion" : "Owner deletion",
    });

    // Delete from Cloudflare first (Correction 10)
    if (submission.source_type === "cloudflare_stream" && submission.cloudflare_video_uid) {
      const accountId = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
      const apiToken = Deno.env.get("CLOUDFLARE_STREAM_API_TOKEN");
      if (accountId && apiToken) {
        const cfRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${submission.cloudflare_video_uid}`,
          { method: "DELETE", headers: { "Authorization": `Bearer ${apiToken}` } },
        );
        // 404 = already gone, continue safely
        if (!cfRes.ok && cfRes.status !== 404) {
          return json({ error: "Failed to delete Cloudflare video" }, 502);
        }
      }
    }

    // Delete DB row
    await supabase.from("gallery_videos").delete().eq("id", submissionId);

    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

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

function titleToSlugBase(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "show";
}

async function generateUniqueSlug(
  supabase: ReturnType<typeof createClient>,
  title: string,
  excludeId: string,
): Promise<string> {
  const base = titleToSlugBase(title);

  const { data: existing } = await supabase
    .from("gallery_videos")
    .select("slug")
    .eq("slug", base)
    .neq("id", excludeId)
    .maybeSingle();

  if (!existing) return base;

  const { data: conflicts } = await supabase
    .from("gallery_videos")
    .select("slug")
    .like("slug", `${base}%`)
    .neq("id", excludeId);

  const taken = new Set((conflicts || []).map((r: { slug: string }) => r.slug));
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, admin_role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.is_admin) return json({ error: "Forbidden" }, 403);

    const role = profile.admin_role as string;
    const canMutate = role === "owner" || role === "editor";
    const isOwner = role === "owner";

    const body = await req.json();
    const { submissionId, action, note } = body;

    if (!submissionId || !action) return json({ error: "submissionId and action required" }, 400);

    if (!canMutate) return json({ error: "Viewers have read-only access" }, 403);

    const { data: submission, error: fetchErr } = await supabase
      .from("gallery_videos")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (fetchErr || !submission) return json({ error: "Submission not found" }, 404);

    const prevStatus = submission.moderation_status;
    const accountId = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
    const apiToken = Deno.env.get("CLOUDFLARE_STREAM_API_TOKEN");
    const allowedOrigins = Deno.env.get("CLOUDFLARE_STREAM_ALLOWED_ORIGINS") || "";

    async function writeLog(logAction: string, newStatus: string) {
      await supabase.from("gallery_moderation_log").insert({
        gallery_video_id: submission.id,
        target_video_id: submission.id,
        admin_user_id: user!.id,
        action: logAction,
        previous_status: prevStatus,
        new_status: newStatus,
        note: note || null,
      });
    }

    if (action === "approve") {
      if (submission.upload_status !== "ready") {
        return json({ error: "Video must be processed before approval" }, 400);
      }
      if (!submission.title || !submission.vehicle_model) {
        return json({ error: "Title and vehicle model required for approval" }, 400);
      }

      // Generate unique slug
      let slug = await generateUniqueSlug(supabase, submission.title, submission.id);

      // Update Cloudflare to make video public with allowed origins
      if (submission.source_type === "cloudflare_stream" && submission.cloudflare_video_uid && accountId && apiToken) {
        const origins = allowedOrigins.split(",").map((o: string) => o.trim()).filter(Boolean);
        const cfRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${submission.cloudflare_video_uid}`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${apiToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uid: submission.cloudflare_video_uid,
              meta: { name: submission.title },
              requireSignedURLs: false,
              allowedOrigins: origins.length > 0 ? origins : undefined,
            }),
          },
        );
        if (!cfRes.ok) {
          return json({ error: "Failed to update Cloudflare video settings" }, 502);
        }
      }

      // Only after Cloudflare succeeds, update DB
      const { error: updateErr } = await supabase
        .from("gallery_videos")
        .update({
          moderation_status: "approved",
          is_public: true,
          approved_at: new Date().toISOString(),
          approved_by: user.id,
          rejected_at: null,
          rejection_reason: null,
          slug,
        })
        .eq("id", submission.id);

      if (updateErr) {
        // Compensation: re-enable signed URLs
        if (submission.source_type === "cloudflare_stream" && submission.cloudflare_video_uid && accountId && apiToken) {
          await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${submission.cloudflare_video_uid}`,
            {
              method: "POST",
              headers: { "Authorization": `Bearer ${apiToken}`, "Content-Type": "application/json" },
              body: JSON.stringify({ uid: submission.cloudflare_video_uid, requireSignedURLs: true }),
            },
          ).catch(() => {});
        }
        return json({ error: "Database update failed after Cloudflare update" }, 500);
      }

      await writeLog("approved", "approved");

      // Optional rebuild webhook
      const rebuildUrl = Deno.env.get("SITE_REBUILD_WEBHOOK_URL");
      if (rebuildUrl) {
        fetch(rebuildUrl, { method: "POST" }).catch(() => {});
      }

      return json({ success: true, slug });
    }

    if (action === "reject") {
      if (!note) return json({ error: "Rejection reason required" }, 400);

      await supabase
        .from("gallery_videos")
        .update({
          moderation_status: "rejected",
          is_public: false,
          rejected_at: new Date().toISOString(),
          rejection_reason: note,
        })
        .eq("id", submission.id);

      await writeLog("rejected", "rejected");
      return json({ success: true });
    }

    if (action === "feature") {
      await supabase.from("gallery_videos").update({ featured: true }).eq("id", submission.id);
      return json({ success: true });
    }

    if (action === "unfeature") {
      await supabase.from("gallery_videos").update({ featured: false }).eq("id", submission.id);
      return json({ success: true });
    }

    if (action === "remove") {
      // Re-enable signed URLs
      if (submission.source_type === "cloudflare_stream" && submission.cloudflare_video_uid && accountId && apiToken) {
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${submission.cloudflare_video_uid}`,
          {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ uid: submission.cloudflare_video_uid, requireSignedURLs: true }),
          },
        ).catch(() => {});
      }

      await supabase
        .from("gallery_videos")
        .update({ moderation_status: "removed", is_public: false })
        .eq("id", submission.id);

      await writeLog("removed", "removed");
      return json({ success: true });
    }

    if (action === "restore") {
      await supabase
        .from("gallery_videos")
        .update({ moderation_status: "pending", is_public: false })
        .eq("id", submission.id);

      await writeLog("restored", "pending");
      return json({ success: true });
    }

    if (action === "delete") {
      if (!isOwner) return json({ error: "Only owner admins can permanently delete" }, 403);

      // Write log BEFORE deleting (Correction 6)
      await writeLog("deleted", "deleted");

      // Delete from Cloudflare first
      if (submission.source_type === "cloudflare_stream" && submission.cloudflare_video_uid && accountId && apiToken) {
        const cfRes = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${submission.cloudflare_video_uid}`,
          { method: "DELETE", headers: { "Authorization": `Bearer ${apiToken}` } },
        );
        // 404 = already gone, continue
        if (!cfRes.ok && cfRes.status !== 404) {
          return json({ error: "Failed to delete Cloudflare video" }, 502);
        }
      }

      // Delete DB row
      await supabase.from("gallery_videos").delete().eq("id", submission.id);

      return json({ success: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

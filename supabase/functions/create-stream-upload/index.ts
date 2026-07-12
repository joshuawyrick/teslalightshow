import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Tus-Resumable, Upload-Length, Upload-Metadata",
  "Access-Control-Expose-Headers": "Location, stream-media-id, Tus-Resumable",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const MAX_FILE_SIZE = 3 * 1024 * 1024 * 1024; // 3 GB

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

    const tusResumable = req.headers.get("Tus-Resumable");
    if (tusResumable !== "1.0.0") {
      return json({ error: "Tus-Resumable 1.0.0 required" }, 400);
    }

    const uploadLength = parseInt(req.headers.get("Upload-Length") || "0", 10);
    if (!uploadLength || uploadLength <= 0) {
      return json({ error: "Upload-Length required" }, 400);
    }
    if (uploadLength > MAX_FILE_SIZE) {
      return json({ error: "File too large (max 3 GB)" }, 400);
    }

    // Parse metadata to get submissionId
    const metadataHeader = req.headers.get("Upload-Metadata") || "";
    const metaPairs: Record<string, string> = {};
    for (const pair of metadataHeader.split(",")) {
      const [key, b64val] = pair.trim().split(" ");
      if (key && b64val) metaPairs[key] = atob(b64val);
    }

    const submissionId = metaPairs["submissionid"];
    if (!submissionId) return json({ error: "submissionid metadata required" }, 400);

    // Verify submission ownership and status
    const { data: submission, error: fetchErr } = await supabase
      .from("gallery_videos")
      .select("id, user_id, upload_status, cloudflare_video_uid, title")
      .eq("id", submissionId)
      .single();

    if (fetchErr || !submission) return json({ error: "Submission not found" }, 404);
    if (submission.user_id !== user.id) return json({ error: "Not your submission" }, 403);

    // Prevent duplicate creation (Correction 3)
    if (submission.cloudflare_video_uid) {
      return json({ error: "Upload already created. Use the existing upload URL to resume." }, 409);
    }
    if (submission.upload_status !== "pending_upload") {
      return json({ error: `Cannot create upload for status: ${submission.upload_status}` }, 409);
    }

    // Build Cloudflare metadata
    const accountId = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
    const apiToken = Deno.env.get("CLOUDFLARE_STREAM_API_TOKEN");
    if (!accountId || !apiToken) {
      return json({ error: "Stream configuration missing" }, 500);
    }

    const safeName = (submission.title || "upload").replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 80);

    const cfMetadata = [
      `name ${btoa(safeName)}`,
      `maxdurationseconds ${btoa("300")}`,
      `requiresignedurls ${btoa("true")}`,
      `thumbnailtimestamppct ${btoa("0.35")}`,
    ].join(",");

    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?direct_user=true`;

    const cfRes = await fetch(cfUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Tus-Resumable": "1.0.0",
        "Upload-Length": String(uploadLength),
        "Upload-Metadata": cfMetadata,
        "Upload-Creator": user.id,
      },
    });

    if (!cfRes.ok) {
      const errBody = await cfRes.text().catch(() => "");
      return json({ error: `Cloudflare rejected upload: ${cfRes.status}` }, cfRes.status >= 500 ? 502 : 400);
    }

    const location = cfRes.headers.get("Location") || cfRes.headers.get("location");
    const streamMediaId = cfRes.headers.get("stream-media-id");

    if (!location || !streamMediaId) {
      return json({ error: "Missing Cloudflare response headers" }, 502);
    }

    // Update DB with UID and status (Correction 3: if this fails, delete CF video)
    const { error: updateErr } = await supabase
      .from("gallery_videos")
      .update({ cloudflare_video_uid: streamMediaId, upload_status: "uploading" })
      .eq("id", submissionId)
      .eq("upload_status", "pending_upload");

    if (updateErr) {
      // Attempt to clean up orphaned Cloudflare video
      try {
        await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${streamMediaId}`,
          { method: "DELETE", headers: { "Authorization": `Bearer ${apiToken}` } },
        );
      } catch (_) { /* best effort */ }
      return json({ error: "Failed to register upload" }, 500);
    }

    return new Response(null, {
      status: 201,
      headers: {
        ...corsHeaders,
        "Location": location,
        "stream-media-id": streamMediaId,
        "Tus-Resumable": "1.0.0",
      },
    });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

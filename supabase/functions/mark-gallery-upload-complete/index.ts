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
    const { submissionId, cloudflareVideoUid } = body;

    if (!submissionId || !cloudflareVideoUid) {
      return json({ error: "submissionId and cloudflareVideoUid required" }, 400);
    }

    // Verify ownership and UID match
    const { data: submission, error: fetchErr } = await supabase
      .from("gallery_videos")
      .select("id, user_id, upload_status, cloudflare_video_uid")
      .eq("id", submissionId)
      .single();

    if (fetchErr || !submission) return json({ error: "Submission not found" }, 404);
    if (submission.user_id !== user.id) return json({ error: "Not your submission" }, 403);
    if (submission.cloudflare_video_uid !== cloudflareVideoUid) {
      return json({ error: "Video UID mismatch" }, 400);
    }

    // Correction 2: only update if currently 'uploading'; do not downgrade ready/error
    if (submission.upload_status === "ready" || submission.upload_status === "error") {
      return json({ status: submission.upload_status });
    }

    if (submission.upload_status !== "uploading") {
      return json({ error: `Cannot mark complete from status: ${submission.upload_status}` }, 409);
    }

    const { error: updateErr } = await supabase
      .from("gallery_videos")
      .update({ upload_status: "processing" })
      .eq("id", submissionId)
      .eq("upload_status", "uploading");

    if (updateErr) return json({ error: "Update failed" }, 500);

    return json({ status: "processing" });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

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

    // Look up the submission
    const { data: submission, error: fetchErr } = await supabase
      .from("gallery_videos")
      .select("id, user_id, cloudflare_video_uid, moderation_status")
      .eq("id", submissionId)
      .single();

    if (fetchErr || !submission) return json({ error: "Submission not found" }, 404);

    // Verify access: owner or admin
    const isOwner = submission.user_id === user.id;
    let isAdmin = false;
    if (!isOwner) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      isAdmin = profile?.is_admin === true;
    }

    if (!isOwner && !isAdmin) {
      return json({ error: "Access denied" }, 403);
    }

    if (!submission.cloudflare_video_uid) {
      return json({ error: "No video UID available" }, 400);
    }

    const accountId = Deno.env.get("CLOUDFLARE_ACCOUNT_ID");
    const apiToken = Deno.env.get("CLOUDFLARE_STREAM_API_TOKEN");
    if (!accountId || !apiToken) return json({ error: "Stream not configured" }, 500);

    // Request a signed token from Cloudflare
    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${submission.cloudflare_video_uid}/token`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
      },
    );

    if (!cfRes.ok) {
      return json({ error: "Failed to generate playback token" }, 502);
    }

    const cfData = await cfRes.json();
    const token = cfData?.result?.token;
    if (!token) return json({ error: "No token in Cloudflare response" }, 502);

    return json({ token });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

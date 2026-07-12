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

const VALID_REASONS = ["copyright", "inappropriate", "spam", "misleading", "other"];

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

    // Optional auth
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = user?.id ?? null;
    }

    const body = await req.json();
    const { videoId, reason, details } = body;

    if (!videoId) return json({ error: "videoId required" }, 400);
    if (!reason || !VALID_REASONS.includes(reason)) {
      return json({ error: "Valid reason required" }, 400);
    }
    if (details && (typeof details !== "string" || details.length > 500)) {
      return json({ error: "Details must be under 500 characters" }, 400);
    }

    // Rate limit: use HMAC hash for anonymous reporters
    let reporterHash: string | null = null;
    if (!userId) {
      const secret = Deno.env.get("GALLERY_VIEW_HASH_SECRET") || "fallback-report-secret";
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const ua = req.headers.get("user-agent") || "";
      const utcDay = new Date().toISOString().slice(0, 10);
      const key = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
      );
      const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${ip}|${ua}|${utcDay}`));
      reporterHash = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    // Rate limit check (3 reports per identity per day)
    const utcDay = new Date().toISOString().slice(0, 10);
    let countQuery;
    if (userId) {
      countQuery = supabase
        .from("gallery_reports")
        .select("id", { count: "exact", head: true })
        .eq("reporter_user_id", userId)
        .gte("created_at", `${utcDay}T00:00:00Z`);
    } else {
      countQuery = supabase
        .from("gallery_reports")
        .select("id", { count: "exact", head: true })
        .eq("reporter_hash", reporterHash!)
        .gte("created_at", `${utcDay}T00:00:00Z`);
    }

    const { count } = await countQuery;
    if ((count ?? 0) >= 3) {
      return json({ error: "Report limit reached for today" }, 429);
    }

    const { error: insertErr } = await supabase.from("gallery_reports").insert({
      gallery_video_id: videoId,
      reporter_user_id: userId,
      reporter_hash: userId ? null : reporterHash,
      reason,
      details: details?.trim() || null,
    });

    if (insertErr) return json({ error: "Failed to submit report" }, 500);

    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

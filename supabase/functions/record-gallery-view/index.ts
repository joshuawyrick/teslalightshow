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

    const body = await req.json();
    const { videoId } = body;
    if (!videoId) return json({ error: "videoId required" }, 400);

    // Determine viewer identity
    let viewerUserId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      viewerUserId = user?.id ?? null;
    }

    let viewerHash: string | null = null;
    if (!viewerUserId) {
      const secret = Deno.env.get("GALLERY_VIEW_HASH_SECRET") || "fallback-view-secret";
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const ua = req.headers.get("user-agent") || "";
      const utcDay = new Date().toISOString().slice(0, 10);
      const key = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
      );
      const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${ip}|${ua}|${utcDay}`));
      viewerHash = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    const viewDate = new Date().toISOString().slice(0, 10);

    // Insert with ON CONFLICT DO NOTHING (dedup via partial unique indexes)
    const insertData: Record<string, unknown> = {
      gallery_video_id: videoId,
      view_date: viewDate,
    };

    if (viewerUserId) {
      insertData.viewer_user_id = viewerUserId;
    } else {
      insertData.viewer_hash = viewerHash;
    }

    const { error: insertErr, count } = await supabase
      .from("gallery_views")
      .upsert(insertData, { onConflict: viewerUserId ? "gallery_video_id,viewer_user_id,view_date" : "gallery_video_id,viewer_hash,view_date", ignoreDuplicates: true })
      .select("id", { count: "exact", head: true });

    // Only increment if a new row was inserted
    if (!insertErr && (count ?? 0) > 0) {
      await supabase.rpc("increment_gallery_view", { p_video_id: videoId });
    }

    return json({ ok: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

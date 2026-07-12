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

const EDITABLE_FIELDS = ["title", "song_title", "artist_name", "vehicle_model", "occasion", "genre", "story"];

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
    const { submissionId, ...fields } = body;
    if (!submissionId) return json({ error: "submissionId required" }, 400);

    const { data: submission, error: fetchErr } = await supabase
      .from("gallery_videos")
      .select("id, user_id, moderation_status")
      .eq("id", submissionId)
      .single();

    if (fetchErr || !submission) return json({ error: "Submission not found" }, 404);

    const isOwner = submission.user_id === user.id;
    let isAdmin = false;
    let adminRole: string | null = null;

    if (!isOwner) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin, admin_role")
        .eq("id", user.id)
        .maybeSingle();
      isAdmin = profile?.is_admin === true;
      adminRole = profile?.admin_role ?? null;
    }

    if (!isOwner && !isAdmin) return json({ error: "Access denied" }, 403);

    // Owner can only edit pending/rejected
    if (isOwner && !isAdmin) {
      if (!["pending", "rejected"].includes(submission.moderation_status)) {
        return json({ error: "Cannot edit approved or removed submissions" }, 403);
      }
    }

    // Admin viewer cannot edit
    if (isAdmin && !isOwner && adminRole === "viewer") {
      return json({ error: "Viewers have read-only access" }, 403);
    }

    // Filter to only allowed fields
    const updates: Record<string, string | null> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (EDITABLE_FIELDS.includes(key)) {
        updates[key] = typeof value === "string" ? value.trim().slice(0, key === "story" ? 500 : 120) : null;
      }
    }

    if (Object.keys(updates).length === 0) {
      return json({ error: "No valid fields to update" }, 400);
    }

    // Validate specific fields
    if (updates.title !== undefined && updates.title && (updates.title.length < 2 || updates.title.length > 100)) {
      return json({ error: "Title must be 2-100 characters" }, 400);
    }

    const { error: updateErr } = await supabase
      .from("gallery_videos")
      .update(updates)
      .eq("id", submissionId);

    if (updateErr) return json({ error: "Update failed" }, 500);

    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

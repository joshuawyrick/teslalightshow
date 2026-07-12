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

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing auth" }, 401);
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authErr || !user) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Verify admin server-side and get role
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("is_admin, admin_role")
      .eq("id", user.id)
      .maybeSingle();

    if (!adminProfile?.is_admin) {
      return json({ error: "Forbidden" }, 403);
    }

    const callerRole = adminProfile.admin_role as string;
    const url = new URL(req.url);

    // GET dashboard data — all admin roles can view
    if (req.method === "GET" && url.searchParams.get("action") === "dashboard") {
      const [usersRes, purchasesRes, downloadsRes, videosRes, adminsRes] = await Promise.all([
        supabase.from("profiles").select("id, email, credits, snippet_used, is_admin, admin_role, created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("purchases").select("id, user_id, package_name, credits_purchased, amount_cents, created_at, profiles(email)").order("created_at", { ascending: false }).limit(20),
        supabase.from("downloads").select("id", { count: "exact", head: true }),
        supabase.from("gallery_videos").select("id, user_id, title, storage_path, youtube_id, description, created_at").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, email, admin_role, created_at").not("admin_role", "is", null).order("created_at", { ascending: true }),
      ]);

      // Recalculate total revenue from ALL purchases
      const { data: allPurchases } = await supabase
        .from("purchases")
        .select("amount_cents");
      const totalRev = (allPurchases ?? []).reduce(
        (sum: number, p: { amount_cents: number }) => sum + (p.amount_cents ?? 0), 0
      );

      const purchases = (purchasesRes.data ?? []).map((p: {
        id: string; package_name: string; credits_purchased: number;
        amount_cents: number; created_at: string;
        profiles: { email: string } | { email: string }[] | null;
      }) => ({
        id: p.id,
        email: Array.isArray(p.profiles) ? p.profiles[0]?.email : (p.profiles as { email: string } | null)?.email ?? "",
        package_name: p.package_name,
        credits_purchased: p.credits_purchased,
        amount_cents: p.amount_cents,
        created_at: p.created_at,
      }));

      return json({
        callerRole,
        stats: {
          totalRevenueCents: totalRev,
          totalUsers: (usersRes.data ?? []).length,
          totalDownloads: downloadsRes.count ?? 0,
        },
        users: usersRes.data ?? [],
        purchases,
        videos: videosRes.data ?? [],
        admins: adminsRes.data ?? [],
      });
    }

    // POST: actions that require editor or owner role
    if (req.method === "POST") {
      const body = await req.json();
      const { action } = body;

      // Viewers cannot perform any POST actions
      if (callerRole === "viewer") {
        return json({ error: "Viewers have read-only access" }, 403);
      }

      if (action === "grant") {
        const { email, credits, note } = body;
        if (!email || !credits || credits === 0) {
          return json({ error: "email and non-zero credits required" }, 400);
        }

        const { data: result, error: grantErr } = await supabase.rpc("admin_grant_credits", {
          p_admin_uid: user.id,
          p_recipient_email: email,
          p_credits: credits,
          p_note: note ?? null,
        });

        if (grantErr) {
          return json({ error: grantErr.message }, 500);
        }

        return json(result);
      }

      if (action === "manage_admin") {
        // Only owner can manage admins
        if (callerRole !== "owner") {
          return json({ error: "Only the owner can manage admin roles" }, 403);
        }

        const { email, role } = body;
        if (!email) {
          return json({ error: "email is required" }, 400);
        }
        if (role !== null && role !== "editor" && role !== "viewer" && role !== "owner") {
          return json({ error: "role must be editor, viewer, owner, or null to revoke" }, 400);
        }

        const { data: result, error: roleErr } = await supabase.rpc("set_admin_role", {
          p_admin_uid: user.id,
          p_target_email: email,
          p_role: role,
        });

        if (roleErr) {
          return json({ error: roleErr.message }, 500);
        }

        return json(result);
      }

      if (action === "add_youtube_video") {
        const { title, youtube_id, description } = body;
        if (!title || !youtube_id) {
          return json({ error: "title and youtube_id required" }, 400);
        }
        if (!/^[a-zA-Z0-9_-]{11}$/.test(youtube_id)) {
          return json({ error: "Invalid YouTube video ID" }, 400);
        }

        const { data: newVideo, error: insertErr } = await supabase
          .from("gallery_videos")
          .insert({
            user_id: user.id,
            title: title.trim(),
            youtube_id,
            description: description?.trim() || null,
            storage_path: null,
          })
          .select()
          .single();

        if (insertErr) {
          return json({ error: insertErr.message }, 500);
        }

        return json({ success: true, video: newVideo });
      }

      if (action === "delete_video") {
        const { video_id, storage_path } = body;
        if (!video_id) {
          return json({ error: "video_id required" }, 400);
        }

        if (storage_path) {
          await supabase.storage.from("gallery").remove([storage_path]);
        }
        await supabase.from("gallery_videos").delete().eq("id", video_id);

        return json({ success: true });
      }

      return json({ error: "Unknown action" }, 400);
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

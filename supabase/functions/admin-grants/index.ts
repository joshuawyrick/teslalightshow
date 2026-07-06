import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin server-side
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (!adminProfile?.is_admin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);

    // GET dashboard data
    if (req.method === "GET" && url.searchParams.get("action") === "dashboard") {
      const [usersRes, purchasesRes, downloadsRes, videosRes] = await Promise.all([
        supabase.from("profiles").select("id, email, credits, snippet_used, is_admin, created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("purchases").select("id, user_id, package_name, credits_purchased, amount_cents, created_at, profiles(email)").order("created_at", { ascending: false }).limit(20),
        supabase.from("downloads").select("id", { count: "exact", head: true }),
        supabase.from("gallery_videos").select("id, user_id, title, storage_path, created_at").order("created_at", { ascending: false }),
      ]);

      const totalRevenueCents = (purchasesRes.data ?? []).reduce(
        (sum: number, p: { amount_cents: number }) => sum + (p.amount_cents ?? 0), 0
      );

      // Recalculate total revenue from ALL purchases (not just last 20)
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

      return new Response(JSON.stringify({
        stats: {
          totalRevenueCents: totalRev,
          totalUsers: (usersRes.data ?? []).length,
          totalDownloads: downloadsRes.count ?? 0,
        },
        users: usersRes.data ?? [],
        purchases,
        videos: videosRes.data ?? [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // POST: grant credits or other admin actions
    if (req.method === "POST") {
      const body = await req.json();
      const { action } = body;

      if (action === "grant") {
        const { email, credits, note } = body;
        if (!email || !credits || credits < 1) {
          return new Response(JSON.stringify({ error: "email and credits required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const { data: result, error: grantErr } = await supabase.rpc("admin_grant_credits", {
          p_admin_uid: user.id,
          p_recipient_email: email,
          p_credits: credits,
          p_note: note ?? null,
        });

        if (grantErr) {
          return new Response(JSON.stringify({ error: grantErr.message }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

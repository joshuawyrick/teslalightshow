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

    // Verify caller is admin via auth header
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const { data: { user }, error: authErr } = await supabase.auth.getUser(
        authHeader.replace("Bearer ", ""),
      );
      if (authErr || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile?.is_admin) {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find expired downloads (batch of 100 at a time)
    const { data: expired, error: queryErr } = await supabase
      .from("downloads")
      .select("id, storage_path")
      .lt("expires_at", new Date().toISOString())
      .limit(100);

    if (queryErr) {
      return new Response(JSON.stringify({ error: queryErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!expired || expired.length === 0) {
      return new Response(JSON.stringify({ purged: 0, message: "No expired downloads." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete storage files
    const storagePaths = expired.map((d: { storage_path: string }) => d.storage_path);
    const { error: removeErr } = await supabase.storage
      .from("downloads")
      .remove(storagePaths);

    if (removeErr) {
      return new Response(JSON.stringify({ error: `Storage removal failed: ${removeErr.message}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete DB rows
    const ids = expired.map((d: { id: string }) => d.id);
    const { error: deleteErr } = await supabase
      .from("downloads")
      .delete()
      .in("id", ids);

    if (deleteErr) {
      return new Response(JSON.stringify({ error: `DB deletion failed: ${deleteErr.message}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ purged: expired.length, message: `Purged ${expired.length} expired downloads.` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

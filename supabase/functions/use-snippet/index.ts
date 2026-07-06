import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
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

    const { fseqB64, songName, renditionId, renditionName, vehicleModel } = await req.json();

    if (!fseqB64 || !songName || !renditionId || !renditionName || !vehicleModel) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Atomically mark snippet_used — returns false if already used
    const { data: claimed, error: claimErr } = await supabase.rpc("use_snippet", { uid: user.id });
    if (claimErr) {
      return new Response(JSON.stringify({ error: claimErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!claimed) {
      return new Response(JSON.stringify({ error: "Free snippet already used" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upload snippet fseq to storage
    const downloadId = crypto.randomUUID();
    const storagePath = `${user.id}/${downloadId}.fseq`;
    const fseqBytes = base64ToBytes(fseqB64);

    const { error: uploadErr } = await supabase.storage
      .from("downloads")
      .upload(storagePath, fseqBytes, { contentType: "application/octet-stream" });

    if (uploadErr) {
      // Note: snippet_used stays true — prevent double-claiming
      return new Response(JSON.stringify({ error: `Storage upload failed: ${uploadErr.message}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert download record
    const { error: insertErr } = await supabase.from("downloads").insert({
      id: downloadId,
      user_id: user.id,
      song_name: songName,
      rendition_id: renditionId,
      rendition_name: renditionName,
      vehicle_model: vehicleModel,
      storage_path: storagePath,
      is_snippet: true,
    });

    if (insertErr) {
      await supabase.storage.from("downloads").remove([storagePath]);
      return new Response(JSON.stringify({ error: `DB insert failed: ${insertErr.message}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, downloadId, storagePath }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

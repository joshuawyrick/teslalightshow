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

const VALID_MODELS = ["model-3", "model-y", "model-s", "model-x", "cybertruck", "other"];
const VALID_OCCASIONS = [
  "general", "birthday", "christmas", "halloween", "fourth-of-july",
  "st-patricks-day", "valentines-day", "new-years", "thanksgiving", "easter",
  "wedding", "anniversary", "graduation", "gender-reveal", "baby-shower",
  "memorial-day", "veterans-day", "mothers-day", "fathers-day", "custom",
];
const VALID_GENRES = [
  "edm", "pop", "rock", "country", "hip-hop", "classical", "dubstep",
  "techno", "trance", "house", "synthwave", "holiday", "soundtrack", "video-game", "other",
];

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
    const { title, vehicleModel, occasion, songTitle, artistName, genre, story, rightsAttested } = body;

    if (!title || typeof title !== "string" || title.trim().length < 2 || title.trim().length > 100) {
      return json({ error: "Title must be 2-100 characters" }, 400);
    }
    if (!vehicleModel || !VALID_MODELS.includes(vehicleModel)) {
      return json({ error: "Invalid vehicle model" }, 400);
    }
    if (occasion && !VALID_OCCASIONS.includes(occasion)) {
      return json({ error: "Invalid occasion" }, 400);
    }
    if (genre && !VALID_GENRES.includes(genre)) {
      return json({ error: "Invalid genre" }, 400);
    }
    if (songTitle && (typeof songTitle !== "string" || songTitle.length > 120)) {
      return json({ error: "Song title must be under 120 characters" }, 400);
    }
    if (artistName && (typeof artistName !== "string" || artistName.length > 120)) {
      return json({ error: "Artist name must be under 120 characters" }, 400);
    }
    if (story && (typeof story !== "string" || story.length > 500)) {
      return json({ error: "Story must be under 500 characters" }, 400);
    }
    if (rightsAttested !== true) {
      return json({ error: "Rights attestation required" }, 400);
    }

    const { data: result, error: rpcErr } = await supabase.rpc("create_gallery_submission", {
      p_user_id: user.id,
      p_title: title.trim(),
      p_vehicle_model: vehicleModel,
      p_occasion: occasion || null,
      p_song_title: songTitle?.trim() || null,
      p_artist_name: artistName?.trim() || null,
      p_genre: genre || null,
      p_story: story?.trim() || null,
      p_rights_attested: true,
    });

    if (rpcErr) return json({ error: rpcErr.message }, 500);

    const parsed = typeof result === "string" ? JSON.parse(result) : result;
    if (!parsed.success) return json({ error: parsed.error }, 400);

    return json({ submissionId: parsed.submissionId });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Webhook-Signature",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < aBuf.length; i++) {
    result |= aBuf[i] ^ bBuf[i];
  }
  return result === 0;
}

async function computeHmacSha256(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const webhookSecret = Deno.env.get("CLOUDFLARE_STREAM_WEBHOOK_SECRET");
  if (!webhookSecret) return json({ error: "Webhook not configured" }, 500);

  try {
    const rawBody = await req.text();
    const sigHeader = req.headers.get("Webhook-Signature") || "";

    // Parse signature header: time=...,sig1=...
    const parts: Record<string, string> = {};
    for (const part of sigHeader.split(",")) {
      const [k, v] = part.split("=", 2);
      if (k && v) parts[k.trim()] = v.trim();
    }

    const timestamp = parts["time"];
    const sig1 = parts["sig1"];

    if (!timestamp || !sig1) {
      return json({ error: "Invalid webhook signature format" }, 401);
    }

    // Reject timestamps older than 5 minutes
    const ts = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(ts) || Math.abs(now - ts) > 300) {
      return json({ error: "Webhook timestamp too old" }, 401);
    }

    // Verify HMAC
    const signedMessage = `${timestamp}.${rawBody}`;
    const expectedSig = await computeHmacSha256(webhookSecret, signedMessage);
    if (!timingSafeEqual(expectedSig, sig1)) {
      return json({ error: "Invalid signature" }, 401);
    }

    // Parse event
    const event = JSON.parse(rawBody);
    const videoUid = event?.uid;
    if (!videoUid) return json({ ok: true, message: "No UID in event" });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find row by cloudflare_video_uid
    const { data: row, error: fetchErr } = await supabase
      .from("gallery_videos")
      .select("id, upload_status, user_id")
      .eq("cloudflare_video_uid", videoUid)
      .maybeSingle();

    if (fetchErr || !row) {
      return json({ ok: true, message: "No matching submission" });
    }

    const readyToStream = event?.readyToStream === true;
    const statusState = event?.status?.state;

    if (readyToStream || statusState === "ready") {
      // Idempotent: if already ready, skip
      if (row.upload_status === "ready") {
        return json({ ok: true, message: "Already ready" });
      }

      const thumbnail = event?.thumbnail
        ? event.thumbnail
        : null;
      const duration = event?.duration ?? null;
      const inputWidth = event?.input?.width ?? null;
      const inputHeight = event?.input?.height ?? null;

      await supabase
        .from("gallery_videos")
        .update({
          upload_status: "ready",
          thumbnail_url: thumbnail,
          duration_seconds: duration,
          input_width: inputWidth,
          input_height: inputHeight,
          processing_error_code: null,
          processing_error_message: null,
        })
        .eq("id", row.id);

      return json({ ok: true, message: "Marked ready" });
    }

    // Handle error state
    if (statusState === "error") {
      if (row.upload_status === "ready") {
        return json({ ok: true, message: "Already ready, ignoring error" });
      }

      const errCode = event?.status?.errorReasonCode || "processing_error";
      const errMsg = (event?.status?.errorReasonText || "Video processing failed").slice(0, 500);

      await supabase
        .from("gallery_videos")
        .update({
          upload_status: "error",
          processing_error_code: errCode,
          processing_error_message: errMsg,
        })
        .eq("id", row.id);

      return json({ ok: true, message: "Marked error" });
    }

    return json({ ok: true, message: "Event acknowledged" });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

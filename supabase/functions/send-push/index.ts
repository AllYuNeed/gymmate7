// Sends a Web Push notification to one or many users using VAPID + web-push (Deno).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import webpush from "https://esm.sh/web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  user_ids?: string[];
  to_all?: boolean;
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:noreply@example.com";

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const payload: PushPayload = await req.json();
    if (!payload.title || !payload.body) {
      return new Response(JSON.stringify({ error: "title and body required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let q = supabase.from("push_subscriptions").select("id, user_id, endpoint, p256dh, auth");
    if (payload.user_ids && payload.user_ids.length > 0) q = q.in("user_id", payload.user_ids);
    const { data: subs, error } = await q;
    if (error) throw error;

    const notif = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url ?? "/",
      icon: payload.icon,
    });

    let sent = 0;
    let failed = 0;
    const stale: string[] = [];
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          notif,
        );
        sent++;
      } catch (e: unknown) {
        failed++;
        const statusCode = typeof e === "object" && e !== null && "statusCode" in e
          ? Number((e as { statusCode: unknown }).statusCode)
          : 0;
        if (statusCode === 404 || statusCode === 410) stale.push(s.id);
      }
    }
    if (stale.length) await supabase.from("push_subscriptions").delete().in("id", stale);

    return new Response(JSON.stringify({ ok: true, sent, failed, removed: stale.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Daily 8pm cron: nudges users with incomplete quests + streak warnings.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = new Date().toISOString().slice(0, 10);

  // Users with at least one incomplete quest today
  const { data: quests } = await supabase
    .from("daily_quests")
    .select("user_id")
    .eq("quest_date", today)
    .eq("completed", false);
  const questUsers = Array.from(new Set((quests ?? []).map((q: { user_id: string }) => q.user_id)));

  // Streak warning: users whose last_workout_date is older than today with streak > 0
  const { data: streakRisk } = await supabase
    .from("heroes")
    .select("user_id")
    .gt("streak_days", 0)
    .or(`last_workout_date.lt.${today},last_workout_date.is.null`);
  const streakUsers = (streakRisk ?? []).map((h: { user_id: string }) => h.user_id);

  const sendUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-push`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
  };

  let questsSent = 0, streakSent = 0;
  if (questUsers.length) {
    const r = await fetch(sendUrl, {
      method: "POST", headers,
      body: JSON.stringify({
        user_ids: questUsers,
        title: "⚔ Trials await, hero",
        body: "Your daily quests remain unfinished. Strike before midnight.",
        url: "/quests",
      }),
    });
    questsSent = (await r.json()).sent ?? 0;
  }
  if (streakUsers.length) {
    const r = await fetch(sendUrl, {
      method: "POST", headers,
      body: JSON.stringify({
        user_ids: streakUsers,
        title: "🔥 Streak in peril",
        body: "Train today or your streak shall fall.",
        url: "/forge",
      }),
    });
    streakSent = (await r.json()).sent ?? 0;
  }

  return new Response(
    JSON.stringify({ ok: true, questsSent, streakSent }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});

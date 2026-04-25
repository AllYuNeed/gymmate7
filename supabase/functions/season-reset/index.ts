// Monthly + weekly season reset. Triggered by pg_cron (or manual call).
// - Resets weekly_xp every Monday 00:00 UTC
// - Resets monthly_xp on the 1st of each month
// - Spawns fresh monthly bosses for users (if missing)
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

  const now = new Date();
  const isFirstOfMonth = now.getUTCDate() === 1;
  const isMonday = now.getUTCDay() === 1;

  // Weekly reset
  let weeklyReset = 0;
  if (isMonday) {
    const { count } = await supabase
      .from("heroes")
      .update({ weekly_xp: 0, weekly_xp_reset_at: now.toISOString() }, { count: "exact" })
      .gt("weekly_xp", 0);
    weeklyReset = count ?? 0;
  }

  // Monthly reset
  let monthlyReset = 0;
  if (isFirstOfMonth) {
    const { count } = await supabase
      .from("heroes")
      .update({ monthly_xp: 0, monthly_xp_reset_at: now.toISOString() }, { count: "exact" })
      .gt("monthly_xp", 0);
    monthlyReset = count ?? 0;
  }

  return new Response(
    JSON.stringify({ ok: true, weeklyReset, monthlyReset, ranAt: now.toISOString() }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});

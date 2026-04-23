// Generates a personalized AI diet plan for the signed-in hero.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: hero } = await supabase.from("heroes").select("*").eq("user_id", user.id).maybeSingle();
    if (!hero) return new Response(JSON.stringify({ error: "Hero not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const systemPrompt = `You are a master nutritionist for a mythic-fantasy fitness RPG. Create a personalized one-day diet plan tailored to the hero's profile. Respond ONLY via the provided tool. Keep meals realistic, varied, and culturally neutral. Calories and macros should match the hero's goal (fat_loss = deficit ~15%, muscle_gain = surplus ~10%, maintenance otherwise). Use grams.`;
    const userPrompt = `Hero profile:
- Class: ${hero.class}
- Goal: ${hero.goal}
- Age: ${hero.age ?? "unknown"}, Gender: ${hero.gender ?? "unknown"}
- Height: ${hero.height_cm ?? "?"}cm, Weight: ${hero.weight_kg ?? "?"}kg
- Body type: ${hero.body_type}
- Experience: ${hero.experience_level}
- Available training days: ${hero.available_days}
- Sleep: ${hero.sleep_quality}, Stress: ${hero.stress_level}
- Injuries: ${(hero.injuries ?? []).join(", ") || "none"}

Create a diet plan with 4-5 meals, with mythic-flavored meal names but real food.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        tools: [{
          type: "function",
          function: {
            name: "create_diet_plan",
            description: "Return a structured one-day diet plan.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                daily_calories: { type: "integer" },
                protein_g: { type: "integer" },
                carbs_g: { type: "integer" },
                fats_g: { type: "integer" },
                meals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      time: { type: "string" },
                      calories: { type: "integer" },
                      protein_g: { type: "integer" },
                      carbs_g: { type: "integer" },
                      fats_g: { type: "integer" },
                      items: { type: "array", items: { type: "string" } },
                    },
                    required: ["name", "time", "calories", "protein_g", "carbs_g", "fats_g", "items"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "summary", "daily_calories", "protein_g", "carbs_g", "fats_g", "meals"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_diet_plan" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded — try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "Lovable AI credits required. Add funds in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await aiRes.text();
      console.error("AI gateway error:", aiRes.status, t);
      throw new Error("AI generation failed");
    }
    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI returned no plan");
    const plan = JSON.parse(toolCall.function.arguments);

    // Mark previous inactive
    await supabase.from("diet_plans").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);
    const { data: inserted, error: insErr } = await supabase.from("diet_plans").insert({
      user_id: user.id,
      title: plan.title,
      summary: plan.summary,
      daily_calories: plan.daily_calories,
      protein_g: plan.protein_g,
      carbs_g: plan.carbs_g,
      fats_g: plan.fats_g,
      meals: plan.meals,
    }).select().single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ ok: true, plan: inserted }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-diet-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

// Generates a personalized AI weekly workout routine for the signed-in hero.
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

    // ✅ FIXED: Use OPENAI_API_KEY instead of LOVABLE_API_KEY
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: hero } = await supabase.from("heroes").select("*").eq("user_id", user.id).maybeSingle();
    if (!hero) return new Response(JSON.stringify({ error: "Hero not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const libraryCatalog = [
      "Flat Barbell Chest Press", "Incline Barbell Chest Press", "Decline Barbell Chest Press", "Close-Grip Chest Press", "Pec Flyes", "Bent Arm Pullover",
      "Front Lat Pulldown", "Behind-the-Neck Lat Pulldown", "T-Bar Row", "Seated Cable Row", "Barbell Row", "One-Arm Dumbbell Row", "Pull-Up", "Deadlift",
      "Barbell Curl", "Dumbbell Curl", "Rope Hammer Curl", "Cable Reverse Curl", "Preacher Curl", "Concentration Curl",
      "Machine Shoulder Press", "Barbell Front Press", "Barbell Behind-the-Neck Press", "Front Raise", "Side Lateral Raise", "3D Delt Raise", "Upright Row", "Barbell Shrugs", "Face Pull",
      "Close-Grip Bench Press", "Rope Pushdown", "Single-Arm Extension", "Overhead Two-Arm Extension", "Reverse-Grip Cable Pushdown", "V-Bar (D-Rod) Pushdown", "Tricep Kickback", "Skull Crusher",
      "Barbell Squat", "Leg Press", "Leg Extension", "Leg Curl", "Walking Lunges", "Standing Calf Raise", "Romanian Deadlift", "Hip Thrust",
      "Flat Crunch", "Flat Leg Raise", "Side Toe Touches", "Flutter Kicks", "Machine Crunch", "Plank", "Russian Twist", "Hanging Knee Raise",
      "Back Extension", "Running (15 min)", "Burpee", "Kettlebell Swing", "Clean and Jerk", "Power Snatch", "Thruster", "Mountain Climbers", "Turkish Get-Up",
    ];

    const systemPrompt = `You are a master strength coach for a mythic-fantasy fitness RPG. Build a weekly workout schedule fully personalized to the hero. Respond ONLY via the provided tool. Use compound lifts as backbone, accessories for weak points, and avoid exercises that aggravate the hero's injuries. Match training days to "available_days". Use evidence-based set/rep schemes. Prefer exact exercise names from the provided Mortal Gyms Exercise Library catalog so users can open demonstrations in the Library. If an injury or equipment limit blocks a movement, choose the closest safer catalog alternative and explain it in notes. Avoid repeating the same exercise pattern excessively across the week.`;
    const userPrompt = `Hero profile:
- Class: ${hero.class}
- Goal: ${hero.goal}
- Experience: ${hero.experience_level}
- Body type: ${hero.body_type}
- Age: ${hero.age ?? "?"}, Gender: ${hero.gender ?? "?"}
- Height: ${hero.height_cm ?? "?"}cm, Weight: ${hero.weight_kg ?? "?"}kg
- Equipment: ${hero.equipment}
- Days/week available: ${hero.available_days}
- Sleep: ${hero.sleep_quality}, Stress: ${hero.stress_level}
- Injuries: ${(hero.injuries ?? []).join(", ") || "none"}
- Mortal Gyms Exercise Library catalog: ${libraryCatalog.join("; ")}

Generate a routine matching ${hero.available_days} training days. Use mon/tue/wed style day labels.`;

    // ✅ FIXED: Call OpenAI API directly instead of ai.gateway.lovable.dev
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost-effective and fast; swap to "gpt-4o" for higher quality
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        tools: [{
          type: "function",
          function: {
            name: "create_routine",
            description: "Return a structured weekly workout routine.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                days_per_week: { type: "integer" },
                schedule: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "string", description: "e.g. Mon, Tue" },
                      focus: { type: "string", description: "e.g. Push, Legs, Full Body" },
                      exercises: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            sets: { type: "integer" },
                            reps: { type: "string", description: "e.g. 6-8 or AMRAP or 45s" },
                            notes: { type: "string" },
                          },
                          required: ["name", "sets", "reps"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["day", "focus", "exercises"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "summary", "days_per_week", "schedule"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_routine" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded — try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "OpenAI credits required. Add funds at platform.openai.com." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await aiRes.text();
      console.error("OpenAI error:", aiRes.status, t);
      throw new Error("AI generation failed");
    }
    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI returned no routine");
    const routine = JSON.parse(toolCall.function.arguments);

    await supabase.from("workout_routines").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);
    const { data: inserted, error: insErr } = await supabase.from("workout_routines").insert({
      user_id: user.id,
      title: routine.title,
      summary: routine.summary,
      source: "ai",
      days_per_week: routine.days_per_week,
      schedule: routine.schedule,
    }).select().single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ ok: true, routine: inserted }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-routine error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

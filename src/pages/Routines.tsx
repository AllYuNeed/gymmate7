import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface DayPlan { day: string; focus: string; exercises: { name: string; sets: number; reps: string; notes?: string }[]; }
interface Routine {
  id: string;
  title: string;
  summary: string | null;
  source: string;
  days_per_week: number;
  schedule: DayPlan[];
  created_at: string;
}

const PRESETS: Record<string, () => Routine> = {
  ppl: () => ({
    id: "preset_ppl", title: "Push / Pull / Legs (Preset)", summary: "A timeless 6-day split for hypertrophy.", source: "preset", days_per_week: 6,
    created_at: new Date().toISOString(),
    schedule: [
      { day: "Mon", focus: "Push", exercises: [{ name: "Bench Press", sets: 4, reps: "6-8" }, { name: "Overhead Press", sets: 3, reps: "8-10" }, { name: "Incline DB Press", sets: 3, reps: "10-12" }, { name: "Lateral Raise", sets: 3, reps: "12-15" }, { name: "Tricep Pushdown", sets: 3, reps: "12-15" }] },
      { day: "Tue", focus: "Pull", exercises: [{ name: "Barbell Row", sets: 4, reps: "6-8" }, { name: "Pull-Up", sets: 3, reps: "AMRAP" }, { name: "Lat Pulldown", sets: 3, reps: "10-12" }, { name: "Barbell Curl", sets: 3, reps: "10-12" }] },
      { day: "Wed", focus: "Legs", exercises: [{ name: "Back Squat", sets: 4, reps: "5-8" }, { name: "Romanian Deadlift", sets: 3, reps: "8-10" }, { name: "Leg Press", sets: 3, reps: "10-12" }, { name: "Calf Raise", sets: 4, reps: "12-15" }] },
      { day: "Thu", focus: "Push", exercises: [{ name: "Overhead Press", sets: 4, reps: "6-8" }, { name: "Incline DB Press", sets: 3, reps: "8-10" }, { name: "Push-Up", sets: 3, reps: "AMRAP" }] },
      { day: "Fri", focus: "Pull", exercises: [{ name: "Deadlift", sets: 3, reps: "5" }, { name: "Lat Pulldown", sets: 3, reps: "10-12" }, { name: "Barbell Curl", sets: 3, reps: "10-12" }] },
      { day: "Sat", focus: "Legs", exercises: [{ name: "Front Squat", sets: 4, reps: "6-8" }, { name: "Leg Curl", sets: 3, reps: "10-12" }, { name: "Hip Thrust", sets: 3, reps: "8-10" }] },
    ],
  }),
  upper_lower: () => ({
    id: "preset_ul", title: "Upper / Lower (Preset)", summary: "Classic 4-day split — efficient and balanced.", source: "preset", days_per_week: 4,
    created_at: new Date().toISOString(),
    schedule: [
      { day: "Mon", focus: "Upper", exercises: [{ name: "Bench Press", sets: 4, reps: "6-8" }, { name: "Barbell Row", sets: 4, reps: "6-8" }, { name: "Overhead Press", sets: 3, reps: "8-10" }, { name: "Lat Pulldown", sets: 3, reps: "10-12" }] },
      { day: "Tue", focus: "Lower", exercises: [{ name: "Back Squat", sets: 4, reps: "5-8" }, { name: "Romanian Deadlift", sets: 3, reps: "8-10" }, { name: "Calf Raise", sets: 4, reps: "12-15" }] },
      { day: "Thu", focus: "Upper", exercises: [{ name: "Incline DB Press", sets: 4, reps: "8-10" }, { name: "Pull-Up", sets: 4, reps: "AMRAP" }, { name: "Lateral Raise", sets: 3, reps: "12-15" }, { name: "Barbell Curl", sets: 3, reps: "10-12" }] },
      { day: "Fri", focus: "Lower", exercises: [{ name: "Deadlift", sets: 3, reps: "5" }, { name: "Leg Press", sets: 3, reps: "10-12" }, { name: "Hip Thrust", sets: 3, reps: "8-10" }] },
    ],
  }),
  full_body: () => ({
    id: "preset_fb", title: "Full Body 3x (Preset)", summary: "Three full-body days — perfect for novices and busy heroes.", source: "preset", days_per_week: 3,
    created_at: new Date().toISOString(),
    schedule: [
      { day: "Mon", focus: "Full A", exercises: [{ name: "Back Squat", sets: 3, reps: "5-8" }, { name: "Bench Press", sets: 3, reps: "6-8" }, { name: "Barbell Row", sets: 3, reps: "6-8" }, { name: "Plank", sets: 3, reps: "45s" }] },
      { day: "Wed", focus: "Full B", exercises: [{ name: "Deadlift", sets: 3, reps: "5" }, { name: "Overhead Press", sets: 3, reps: "8-10" }, { name: "Pull-Up", sets: 3, reps: "AMRAP" }] },
      { day: "Fri", focus: "Full C", exercises: [{ name: "Front Squat", sets: 3, reps: "6-8" }, { name: "Incline DB Press", sets: 3, reps: "8-10" }, { name: "Lat Pulldown", sets: 3, reps: "10-12" }, { name: "Hip Thrust", sets: 3, reps: "8-10" }] },
    ],
  }),
};

const Routines = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data } = await supabase
        .from("workout_routines").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data) setRoutine(data as unknown as Routine);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const generateAi = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-routine");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const { data: fresh } = await supabase
        .from("workout_routines").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (fresh) setRoutine(fresh as unknown as Routine);
      toast.success("AI routine forged!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate routine");
    } finally {
      setGenerating(false);
    }
  };

  const usePreset = async (key: keyof typeof PRESETS) => {
    if (!user) return;
    const r = PRESETS[key]();
    // mark previous inactive
    await supabase.from("workout_routines").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);
    const { data } = await supabase.from("workout_routines").insert([{
      user_id: user.id,
      title: r.title,
      summary: r.summary,
      source: "preset",
      days_per_week: r.days_per_week,
      schedule: r.schedule as unknown as never,
    }]).select().single();
    if (data) setRoutine(data as unknown as Routine);
    toast.success("Preset routine activated!");
  };

  if (loading) return null;

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/70">✠ Training Routines ✠</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-gold sm:text-4xl">{routine?.title ?? "Choose Your Path"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">AI-forged or hand-crafted. Switch any time.</p>
        </div>
      </header>

      <section className="mt-8 panel p-6">
        <p className="font-display text-xs uppercase tracking-widest text-secondary">Forge a New Routine</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button variant="hero" onClick={generateAi} disabled={generating}>
            {generating ? "Summoning..." : "✦ AI Personalized"}
          </Button>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="rune" size="sm" onClick={() => usePreset("ppl")}>PPL 6d</Button>
            <Button variant="rune" size="sm" onClick={() => usePreset("upper_lower")}>U/L 4d</Button>
            <Button variant="rune" size="sm" onClick={() => usePreset("full_body")}>Full 3d</Button>
          </div>
        </div>
        <div className="mt-3">
          <Button variant="rune" className="w-full" onClick={() => navigate("/plan-builder")}>
            ⚒ Build a Custom Plan (Workout & Diet)
          </Button>
        </div>
      </section>

      {!routine && (
        <div className="mt-8 panel p-10 text-center">
          <p className="font-display text-2xl text-gold">No active routine</p>
          <p className="mt-2 text-sm text-muted-foreground">Pick AI or a preset above.</p>
        </div>
      )}

      {routine && (
        <section className="mt-8 space-y-3">
          {routine.summary && <p className="text-sm italic text-muted-foreground">{routine.summary}</p>}
          {routine.schedule.map((d, i) => (
            <div key={i} className="panel p-5">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-base uppercase tracking-wider text-gold">{d.day} · {d.focus}</p>
                <p className="font-display text-xs uppercase tracking-widest text-secondary">{d.exercises.length} moves</p>
              </div>
              <div className="mt-3 space-y-2">
                {d.exercises.map((ex, j) => (
                  <div key={j} className="flex items-center justify-between rounded-md border border-border/60 bg-surface-deep/40 px-3 py-2">
                    <span className="text-sm text-foreground">{ex.name}</span>
                    <span className="font-display text-xs uppercase tracking-widest text-primary/80">{ex.sets} × {ex.reps}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  );
};

export default Routines;

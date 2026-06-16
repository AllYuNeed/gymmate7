import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface DayPlan { day: string; focus: string; exercises: { name: string; sets: number; reps: string; notes?: string }[]; }
interface Routine {
  id: string; title: string; summary: string | null; source: string;
  days_per_week: number; schedule: DayPlan[]; created_at: string;
}
interface AssignedWorkout {
  assignment_id: string; assigned_by_name: string | null; note: string | null;
  plan: { id: string; title: string; summary: string | null; days_per_week: number; schedule: DayPlan[]; };
}

const PRESETS: Record<string, () => Routine> = {
  ppl: () => ({
    id: "preset_ppl", title: "Push / Pull / Legs (Preset)", summary: "A timeless 6-day split for hypertrophy.", source: "preset", days_per_week: 6, created_at: new Date().toISOString(),
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
    id: "preset_ul", title: "Upper / Lower (Preset)", summary: "Classic 4-day split — efficient and balanced.", source: "preset", days_per_week: 4, created_at: new Date().toISOString(),
    schedule: [
      { day: "Mon", focus: "Upper", exercises: [{ name: "Bench Press", sets: 4, reps: "6-8" }, { name: "Barbell Row", sets: 4, reps: "6-8" }, { name: "Overhead Press", sets: 3, reps: "8-10" }, { name: "Lat Pulldown", sets: 3, reps: "10-12" }] },
      { day: "Tue", focus: "Lower", exercises: [{ name: "Back Squat", sets: 4, reps: "5-8" }, { name: "Romanian Deadlift", sets: 3, reps: "8-10" }, { name: "Calf Raise", sets: 4, reps: "12-15" }] },
      { day: "Thu", focus: "Upper", exercises: [{ name: "Incline DB Press", sets: 4, reps: "8-10" }, { name: "Pull-Up", sets: 4, reps: "AMRAP" }, { name: "Lateral Raise", sets: 3, reps: "12-15" }, { name: "Barbell Curl", sets: 3, reps: "10-12" }] },
      { day: "Fri", focus: "Lower", exercises: [{ name: "Deadlift", sets: 3, reps: "5" }, { name: "Leg Press", sets: 3, reps: "10-12" }, { name: "Hip Thrust", sets: 3, reps: "8-10" }] },
    ],
  }),
  full_body: () => ({
    id: "preset_fb", title: "Full Body 3x (Preset)", summary: "Three full-body days — perfect for novices and busy heroes.", source: "preset", days_per_week: 3, created_at: new Date().toISOString(),
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
  const [assignedWorkouts, setAssignedWorkouts] = useState<AssignedWorkout[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [presetLoading, setPresetLoading] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data, error } = await supabase
        .from("workout_routines").select("*").eq("user_id", user.id).eq("is_active", true)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (error) toast.error("Could not load routine: " + error.message);
      if (data) setRoutine(data as unknown as Routine);
      await loadAssigned(user.id);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const loadAssigned = async (uid: string) => {
    const { data: assignments, error } = await supabase
      .from("plan_assignments")
      .select("id, note, assigned_by, workout_plan_id")
      .eq("assigned_to", uid)
      .eq("plan_kind", "workout")
      .not("workout_plan_id", "is", null);
    if (error || !assignments?.length) return;

    const planIds = assignments.map((a) => a.workout_plan_id).filter(Boolean) as string[];
    const assignerIds = [...new Set(assignments.map((a) => a.assigned_by))];
    const [{ data: plans }, { data: assigners }] = await Promise.all([
      supabase.from("custom_workout_plans").select("id, title, summary, days_per_week, schedule").in("id", planIds),
      supabase.from("heroes").select("user_id, hero_name").in("user_id", assignerIds),
    ]);
    const planMap = new Map((plans ?? []).map((p) => [p.id, p]));
    const assignerMap = new Map((assigners ?? []).map((h) => [h.user_id, h.hero_name]));
    setAssignedWorkouts(
      assignments.map((a) => {
        const plan = planMap.get(a.workout_plan_id!);
        if (!plan) return null;
        return { assignment_id: a.id, assigned_by_name: assignerMap.get(a.assigned_by) ?? null, note: a.note ?? null, plan: plan as AssignedWorkout["plan"] };
      }).filter(Boolean) as AssignedWorkout[]
    );
  };

  const generateAi = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-routine");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const { data: fresh } = await supabase.from("workout_routines").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (fresh) setRoutine(fresh as unknown as Routine);
      toast.success("AI routine forged!");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to generate routine"); }
    finally { setGenerating(false); }
  };

  const applyPreset = async (key: keyof typeof PRESETS) => {
    if (!user) return;
    setPresetLoading(key);
    try {
      const r = PRESETS[key]();
      const { error: ue } = await supabase.from("workout_routines").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);
      if (ue) throw ue;
      const { data, error: ie } = await supabase.from("workout_routines").insert([{ user_id: user.id, title: r.title, summary: r.summary, source: "preset", days_per_week: r.days_per_week, schedule: r.schedule as unknown as never }]).select().single();
      if (ie) throw ie;
      if (data) setRoutine(data as unknown as Routine);
      toast.success("Preset routine activated!");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to activate preset"); }
    finally { setPresetLoading(null); }
  };

  const activateAssigned = async (aw: AssignedWorkout) => {
    if (!user) return;
    try {
      await supabase.from("workout_routines").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);
      const { data, error } = await supabase.from("workout_routines").insert([{
        user_id: user.id, title: aw.plan.title, summary: aw.plan.summary,
        source: "assigned", days_per_week: aw.plan.days_per_week, schedule: aw.plan.schedule as unknown as never,
      }]).select().single();
      if (error) throw error;
      if (data) setRoutine(data as unknown as Routine);
      toast.success(`Now following "${aw.plan.title}"`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to activate plan"); }
  };

  if (loading) return null;

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-12">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/70">✠ Training Routines ✠</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-gold sm:text-4xl">{routine?.title ?? "Choose Your Path"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI-forged or hand-crafted. Switch any time.</p>
      </header>

      <section className="mt-8 panel p-6">
        <p className="font-display text-xs uppercase tracking-widest text-secondary">Forge a New Routine</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button variant="hero" onClick={generateAi} disabled={generating || presetLoading !== null}>
            {generating ? "Summoning..." : "✦ AI Personalized"}
          </Button>
          <div className="grid grid-cols-3 gap-2">
            {(["ppl", "upper_lower", "full_body"] as const).map((key) => (
              <Button key={key} variant="rune" size="sm" onClick={() => applyPreset(key)} disabled={presetLoading !== null || generating}>
                {presetLoading === key ? "..." : key === "ppl" ? "PPL 6d" : key === "upper_lower" ? "U/L 4d" : "Full 3d"}
              </Button>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <Button variant="rune" className="w-full" onClick={() => navigate("/plan-builder")}>⚒ Build a Custom Plan (Workout & Diet)</Button>
        </div>
      </section>

      {/* ✅ NEW: Plans assigned to this user by a trainer/admin */}
      {assignedWorkouts.length > 0 && (
        <section className="mt-8">
          <p className="font-display text-xs uppercase tracking-widest text-secondary">⚔ Plans Assigned to You</p>
          <div className="mt-3 space-y-3">
            {assignedWorkouts.map((aw) => (
              <div key={aw.assignment_id} className="panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base uppercase tracking-wider text-gold">{aw.plan.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {aw.plan.days_per_week} days/week · From {aw.assigned_by_name ?? "your trainer"}
                      {aw.note ? <span className="italic"> · "{aw.note}"</span> : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="rune" size="sm" onClick={() => setExpandedId(expandedId === aw.assignment_id ? null : aw.assignment_id)}>
                      {expandedId === aw.assignment_id ? "Hide" : "Preview"}
                    </Button>
                    <Button variant="hero" size="sm" onClick={() => activateAssigned(aw)}>Activate</Button>
                  </div>
                </div>
                {expandedId === aw.assignment_id && (
                  <div className="mt-3 space-y-2">
                    {aw.plan.schedule.map((d, i) => (
                      <div key={i} className="rounded-md border border-border/60 bg-surface-deep/40 px-3 py-2">
                        <p className="font-display text-xs uppercase tracking-wider text-primary">{d.day} · {d.focus}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{d.exercises.map((e) => e.name).join(", ")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {!routine && assignedWorkouts.length === 0 && (
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

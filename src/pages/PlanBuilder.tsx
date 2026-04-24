import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ExerciseEntry { name: string; sets: number; reps: number; rest_sec: number; }
interface DayEntry { day: string; focus: string; exercises: ExerciseEntry[]; }
interface MealEntry { name: string; calories: number; protein_g: number; carbs_g: number; fats_g: number; notes?: string; }

interface WPlan {
  id: string;
  title: string;
  summary: string | null;
  days_per_week: number;
  schedule: DayEntry[];
}
interface DPlan {
  id: string;
  title: string;
  summary: string | null;
  daily_calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  meals: MealEntry[];
}

const PlanBuilder = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"workout" | "diet">("workout");
  const [wPlans, setWPlans] = useState<WPlan[]>([]);
  const [dPlans, setDPlans] = useState<DPlan[]>([]);

  // Workout builder state
  const [wTitle, setWTitle] = useState("");
  const [wSummary, setWSummary] = useState("");
  const [wDays, setWDays] = useState<DayEntry[]>([
    { day: "Day 1", focus: "Upper", exercises: [{ name: "Bench Press", sets: 4, reps: 8, rest_sec: 90 }] },
  ]);

  // Diet builder state
  const [dTitle, setDTitle] = useState("");
  const [dSummary, setDSummary] = useState("");
  const [dCals, setDCals] = useState(2400);
  const [dProtein, setDProtein] = useState(180);
  const [dCarbs, setDCarbs] = useState(260);
  const [dFats, setDFats] = useState(70);
  const [dMeals, setDMeals] = useState<MealEntry[]>([
    { name: "Breakfast", calories: 600, protein_g: 40, carbs_g: 60, fats_g: 18 },
  ]);

  // Assign state
  const [assignTo, setAssignTo] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    void load();
  }, [user, authLoading, navigate]);

  const load = async () => {
    if (!user) return;
    const { data: w } = await supabase
      .from("custom_workout_plans")
      .select("id, title, summary, days_per_week, schedule")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false });
    setWPlans((w ?? []) as unknown as WPlan[]);
    const { data: d } = await supabase
      .from("custom_diet_plans")
      .select("id, title, summary, daily_calories, protein_g, carbs_g, fats_g, meals")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false });
    setDPlans((d ?? []) as unknown as DPlan[]);
  };

  // ---------- Workout helpers ----------
  const addDay = () => setWDays((p) => [...p, { day: `Day ${p.length + 1}`, focus: "Full Body", exercises: [] }]);
  const removeDay = (i: number) => setWDays((p) => p.filter((_, idx) => idx !== i));
  const updateDay = (i: number, patch: Partial<DayEntry>) => setWDays((p) => p.map((d, idx) => idx === i ? { ...d, ...patch } : d));
  const addExercise = (i: number) => updateDay(i, { exercises: [...wDays[i].exercises, { name: "", sets: 3, reps: 10, rest_sec: 60 }] });
  const updateExercise = (di: number, ei: number, patch: Partial<ExerciseEntry>) => {
    const day = wDays[di];
    const exs = day.exercises.map((e, idx) => idx === ei ? { ...e, ...patch } : e);
    updateDay(di, { exercises: exs });
  };
  const removeExercise = (di: number, ei: number) => updateDay(di, { exercises: wDays[di].exercises.filter((_, idx) => idx !== ei) });

  const saveWorkout = async () => {
    if (!user || !wTitle.trim()) { toast.error("Title required"); return; }
    try {
      const { error } = await supabase.from("custom_workout_plans").insert({
        owner_user_id: user.id,
        title: wTitle.trim(),
        summary: wSummary.trim() || null,
        days_per_week: wDays.length,
        schedule: wDays as unknown as never,
      });
      if (error) throw error;
      toast.success("Workout plan saved");
      setWTitle(""); setWSummary("");
      setWDays([{ day: "Day 1", focus: "Upper", exercises: [{ name: "Bench Press", sets: 4, reps: 8, rest_sec: 90 }] }]);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  // ---------- Diet helpers ----------
  const addMeal = () => setDMeals((p) => [...p, { name: `Meal ${p.length + 1}`, calories: 500, protein_g: 30, carbs_g: 50, fats_g: 15 }]);
  const updateMeal = (i: number, patch: Partial<MealEntry>) => setDMeals((p) => p.map((m, idx) => idx === i ? { ...m, ...patch } : m));
  const removeMeal = (i: number) => setDMeals((p) => p.filter((_, idx) => idx !== i));

  const saveDiet = async () => {
    if (!user || !dTitle.trim()) { toast.error("Title required"); return; }
    try {
      const { error } = await supabase.from("custom_diet_plans").insert({
        owner_user_id: user.id,
        title: dTitle.trim(),
        summary: dSummary.trim() || null,
        daily_calories: dCals,
        protein_g: dProtein, carbs_g: dCarbs, fats_g: dFats,
        meals: dMeals as unknown as never,
      });
      if (error) throw error;
      toast.success("Diet plan saved");
      setDTitle(""); setDSummary("");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const assignPlan = async (kind: "workout" | "diet", planId: string) => {
    if (!user) return;
    const handle = assignTo.trim().toLowerCase();
    if (handle.length < 3) { toast.error("Enter a username (min 3 chars)"); return; }
    try {
      const { data: target } = await supabase.from("heroes").select("user_id, hero_name").eq("username", handle).maybeSingle();
      if (!target) { toast.error("No mortal with that username"); return; }
      const payload = {
        plan_kind: kind,
        workout_plan_id: kind === "workout" ? planId : null,
        diet_plan_id: kind === "diet" ? planId : null,
        assigned_by: user.id,
        assigned_to: target.user_id,
      };
      const { error } = await supabase.from("plan_assignments").insert(payload);
      if (error) throw error;
      toast.success(`Assigned to ${target.hero_name}`);
      setAssignTo("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const deletePlan = async (kind: "workout" | "diet", id: string) => {
    const table = kind === "workout" ? "custom_workout_plans" : "custom_diet_plans";
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    await load();
  };

  return (
    <main className="relative mx-auto max-w-4xl px-6 py-12">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/70">◆ Plan Forge ◆</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-gold sm:text-4xl">Custom Workout & Diet Builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">Craft routines, save them, and assign to any mortal by username.</p>
      </header>

      <div className="mt-6 flex gap-2">
        {(["workout", "diet"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md border px-4 py-2 font-display text-xs uppercase tracking-widest transition-all ${
              tab === t ? "border-primary bg-primary/15 text-primary shadow-gold" : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {t === "workout" ? "⚔ Workout" : "❀ Diet"}
          </button>
        ))}
      </div>

      {tab === "workout" && (
        <>
          <section className="mt-6 panel-glow space-y-4 p-6">
            <h2 className="font-display text-sm uppercase tracking-widest text-secondary">Build Workout Plan</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Title</Label>
                <Input value={wTitle} onChange={(e) => setWTitle(e.target.value)} maxLength={80} className="mt-1 bg-surface-deep" placeholder="My Push/Pull/Legs" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Summary</Label>
                <Input value={wSummary} onChange={(e) => setWSummary(e.target.value)} maxLength={140} className="mt-1 bg-surface-deep" placeholder="6-day intermediate split" />
              </div>
            </div>

            {wDays.map((day, di) => (
              <div key={di} className="rounded-md border border-border bg-card/40 p-4">
                <div className="flex items-center gap-2">
                  <Input value={day.day} onChange={(e) => updateDay(di, { day: e.target.value })} className="bg-surface-deep font-display" maxLength={20} />
                  <Input value={day.focus} onChange={(e) => updateDay(di, { focus: e.target.value })} className="bg-surface-deep" placeholder="Focus" maxLength={30} />
                  <Button variant="ghost" size="sm" onClick={() => removeDay(di)}>✕</Button>
                </div>
                <div className="mt-3 space-y-2">
                  {day.exercises.map((ex, ei) => (
                    <div key={ei} className="grid grid-cols-12 gap-2">
                      <Input className="col-span-5 bg-surface-deep" value={ex.name} onChange={(e) => updateExercise(di, ei, { name: e.target.value })} placeholder="Exercise" maxLength={60} />
                      <Input className="col-span-2 bg-surface-deep" type="number" value={ex.sets} onChange={(e) => updateExercise(di, ei, { sets: parseInt(e.target.value || "0", 10) })} placeholder="Sets" />
                      <Input className="col-span-2 bg-surface-deep" type="number" value={ex.reps} onChange={(e) => updateExercise(di, ei, { reps: parseInt(e.target.value || "0", 10) })} placeholder="Reps" />
                      <Input className="col-span-2 bg-surface-deep" type="number" value={ex.rest_sec} onChange={(e) => updateExercise(di, ei, { rest_sec: parseInt(e.target.value || "0", 10) })} placeholder="Rest s" />
                      <Button variant="ghost" size="sm" className="col-span-1" onClick={() => removeExercise(di, ei)}>✕</Button>
                    </div>
                  ))}
                  <Button variant="rune" size="sm" onClick={() => addExercise(di)}>+ Exercise</Button>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button variant="rune" onClick={addDay}>+ Day</Button>
              <Button variant="hero" onClick={saveWorkout} className="flex-1">Save Workout Plan</Button>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-lg uppercase tracking-widest text-foreground">My Workout Plans</h2>
            <div className="mt-4 space-y-3">
              {wPlans.length === 0 && <div className="panel p-6 text-center text-sm text-muted-foreground">No saved plans yet.</div>}
              {wPlans.map((p) => (
                <div key={p.id} className="panel p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-base uppercase tracking-wider text-foreground">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.days_per_week} days · {p.summary}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deletePlan("workout", p.id)}>Delete</Button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input value={assignTo} onChange={(e) => setAssignTo(e.target.value)} placeholder="username to assign" className="bg-surface-deep" maxLength={20} />
                    <Button variant="rune" size="sm" onClick={() => assignPlan("workout", p.id)}>Assign</Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === "diet" && (
        <>
          <section className="mt-6 panel-glow space-y-4 p-6">
            <h2 className="font-display text-sm uppercase tracking-widest text-secondary">Build Diet Plan</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Title</Label>
                <Input value={dTitle} onChange={(e) => setDTitle(e.target.value)} maxLength={80} className="mt-1 bg-surface-deep" placeholder="Lean Bulk 2400" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Summary</Label>
                <Input value={dSummary} onChange={(e) => setDSummary(e.target.value)} maxLength={140} className="mt-1 bg-surface-deep" placeholder="High protein, moderate carbs" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">kcal/day</Label>
                <Input type="number" value={dCals} onChange={(e) => setDCals(parseInt(e.target.value || "0", 10))} className="mt-1 bg-surface-deep" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Protein (g)</Label>
                <Input type="number" value={dProtein} onChange={(e) => setDProtein(parseInt(e.target.value || "0", 10))} className="mt-1 bg-surface-deep" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Carbs (g)</Label>
                <Input type="number" value={dCarbs} onChange={(e) => setDCarbs(parseInt(e.target.value || "0", 10))} className="mt-1 bg-surface-deep" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Fats (g)</Label>
                <Input type="number" value={dFats} onChange={(e) => setDFats(parseInt(e.target.value || "0", 10))} className="mt-1 bg-surface-deep" />
              </div>
            </div>

            <div className="space-y-2">
              {dMeals.map((m, i) => (
                <div key={i} className="rounded-md border border-border bg-card/40 p-3">
                  <div className="grid grid-cols-12 gap-2">
                    <Input className="col-span-4 bg-surface-deep" value={m.name} onChange={(e) => updateMeal(i, { name: e.target.value })} placeholder="Meal" maxLength={40} />
                    <Input className="col-span-2 bg-surface-deep" type="number" value={m.calories} onChange={(e) => updateMeal(i, { calories: parseInt(e.target.value || "0", 10) })} placeholder="kcal" />
                    <Input className="col-span-2 bg-surface-deep" type="number" value={m.protein_g} onChange={(e) => updateMeal(i, { protein_g: parseInt(e.target.value || "0", 10) })} placeholder="P" />
                    <Input className="col-span-2 bg-surface-deep" type="number" value={m.carbs_g} onChange={(e) => updateMeal(i, { carbs_g: parseInt(e.target.value || "0", 10) })} placeholder="C" />
                    <Input className="col-span-1 bg-surface-deep" type="number" value={m.fats_g} onChange={(e) => updateMeal(i, { fats_g: parseInt(e.target.value || "0", 10) })} placeholder="F" />
                    <Button variant="ghost" size="sm" className="col-span-1" onClick={() => removeMeal(i)}>✕</Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="rune" onClick={addMeal}>+ Meal</Button>
              <Button variant="hero" onClick={saveDiet} className="flex-1">Save Diet Plan</Button>
            </div>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-lg uppercase tracking-widest text-foreground">My Diet Plans</h2>
            <div className="mt-4 space-y-3">
              {dPlans.length === 0 && <div className="panel p-6 text-center text-sm text-muted-foreground">No saved plans yet.</div>}
              {dPlans.map((p) => (
                <div key={p.id} className="panel p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-base uppercase tracking-wider text-foreground">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.daily_calories} kcal · P{p.protein_g}/C{p.carbs_g}/F{p.fats_g} · {p.summary}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deletePlan("diet", p.id)}>Delete</Button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input value={assignTo} onChange={(e) => setAssignTo(e.target.value)} placeholder="username to assign" className="bg-surface-deep" maxLength={20} />
                    <Button variant="rune" size="sm" onClick={() => assignPlan("diet", p.id)}>Assign</Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default PlanBuilder;

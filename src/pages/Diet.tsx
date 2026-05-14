import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Meal { name: string; time: string; calories: number; protein_g: number; carbs_g: number; fats_g: number; items: string[]; }
interface DietPlan {
  id: string; title: string; summary: string | null;
  daily_calories: number | null; protein_g: number | null; carbs_g: number | null; fats_g: number | null;
  meals: Meal[]; is_active: boolean; created_at: string;
}

// ✅ NEW: Shape for diet plans assigned to this user
interface AssignedDiet {
  assignment_id: string; assigned_by_name: string | null; note: string | null;
  plan: {
    id: string; title: string; summary: string | null;
    daily_calories: number | null; protein_g: number | null; carbs_g: number | null; fats_g: number | null;
    meals: Meal[];
  };
}

const Diet = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [assignedDiets, setAssignedDiets] = useState<AssignedDiet[]>([]);  // ✅ NEW
  const [expandedId, setExpandedId] = useState<string | null>(null);       // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data, error } = await supabase
        .from("diet_plans").select("*").eq("user_id", user.id).eq("is_active", true)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (error) toast.error("Could not load diet plan: " + error.message);
      if (data) setPlan(data as unknown as DietPlan);

      // ✅ NEW: load assigned diet plans
      await loadAssigned(user.id);

      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  // ✅ NEW: Fetch diet plan_assignments for this user
  const loadAssigned = async (uid: string) => {
    const { data: assignments, error } = await supabase
      .from("plan_assignments")
      .select("id, note, assigned_by, diet_plan_id")
      .eq("assigned_to", uid)
      .eq("plan_kind", "diet")
      .not("diet_plan_id", "is", null);
    if (error || !assignments?.length) return;

    const planIds = assignments.map((a) => a.diet_plan_id).filter(Boolean) as string[];
    const assignerIds = [...new Set(assignments.map((a) => a.assigned_by))];
    const [{ data: plans }, { data: assigners }] = await Promise.all([
      supabase.from("custom_diet_plans").select("id, title, summary, daily_calories, protein_g, carbs_g, fats_g, meals").in("id", planIds),
      supabase.from("heroes").select("user_id, hero_name").in("user_id", assignerIds),
    ]);
    const planMap = new Map((plans ?? []).map((p) => [p.id, p]));
    const assignerMap = new Map((assigners ?? []).map((h) => [h.user_id, h.hero_name]));
    setAssignedDiets(
      assignments.map((a) => {
        const p = planMap.get(a.diet_plan_id!);
        if (!p) return null;
        return { assignment_id: a.id, assigned_by_name: assignerMap.get(a.assigned_by) ?? null, note: a.note ?? null, plan: p as AssignedDiet["plan"] };
      }).filter(Boolean) as AssignedDiet[]
    );
  };

  const generate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-diet-plan");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const { data: fresh } = await supabase
        .from("diet_plans").select("*").eq("user_id", user.id).eq("is_active", true)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (fresh) setPlan(fresh as unknown as DietPlan);
      toast.success("Your diet plan has been forged!");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to generate diet plan"); }
    finally { setGenerating(false); }
  };

  // ✅ NEW: Activate an assigned diet plan by copying it into diet_plans
  const activateAssigned = async (ad: AssignedDiet) => {
    if (!user) return;
    try {
      await supabase.from("diet_plans").update({ is_active: false }).eq("user_id", user.id).eq("is_active", true);
      const { data, error } = await supabase.from("diet_plans").insert([{
        user_id: user.id,
        title: ad.plan.title,
        summary: ad.plan.summary,
        daily_calories: ad.plan.daily_calories,
        protein_g: ad.plan.protein_g,
        carbs_g: ad.plan.carbs_g,
        fats_g: ad.plan.fats_g,
        meals: ad.plan.meals as unknown as never,
        is_active: true,
      }]).select().single();
      if (error) throw error;
      if (data) setPlan(data as unknown as DietPlan);
      toast.success(`Now following "${ad.plan.title}"`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed to activate diet plan"); }
  };

  if (loading) return null;

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/70">❀ Mystic Diet ❀</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-gold sm:text-4xl">{plan ? plan.title : "Your Sacred Provisions"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">AI-forged from your hero's body, goals, and bloodline.</p>
        </div>
        <Button variant="hero" size="sm" onClick={generate} disabled={generating}>
          {generating ? "Forging..." : plan ? "Regenerate" : "Forge Plan"}
        </Button>
      </header>

      {/* ✅ NEW: Assigned diet plans section */}
      {assignedDiets.length > 0 && (
        <section className="mt-8">
          <p className="font-display text-xs uppercase tracking-widest text-secondary">❀ Diet Plans Assigned to You</p>
          <div className="mt-3 space-y-3">
            {assignedDiets.map((ad) => (
              <div key={ad.assignment_id} className="panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base uppercase tracking-wider text-gold">{ad.plan.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ad.plan.daily_calories ?? "?"}kcal · From {ad.assigned_by_name ?? "your trainer"}
                      {ad.note ? <span className="italic"> · "{ad.note}"</span> : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="rune" size="sm" onClick={() => setExpandedId(expandedId === ad.assignment_id ? null : ad.assignment_id)}>
                      {expandedId === ad.assignment_id ? "Hide" : "Preview"}
                    </Button>
                    <Button variant="hero" size="sm" onClick={() => activateAssigned(ad)}>Activate</Button>
                  </div>
                </div>
                {expandedId === ad.assignment_id && (
                  <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-4 gap-2">
                      {[["Kcal", ad.plan.daily_calories], ["Protein", `${ad.plan.protein_g}g`], ["Carbs", `${ad.plan.carbs_g}g`], ["Fats", `${ad.plan.fats_g}g`]].map(([l, v]) => (
                        <div key={l as string} className="rounded-md border border-border bg-surface-deep/60 p-2 text-center">
                          <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">{l}</p>
                          <p className="mt-0.5 font-display text-sm font-bold text-foreground">{v}</p>
                        </div>
                      ))}
                    </div>
                    {(ad.plan.meals as Meal[]).map((m, i) => (
                      <div key={i} className="rounded-md border border-border/60 bg-surface-deep/40 px-3 py-2">
                        <p className="font-display text-xs uppercase tracking-wider text-primary">{m.name}{m.time ? ` · ${m.time}` : ""}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{m.items?.join(", ")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {!plan && assignedDiets.length === 0 && (
        <div className="mt-10 panel p-10 text-center">
          <p className="font-display text-2xl text-gold">No plan yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Tap "Forge Plan" — the runes will craft a personalized diet for your hero.</p>
        </div>
      )}

      {plan && (
        <>
          <section className="mt-8 panel-glow p-6">
            <p className="text-sm italic text-muted-foreground">{plan.summary}</p>
            <div className="mt-5 grid grid-cols-4 gap-3">
              <Macro label="Kcal" value={plan.daily_calories ?? 0} />
              <Macro label="Protein" value={`${plan.protein_g}g`} />
              <Macro label="Carbs" value={`${plan.carbs_g}g`} />
              <Macro label="Fats" value={`${plan.fats_g}g`} />
            </div>
          </section>
          <section className="mt-8 space-y-3">
            <h2 className="font-display text-lg uppercase tracking-widest text-foreground">Today's Feast</h2>
            {plan.meals.map((m, i) => (
              <div key={i} className="panel p-5">
                <div className="flex items-baseline justify-between">
                  <p className="font-display text-base uppercase tracking-wider text-gold">{m.name}</p>
                  <p className="font-display text-xs uppercase tracking-widest text-secondary">{m.time}</p>
                </div>
                <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                  {m.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Pill>{m.calories} kcal</Pill><Pill>P {m.protein_g}g</Pill>
                  <Pill>C {m.carbs_g}g</Pill><Pill>F {m.fats_g}g</Pill>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
};

const Macro = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-md border border-border bg-surface-deep/60 p-3 text-center">
    <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
    <p className="mt-1 font-display text-lg font-bold text-foreground">{value}</p>
  </div>
);
const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-border-bright/40 bg-surface-raised/60 px-2.5 py-0.5 font-display uppercase tracking-widest text-primary/80">{children}</span>
);

export default Diet;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Meal { name: string; time: string; calories: number; protein_g: number; carbs_g: number; fats_g: number; items: string[]; }
interface DietPlan {
  id: string;
  title: string;
  summary: string | null;
  daily_calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  meals: Meal[];
  is_active: boolean;
  created_at: string;
}

const Diet = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data } = await supabase
        .from("diet_plans").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data) setPlan(data as unknown as DietPlan);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const generate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-diet-plan");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      // refetch
      const { data: fresh } = await supabase
        .from("diet_plans").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (fresh) setPlan(fresh as unknown as DietPlan);
      toast.success("Your diet plan has been forged!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate diet plan");
    } finally {
      setGenerating(false);
    }
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

      {!plan && (
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
                  <Pill>{m.calories} kcal</Pill>
                  <Pill>P {m.protein_g}g</Pill>
                  <Pill>C {m.carbs_g}g</Pill>
                  <Pill>F {m.fats_g}g</Pill>
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

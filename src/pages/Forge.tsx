import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EXERCISES, MUSCLE_BY_ID } from "@/data/muscles";
import { setXp } from "@/lib/xp";
import { toast } from "sonner";

interface RecentLog {
  id: string;
  exercise: string;
  reps: number;
  sets: number;
  weight_kg: number;
  xp_earned: number;
  created_at: string;
}

const Forge = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [exerciseId, setExerciseId] = useState(EXERCISES[0].id);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(10);
  const [weight, setWeight] = useState(40);
  const [recent, setRecent] = useState<RecentLog[]>([]);
  const [busy, setBusy] = useState(false);

  const exercise = useMemo(() => EXERCISES.find((e) => e.id === exerciseId)!, [exerciseId]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data: hero } = await supabase.from("heroes").select("units").eq("user_id", user.id).maybeSingle();
      if (!hero) { navigate("/awaken"); return; }
      setUnits((hero.units as "metric" | "imperial") ?? "metric");
      const { data: logs } = await supabase
        .from("workout_logs")
        .select("id, exercise, reps, sets, weight_kg, xp_earned, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setRecent((logs ?? []) as RecentLog[]);
    })();
  }, [user, authLoading, navigate]);

  const weightKg = units === "metric" ? weight : Math.round((weight / 2.20462) * 10) / 10;
  const xpPerSet = setXp(reps, weightKg, exercise.intensity);
  const totalXp = xpPerSet * sets;

  const logWorkout = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const { data: log, error: logErr } = await supabase
        .from("workout_logs")
        .insert({
          user_id: user.id,
          exercise: exercise.name,
          muscles: exercise.muscles,
          sets,
          reps,
          weight_kg: weightKg,
          intensity: exercise.intensity,
          xp_earned: totalXp,
        })
        .select()
        .single();
      if (logErr) throw logErr;

      // Update hero XP and coins
      const { data: hero } = await supabase.from("heroes").select("xp, level, coins, streak_days").eq("user_id", user.id).single();
      if (hero) {
        const newXp = (hero.xp ?? 0) + totalXp;
        const newCoins = (hero.coins ?? 0) + Math.round(totalXp / 5);
        // simple level-up
        const xpForLvl = (l: number) => Math.floor(100 * Math.pow(l, 1.5));
        let level = hero.level ?? 1;
        let consumed = 0;
        while (newXp - consumed >= xpForLvl(level + 1)) { consumed += xpForLvl(level + 1); level++; }
        await supabase.from("heroes").update({ xp: newXp, level, coins: newCoins }).eq("user_id", user.id);
        if (level > (hero.level ?? 1)) toast.success(`✦ LEVEL UP! Lv ${level}`, { duration: 4000 });
      }

      // Distribute muscle XP
      const perMuscle = Math.max(1, Math.round(totalXp / exercise.muscles.length));
      for (const muscleId of exercise.muscles) {
        const { data: realm } = await supabase
          .from("muscle_realms")
          .select("id, xp, rank")
          .eq("user_id", user.id)
          .eq("muscle", muscleId)
          .maybeSingle();
        if (realm) {
          const nx = realm.xp + perMuscle;
          // rank ~ floor(sqrt(xp/50)) + 1
          const newRank = Math.max(realm.rank, Math.floor(Math.sqrt(nx / 50)) + 1);
          await supabase.from("muscle_realms").update({ xp: nx, rank: newRank }).eq("id", realm.id);
        } else {
          await supabase.from("muscle_realms").insert({ user_id: user.id, muscle: muscleId, xp: perMuscle, rank: 1 });
        }
      }

      // Quest progress: any "log_workout" type
      const today = new Date().toISOString().slice(0, 10);
      const { data: quests } = await supabase
        .from("daily_quests")
        .select("id, type, target, progress, completed, xp_reward, coin_reward")
        .eq("user_id", user.id)
        .eq("quest_date", today)
        .eq("completed", false);
      for (const q of quests ?? []) {
        if (q.type === "log_sets") {
          const np = q.progress + sets;
          const done = np >= q.target;
          await supabase.from("daily_quests").update({ progress: np, completed: done }).eq("id", q.id);
        }
        if (q.type === "log_workout") {
          const np = q.progress + 1;
          const done = np >= q.target;
          await supabase.from("daily_quests").update({ progress: np, completed: done }).eq("id", q.id);
        }
      }

      // Boss damage
      const monthKey = new Date().toISOString().slice(0, 7);
      const { data: boss } = await supabase
        .from("boss_battles")
        .select("id, current_hp, status")
        .eq("user_id", user.id)
        .eq("month_key", monthKey)
        .eq("status", "active")
        .maybeSingle();
      if (boss) {
        const dmg = Math.round(totalXp * 1.2);
        const newHp = Math.max(0, boss.current_hp - dmg);
        await supabase.from("boss_battles").update({
          current_hp: newHp,
          status: newHp === 0 ? "defeated" : "active",
          defeated_at: newHp === 0 ? new Date().toISOString() : null,
        }).eq("id", boss.id);
        toast.success(`⚔ Dealt ${dmg} damage to the Boss!`);
      }

      toast.success(`+${totalXp} XP earned!`);
      setRecent((r) => [log as RecentLog, ...r].slice(0, 10));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to log workout");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-12">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/70">◆ The Forge ◆</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-gold sm:text-4xl">Log a Workout</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every rep is a rune. Every set, a step toward legend.</p>
      </header>

      <section className="mt-8 panel-glow p-6 space-y-5">
        <div>
          <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Exercise</Label>
          <select
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value)}
            className="mt-2 w-full rounded-md border border-input bg-surface-deep px-3 py-2.5 font-display text-base tracking-wider text-foreground outline-none focus:border-primary"
          >
            {EXERCISES.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
          <p className="mt-2 text-xs text-muted-foreground">
            Targets:{" "}
            {exercise.muscles.map((m, i) => (
              <span key={m} className="text-primary/80">
                {i > 0 ? " · " : ""}{MUSCLE_BY_ID[m]?.name ?? m}
              </span>
            ))}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Sets</Label>
            <Input type="number" min={1} max={20} value={sets} onChange={(e) => setSets(parseInt(e.target.value || "0", 10))} className="mt-1 bg-surface-deep font-display text-lg" />
          </div>
          <div>
            <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Reps</Label>
            <Input type="number" min={1} max={100} value={reps} onChange={(e) => setReps(parseInt(e.target.value || "0", 10))} className="mt-1 bg-surface-deep font-display text-lg" />
          </div>
          <div>
            <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">
              Weight ({units === "metric" ? "kg" : "lb"})
            </Label>
            <Input type="number" min={0} max={1000} value={weight} onChange={(e) => setWeight(parseFloat(e.target.value || "0"))} className="mt-1 bg-surface-deep font-display text-lg" />
          </div>
        </div>

        <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-center">
          <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Estimated reward</p>
          <p className="mt-1 font-display text-3xl font-bold text-gold">+{totalXp} XP</p>
          <p className="text-xs text-muted-foreground">{xpPerSet} XP × {sets} sets</p>
        </div>

        <Button variant="hero" size="lg" className="w-full" onClick={logWorkout} disabled={busy}>
          {busy ? "Inscribing..." : "⚔ Log Set"}
        </Button>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg uppercase tracking-widest text-foreground">Recent Battles</h2>
        <div className="mt-4 space-y-2">
          {recent.length === 0 && (
            <div className="panel p-6 text-center text-sm text-muted-foreground">No workouts logged yet — strike the first rune.</div>
          )}
          {recent.map((r) => (
            <div key={r.id} className="panel flex items-center justify-between p-4">
              <div>
                <p className="font-display text-sm uppercase tracking-wider text-foreground">{r.exercise}</p>
                <p className="text-xs text-muted-foreground">{r.sets} × {r.reps} @ {r.weight_kg} kg</p>
              </div>
              <div className="font-display text-lg text-primary">+{r.xp_earned}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Forge;

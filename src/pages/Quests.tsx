import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Quest {
  id: string;
  title: string;
  description: string | null;
  type: string;
  target: number;
  progress: number;
  xp_reward: number;
  coin_reward: number;
  completed: boolean;
}

const QUEST_POOL: Omit<Quest, "id" | "progress" | "completed">[] = [
  { title: "Forge of First Light", description: "Complete any workout today.", type: "log_workout", target: 1, xp_reward: 60, coin_reward: 15 },
  { title: "Iron Trinity", description: "Finish 3 workouts in any form.", type: "log_workout", target: 3, xp_reward: 120, coin_reward: 30 },
  { title: "Twelve Trials of Steel", description: "Complete 12 sets across the day.", type: "log_sets", target: 12, xp_reward: 100, coin_reward: 25 },
  { title: "Ascendant's Volume", description: "Push through 25 sets total.", type: "log_sets", target: 25, xp_reward: 220, coin_reward: 50 },
  { title: "Whisper of the Mountain", description: "Move your body — even one set counts.", type: "log_sets", target: 5, xp_reward: 50, coin_reward: 10 },
];

const todayKey = () => new Date().toISOString().slice(0, 10);

const Quests = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  const ensureToday = async (uid: string) => {
    const today = todayKey();
    const { data: existing } = await supabase
      .from("daily_quests").select("*").eq("user_id", uid).eq("quest_date", today);
    if (existing && existing.length > 0) return existing as Quest[];
    // generate 3 random quests
    const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    const rows = shuffled.map((q) => ({ ...q, user_id: uid, quest_date: today, progress: 0, completed: false }));
    const { data: inserted } = await supabase.from("daily_quests").insert(rows).select();
    return (inserted ?? []) as Quest[];
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const list = await ensureToday(user.id);
      setQuests(list);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const claim = async (q: Quest) => {
    if (!user || !q.completed) return;
    // mark claimed by deletion-from-list (we record a `claimed` via type swap or just remove from screen)
    // We'll set progress to 9999 to mark claimed, then award XP+coins
    const { data: hero } = await supabase.from("heroes").select("xp, level, coins").eq("user_id", user.id).single();
    if (hero) {
      const newXp = (hero.xp ?? 0) + q.xp_reward;
      const xpForLvl = (l: number) => Math.floor(100 * Math.pow(l, 1.5));
      let level = hero.level ?? 1; let consumed = 0;
      while (newXp - consumed >= xpForLvl(level + 1)) { consumed += xpForLvl(level + 1); level++; }
      await supabase.from("heroes").update({
        xp: newXp,
        level,
        coins: (hero.coins ?? 0) + q.coin_reward,
      }).eq("user_id", user.id);
    }
    await supabase.from("daily_quests").update({ progress: 99999 }).eq("id", q.id);
    setQuests((qs) => qs.filter((x) => x.id !== q.id));
    toast.success(`Quest claimed! +${q.xp_reward} XP, +${q.coin_reward} coins`);
  };

  if (loading) return null;

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-12">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/70">✦ Daily Quests ✦</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-gold sm:text-4xl">The Day's Trials</h1>
        <p className="mt-1 text-sm text-muted-foreground">Complete each quest before midnight to claim its bounty.</p>
      </header>

      <section className="mt-8 space-y-3">
        {quests.length === 0 && (
          <div className="panel p-8 text-center text-muted-foreground">All trials claimed. Return tomorrow.</div>
        )}
        {quests.map((q) => {
          const pct = Math.min(100, (q.progress / q.target) * 100);
          return (
            <div key={q.id} className={`panel p-5 transition-all ${q.completed ? "shadow-gold border-primary/60" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-display text-base uppercase tracking-wider text-gold">{q.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{q.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-xs uppercase tracking-widest text-secondary">+{q.xp_reward} XP</p>
                  <p className="font-display text-xs uppercase tracking-widest text-primary">+{q.coin_reward} ✪</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-deep ring-1 ring-border">
                <div className="h-full rounded-full bg-gradient-xp transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">{Math.min(q.progress, q.target)} / {q.target}</span>
                {q.completed ? (
                  <Button variant="hero" size="sm" onClick={() => claim(q)}>Claim Reward ✦</Button>
                ) : (
                  <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">In progress</span>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
};

export default Quests;

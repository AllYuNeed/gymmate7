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
  { title: "Forge of First Light",    description: "Complete any workout today.",           type: "log_workout", target: 1,  xp_reward: 60,  coin_reward: 15 },
  { title: "Iron Trinity",            description: "Finish 3 workouts in any form.",        type: "log_workout", target: 3,  xp_reward: 120, coin_reward: 30 },
  { title: "Twelve Trials of Steel",  description: "Complete 12 sets across the day.",      type: "log_sets",    target: 12, xp_reward: 100, coin_reward: 25 },
  { title: "Ascendant's Volume",      description: "Push through 25 sets total.",           type: "log_sets",    target: 25, xp_reward: 220, coin_reward: 50 },
  { title: "Whisper of the Mountain", description: "Move your body — even one set counts.", type: "log_sets",    target: 5,  xp_reward: 50,  coin_reward: 10 },
];

const todayKey = () => new Date().toISOString().slice(0, 10);

const Quests = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  // ─── Load / generate today's quests ──────────────────────────────────────
  const ensureToday = async (uid: string) => {
    const today = todayKey();
    const { data: existing, error: fetchErr } = await supabase
      .from("daily_quests")
      .select("*")
      .eq("user_id", uid)
      .eq("quest_date", today);

    if (fetchErr) {
      toast.error("Could not load quests: " + fetchErr.message);
      return [];
    }

    // ✅ FIX: Only filter out rows where reward was already claimed (completed = true).
    // Rows where progress >= target but completed = false are "done, awaiting claim" — keep them.
    const unclaimed = (existing ?? []).filter((q) => !q.completed) as Quest[];

    if ((existing ?? []).length > 0) return unclaimed;

    // No quests yet for today — generate 3
    const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    const rows = shuffled.map((q) => ({
      ...q,
      user_id: uid,
      quest_date: today,
      progress: 0,
      completed: false,
    }));

    const { data: inserted, error: insertErr } = await supabase
      .from("daily_quests").insert(rows).select();

    if (insertErr) {
      toast.error("Could not create quests: " + insertErr.message);
      return [];
    }
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

  // ✅ NEW: Realtime subscription — progress updates from Forge show live
  useEffect(() => {
    if (!user) return;
    const today = todayKey();
    const channel = supabase
      .channel("quest-progress")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "daily_quests",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as Quest;
          // Only update quests for today and not yet claimed
          if (updated.quest_date !== today) return;
          if (updated.completed) {
            // Reward was claimed elsewhere (e.g. another tab) — remove from list
            setQuests((qs) => qs.filter((q) => q.id !== updated.id));
          } else {
            // Progress updated — refresh the quest in local state
            setQuests((qs) =>
              qs.map((q) => (q.id === updated.id ? { ...q, ...updated } : q))
            );
          }
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [user]);

  // ─── Claim reward ─────────────────────────────────────────────────────────
  const claim = async (q: Quest) => {
    if (!user) return;

    // ✅ FIX: Claim when progress >= target, not when completed === true
    if (q.progress < q.target) return;

    setClaiming(q.id);
    try {
      // Give XP and coins to hero
      const { data: hero } = await supabase
        .from("heroes").select("xp, level, coins").eq("user_id", user.id).single();

      if (hero) {
        const newXp = (hero.xp ?? 0) + q.xp_reward;
        const xpForLvl = (l: number) => Math.floor(100 * Math.pow(l, 1.5));
        let level = hero.level ?? 1;
        let consumed = 0;
        while (newXp - consumed >= xpForLvl(level + 1)) {
          consumed += xpForLvl(level + 1);
          level++;
        }
        const { error: heroErr } = await supabase.from("heroes").update({
          xp: newXp,
          level,
          coins: (hero.coins ?? 0) + q.coin_reward,
        }).eq("user_id", user.id);
        if (heroErr) throw heroErr;
        if (level > (hero.level ?? 1)) {
          toast.success(`✦ LEVEL UP! Lv ${level}`, { duration: 4000 });
        }
      }

      // ✅ FIX: Set completed = true NOW (only here, not in Forge.tsx)
      // This marks "reward claimed" — quest will be filtered out on next load
      const { error: updateErr } = await supabase
        .from("daily_quests")
        .update({ completed: true, progress: q.target })
        .eq("id", q.id);
      if (updateErr) throw updateErr;

      // Remove from local state immediately
      setQuests((qs) => qs.filter((x) => x.id !== q.id));
      toast.success(`+${q.xp_reward} XP · +${q.coin_reward} ✪ claimed!`);
    } catch (e) {
      const msg = typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e);
      toast.error(msg);
    } finally {
      setClaiming(null);
    }
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
          <div className="panel p-8 text-center text-muted-foreground">
            All trials claimed. Return tomorrow.
          </div>
        )}

        {quests.map((q) => {
          // ✅ FIX: "done" is based on progress vs target, not the completed flag
          const done = q.progress >= q.target;
          const pct  = Math.min(100, (q.progress / q.target) * 100);

          return (
            <div
              key={q.id}
              className={`panel p-5 transition-all ${done ? "shadow-gold border-primary/60" : ""}`}
            >
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

              {/* Progress bar */}
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-deep ring-1 ring-border">
                <div
                  className="h-full rounded-full bg-gradient-xp transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                  {Math.min(q.progress, q.target)} / {q.target}
                </span>
                {/* ✅ FIX: Show "Claim Reward" when progress >= target */}
                {done ? (
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => claim(q)}
                    disabled={claiming === q.id}
                  >
                    {claiming === q.id ? "Claiming..." : "Claim Reward ✦"}
                  </Button>
                ) : (
                  <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                    In progress
                  </span>
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

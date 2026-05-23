import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { monthKeyIST } from "@/lib/ist";

interface Boss {
  id: string;
  boss_name: string;
  boss_lore: string | null;
  boss_sigil: string;
  max_hp: number;
  current_hp: number;
  status: string;
  loot: string[];
  defeated_at: string | null;
}

const BOSSES = [
  { name: "Vorgath, Tyrant of Stagnation", sigil: "☠", lore: "He feeds on those who rest too long. Strike, or be devoured.", loot: ["Crown of Discipline", "Sigil of Iron Will", "+500 coins"] },
  { name: "Nyxara, Queen of Shadows", sigil: "✠", lore: "Born of doubt, she crumbles before the steady hand.", loot: ["Cloak of Resolve", "Phantom Pendant", "+750 coins"] },
  { name: "Mor'thul the Devourer", sigil: "❂", lore: "Ancient and ravenous — only legends slay him.", loot: ["Devourer's Tooth", "Heart of Flame", "+1000 coins"] },
  { name: "Khorath, the Iron Monarch", sigil: "⚔", lore: "Forged from a thousand failed lifters. He waits.", loot: ["Monarch's Gauntlet", "Crown Shard", "+850 coins"] },
];

const BossPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [boss, setBoss] = useState<Boss | null>(null);
  const [loading, setLoading] = useState(true);

  const monthKey = monthKeyIST();

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data: hero } = await supabase.from("heroes").select("level").eq("user_id", user.id).maybeSingle();
      if (!hero) { navigate("/awaken"); return; }

      const { data: existing } = await supabase
        .from("boss_battles").select("*").eq("user_id", user.id).eq("month_key", monthKey).maybeSingle();
      if (existing) { setBoss(existing as Boss); setLoading(false); return; }

      // Spawn new boss for the month
      const pick = BOSSES[Math.floor(Math.random() * BOSSES.length)];
      const maxHp = 5000 + (hero.level ?? 1) * 1500;
      const { data: created } = await supabase.from("boss_battles").insert({
        user_id: user.id,
        boss_name: pick.name,
        boss_lore: pick.lore,
        boss_sigil: pick.sigil,
        max_hp: maxHp,
        current_hp: maxHp,
        month_key: monthKey,
        loot: pick.loot,
      }).select().single();
      setBoss(created as Boss);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  if (loading || !boss) return null;

  const pct = Math.max(0, (boss.current_hp / boss.max_hp) * 100);
  const defeated = boss.status === "defeated";

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-12">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-destructive/80">☠ Monthly Boss ☠</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-gold sm:text-4xl">The Reckoning</h1>
        <p className="mt-1 text-sm text-muted-foreground">Slay the boss before the month's end. Every workout is a strike.</p>
      </header>

      <section className="mt-8 panel-glow p-8 text-center">
        <div
          className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-2 border-destructive/60 bg-destructive/10 font-display text-7xl text-destructive"
          style={{ textShadow: "0 0 24px hsl(0 75% 55% / 0.7)", animation: "pulse-gold 2s infinite" }}
        >
          {boss.boss_sigil}
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold text-foreground sm:text-3xl">{boss.boss_name}</h2>
        <p className="mt-2 italic text-muted-foreground">"{boss.boss_lore}"</p>

        <div className="mt-6">
          <div className="mb-2 flex justify-between font-display text-xs uppercase tracking-widest text-muted-foreground">
            <span>HP</span>
            <span>{boss.current_hp.toLocaleString()} / {boss.max_hp.toLocaleString()}</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-surface-deep ring-1 ring-border">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, hsl(0 75% 50%), hsl(15 85% 55%))",
                boxShadow: "0 0 12px hsl(0 75% 55% / 0.6)",
              }}
            />
          </div>
        </div>

        {defeated ? (
          <div className="mt-6 rounded-md border border-primary/50 bg-primary/10 p-4">
            <p className="font-display text-lg uppercase tracking-widest text-gold">⚔ DEFEATED ⚔</p>
            <p className="mt-1 text-xs text-muted-foreground">A new boss will rise next month.</p>
          </div>
        ) : (
          <div className="mt-6 text-xs text-muted-foreground">Strike the boss by logging workouts in the Forge.</div>
        )}

        <div className="mt-6">
          <p className="font-display text-xs uppercase tracking-widest text-secondary">Reward Hoard</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {boss.loot.map((l, i) => (
              <span key={i} className={`rounded-full border px-3 py-1 font-display text-xs uppercase tracking-widest ${defeated ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>
                {l}
              </span>
            ))}
          </div>
        </div>

        <Button variant="ghost" className="mt-8" onClick={() => navigate("/forge")}>To the Forge ⚔</Button>
      </section>
    </main>
  );
};

export default BossPage;

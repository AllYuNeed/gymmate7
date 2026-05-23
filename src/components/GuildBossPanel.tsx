import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { monthKeyIST } from "@/lib/ist";
import { toast } from "sonner";

interface GuildBoss {
  id: string;
  guild_id: string;
  boss_name: string;
  boss_lore: string | null;
  boss_sigil: string;
  max_hp: number;
  current_hp: number;
  status: string;
  loot: string[];
}

interface DamageEntry {
  user_id: string;
  damage: number;
  hero_name?: string;
}

const BOSSES = [
  { name: "Krael, Warden of Ashes", sigil: "☠", lore: "He hoards the embers of those who quit.", loot: ["Guild Crest of Embers", "+200 coins each"] },
  { name: "Vyrsynth, the Hollow Choir", sigil: "✠", lore: "A chorus of the unmotivated. Silence them.", loot: ["Choirbreaker Sigil", "+250 coins each"] },
  { name: "Mor'doloth, Iron Sovereign", sigil: "⚔", lore: "Forged from a thousand abandoned routines.", loot: ["Sovereign's Mark", "+300 coins each"] },
];

export function GuildBossPanel({
  guildId,
  isLeader,
  isMember,
  memberCount,
}: {
  guildId: string;
  isLeader: boolean;
  isMember: boolean;
  memberCount: number;
}) {
  const [boss, setBoss] = useState<GuildBoss | null>(null);
  const [damage, setDamage] = useState<DamageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const monthKey = monthKeyIST();

  useEffect(() => {
    void load();
    // realtime HP updates
    const channel = supabase
      .channel(`guild-boss-${guildId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "guild_bosses", filter: `guild_id=eq.${guildId}` },
        (payload) => {
          if (payload.eventType === "DELETE") setBoss(null);
          else setBoss(payload.new as GuildBoss);
        })
      .on("postgres_changes", { event: "*", schema: "public", table: "guild_boss_damage" },
        () => { void loadDamage(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guildId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("guild_bosses")
      .select("*")
      .eq("guild_id", guildId)
      .eq("month_key", monthKey)
      .maybeSingle();
    setBoss((data as GuildBoss) ?? null);
    if (data) await loadDamage(data.id);
    setLoading(false);
  };

  const loadDamage = async (bossId?: string) => {
    const id = bossId ?? boss?.id;
    if (!id) return;
    const { data } = await supabase
      .from("guild_boss_damage")
      .select("user_id, damage")
      .eq("guild_boss_id", id)
      .order("damage", { ascending: false })
      .limit(10);
    const userIds = (data ?? []).map((d) => d.user_id);
    let map = new Map<string, string>();
    if (userIds.length) {
      const { data: heroes } = await supabase.from("heroes").select("user_id, hero_name").in("user_id", userIds);
      map = new Map((heroes ?? []).map((h) => [h.user_id, h.hero_name]));
    }
    setDamage((data ?? []).map((d) => ({ ...d, hero_name: map.get(d.user_id) })));
  };

  const spawn = async () => {
    if (!isLeader) return;
    setBusy(true);
    try {
      const pick = BOSSES[Math.floor(Math.random() * BOSSES.length)];
      const maxHp = 25000 + memberCount * 8000;
      const { data, error } = await supabase.from("guild_bosses").insert({
        guild_id: guildId,
        boss_name: pick.name,
        boss_lore: pick.lore,
        boss_sigil: pick.sigil,
        max_hp: maxHp,
        current_hp: maxHp,
        month_key: monthKey,
        loot: pick.loot,
      }).select().single();
      if (error) throw error;
      setBoss(data as GuildBoss);
      toast.success("⚔ Guild boss summoned!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to spawn boss");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  if (!boss) {
    return (
      <section className="mt-8 panel-glow p-6 text-center">
        <p className="font-display text-xs uppercase tracking-[0.4em] text-destructive/70">☠ Guild Boss ☠</p>
        <h2 className="mt-2 font-display text-xl font-bold text-gold">No boss this month</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLeader ? "Summon a boss for your guild to slay together." : "Awaiting the leader to summon a boss."}
        </p>
        {isLeader && (
          <Button variant="hero" className="mt-4" onClick={spawn} disabled={busy}>
            {busy ? "Summoning..." : "⚔ Summon Boss"}
          </Button>
        )}
      </section>
    );
  }

  const pct = Math.max(0, (boss.current_hp / boss.max_hp) * 100);
  const defeated = boss.status === "defeated";

  return (
    <section className="mt-8 panel-glow p-6">
      <div className="flex items-center gap-4">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-destructive/60 bg-destructive/10 font-display text-5xl text-destructive"
          style={{ textShadow: "0 0 20px hsl(0 75% 55% / 0.7)" }}
        >
          {boss.boss_sigil}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[10px] uppercase tracking-[0.4em] text-destructive/70">Guild Boss</p>
          <h2 className="truncate font-display text-xl font-bold text-foreground">{boss.boss_name}</h2>
          {boss.boss_lore && <p className="text-xs italic text-muted-foreground">"{boss.boss_lore}"</p>}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between font-display text-[11px] uppercase tracking-widest text-muted-foreground">
          <span>HP</span>
          <span>{boss.current_hp.toLocaleString()} / {boss.max_hp.toLocaleString()}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-deep ring-1 ring-border">
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

      {defeated && (
        <div className="mt-4 rounded-md border border-primary/50 bg-primary/10 p-3 text-center">
          <p className="font-display text-sm uppercase tracking-widest text-gold">⚔ DEFEATED ⚔</p>
        </div>
      )}

      {damage.length > 0 && (
        <div className="mt-5">
          <p className="font-display text-[11px] uppercase tracking-widest text-secondary">Top Strikers</p>
          <ul className="mt-2 space-y-1">
            {damage.slice(0, 5).map((d, i) => (
              <li key={d.user_id} className="flex items-center justify-between text-sm">
                <span className="font-display uppercase tracking-wider text-foreground">
                  {i + 1}. {d.hero_name ?? "Unknown"}
                </span>
                <span className="font-display text-destructive">{d.damage.toLocaleString()} dmg</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5">
        <p className="font-display text-[11px] uppercase tracking-widest text-secondary">Loot Hoard</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {boss.loot.map((l, i) => (
            <span key={i} className={`rounded-full border px-3 py-1 font-display text-[11px] uppercase tracking-widest ${defeated ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-muted-foreground"}`}>
              {l}
            </span>
          ))}
        </div>
      </div>

      {isMember && !defeated && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Every workout in the Forge damages this boss.
        </p>
      )}
    </section>
  );
}

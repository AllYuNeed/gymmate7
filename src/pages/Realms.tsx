import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MUSCLES, tierForRank } from "@/data/muscles";

interface Realm { muscle: string; xp: number; rank: number; }

const Realms = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [realms, setRealms] = useState<Record<string, Realm>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data } = await supabase.from("muscle_realms").select("muscle, xp, rank").eq("user_id", user.id);
      const map: Record<string, Realm> = {};
      (data ?? []).forEach((r) => { map[r.muscle] = r as Realm; });
      // ensure every muscle has an entry
      for (const m of MUSCLES) if (!map[m.id]) map[m.id] = { muscle: m.id, xp: 0, rank: 1 };
      setRealms(map);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  if (loading) return null;

  const regions = ["upper", "core", "lower"] as const;
  const regionLabels = { upper: "Realms of the Upper Sky", core: "Realms of the Core Vault", lower: "Realms of the Lower Earth" };

  return (
    <main className="relative mx-auto max-w-3xl px-6 py-12">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/70">☉ 17 Muscle Realms ☉</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-gold sm:text-4xl">The Body Atlas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Each kingdom rises with the work you offer it.</p>
      </header>

      {regions.map((reg) => (
        <section key={reg} className="mt-8">
          <h2 className="font-display text-sm uppercase tracking-widest text-secondary">{regionLabels[reg]}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MUSCLES.filter((m) => m.region === reg).map((m) => {
              const r = realms[m.id]!;
              const tier = tierForRank(r.rank);
              return (
                <div key={m.id} className="panel p-4 transition-all hover:-translate-y-0.5 hover:shadow-gold">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl text-primary" style={{ textShadow: "0 0 10px hsl(45 90% 60% / 0.5)" }}>{m.glyph}</span>
                    <span className="rounded border px-1.5 py-0.5 font-display text-[10px] uppercase tracking-widest" style={{ color: tier.color, borderColor: tier.color }}>{tier.label}</span>
                  </div>
                  <p className="mt-2 font-display text-sm uppercase tracking-wider text-foreground">{m.name}</p>
                  <div className="mt-1 flex items-baseline justify-between text-xs text-muted-foreground">
                    <span>Rank {r.rank}</span>
                    <span>{r.xp} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </main>
  );
};

export default Realms;

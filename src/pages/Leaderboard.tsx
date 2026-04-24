import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Row {
  id: string;
  hero_name: string;
  username: string | null;
  gym_name: string | null;
  country: string | null;
  level: number;
  xp: number;
  weekly_xp: number;
  class: string;
}

type Mode = "all_time" | "weekly" | "country" | "guild";

const Leaderboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<Mode>("all_time");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [myCountry, setMyCountry] = useState<string | null>(null);
  const [guildRows, setGuildRows] = useState<Array<{ id: string; name: string; icon: string; total_xp: number; country: string | null }>>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data: me } = await supabase.from("heroes").select("country").eq("user_id", user.id).maybeSingle();
      setMyCountry(me?.country ?? null);
    })();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    (async () => {
      if (mode === "guild") {
        const { data } = await supabase
          .from("guilds")
          .select("id, name, icon, total_xp, country")
          .order("total_xp", { ascending: false })
          .limit(100);
        setGuildRows(data ?? []);
        setLoading(false);
        return;
      }

      let query = supabase
        .from("heroes")
        .select("id, hero_name, username, gym_name, country, level, xp, weekly_xp, class");

      if (mode === "all_time") query = query.order("xp", { ascending: false });
      if (mode === "weekly") query = query.order("weekly_xp", { ascending: false });
      if (mode === "country") {
        if (!myCountry) { setRows([]); setLoading(false); return; }
        query = query.eq("country", myCountry).order("xp", { ascending: false });
      }
      const { data } = await query.limit(100);
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [mode, user, myCountry]);

  const myRow = rows.findIndex((r) => r.id && user && rows.find((x) => x.id === r.id));
  // Find current user's index in current ranking
  const myRankIndex = rows.findIndex((r) => r.username && user && (r as any).id === (user as any).id);

  return (
    <main className="relative mx-auto max-w-4xl px-6 py-12">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/70">◆ Hall of Mortals ◆</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-gold sm:text-4xl">Global Leaderboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">The top 100 mortals climbing the realms of iron.</p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        {([
          { v: "all_time", l: "All-Time", g: "♛" },
          { v: "weekly", l: "Weekly", g: "✦" },
          { v: "country", l: myCountry ? `In ${myCountry}` : "Country", g: "✠" },
          { v: "guild", l: "Guilds", g: "♆" },
        ] as const).map((t) => (
          <button
            key={t.v}
            onClick={() => setMode(t.v as Mode)}
            disabled={t.v === "country" && !myCountry}
            className={`rounded-md border px-4 py-2 font-display text-xs uppercase tracking-widest transition-all ${
              mode === t.v
                ? "border-primary bg-primary/15 text-primary shadow-gold"
                : "border-border text-muted-foreground hover:border-primary/40 disabled:opacity-40"
            }`}
          >
            <span className="mr-1.5">{t.g}</span>{t.l}
          </button>
        ))}
      </div>

      <section className="mt-6 panel divide-y divide-border/50">
        {loading && <div className="p-8 text-center text-sm text-muted-foreground">Summoning the codex...</div>}

        {!loading && mode !== "guild" && rows.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No mortals found in this ranking yet.</div>
        )}

        {!loading && mode !== "guild" && rows.map((r, i) => {
          const score = mode === "weekly" ? r.weekly_xp : r.xp;
          const rank = i + 1;
          const tierColor = rank === 1 ? "text-primary" : rank <= 3 ? "text-secondary" : rank <= 10 ? "text-foreground" : "text-muted-foreground";
          return (
            <div key={r.id} className="flex items-center gap-4 p-4">
              <div className={`w-10 shrink-0 text-center font-display text-2xl ${tierColor}`}>
                {rank === 1 ? "♛" : rank}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base uppercase tracking-wider text-foreground">
                  {r.hero_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.username && <>@{r.username} · </>}
                  Lv {r.level}
                  {r.gym_name && <> · {r.gym_name}</>}
                  {r.country && <> · {r.country}</>}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-lg font-bold text-gold">{score.toLocaleString()}</p>
                <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">
                  {mode === "weekly" ? "Weekly XP" : "Total XP"}
                </p>
              </div>
            </div>
          );
        })}

        {!loading && mode === "guild" && guildRows.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No guilds have risen yet. Found one!</div>
        )}

        {!loading && mode === "guild" && guildRows.map((g, i) => (
          <div key={g.id} className="flex items-center gap-4 p-4">
            <div className={`w-10 shrink-0 text-center font-display text-2xl ${i === 0 ? "text-primary" : i < 3 ? "text-secondary" : "text-muted-foreground"}`}>
              {i + 1}
            </div>
            <div className="font-display text-2xl text-primary">{g.icon}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base uppercase tracking-wider text-foreground">{g.name}</p>
              {g.country && <p className="text-xs text-muted-foreground">{g.country}</p>}
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-bold text-gold">{g.total_xp.toLocaleString()}</p>
              <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">Guild XP</p>
            </div>
          </div>
        ))}
      </section>

      <div className="mt-6 text-center">
        <Button variant="rune" onClick={() => navigate("/guilds")}>Visit Guild Hall →</Button>
      </div>
    </main>
  );
};

export default Leaderboard;

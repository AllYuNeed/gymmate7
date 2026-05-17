import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sigil } from "@/components/Sigil";
import { HeroAvatar } from "@/components/HeroAvatar";
import { AvatarPicker } from "@/components/AvatarPicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { HERO_CLASSES, type ClassId } from "@/data/classes";
import { pushSupported, subscribePush, unsubscribePush } from "@/lib/push";
import { toast } from "sonner";

interface Hero {
  hero_name: string;
  username: string | null;
  class: ClassId;
  level: number;
  xp: number;
  coins: number;
  streak_days: number;
  streak_freezes: number;
  avatar_url: string | null;
  gym_name: string | null;
}

const xpForLevel = (lvl: number) => Math.floor(100 * Math.pow(lvl, 1.5));

const Sanctum = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  useEffect(() => {
    if (!pushSupported() || !user) return;
    supabase.from("push_subscriptions").select("id").eq("user_id", user.id).limit(1)
      .then(({ data }) => setPushOn((data ?? []).length > 0));
  }, [user]);

  const togglePush = async () => {
    if (!user) return;
    setPushBusy(true);
    if (pushOn) {
      await unsubscribePush();
      setPushOn(false);
      toast.success("Notifications disabled");
    } else {
      const r = await subscribePush(user.id);
      if (r.ok) { setPushOn(true); toast.success("⚔ Notifications enabled"); }
      else toast.error(r.error ?? "Failed to enable");
    }
    setPushBusy(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    supabase
      .from("heroes")
      .select("hero_name, username, class, level, xp, coins, streak_days, streak_freezes, avatar_url, gym_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          navigate("/awaken");
          return;
        }
        setHero(data as Hero);
        setLoading(false);
      });
  }, [user, authLoading, navigate]);

  const saveUsername = async () => {
    if (!user) return;
    const next = usernameDraft.trim().toLowerCase();
    if (next.length < 3 || !/^[a-zA-Z0-9_]+$/.test(next)) {
      toast.error("3+ chars, letters/numbers/underscore only");
      return;
    }
    setSavingUsername(true);
    const { error } = await supabase.from("heroes").update({ username: next }).eq("user_id", user.id);
    setSavingUsername(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Username taken" : "Failed to save");
      return;
    }
    setHero((h) => (h ? { ...h, username: next } : h));
    setEditingUsername(false);
    toast.success("Username updated");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading || !hero) return null;

  const heroClass = HERO_CLASSES[hero.class];
  const xpNeeded = xpForLevel(hero.level + 1);
  const xpInLevel = hero.xp;
  const xpPercent = Math.min(100, (xpInLevel / xpNeeded) * 100);

  return (
    <main className="relative min-h-screen overflow-hidden pb-20">
      <div className="starfield" />

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/70">◆ The Sanctum ◆</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-gold sm:text-4xl">{hero.hero_name}</h1>
            {editingUsername ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="font-display text-sm text-muted-foreground">@</span>
                <Input
                  autoFocus
                  value={usernameDraft}
                  onChange={(e) => setUsernameDraft(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                  maxLength={20}
                  className="h-8 w-40 font-display text-sm"
                  placeholder="username"
                />
                <Button size="sm" variant="rune" onClick={saveUsername} disabled={savingUsername}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingUsername(false)} disabled={savingUsername}>
                  Cancel
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setUsernameDraft(hero.username ?? "");
                  setEditingUsername(true);
                }}
                className="mt-1 inline-flex items-center gap-1.5 font-display text-sm text-secondary transition hover:text-primary"
                aria-label="Edit username"
              >
                {hero.username ? `@${hero.username}` : "+ set username"}
                <span className="text-xs opacity-60">✎</span>
              </button>
            )}
            <p className="mt-1 font-display text-sm uppercase tracking-widest text-muted-foreground">
              Lv {hero.level} · {heroClass.name}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {pushSupported() && (
              <Button variant="rune" size="sm" onClick={togglePush} disabled={pushBusy}>
                {pushOn ? "🔕 Mute" : "🔔 Notify"}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </header>

        {/* Hero card */}
        <section className="mt-8 panel-glow p-8">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            <div className="relative flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setAvatarOpen(true)}
                className="group relative outline-none"
                aria-label="Change avatar"
              >
                <HeroAvatar avatarUrl={hero.avatar_url} name={hero.hero_name} size={140} glow />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-primary/60 bg-surface-deep px-2.5 py-0.5 font-display text-[10px] uppercase tracking-widest text-primary opacity-0 transition group-hover:opacity-100">
                  Edit
                </span>
              </button>
              <Sigil glyph={heroClass.sigil} size={80} color={heroClass.color} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-display text-xs uppercase tracking-[0.3em] text-secondary">
                {heroClass.title}
              </p>
              <p className="mt-3 italic text-muted-foreground">"{heroClass.lore}"</p>
              <div className="mt-4 inline-block rounded-md border border-primary/40 bg-primary/5 px-4 py-2 font-display text-xs uppercase tracking-widest text-primary">
                {heroClass.bonusLabel}
              </div>

              {/* XP bar */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between font-display text-xs uppercase tracking-widest text-muted-foreground">
                  <span>Experience</span>
                  <span>{xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-surface-deep ring-1 ring-border">
                  <div
                    className="h-full rounded-full bg-gradient-xp transition-all duration-700"
                    style={{ width: `${xpPercent}%`, boxShadow: "0 0 12px hsl(45 90% 60% / 0.6)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard glyph="✪" label="Coins" value={hero.coins.toLocaleString()} />
          <StatCard glyph="✦" label="Streak" value={`${hero.streak_days} days`} />
          <StatCard glyph="❅" label="Freezes" value={`${hero.streak_freezes} / 2`} />
          <StatCard glyph="⚔" label="Level" value={`${hero.level}`} />
        </section>

        {/* Gym Journey Card */}
        <section className="mt-8">
          <Link
            to="/gym-journey"
            className="group block rounded-xl border border-border hover:border-primary/50 bg-surface-raised p-5 transition-all hover:shadow-[0_0_20px_hsl(45_90%_55%/0.1)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-xl">
                  🏋️
                </div>
                <div>
                  <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Current Gym</p>
                  <p className="font-display text-base font-bold text-foreground">
                    {hero.gym_name ?? (
                      <span className="text-muted-foreground italic text-sm">Not set — tap to add</span>
                    )}
                  </p>
                </div>
              </div>
              <span className="font-display text-xs text-secondary group-hover:text-primary transition-colors">
                View Journey →
              </span>
            </div>
          </Link>
        </section>

        {/* Coming next teaser */}
        <section className="mt-10 panel p-8 text-center">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-secondary">◆ Next Chapter ◆</p>
          <h2 className="mt-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
            The Forge awaits...
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Workouts, muscle ranks, daily quests, and the first Boss are being summoned. Your hero stands ready.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <span className="rounded-full border border-border-bright/40 bg-surface-raised/60 px-4 py-1.5 font-display text-xs uppercase tracking-widest text-primary/80">
              Workouts
            </span>
            <span className="rounded-full border border-border-bright/40 bg-surface-raised/60 px-4 py-1.5 font-display text-xs uppercase tracking-widest text-primary/80">
              17 Muscle Realms
            </span>
            <span className="rounded-full border border-border-bright/40 bg-surface-raised/60 px-4 py-1.5 font-display text-xs uppercase tracking-widest text-primary/80">
              Daily Quests
            </span>
            <span className="rounded-full border border-border-bright/40 bg-surface-raised/60 px-4 py-1.5 font-display text-xs uppercase tracking-widest text-primary/80">
              Boss Battles
            </span>
          </div>
        </section>
      </div>

      {user && (
        <AvatarPicker
          open={avatarOpen}
          onOpenChange={setAvatarOpen}
          userId={user.id}
          currentAvatarUrl={hero.avatar_url}
          heroName={hero.hero_name}
          heroXp={hero.xp}
          heroLevel={hero.level}
          heroStreak={hero.streak_days}
          onSaved={(url) => setHero((h) => (h ? { ...h, avatar_url: url } : h))}
        />
      )}
    </main>
  );
};

function StatCard({ glyph, label, value }: { glyph: string; label: string; value: string }) {
  return (
    <div className="panel p-5 text-center transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-gold">
      <div
        className="mx-auto mb-2 font-display text-3xl text-primary"
        style={{ textShadow: "0 0 14px hsl(45 90% 55% / 0.7)" }}
      >
        {glyph}
      </div>
      <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export default Sanctum;

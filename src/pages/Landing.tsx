import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sigil } from "@/components/Sigil";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const { user } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="starfield" />

      {/* Hero */}
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="mb-10 animate-[float_5s_ease-in-out_infinite]">
          <Logo size={240} />
        </div>

        <p className="mb-4 font-display text-xs uppercase tracking-[0.4em] text-primary/80">
          ◆ Mortal Gyms ◆
        </p>

        <h1 className="font-display text-5xl font-black leading-[1.05] sm:text-7xl md:text-8xl">
          <span className="text-gold">Train. Compete.</span>
          <br />
          <span className="text-foreground/90">Ascend.</span>
        </h1>

        <p className="mx-auto mt-8 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          The competitive fitness RPG. Forge XP from every rep, raid bosses with your guild,
          and climb the global leaderboard of mortals turning iron into legend.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          {user ? (
            <Button asChild variant="hero" size="xl">
              <Link to="/sanctum">Enter the Sanctum</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="hero" size="xl">
                <Link to="/awaken">Awaken Your Hero</Link>
              </Button>
              <Button asChild variant="rune" size="xl">
                <Link to="/auth">I have a covenant</Link>
              </Button>
            </>
          )}
        </div>

        <div className="rune-divider mt-20 w-full max-w-md" />

        {/* Pillars */}
        <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="panel p-6 text-left transition-transform duration-300 hover:-translate-y-1 hover:shadow-gold">
              <div className="mb-3 font-display text-3xl text-primary" style={{ textShadow: "0 0 16px hsl(45 90% 55% / 0.6)" }}>
                {p.glyph}
              </div>
              <h3 className="font-display text-lg uppercase tracking-wider text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-16 font-display text-xs uppercase tracking-[0.3em] text-muted-foreground/60">
          ✦ Guilds · Global Top 100 · 17 muscle realms · monthly bosses ✦
        </p>
      </section>
    </main>
  );
};

const PILLARS = [
  {
    glyph: "⚔",
    title: "Forge XP",
    body: "Every rep, set, and PR earns experience. Level your hero from Untrained to Legend.",
  },
  {
    glyph: "♆",
    title: "Rank 17 Muscles",
    body: "Each muscle group ranks separately. Weak realms surface — and the AI prioritizes them.",
  },
  {
    glyph: "☀",
    title: "Slay the Boss",
    body: "Each month a Boss appears. Burn its HP with workouts. Earn rare loot. Rise in rank.",
  },
];

export default Landing;

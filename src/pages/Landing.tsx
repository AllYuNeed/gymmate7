import { Link } from "react-router-dom";
import { Activity, Shield, Sparkles, Sword, Trophy, Zap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/hooks/useAuth";

const Landing = () => {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="starfield" />

      <section className="relative mx-auto grid min-h-[92vh] max-w-6xl items-center gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center lg:text-left"
        >
          <p className="font-display text-xs uppercase tracking-[0.35em] text-primary/80">
            Mortal Gyms Fitness Evolution
          </p>
          <h1 className="mt-5 font-display text-5xl font-black leading-[1.03] sm:text-7xl">
            <span className="text-gold">Train like a hero.</span>
            <br />
            <span className="text-foreground/90">Compete like a legend.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
            Mortal Gyms turns every workout into XP, streaks, guild raids, muscle realms,
            avatars, and leaderboard progression built for serious gym consistency.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            {user ? (
              <Button asChild variant="hero" size="xl">
                <Link to="/sanctum">
                  <Zap className="h-5 w-5" />
                  Enter the Sanctum
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="hero" size="xl">
                  <Link to="/awaken">
                    <Sparkles className="h-5 w-5" />
                    Awaken Your Hero
                  </Link>
                </Button>
                <Button asChild variant="rune" size="xl">
                  <Link to="/auth">Continue to Login</Link>
                </Button>
              </>
            )}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 text-left">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-md border border-border/70 bg-card/70 p-3 backdrop-blur">
                <p className="font-display text-xl text-primary">{stat.value}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.92, rotate: -2 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex justify-center"
        >
          <div className="absolute inset-8 rounded-full bg-primary/10 blur-3xl" />
          <div className="ring-arcane relative rounded-full bg-background/40 p-8 shadow-gold backdrop-blur">
            <Logo size={260} />
          </div>
        </motion.div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 pb-20">
        <ScrollReveal>
          <div className="rune-divider mx-auto mb-10 max-w-lg" />
        </ScrollReveal>
        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <ScrollReveal key={pillar.title} delay={index * 0.08}>
              <div className="panel h-full p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-gold">
                <pillar.icon className="h-8 w-8 text-primary" />
                <h2 className="mt-5 font-display text-lg uppercase tracking-wider text-foreground">
                  {pillar.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </main>
  );
};

const STATS = [
  { label: "Muscle realms", value: "17" },
  { label: "Guild battles", value: "Live" },
  { label: "Streak guard", value: "Sun" },
];

const PILLARS = [
  {
    icon: Activity,
    title: "Forge XP",
    body: "Log real workouts, earn XP, level your hero, and make every set count toward long-term progression.",
  },
  {
    icon: Shield,
    title: "Protect Streaks",
    body: "Sunday recovery protection keeps rest day healthy while shields protect missed non-Sunday training days.",
  },
  {
    icon: Sword,
    title: "Raid With Guilds",
    body: "Join a guild, promote leaders, battle bosses, share chat, and climb the guild leaderboard together.",
  },
  {
    icon: Trophy,
    title: "Climb Ranks",
    body: "Compete across global, weekly, country, and guild rankings with a clear path from beginner to advanced.",
  },
  {
    icon: Sparkles,
    title: "Unlock Avatars",
    body: "Equip original superhero, cinematic, Bollywood, and Kollywood-inspired avatars as your XP grows.",
  },
  {
    icon: Zap,
    title: "Live Feedback",
    body: "Animated wins, fast UI states, push notifications, and live updates keep every session responsive.",
  },
];

export default Landing;

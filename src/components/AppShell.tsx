import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";

const TABS = [
  { to: "/sanctum", label: "Sanctum", glyph: "◆" },
  { to: "/forge", label: "Forge", glyph: "⚔" },
  { to: "/realms", label: "Realms", glyph: "☉" },
  { to: "/quests", label: "Quests", glyph: "✦" },
  { to: "/boss", label: "Boss", glyph: "☠" },
  { to: "/diet", label: "Diet", glyph: "❀" },
  { to: "/routines", label: "Plans", glyph: "✠" },
  { to: "/leaderboard", label: "Ranks", glyph: "♛" },
  { to: "/guilds", label: "Guilds", glyph: "♆" },
  { to: "/messages", label: "Chat", glyph: "✉" },
  { to: "/friends", label: "Pacts", glyph: "♡" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const hideNav = ["/", "/auth", "/awaken", "/forgot-password", "/reset-password", "/privacy", "/terms", "/data-safety"].includes(location.pathname);

  return (
    <div className="relative min-h-screen pb-24">
      <div className="starfield pointer-events-none fixed inset-0" />
      <div className="relative">{children}</div>
      {!hideNav && <BottomNav />}
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="relative z-10 mt-16 border-t border-border/40 bg-surface-deep/40 px-6 py-6 text-center text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <span className="font-display uppercase tracking-widest text-primary/70">◆ Mortal Gyms ◆</span>
        <a href="/privacy" className="hover:text-primary">Privacy</a>
        <span aria-hidden>·</span>
        <a href="/terms" className="hover:text-primary">Terms</a>
        <span aria-hidden>·</span>
        <a href="/data-safety" className="hover:text-primary">Data Safety</a>
      </div>
    </footer>
  );
}

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface-deep/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-stretch justify-between gap-1 overflow-x-auto px-2 py-2">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `group flex min-w-[58px] flex-1 flex-col items-center justify-center rounded-md px-1 py-1.5 text-[10px] font-display uppercase tracking-widest transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary/80"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="text-xl"
                  style={isActive ? { textShadow: "0 0 12px hsl(45 90% 60%)" } : undefined}
                >
                  {t.glyph}
                </span>
                <span className="mt-0.5">{t.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

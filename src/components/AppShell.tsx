import { ReactNode, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingPacts, setPendingPacts] = useState(0);

  const fetchCounts = async () => {
    if (!user) return;

    // Unread messages count
    const { data: convs } = await supabase
      .from("conversations")
      .select("id")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);

    if (convs && convs.length > 0) {
      const convIds = convs.map((c) => c.id);
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", convIds)
        .neq("sender_id", user.id)
        .is("read_at", null);
      setUnreadMessages(count ?? 0);
    }

    // Pending pact/friend requests
    const { count: pactCount } = await supabase
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .eq("addressee_id", user.id)
      .eq("status", "pending");
    setPendingPacts(pactCount ?? 0);
  };

  useEffect(() => {
    if (!user) return;
    fetchCounts();

    // Real-time updates
    const ch = supabase
      .channel("nav-badges:" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, fetchCounts)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, fetchCounts)
      .subscribe();

    // Push notification setup
    setupPushNotifications(user.id);

    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

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
    { to: "/messages", label: "Chat", glyph: "✉", badge: unreadMessages },
    { to: "/friends", label: "Pacts", glyph: "♡", badge: pendingPacts },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface-deep/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl items-stretch justify-between gap-1 overflow-x-auto px-2 py-2">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `group relative flex min-w-[58px] flex-1 flex-col items-center justify-center rounded-md px-1 py-1.5 text-[10px] font-display uppercase tracking-widest transition-all ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/80"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative text-xl" style={isActive ? { textShadow: "0 0 12px hsl(45 90% 60%)" } : undefined}>
                  {t.glyph}
                  {t.badge && t.badge > 0 ? (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {t.badge > 99 ? "99+" : t.badge}
                    </span>
                  ) : null}
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

async function setupPushNotifications(userId: string) {
  try {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission === "denied") return;

    // Get VAPID public key from edge function
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vapid-key`,
      { headers: { Authorization: `Bearer ${session.access_token}` } }
    );
    if (!res.ok) return;
    const { key } = await res.json();
    if (!key) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return; // Already subscribed

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: key,
    });

    const subJson = sub.toJSON();
    await supabase.from("push_subscriptions").upsert({
      user_id: userId,
      endpoint: subJson.endpoint!,
      p256dh: (subJson.keys as Record<string, string>).p256dh,
      auth: (subJson.keys as Record<string, string>).auth,
    }, { onConflict: "endpoint" });
  } catch (e) {
    console.error("Push setup error:", e);
  }
}

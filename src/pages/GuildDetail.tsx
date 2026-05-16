import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { GuildBossPanel } from "@/components/GuildBossPanel";
import { HeroAvatar } from "@/components/HeroAvatar";

interface Guild {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  invite_code: string | null;
  country: string | null;
  total_xp: number;
  leader_user_id: string;
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  contributed_xp: number;
  joined_at: string;
  hero_name?: string;
  username?: string | null;
  level?: number;
  avatar_url?: string | null;
}

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  hero_name?: string;
}

// ✅ FIX: Properly extract message from Supabase errors (not instanceof Error)
const errMsg = (e: unknown): string => {
  if (!e) return "Unknown error";
  if (typeof e === "object" && "message" in e) return String((e as { message: unknown }).message);
  return String(e);
};

// Role badge config
const ROLE_BADGE: Record<string, { label: string; symbol: string; className: string }> = {
  leader:  { label: "Leader", symbol: "♛", className: "text-primary" },
  admin:   { label: "Admin",  symbol: "⚡", className: "text-yellow-400" },
  member:  { label: "Member", symbol: "",   className: "text-muted-foreground" },
};

const GuildDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [guild, setGuild] = useState<Guild | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [myRole, setMyRole] = useState<string>("member");

  // management UI state
  const [confirmTransfer, setConfirmTransfer] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // tracks which member id is loading

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    if (!id) return;
    void load();
  }, [id, user, authLoading, navigate]);

  const load = async () => {
    if (!id || !user) return;
    setLoading(true);
    const { data: g } = await supabase.from("guilds").select("*").eq("id", id).maybeSingle();
    if (!g) { toast.error("Guild not found"); navigate("/guilds"); return; }
    setGuild(g as Guild);

    const { data: membs } = await supabase
      .from("guild_members")
      .select("id, user_id, role, contributed_xp, joined_at")
      .eq("guild_id", id)
      .order("contributed_xp", { ascending: false });

    const userIds = (membs ?? []).map((m) => m.user_id);
    let heroByUser = new Map<string, { hero_name: string; username: string | null; level: number; avatar_url: string | null }>();
    if (userIds.length > 0) {
      const { data: heroes } = await supabase
        .from("heroes")
        .select("user_id, hero_name, username, level, avatar_url")
        .in("user_id", userIds);
      heroByUser = new Map((heroes ?? []).map((h) => [h.user_id, {
        hero_name: h.hero_name, username: h.username, level: h.level, avatar_url: h.avatar_url,
      }]));
    }

    const enriched = (membs ?? []).map((m) => ({
      ...m,
      hero_name: heroByUser.get(m.user_id)?.hero_name,
      username: heroByUser.get(m.user_id)?.username ?? null,
      level: heroByUser.get(m.user_id)?.level,
      avatar_url: heroByUser.get(m.user_id)?.avatar_url ?? null,
    }));

    // Sort: leader first, then admins, then members
    enriched.sort((a, b) => {
      const order = { leader: 0, admin: 1, member: 2 };
      return (order[a.role as keyof typeof order] ?? 2) - (order[b.role as keyof typeof order] ?? 2);
    });

    setMembers(enriched);

    const me = enriched.find((m) => m.user_id === user.id);
    const amMember = !!me;
    // ✅ FIX: Owner is always considered a member for display purposes even if missing from guild_members
    const amOwner = (g as Guild).leader_user_id === user.id;
    setIsMember(amMember || amOwner);
    setMyRole(me?.role ?? (amOwner ? "leader" : "member"));

    if (amMember || amOwner) {
      const { data: msgs } = await supabase
        .from("guild_messages")
        .select("id, user_id, message, created_at")
        .eq("guild_id", id)
        .order("created_at", { ascending: true })
        .limit(200);
      const enrichedMsgs = (msgs ?? []).map((m) => ({
        ...m,
        hero_name: heroByUser.get(m.user_id)?.hero_name ?? "Unknown",
      }));
      setMessages(enrichedMsgs);
    }
    setLoading(false);
  };

  // Realtime chat subscription
  useEffect(() => {
    if (!id || !isMember) return;
    const channel = supabase
      .channel(`guild-${id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "guild_messages", filter: `guild_id=eq.${id}`,
      }, async (payload) => {
        const m = payload.new as { id: string; user_id: string; message: string; created_at: string };
        const { data: hero } = await supabase.from("heroes").select("hero_name").eq("user_id", m.user_id).maybeSingle();
        setMessages((prev) => [...prev, { ...m, hero_name: hero?.hero_name ?? "Unknown" }]);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [id, isMember]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // ─── Chat ───────────────────────────────────────────────────────────────────
  const send = async () => {
    if (!user || !id || !draft.trim() || !guild) return;
    setSending(true);
    try {
      const text = draft.trim().slice(0, 500);
      const { error } = await supabase.from("guild_messages").insert({ guild_id: id, user_id: user.id, message: text });
      if (error) throw error;
      setDraft("");
      const recipients = members.filter((m) => m.user_id !== user.id).map((m) => m.user_id);
      if (recipients.length > 0) {
        const senderName = members.find((m) => m.user_id === user.id)?.hero_name ?? "A guildmate";
        void supabase.functions.invoke("send-push", {
          body: { user_ids: recipients, title: `${guild.icon} ${guild.name}`, body: `${senderName}: ${text.slice(0, 80)}`, url: `/guilds/${id}` },
        });
      }
    } catch (e) { toast.error(errMsg(e)); }
    finally { setSending(false); }
  };

  const leave = async () => {
    if (!user || !id || !guild) return;
    if (guild.leader_user_id === user.id) { toast.error("Leaders can't leave. Transfer ownership first."); return; }
    const { error } = await supabase.from("guild_members").delete().eq("guild_id", id).eq("user_id", user.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Left the guild.");
    navigate("/guilds");
  };

  // ✅ NEW: Copy invite code
  const copyCode = async () => {
    if (!guild?.invite_code) return;
    await navigator.clipboard.writeText(guild.invite_code);
    toast.success("Invite code copied!");
  };

  // ─── Member management ──────────────────────────────────────────────────────

  // ✅ NEW: Remove / kick a member
  const kickMember = async (m: Member) => {
    if (!id) return;
    // Admins can only kick regular members
    if (myRole === "admin" && m.role !== "member") {
      toast.error("Admins can only remove regular members.");
      return;
    }
    setActionLoading(m.id);
    try {
      const { error } = await supabase.from("guild_members").delete().eq("id", m.id);
      if (error) throw error;
      setMembers((prev) => prev.filter((x) => x.id !== m.id));
      toast.success(`${m.hero_name ?? "Member"} removed from the guild.`);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setActionLoading(null); }
  };

  // ✅ NEW: Promote to admin or demote back to member
  const toggleAdmin = async (m: Member) => {
    if (!id || myRole !== "leader") return;
    const newRole = m.role === "admin" ? "member" : "admin";
    setActionLoading(m.id);
    try {
      const { error } = await supabase.from("guild_members").update({ role: newRole }).eq("id", m.id);
      if (error) throw error;
      setMembers((prev) => prev.map((x) => x.id === m.id ? { ...x, role: newRole } : x));
      toast.success(newRole === "admin"
        ? `${m.hero_name ?? "Member"} is now an Admin ⚡`
        : `${m.hero_name ?? "Member"} demoted to Member.`);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setActionLoading(null); }
  };

  // ✅ NEW: Transfer ownership to another member
  const transferOwnership = async (m: Member) => {
    if (!id || !guild || myRole !== "leader" || !user) return;
    setActionLoading(m.id);
    try {
      // Update guilds table — new leader
      const { error: gErr } = await supabase
        .from("guilds")
        .update({ leader_user_id: m.user_id, owner_id: m.user_id })
        .eq("id", id);
      if (gErr) throw gErr;

      // Update guild_members roles
      const { error: oldErr } = await supabase
        .from("guild_members")
        .update({ role: "member" })
        .eq("guild_id", id)
        .eq("user_id", user.id);
      if (oldErr) throw oldErr;

      const { error: newErr } = await supabase
        .from("guild_members")
        .update({ role: "leader" })
        .eq("id", m.id);
      if (newErr) throw newErr;

      toast.success(`Ownership transferred to ${m.hero_name ?? "new leader"} ♛`);
      setConfirmTransfer(null);
      await load(); // reload everything since roles changed
    } catch (e) { toast.error(errMsg(e)); }
    finally { setActionLoading(null); }
  };

  // ─── Derived helpers ────────────────────────────────────────────────────────
  const isLeader = guild?.leader_user_id === user?.id || myRole === "leader";
  const isAdmin  = myRole === "admin";
  const canManage = isLeader || isAdmin;

  if (loading || !guild) {
    return <main className="px-6 py-12 text-center text-sm text-muted-foreground">Summoning...</main>;
  }

  return (
    <main className="relative mx-auto max-w-4xl px-6 py-12">
      <button
        onClick={() => navigate("/guilds")}
        className="mb-4 font-display text-xs uppercase tracking-widest text-muted-foreground hover:text-primary"
      >
        ← Guild Hall
      </button>

      {/* ── Guild header ──────────────────────────────────────────────────── */}
      <header className="panel-glow p-6">
        <div className="flex items-center gap-4">
          <span className="font-display text-5xl text-primary" style={{ textShadow: "0 0 16px hsl(45 90% 55%)" }}>
            {guild.icon}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-3xl font-bold text-gold">{guild.name}</h1>
            <p className="text-xs text-muted-foreground">
              {members.length} members · {guild.total_xp.toLocaleString()} guild XP
              {guild.country && <> · {guild.country}</>}
            </p>
          </div>

          {/* ✅ FIX: Invite code always visible to leader/admin, not hidden behind isMember */}
          {(isMember || isLeader) && guild.invite_code && (
            <Button variant="rune" size="sm" onClick={copyCode}>
              Code: {guild.invite_code}
            </Button>
          )}
        </div>

        {guild.description && <p className="mt-4 italic text-muted-foreground">"{guild.description}"</p>}

        {/* Leave button — only for non-leaders */}
        {isMember && !isLeader && (
          <Button variant="ghost" size="sm" onClick={leave} className="mt-4">Leave Guild</Button>
        )}
      </header>

      <GuildBossPanel
        guildId={guild.id}
        isLeader={isLeader}
        isMember={isMember}
        memberCount={members.length}
      />

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1.4fr]">

        {/* ── Members list ───────────────────────────────────────────────── */}
        <section>
          <h2 className="font-display text-sm uppercase tracking-widest text-secondary">⚔ Members</h2>
          <div className="mt-3 panel divide-y divide-border/50">
            {members.map((m, i) => {
              const badge = ROLE_BADGE[m.role] ?? ROLE_BADGE.member;
              const isMe = m.user_id === user?.id;
              const isThisLeader = m.role === "leader";
              const canKick = canManage && !isMe && !isThisLeader && !(isAdmin && m.role === "admin");
              const canToggleAdmin = isLeader && !isMe && !isThisLeader;

              return (
                <div key={m.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center font-display text-sm text-muted-foreground">{i + 1}</div>
                    <HeroAvatar avatarUrl={m.avatar_url} name={m.hero_name ?? "?"} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm uppercase tracking-wider text-foreground">
                        {m.hero_name ?? "Unknown"}
                        {badge.symbol && (
                          <span className={`ml-2 ${badge.className}`}>{badge.symbol}</span>
                        )}
                        {isMe && <span className="ml-1 text-xs text-muted-foreground">(you)</span>}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {m.username && <>@{m.username} · </>}Lv {m.level ?? 1} · {badge.label}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-sm text-gold">{m.contributed_xp.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* ✅ NEW: Management actions row */}
                  {canManage && !isMe && !isThisLeader && (
                    <div className="mt-2 ml-9 flex flex-wrap gap-2">
                      {/* Promote/Demote admin — leader only */}
                      {canToggleAdmin && (
                        <button
                          onClick={() => toggleAdmin(m)}
                          disabled={actionLoading === m.id}
                          className="rounded border border-border px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-muted-foreground hover:border-yellow-400 hover:text-yellow-400 disabled:opacity-40"
                        >
                          {actionLoading === m.id ? "..." : m.role === "admin" ? "Remove Admin" : "Make Admin ⚡"}
                        </button>
                      )}

                      {/* Transfer ownership — leader only */}
                      {isLeader && (
                        <button
                          onClick={() => setConfirmTransfer(m)}
                          disabled={actionLoading === m.id}
                          className="rounded border border-border px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-40"
                        >
                          Transfer ♛
                        </button>
                      )}

                      {/* Kick — leader can kick anyone, admin can kick members only */}
                      {canKick && (
                        <button
                          onClick={() => kickMember(m)}
                          disabled={actionLoading === m.id}
                          className="rounded border border-border px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-muted-foreground hover:border-destructive hover:text-destructive disabled:opacity-40"
                        >
                          {actionLoading === m.id ? "..." : "Kick ✕"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Guild chat ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="font-display text-sm uppercase tracking-widest text-secondary">✉ Guild Chat</h2>
          {!isMember ? (
            <div className="mt-3 panel p-6 text-center text-sm text-muted-foreground">
              Join this guild with the invite code to chat.
            </div>
          ) : (
            <div className="mt-3 panel flex h-[460px] flex-col">
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground">No messages yet. Break the silence.</p>
                )}
                {messages.map((m) => {
                  const mine = m.user_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-lg px-3 py-2 ${mine ? "bg-primary/20 border border-primary/40" : "bg-surface-raised border border-border"}`}>
                        {!mine && <p className="font-display text-[10px] uppercase tracking-widest text-secondary">{m.hero_name}</p>}
                        <p className="text-sm text-foreground break-words">{m.message}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 border-t border-border p-3">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
                  maxLength={500}
                  placeholder="Speak to the guild..."
                  className="bg-surface-deep"
                />
                <Button variant="hero" onClick={send} disabled={sending || !draft.trim()}>Send</Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ✅ NEW: Transfer ownership confirmation modal */}
      {confirmTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="panel w-full max-w-sm p-6">
            <p className="font-display text-xs uppercase tracking-widest text-destructive">⚠ Confirm Transfer</p>
            <h3 className="mt-2 font-display text-lg font-bold text-gold">
              Transfer leadership to {confirmTransfer.hero_name ?? "this member"}?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You will become a regular member. This cannot be undone unless they transfer it back.
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setConfirmTransfer(null)}>Cancel</Button>
              <Button
                variant="hero"
                className="flex-1"
                disabled={actionLoading === confirmTransfer.id}
                onClick={() => transferOwnership(confirmTransfer)}
              >
                {actionLoading === confirmTransfer.id ? "Transferring..." : "Confirm ♛"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default GuildDetail;

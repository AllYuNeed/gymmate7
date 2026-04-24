import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Guild {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  invite_code: string;
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
}

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  hero_name?: string;
}

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
    let heroByUser = new Map<string, { hero_name: string; username: string | null; level: number }>();
    if (userIds.length > 0) {
      const { data: heroes } = await supabase
        .from("heroes")
        .select("user_id, hero_name, username, level")
        .in("user_id", userIds);
      heroByUser = new Map((heroes ?? []).map((h) => [h.user_id, { hero_name: h.hero_name, username: h.username, level: h.level }]));
    }
    const enriched = (membs ?? []).map((m) => ({
      ...m,
      hero_name: heroByUser.get(m.user_id)?.hero_name,
      username: heroByUser.get(m.user_id)?.username ?? null,
      level: heroByUser.get(m.user_id)?.level,
    }));
    setMembers(enriched);
    setIsMember(enriched.some((m) => m.user_id === user.id));

    if (enriched.some((m) => m.user_id === user.id)) {
      const { data: msgs } = await supabase
        .from("guild_messages")
        .select("id, user_id, message, created_at")
        .eq("guild_id", id)
        .order("created_at", { ascending: true })
        .limit(200);
      const enrichedMsgs = (msgs ?? []).map((m) => ({ ...m, hero_name: heroByUser.get(m.user_id)?.hero_name ?? "Unknown" }));
      setMessages(enrichedMsgs);
    }
    setLoading(false);
  };

  // Realtime chat subscription
  useEffect(() => {
    if (!id || !isMember) return;
    const channel = supabase
      .channel(`guild-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "guild_messages", filter: `guild_id=eq.${id}` },
        async (payload) => {
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

  const send = async () => {
    if (!user || !id || !draft.trim()) return;
    setSending(true);
    try {
      const { error } = await supabase.from("guild_messages").insert({
        guild_id: id, user_id: user.id, message: draft.trim().slice(0, 500),
      });
      if (error) throw error;
      setDraft("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const leave = async () => {
    if (!user || !id || !guild) return;
    if (guild.leader_user_id === user.id) {
      toast.error("Leaders can't leave. Delete the guild instead.");
      return;
    }
    const { error } = await supabase.from("guild_members").delete().eq("guild_id", id).eq("user_id", user.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Left the guild.");
    navigate("/guilds");
  };

  const copyCode = async () => {
    if (!guild) return;
    await navigator.clipboard.writeText(guild.invite_code);
    toast.success("Invite code copied!");
  };

  if (loading || !guild) return <main className="px-6 py-12 text-center text-sm text-muted-foreground">Summoning...</main>;

  return (
    <main className="relative mx-auto max-w-4xl px-6 py-12">
      <button onClick={() => navigate("/guilds")} className="mb-4 font-display text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">← Guild Hall</button>

      <header className="panel-glow p-6">
        <div className="flex items-center gap-4">
          <span className="font-display text-5xl text-primary" style={{ textShadow: "0 0 16px hsl(45 90% 55%)" }}>{guild.icon}</span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-3xl font-bold text-gold">{guild.name}</h1>
            <p className="text-xs text-muted-foreground">{members.length} members · {guild.total_xp.toLocaleString()} guild XP{guild.country && <> · {guild.country}</>}</p>
          </div>
          {isMember && (
            <Button variant="rune" size="sm" onClick={copyCode}>Code: {guild.invite_code}</Button>
          )}
        </div>
        {guild.description && <p className="mt-4 italic text-muted-foreground">"{guild.description}"</p>}
        {isMember && guild.leader_user_id !== user?.id && (
          <Button variant="ghost" size="sm" onClick={leave} className="mt-4">Leave Guild</Button>
        )}
      </header>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1.4fr]">
        {/* Members */}
        <section>
          <h2 className="font-display text-sm uppercase tracking-widest text-secondary">⚔ Members</h2>
          <div className="mt-3 panel divide-y divide-border/50">
            {members.map((m, i) => (
              <div key={m.id} className="flex items-center gap-3 p-3">
                <div className="w-6 text-center font-display text-sm text-muted-foreground">{i + 1}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm uppercase tracking-wider text-foreground">
                    {m.hero_name ?? "Unknown"}
                    {m.role === "leader" && <span className="ml-2 text-primary">♛</span>}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {m.username && <>@{m.username} · </>}Lv {m.level ?? 1}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-sm text-gold">{m.contributed_xp.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chat */}
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
                        <p className="mt-1 text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
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
    </main>
  );
};

export default GuildDetail;

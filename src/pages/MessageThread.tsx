import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { HeroAvatar } from "@/components/HeroAvatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Image as ImageIcon, Send, Sparkles, CheckCheck, Check } from "lucide-react";
import { sendMessage, markConversationRead, setTyping, clearTyping, type AchievementCard } from "@/lib/chat";
import { toast } from "sonner";
import { format } from "date-fns";

interface Msg {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  attachment: AchievementCard | null;
  read_at: string | null;
  created_at: string;
}

interface OtherHero {
  user_id: string;
  hero_name: string;
  avatar_url: string | null;
  level: number;
  class: string;
  xp: number;
}

const MessageThread = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [other, setOther] = useState<OtherHero | null>(null);
  const [me, setMe] = useState<OtherHero | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Load conversation + other user
  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const { data: conv } = await supabase
        .from("conversations")
        .select("user_a,user_b")
        .eq("id", id)
        .maybeSingle();
      if (!conv) {
        toast.error("Conversation not found");
        navigate("/messages");
        return;
      }
      const otherId = conv.user_a === user.id ? conv.user_b : conv.user_a;
      const { data: heroes } = await supabase
        .from("heroes")
        .select("user_id,hero_name,avatar_url,level,class,xp")
        .in("user_id", [otherId, user.id]);
      const o = heroes?.find((h) => h.user_id === otherId);
      const m = heroes?.find((h) => h.user_id === user.id);
      if (o) setOther(o);
      if (m) setMe(m);

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true })
        .limit(200);
      setMessages((msgs ?? []) as unknown as Msg[]);
      await markConversationRead(id, user.id);
    })();
  }, [id, user, navigate]);

  // Realtime subscription for new messages + reads + typing
  useEffect(() => {
    if (!id || !user) return;
    const ch = supabase
      .channel(`conv:${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          const m = payload.new as unknown as Msg;
          setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
          if (m.sender_id !== user.id) markConversationRead(id, user.id);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          const m = payload.new as unknown as Msg;
          setMessages((prev) => prev.map((p) => (p.id === m.id ? m : p)));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "typing_indicators", filter: `conversation_id=eq.${id}` },
        (payload) => {
          const row = (payload.new ?? payload.old) as { user_id: string; updated_at?: string } | null;
          if (!row || row.user_id === user.id) return;
          if (payload.eventType === "DELETE") {
            setOtherTyping(false);
          } else {
            const ts = row.updated_at ? new Date(row.updated_at).getTime() : 0;
            const fresh = Date.now() - ts < 5000;
            setOtherTyping(fresh);
            setTimeout(() => setOtherTyping(false), 5000);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, user]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, otherTyping]);

  // Notify push when sending
  const triggerPush = async (preview: string) => {
    if (!other || !me) return;
    try {
      await supabase.functions.invoke("send-push", {
        body: {
          user_ids: [other.user_id],
          title: `${me.hero_name} whispers`,
          body: preview.slice(0, 120),
          url: `/messages/${id}`,
        },
      });
    } catch {
      /* ignore push failures */
    }
  };

  const handleSend = async () => {
    if (!user || !id || sending) return;
    const text = draft.trim();
    if (!text) return;
    setSending(true);
    try {
      await sendMessage({ conversationId: id, senderId: user.id, content: text });
      setDraft("");
      clearTyping(id, user.id);
      triggerPush(text);
    } catch (err) {
      toast.error("Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user || !id) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("chat-images").upload(path, file);
    if (upErr) {
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("chat-images").getPublicUrl(path);
    await sendMessage({ conversationId: id, senderId: user.id, imageUrl: pub.publicUrl });
    triggerPush("📷 sent an image");
  };

  const shareAchievement = async () => {
    if (!user || !id || !me) return;
    const card: AchievementCard = {
      kind: "level_up",
      title: `Lv ${me.level} ${me.class}`,
      detail: `${me.xp.toLocaleString()} XP forged in the fires of the Forge`,
      xp: me.xp,
      icon: "✦",
    };
    await sendMessage({ conversationId: id, senderId: user.id, attachment: card });
    triggerPush(`shared a ${card.title} achievement`);
  };

  const handleDraftChange = (v: string) => {
    setDraft(v);
    if (!user || !id) return;
    setTyping(id, user.id);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (user && id) clearTyping(id, user.id);
    }, 4000);
  };

  return (
    <main className="mx-auto flex h-[calc(100vh-6rem)] max-w-3xl flex-col px-4 py-4">
      {/* Header */}
      <div className="panel mb-3 flex items-center gap-3 p-3">
        <Link to="/messages">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        {other && (
          <>
            <HeroAvatar avatarUrl={other.avatar_url} heroName={other.hero_name} size={40} />
            <div className="flex-1 min-w-0">
              <p className="truncate font-display text-foreground">{other.hero_name}</p>
              <p className="text-xs text-muted-foreground">Lv {other.level} {other.class}</p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-lg px-3 py-2 ${
                  mine
                    ? "bg-gradient-gold-shine text-primary-foreground shadow-gold"
                    : "border border-border bg-surface-raised/60 text-foreground"
                }`}
              >
                {m.image_url && (
                  <img src={m.image_url} alt="shared" className="mb-1 max-h-64 rounded" />
                )}
                {m.attachment && (
                  <div className="mb-1 rounded border border-primary/30 bg-background/40 p-3">
                    <p className="font-display text-xs uppercase tracking-widest opacity-80">
                      {m.attachment.icon ?? "✦"} Achievement
                    </p>
                    <p className="mt-1 font-display text-base">{m.attachment.title}</p>
                    <p className="text-xs opacity-90">{m.attachment.detail}</p>
                  </div>
                )}
                {m.content && <p className="whitespace-pre-wrap text-sm">{m.content}</p>}
                <div className={`mt-1 flex items-center gap-1 text-[10px] ${mine ? "opacity-80" : "opacity-60"}`}>
                  <span>{format(new Date(m.created_at), "HH:mm")}</span>
                  {mine && (m.read_at ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                </div>
              </div>
            </div>
          );
        })}
        {otherTyping && (
          <div className="flex justify-start">
            <div className="rounded-lg border border-border bg-surface-raised/60 px-3 py-2 text-xs italic text-muted-foreground">
              {other?.hero_name} is inscribing…
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="panel mt-3 flex items-end gap-2 p-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImageUpload(f);
            e.target.value = "";
          }}
        />
        <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} title="Send image">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={shareAchievement} title="Share achievement">
          <Sparkles className="h-4 w-4" />
        </Button>
        <textarea
          value={draft}
          onChange={(e) => handleDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Inscribe a whisper..."
          rows={1}
          className="flex-1 resize-none bg-transparent px-2 py-2 text-foreground outline-none placeholder:text-muted-foreground"
        />
        <Button variant="hero" size="icon" onClick={handleSend} disabled={sending || !draft.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </main>
  );
};

export default MessageThread;

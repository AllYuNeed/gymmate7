import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { HeroAvatar } from "@/components/HeroAvatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConvRow {
  id: string;
  user_a: string;
  user_b: string;
  last_message_at: string;
  other?: {
    user_id: string;
    hero_name: string;
    avatar_url: string | null;
    level: number;
  };
  preview?: string;
  unread?: number;
}

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [convs, setConvs] = useState<ConvRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const load = async () => {
    if (!user) return;
    const { data: rawConvs } = await supabase
      .from("conversations")
      .select("id,user_a,user_b,last_message_at")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("last_message_at", { ascending: false });
    if (!rawConvs) {
      setLoading(false);
      return;
    }

    const otherIds = rawConvs.map((c) => (c.user_a === user.id ? c.user_b : c.user_a));
    const [{ data: heroes }, ...previewResults] = await Promise.all([
      otherIds.length
        ? supabase.from("heroes").select("user_id,hero_name,avatar_url,level").in("user_id", otherIds)
        : Promise.resolve({ data: [] as never[] }),
      ...rawConvs.map((c) =>
        supabase
          .from("messages")
          .select("content,image_url,sender_id,read_at,created_at")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      ),
    ]);
    const heroMap = new Map((heroes ?? []).map((h) => [h.user_id, h]));

    // Get unread counts per conversation in parallel
    const unreadResults = await Promise.all(
      rawConvs.map((c) =>
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", c.id)
          .neq("sender_id", user.id)
          .is("read_at", null)
      )
    );

    const enriched: ConvRow[] = rawConvs.map((c, i) => {
      const otherId = c.user_a === user.id ? c.user_b : c.user_a;
      const last = (previewResults[i] as { data: { content: string | null; image_url: string | null } | null })?.data;
      return {
        ...c,
        other: heroMap.get(otherId),
        preview: last?.content ?? (last?.image_url ? "📷 Image" : "—"),
        unread: unreadResults[i].count ?? 0,
      };
    });
    setConvs(enriched);
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase
      .channel("inbox:" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/80">◆ Whispers ◆</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-gold">Sacred Messages</h1>
        </div>
        <Link to="/friends">
          <Button variant="rune" size="sm"><UserPlus className="h-3 w-3" /> Pacts</Button>
        </Link>
      </div>

      {loading ? (
        <p className="panel p-6 text-center text-sm text-muted-foreground">Summoning...</p>
      ) : convs.length === 0 ? (
        <div className="panel p-8 text-center">
          <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No whispers yet. Forge a pact to begin a conversation.
          </p>
          <Link to="/friends" className="mt-4 inline-block">
            <Button variant="hero" size="sm">Find Heroes</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {convs.map((c) => (
            <Link
              key={c.id}
              to={`/messages/${c.id}`}
              className="panel flex items-center gap-3 p-3 transition-colors hover:border-primary/40"
            >
              <HeroAvatar avatarUrl={c.other?.avatar_url ?? null} heroName={c.other?.hero_name ?? "?"} size={48} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-display text-foreground">{c.other?.hero_name ?? "Unknown"}</p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(c.last_message_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.preview}</p>
              </div>
              {c.unread && c.unread > 0 ? (
                <span className="ml-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-gradient-gold-shine px-2 font-display text-[10px] font-bold text-primary-foreground shadow-gold">
                  {c.unread}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default Messages;

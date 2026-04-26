import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { HeroAvatar } from "@/components/HeroAvatar";
import { getOrCreateConversation } from "@/lib/chat";
import { toast } from "sonner";
import { Search, UserPlus, Check, X, MessageSquare } from "lucide-react";

interface HeroLite {
  user_id: string;
  hero_name: string;
  username: string | null;
  avatar_url: string | null;
  level: number;
  class: string;
}

interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  hero?: HeroLite;
}

const Friends = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<HeroLite[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [incoming, setIncoming] = useState<Friendship[]>([]);
  const [outgoing, setOutgoing] = useState<Friendship[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const loadFriendships = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("friendships")
      .select("id,requester_id,addressee_id,status")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
    if (!data) return;

    const otherIds = data.map((f) => (f.requester_id === user.id ? f.addressee_id : f.requester_id));
    const { data: heroes } = otherIds.length
      ? await supabase
          .from("heroes")
          .select("user_id,hero_name,username,avatar_url,level,class")
          .in("user_id", otherIds)
      : { data: [] };
    const heroMap = new Map((heroes ?? []).map((h) => [h.user_id, h]));

    const enriched: Friendship[] = data.map((f) => ({
      ...f,
      hero: heroMap.get(f.requester_id === user.id ? f.addressee_id : f.requester_id),
    }));

    setFriends(enriched.filter((f) => f.status === "accepted"));
    setIncoming(enriched.filter((f) => f.status === "pending" && f.addressee_id === user.id));
    setOutgoing(enriched.filter((f) => f.status === "pending" && f.requester_id === user.id));
  };

  useEffect(() => {
    loadFriendships();
    if (!user) return;
    const ch = supabase
      .channel("friendships:" + user.id)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => loadFriendships())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || search.trim().length < 2) return;
    const term = `%${search.trim()}%`;
    const { data } = await supabase
      .from("heroes")
      .select("user_id,hero_name,username,avatar_url,level,class")
      .or(`hero_name.ilike.${term},username.ilike.${term}`)
      .neq("user_id", user.id)
      .limit(20);
    setResults(data ?? []);
  };

  const sendRequest = async (addresseeId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("friendships")
      .insert({ requester_id: user.id, addressee_id: addresseeId, status: "pending" });
    if (error) {
      toast.error(error.message.includes("unique") ? "Pact already exists" : error.message);
    } else {
      toast.success("Pact request dispatched");
      loadFriendships();
    }
  };

  const respondRequest = async (id: string, accept: boolean) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: accept ? "accepted" : "declined" })
      .eq("id", id);
    if (error) toast.error(error.message);
    else toast.success(accept ? "Pact sealed" : "Pact denied");
  };

  const removeFriend = async (id: string) => {
    await supabase.from("friendships").delete().eq("id", id);
    toast.success("Pact severed");
  };

  const openChat = async (otherId: string) => {
    if (!user) return;
    try {
      const convId = await getOrCreateConversation(user.id, otherId);
      navigate(`/messages/${convId}`);
    } catch {
      toast.error("Failed to open chat");
    }
  };

  const isFriendOrPending = (uid: string) =>
    friends.some((f) => f.hero?.user_id === uid) ||
    outgoing.some((f) => f.hero?.user_id === uid) ||
    incoming.some((f) => f.hero?.user_id === uid);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/80">◆ Allied Heroes ◆</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-gold">Pacts & Companions</h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="panel mb-6 flex items-center gap-2 p-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Seek by hero name or username..."
          className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
        />
        <Button type="submit" size="sm" variant="rune">Seek</Button>
      </form>

      {results.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-sm uppercase tracking-widest text-muted-foreground">Search Results</h2>
          <div className="space-y-2">
            {results.map((h) => (
              <div key={h.user_id} className="panel flex items-center gap-3 p-3">
                <HeroAvatar avatarUrl={h.avatar_url} name={h.hero_name} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-display text-foreground">{h.hero_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {h.username ? `@${h.username} · ` : ""}Lv {h.level} {h.class}
                  </p>
                </div>
                {isFriendOrPending(h.user_id) ? (
                  <span className="text-xs text-muted-foreground">Pact exists</span>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => sendRequest(h.user_id)}>
                    <UserPlus className="h-3 w-3" /> Request
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Incoming */}
      {incoming.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-sm uppercase tracking-widest text-muted-foreground">
            Incoming Pacts ({incoming.length})
          </h2>
          <div className="space-y-2">
            {incoming.map((f) => (
              <div key={f.id} className="panel flex items-center gap-3 p-3">
                <HeroAvatar avatarUrl={f.hero?.avatar_url ?? null} name={f.hero?.hero_name ?? "?"} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-display text-foreground">{f.hero?.hero_name}</p>
                  <p className="text-xs text-muted-foreground">Lv {f.hero?.level} {f.hero?.class}</p>
                </div>
                <Button size="sm" variant="hero" onClick={() => respondRequest(f.id, true)}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => respondRequest(f.id, false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Friends */}
      <section className="mb-8">
        <h2 className="mb-3 font-display text-sm uppercase tracking-widest text-muted-foreground">
          Bound Companions ({friends.length})
        </h2>
        {friends.length === 0 ? (
          <p className="panel p-6 text-center text-sm text-muted-foreground">
            No pacts yet. Seek heroes above to forge alliances.
          </p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f.id} className="panel flex items-center gap-3 p-3">
                <HeroAvatar avatarUrl={f.hero?.avatar_url ?? null} name={f.hero?.hero_name ?? "?"} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-display text-foreground">{f.hero?.hero_name}</p>
                  <p className="text-xs text-muted-foreground">Lv {f.hero?.level} {f.hero?.class}</p>
                </div>
                <Button size="sm" variant="rune" onClick={() => f.hero && openChat(f.hero.user_id)}>
                  <MessageSquare className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removeFriend(f.id)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Outgoing */}
      {outgoing.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-sm uppercase tracking-widest text-muted-foreground">
            Awaiting Response ({outgoing.length})
          </h2>
          <div className="space-y-2">
            {outgoing.map((f) => (
              <div key={f.id} className="panel flex items-center gap-3 p-3 opacity-70">
                <HeroAvatar avatarUrl={f.hero?.avatar_url ?? null} name={f.hero?.hero_name ?? "?"} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-display text-foreground">{f.hero?.hero_name}</p>
                  <p className="text-xs text-muted-foreground">Pending...</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => removeFriend(f.id)}>Cancel</Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default Friends;

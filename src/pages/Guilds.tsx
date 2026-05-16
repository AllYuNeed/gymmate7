import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateInviteCode } from "@/lib/social";
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

// ✅ Helper: extracts message from both standard Error and Supabase PostgrestError
const errMsg = (e: unknown): string => {
  if (!e) return "Unknown error";
  if (typeof e === "object") {
    if ("message" in e && typeof (e as { message: unknown }).message === "string")
      return (e as { message: string }).message;
    if ("error_description" in e && typeof (e as { error_description: unknown }).error_description === "string")
      return (e as { error_description: string }).error_description;
  }
  return String(e);
};

const Guilds = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [myGuilds, setMyGuilds] = useState<Guild[]>([]);
  const [topGuilds, setTopGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);

  // create form
  const [openCreate, setOpenCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIcon, setNewIcon] = useState("⚔");
  const [creating, setCreating] = useState(false);

  // join form
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    void loadAll();
  }, [user, authLoading, navigate]);

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    const { data: memberships } = await supabase
      .from("guild_members").select("guild_id").eq("user_id", user.id);
    const ids = (memberships ?? []).map((m) => m.guild_id);
    if (ids.length > 0) {
      const { data: mine } = await supabase.from("guilds").select("*").in("id", ids);
      setMyGuilds((mine ?? []) as Guild[]);
    } else {
      setMyGuilds([]);
    }
    const { data: top } = await supabase
      .from("guilds").select("*").order("total_xp", { ascending: false }).limit(20);
    setTopGuilds((top ?? []) as Guild[]);
    setLoading(false);
  };

  const createGuild = async () => {
    if (!user || !newName.trim()) return;
    setCreating(true);
    try {
      const { data: hero } = await supabase
        .from("heroes").select("country").eq("user_id", user.id).maybeSingle();
      const code = generateInviteCode();

      const { data: g, error } = await supabase
        .from("guilds")
        .insert({
          name: newName.trim(),
          description: newDesc.trim() || null,
          icon: newIcon || "⚔",
          invite_code: code,
          country: hero?.country ?? null,
          leader_user_id: user.id,
          // ✅ FIX: Lovable created guilds table with owner_id (NOT NULL).
          // We must supply it alongside leader_user_id to avoid the NOT NULL violation.
          owner_id: user.id,
        })
        .select()
        .single();

      // ✅ FIX: Properly surface Supabase errors (they are not instanceof Error)
      if (error) throw error;

      // Auto-join as leader
      const { error: joinErr } = await supabase
        .from("guild_members")
        .insert({ guild_id: g.id, user_id: user.id, role: "leader" });
      if (joinErr) throw joinErr;

      toast.success(`Guild forged! Invite code: ${code}`);
      setOpenCreate(false);
      setNewName(""); setNewDesc(""); setNewIcon("⚔");
      await loadAll();
      navigate(`/guilds/${g.id}`);
    } catch (e) {
      // ✅ FIX: Shows real Supabase error message instead of generic fallback
      toast.error(errMsg(e));
    } finally {
      setCreating(false);
    }
  };

  const joinGuild = async () => {
    if (!user || !joinCode.trim()) return;
    setJoining(true);
    try {
      const code = joinCode.trim().toUpperCase();
      const { data: g, error } = await supabase
        .from("guilds").select("id, name").eq("invite_code", code).maybeSingle();
      if (error) throw error;
      if (!g) { toast.error("No guild matches that code."); return; }

      const { error: jerr } = await supabase
        .from("guild_members").insert({ guild_id: g.id, user_id: user.id, role: "member" });
      if (jerr) {
        if (jerr.code === "23505") toast.error("You're already in this guild.");
        else throw jerr;
        return;
      }
      toast.success(`Joined ${g.name}!`);
      setJoinCode("");
      await loadAll();
      navigate(`/guilds/${g.id}`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setJoining(false);
    }
  };

  return (
    <main className="relative mx-auto max-w-4xl px-6 py-12">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/70">◆ Guild Hall ◆</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-gold sm:text-4xl">Forge alliances. Conquer together.</h1>
        <p className="mt-1 text-sm text-muted-foreground">Found a guild, invite your circle, and stack XP across the realm.</p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="panel p-6">
          <h2 className="font-display text-sm uppercase tracking-widest text-secondary">⚔ Found a Guild</h2>
          {!openCreate ? (
            <Button variant="hero" className="mt-4 w-full" onClick={() => setOpenCreate(true)}>Create New Guild</Button>
          ) : (
            <div className="mt-4 space-y-3">
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Guild Name</Label>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={40} placeholder="Iron Wolves" className="mt-1 bg-surface-deep" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Sigil (1 char)</Label>
                <Input value={newIcon} onChange={(e) => setNewIcon(e.target.value.slice(0, 2))} className="mt-1 bg-surface-deep font-display text-2xl text-center" maxLength={2} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} maxLength={200} placeholder="Lift heavy. Stay sharp." className="mt-1 w-full rounded-md border border-input bg-surface-deep p-3 text-sm" rows={3} />
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setOpenCreate(false)} className="flex-1">Cancel</Button>
                <Button variant="hero" onClick={createGuild} disabled={creating || !newName.trim()} className="flex-1">
                  {creating ? "Forging..." : "Forge"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="panel p-6">
          <h2 className="font-display text-sm uppercase tracking-widest text-secondary">✦ Join with Invite</h2>
          <div className="mt-4 space-y-3">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              placeholder="A1B2C3"
              className="bg-surface-deep text-center font-display text-2xl tracking-[0.4em]"
            />
            <Button variant="rune" className="w-full" onClick={joinGuild} disabled={joining || joinCode.length < 4}>
              {joining ? "Joining..." : "Enter Code"}
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg uppercase tracking-widest text-foreground">My Guilds</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {loading && <div className="panel p-6 text-center text-sm text-muted-foreground sm:col-span-2">Loading...</div>}
          {!loading && myGuilds.length === 0 && (
            <div className="panel p-6 text-center text-sm text-muted-foreground sm:col-span-2">No guilds yet. Found or join one above.</div>
          )}
          {myGuilds.map((g) => (
            <button key={g.id} onClick={() => navigate(`/guilds/${g.id}`)} className="panel p-5 text-left transition hover:-translate-y-0.5 hover:shadow-gold">
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl text-primary">{g.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg uppercase tracking-wider text-foreground">{g.name}</p>
                  <p className="text-xs text-muted-foreground">Code: {g.invite_code} · {g.total_xp.toLocaleString()} XP</p>
                </div>
              </div>
              {g.description && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{g.description}</p>}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg uppercase tracking-widest text-foreground">Top Guilds</h2>
        <div className="mt-4 panel divide-y divide-border/50">
          {topGuilds.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No guilds yet.</div>}
          {topGuilds.map((g, i) => (
            <button key={g.id} onClick={() => navigate(`/guilds/${g.id}`)} className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-card/60">
              <div className={`w-8 text-center font-display text-xl ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{i + 1}</div>
              <div className="font-display text-2xl text-primary">{g.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm uppercase tracking-wider text-foreground">{g.name}</p>
                {g.country && <p className="text-xs text-muted-foreground">{g.country}</p>}
              </div>
              <div className="font-display text-base font-bold text-gold">{g.total_xp.toLocaleString()}</div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Guilds;

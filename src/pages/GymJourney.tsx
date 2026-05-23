import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { todayIST, fmtMonthYearIST } from "@/lib/ist";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

/* ─────────────── Types ─────────────── */
interface GymEntry {
  id: string;
  gym_name: string;
  gym_location: string | null;
  gym_logo_url: string | null;
  gym_description: string | null;
  join_date: string;
  leave_date: string | null;
  is_current: boolean;
  xp_earned: number;
  workouts_completed: number;
  created_at: string;
}

interface HeroSnap {
  gym_name: string | null;
  xp: number;
}

/* ─────────────── Helpers ─────────────── */
function formatDuration(startIso: string, endIso?: string | null): string {
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : new Date();
  const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years === 1 ? "" : "s"}`);
  if (remMonths > 0) parts.push(`${remMonths} mo`);
  return parts.join(" ") || "< 1 mo";
}

function fmtDate(iso: string): string {
  return fmtMonthYearIST(iso);
}

/* ─────────────── Sub-components ─────────────── */
function TimelineDot({ active }: { active: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`z-10 h-4 w-4 rounded-full border-2 transition-all ${
          active
            ? "border-primary bg-primary shadow-[0_0_12px_hsl(45_90%_55%/0.8)]"
            : "border-border bg-surface-raised"
        }`}
      />
    </div>
  );
}

function GymCard({
  entry,
  onEdit,
  onSwitchFrom,
  showSwitch,
}: {
  entry: GymEntry;
  onEdit: (e: GymEntry) => void;
  onSwitchFrom: (e: GymEntry) => void;
  showSwitch: boolean;
}) {
  const [expanded, setExpanded] = useState(entry.is_current);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
        entry.is_current
          ? "border-primary/60 bg-gradient-to-br from-surface-raised to-surface-deep shadow-[0_0_24px_hsl(45_90%_55%/0.15)]"
          : "border-border bg-surface-raised/60 hover:border-border-bright/50"
      }`}
    >
      {/* Card header */}
      <button
        type="button"
        className="w-full p-5 text-left"
        onClick={() => setExpanded((x) => !x)}
      >
        <div className="flex items-start gap-4">
          {/* Logo / placeholder */}
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border text-2xl ${
              entry.is_current
                ? "border-primary/50 bg-primary/10"
                : "border-border bg-surface-deep"
            }`}
          >
            {entry.gym_logo_url ? (
              <img
                src={entry.gym_logo_url}
                alt={entry.gym_name}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              "🏋️"
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-base font-bold text-foreground truncate">
                {entry.gym_name}
              </h3>
              {entry.is_current && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 bg-primary/10 px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-primary">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  Active
                </span>
              )}
            </div>

            {entry.gym_location && (
              <p className="mt-0.5 text-xs text-muted-foreground">📍 {entry.gym_location}</p>
            )}

            <p className="mt-1 font-display text-xs text-secondary">
              {fmtDate(entry.join_date)} → {entry.leave_date ? fmtDate(entry.leave_date) : "Present"}
              <span className="ml-2 text-muted-foreground">
                ({formatDuration(entry.join_date, entry.leave_date)})
              </span>
            </p>
          </div>

          <span className="text-muted-foreground text-sm shrink-0">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border/40 px-5 pb-5">
          {entry.gym_description && (
            <p className="mt-4 text-sm text-muted-foreground italic">"{entry.gym_description}"</p>
          )}

          {/* Stats row */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <StatPill label="Duration" value={formatDuration(entry.join_date, entry.leave_date)} glyph="⏱" />
            <StatPill label="XP Earned" value={entry.xp_earned.toLocaleString()} glyph="✦" />
            <StatPill label="Workouts" value={entry.workouts_completed.toString()} glyph="⚔" />
          </div>

          {/* XP bar */}
          {entry.xp_earned > 0 && (
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between font-display text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>Gym XP Progress</span>
                <span>{entry.xp_earned.toLocaleString()} XP</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-deep">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-yellow-400 transition-all duration-700"
                  style={{
                    width: `${Math.min(100, (entry.xp_earned / 50000) * 100)}%`,
                    boxShadow: "0 0 8px hsl(45 90% 60% / 0.6)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          {entry.is_current && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="rune" onClick={() => onEdit(entry)}>
                ✎ Edit Gym Profile
              </Button>
              {showSwitch && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="border border-border text-muted-foreground hover:text-foreground"
                  onClick={() => onSwitchFrom(entry)}
                >
                  🔄 Switch Gym
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, glyph }: { label: string; value: string; glyph: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface-deep p-3 text-center">
      <div className="font-display text-base text-primary">{glyph}</div>
      <div className="mt-1 font-display text-sm font-bold text-foreground">{value}</div>
      <div className="font-display text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

/* ─────────────── Edit / Add Modal ─────────────── */
interface ModalProps {
  mode: "add" | "edit" | "switch";
  existing?: GymEntry;
  onClose: () => void;
  onSaved: () => void;
  userId: string;
  currentGymXp: number;
  currentGymWorkouts: number;
}

function GymModal({ mode, existing, onClose, onSaved, userId, currentGymXp, currentGymWorkouts }: ModalProps) {
  const [gymName, setGymName] = useState(mode === "edit" ? (existing?.gym_name ?? "") : "");
  const [location, setLocation] = useState(mode === "edit" ? (existing?.gym_location ?? "") : "");
  const [description, setDescription] = useState(mode === "edit" ? (existing?.gym_description ?? "") : "");
  const [joinDate, setJoinDate] = useState(
    mode === "edit" ? (existing?.join_date ?? todayIST()) : todayIST()
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(existing?.gym_logo_url ?? null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return existing?.gym_logo_url ?? null;
    const ext = logoFile.name.split(".").pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("gym-logos").upload(path, logoFile, { upsert: true });
    if (error) { toast.error("Logo upload failed"); return existing?.gym_logo_url ?? null; }
    const { data } = supabase.storage.from("gym-logos").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    const name = gymName.trim();
    if (!name) { toast.error("Gym name is required"); return; }
    setSaving(true);

    const logoUrl = await uploadLogo();

    if (mode === "edit" && existing) {
      const { error } = await supabase
        .from("gym_history")
        .update({
          gym_name: name,
          gym_location: location.trim() || null,
          gym_description: description.trim() || null,
          gym_logo_url: logoUrl,
          join_date: joinDate,
        })
        .eq("id", existing.id);
      if (error) { toast.error("Failed to save"); setSaving(false); return; }
      // Sync gym_name to heroes table
      await supabase.from("heroes").update({ gym_name: name }).eq("user_id", userId);
      toast.success("Gym profile updated ✓");
      onSaved();
      return;
    }

    if (mode === "add") {
      // Archive current if any
      const { data: current } = await supabase
        .from("gym_history")
        .select("id, xp_earned, workouts_completed")
        .eq("user_id", userId)
        .eq("is_current", true)
        .maybeSingle();

      if (current) {
        await supabase.from("gym_history").update({
          is_current: false,
          leave_date: todayIST(),
          xp_earned: currentGymXp,
          workouts_completed: currentGymWorkouts,
        }).eq("id", current.id);
      }

      const { error } = await supabase.from("gym_history").insert({
        user_id: userId,
        gym_name: name,
        gym_location: location.trim() || null,
        gym_description: description.trim() || null,
        gym_logo_url: logoUrl,
        join_date: joinDate,
        is_current: true,
        xp_earned: 0,
        workouts_completed: 0,
      });
      if (error) { toast.error("Failed to add gym"); setSaving(false); return; }
      await supabase.from("heroes").update({ gym_name: name }).eq("user_id", userId);
      toast.success("🏋️ New gym added! Journey begins.");
      onSaved();
      return;
    }

    if (mode === "switch") {
      // Archive current
      if (existing) {
        await supabase.from("gym_history").update({
          is_current: false,
          leave_date: todayIST(),
          xp_earned: currentGymXp,
          workouts_completed: currentGymWorkouts,
        }).eq("id", existing.id);
      }

      const { error } = await supabase.from("gym_history").insert({
        user_id: userId,
        gym_name: name,
        gym_location: location.trim() || null,
        gym_description: description.trim() || null,
        gym_logo_url: logoUrl,
        join_date: todayIST(),
        is_current: true,
        xp_earned: 0,
        workouts_completed: 0,
      });
      if (error) { toast.error("Failed to switch gym"); setSaving(false); return; }
      await supabase.from("heroes").update({ gym_name: name }).eq("user_id", userId);
      toast.success("🔄 Gym switched! New journey starts.");
      onSaved();
    }
  };

  const title = mode === "add" ? "Add Your Gym" : mode === "edit" ? "Edit Gym Profile" : "Switch Gym";
  const btnLabel = mode === "add" ? "Add Gym" : mode === "edit" ? "Save Changes" : "Switch & Continue";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border-bright/40 bg-surface-raised p-6 shadow-[0_0_60px_hsl(45_90%_55%/0.15)]">
        <h2 className="font-display text-xl font-bold text-gold mb-1">{title}</h2>
        {mode === "switch" && (
          <p className="text-xs text-muted-foreground mb-4">
            Your current gym progress will be archived automatically.
          </p>
        )}

        {/* Logo picker */}
        <div className="mb-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-border-bright/40 bg-surface-deep text-2xl transition hover:border-primary/60"
          >
            {logoPreview ? (
              <img src={logoPreview} alt="logo" className="h-full w-full rounded-xl object-cover" />
            ) : "🏋️"}
          </button>
          <div>
            <p className="font-display text-xs text-muted-foreground">Gym Logo (optional)</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="font-display text-xs text-secondary hover:text-primary transition"
            >
              {logoPreview ? "Change photo" : "Upload photo"}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block font-display text-xs uppercase tracking-widest text-muted-foreground">
              Gym Name *
            </label>
            <Input
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              placeholder="e.g. Gold's Gym, Iron Temple"
              className="bg-surface-deep"
            />
          </div>
          <div>
            <label className="mb-1 block font-display text-xs uppercase tracking-widest text-muted-foreground">
              Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
              className="bg-surface-deep"
            />
          </div>
          <div>
            <label className="mb-1 block font-display text-xs uppercase tracking-widest text-muted-foreground">
              Join Date
            </label>
            <Input
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
              className="bg-surface-deep"
            />
          </div>
          <div>
            <label className="mb-1 block font-display text-xs uppercase tracking-widest text-muted-foreground">
              Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A sentence about your gym..."
              className="bg-surface-deep"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="rune" className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : btnLabel}
          </Button>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────── Loyalty Badge ─────────────── */
function LoyaltyBadge({ months }: { months: number }) {
  if (months >= 24) return <span title="2+ years!">🏆</span>;
  if (months >= 12) return <span title="1+ year!">🥇</span>;
  if (months >= 6) return <span title="6+ months!">🥈</span>;
  return <span title="Keep going!">🥉</span>;
}

/* ─────────────── Main Page ─────────────── */
const GymJourney = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [gyms, setGyms] = useState<GymEntry[]>([]);
  const [hero, setHero] = useState<HeroSnap | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: "add" | "edit" | "switch"; entry?: GymEntry } | null>(null);

  const loadData = async (uid: string) => {
    setLoading(true);
    const [{ data: gymData }, { data: heroData }] = await Promise.all([
      supabase
        .from("gym_history")
        .select("*")
        .eq("user_id", uid)
        .order("join_date", { ascending: false }),
      supabase.from("heroes").select("gym_name, xp").eq("user_id", uid).maybeSingle(),
    ]);
    setGyms((gymData ?? []) as GymEntry[]);
    setHero(heroData as HeroSnap | null);
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    loadData(user.id);
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <main className="relative min-h-screen pb-24">
        <div className="starfield" />
        <div className="relative flex h-screen items-center justify-center">
          <div className="font-display text-primary animate-pulse">Loading Gym Journey...</div>
        </div>
      </main>
    );
  }

  const current = gyms.find((g) => g.is_current);
  const history = gyms.filter((g) => !g.is_current);
  const totalXp = gyms.reduce((s, g) => s + g.xp_earned, 0);
  const totalWorkouts = gyms.reduce((s, g) => s + g.workouts_completed, 0);
  const totalDays = gyms.reduce((s, g) => {
    const start = new Date(g.join_date);
    const end = g.leave_date ? new Date(g.leave_date) : new Date();
    return s + Math.floor((end.getTime() - start.getTime()) / 86_400_000);
  }, 0);

  const longestGym = gyms.reduce<GymEntry | null>((best, g) => {
    const start = new Date(g.join_date);
    const end = g.leave_date ? new Date(g.leave_date) : new Date();
    const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000);
    if (!best) return g;
    const bestStart = new Date(best.join_date);
    const bestEnd = best.leave_date ? new Date(best.leave_date) : new Date();
    const bestDays = Math.floor((bestEnd.getTime() - bestStart.getTime()) / 86_400_000);
    return days > bestDays ? g : best;
  }, null);

  const mostXpGym = gyms.reduce<GymEntry | null>((best, g) => {
    if (!best) return g;
    return g.xp_earned > best.xp_earned ? g : best;
  }, null);

  const currentMonths = current
    ? Math.floor(
        (new Date().getTime() - new Date(current.join_date).getTime()) / (1000 * 60 * 60 * 24 * 30)
      )
    : 0;

  return (
    <main className="relative min-h-screen overflow-hidden pb-28">
      <div className="starfield" />
      <div className="relative mx-auto max-w-3xl px-4 py-10">

        {/* Header */}
        <header className="mb-8">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/70">◆ Gym Identity ◆</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-gold sm:text-4xl">Gym Journey</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your complete gym history and experience timeline</p>
        </header>

        {/* ── Current Gym Banner ── */}
        {current ? (
          <section className="mb-8 rounded-2xl border border-primary/50 bg-gradient-to-br from-surface-raised via-surface-deep to-surface-deep p-6 shadow-[0_0_40px_hsl(45_90%_55%/0.12)]">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-3xl">
                {current.gym_logo_url ? (
                  <img src={current.gym_logo_url} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : "🏋️"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-gold">{current.gym_name}</h2>
                  <LoyaltyBadge months={currentMonths} />
                </div>
                {current.gym_location && (
                  <p className="text-xs text-muted-foreground">📍 {current.gym_location}</p>
                )}
                <p className="mt-1 font-display text-sm text-secondary">
                  Training here for{" "}
                  <span className="text-primary font-bold">
                    {formatDuration(current.join_date)}
                  </span>
                </p>
                {current.gym_description && (
                  <p className="mt-2 text-sm text-muted-foreground italic">"{current.gym_description}"</p>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <StatPill label="This Gym XP" value={current.xp_earned.toLocaleString()} glyph="✦" />
              <StatPill label="Workouts" value={current.workouts_completed.toString()} glyph="⚔" />
              <StatPill label="Since" value={fmtDate(current.join_date)} glyph="📅" />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="rune"
                onClick={() => setModal({ mode: "edit", entry: current })}
              >
                ✎ Edit Profile
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="border border-border text-muted-foreground hover:text-foreground"
                onClick={() => setModal({ mode: "switch", entry: current })}
              >
                🔄 Switch Gym
              </Button>
            </div>
          </section>
        ) : (
          <section className="mb-8 rounded-2xl border border-dashed border-border-bright/40 bg-surface-raised/40 p-8 text-center">
            <div className="text-4xl mb-3">🏋️</div>
            <h2 className="font-display text-lg font-bold text-foreground">No gym set yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add your gym to start tracking your journey</p>
            <Button
              variant="rune"
              className="mt-4"
              onClick={() => setModal({ mode: "add" })}
            >
              + Add Your Gym
            </Button>
          </section>
        )}

        {/* ── Career Stats ── */}
        {gyms.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-secondary">
              ◆ Career Stats ◆
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatPill label="Total XP" value={totalXp.toLocaleString()} glyph="✦" />
              <StatPill label="Total Workouts" value={totalWorkouts.toString()} glyph="⚔" />
              <StatPill label="Total Days" value={`${totalDays}d`} glyph="📅" />
              <StatPill label="Gyms Visited" value={gyms.length.toString()} glyph="🏋️" />
            </div>

            {/* Achievement badges */}
            {(longestGym || mostXpGym) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {longestGym && (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-display text-xs text-primary">
                    🏅 Longest Streak: {longestGym.gym_name}
                  </span>
                )}
                {mostXpGym && mostXpGym.xp_earned > 0 && (
                  <span className="rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 font-display text-xs text-secondary">
                    ⭐ Most XP: {mostXpGym.gym_name}
                  </span>
                )}
              </div>
            )}
          </section>
        )}

        {/* ── Timeline ── */}
        {gyms.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xs uppercase tracking-[0.3em] text-secondary">
                ◆ Gym Timeline ◆
              </h2>
              {current && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-muted-foreground hover:text-primary border border-border"
                  onClick={() => setModal({ mode: "add" })}
                >
                  + Add New Gym
                </Button>
              )}
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-border to-transparent" />

              <div className="space-y-4 pl-8">
                {gyms.map((g) => (
                  <div key={g.id} className="relative">
                    <div className="absolute -left-8 top-5">
                      <TimelineDot active={g.is_current} />
                    </div>
                    <GymCard
                      entry={g}
                      onEdit={(e) => setModal({ mode: "edit", entry: e })}
                      onSwitchFrom={(e) => setModal({ mode: "switch", entry: e })}
                      showSwitch={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Empty state CTA ── */}
        {gyms.length === 0 && (
          <section className="text-center py-12">
            <p className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Start your gym journey today
            </p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
              Track every gym you've trained at, see your XP growth over time, and build a fitness career timeline.
            </p>
          </section>
        )}

        {/* Add gym CTA when has current gym */}
        {!current && gyms.length > 0 && (
          <div className="text-center">
            <Button variant="rune" onClick={() => setModal({ mode: "add" })}>
              + Set Current Gym
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && user && (
        <GymModal
          mode={modal.mode}
          existing={modal.entry}
          userId={user.id}
          currentGymXp={current?.xp_earned ?? 0}
          currentGymWorkouts={current?.workouts_completed ?? 0}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            loadData(user.id);
          }}
        />
      )}
    </main>
  );
};

export default GymJourney;

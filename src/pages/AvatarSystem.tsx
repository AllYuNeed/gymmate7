import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  AVATAR_CHARACTERS,
  RARITY_STYLES,
  TYPE_LABELS,
  isAvatarUnlocked,
  generateAvatarSvg,
  type AvatarCharacter,
  type AvatarRarity,
  type AvatarType,
} from "@/data/avatarSystem";

// ── SVG Avatar Renderer ────────────────────────────────────
function AvatarSvgDisplay({
  avatar,
  size = 96,
  locked = false,
  animated = false,
}: {
  avatar: AvatarCharacter;
  size?: number;
  locked?: boolean;
  animated?: boolean;
}) {
  const svgString = generateAvatarSvg(avatar, size);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img
        src={dataUrl}
        alt={avatar.name}
        width={size}
        height={size}
        className={`rounded-full transition-all ${animated && !locked ? "animate-pulse" : ""} ${locked ? "opacity-40 grayscale" : ""}`}
        style={
          !locked
            ? { boxShadow: `0 0 ${size * 0.15}px ${avatar.primary_color}60` }
            : undefined
        }
      />
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
          <span className="text-xl">🔒</span>
        </div>
      )}
    </div>
  );
}

// ── Rarity Badge ───────────────────────────────────────────
function RarityBadge({ rarity }: { rarity: AvatarRarity }) {
  const s = RARITY_STYLES[rarity];
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-display uppercase tracking-widest ${s.color} ${s.border}`}>
      {s.label}
    </span>
  );
}

// ── Unlock Progress Bar ────────────────────────────────────
function UnlockProgress({
  avatar,
  heroXp,
  heroLevel,
  streakDays,
}: {
  avatar: AvatarCharacter;
  heroXp: number;
  heroLevel: number;
  streakDays: number;
}) {
  const unlocked = isAvatarUnlocked(avatar, heroXp, heroLevel, streakDays);
  if (unlocked) return null;

  const barriers: { label: string; current: number; required: number }[] = [];
  if (avatar.unlock_xp > heroXp) {
    barriers.push({ label: "XP", current: heroXp, required: avatar.unlock_xp });
  }
  if (avatar.unlock_level > heroLevel) {
    barriers.push({ label: "Level", current: heroLevel, required: avatar.unlock_level });
  }
  if (avatar.unlock_streak && avatar.unlock_streak > streakDays) {
    barriers.push({ label: "Streak Days", current: streakDays, required: avatar.unlock_streak });
  }

  return (
    <div className="mt-2 space-y-1">
      {barriers.map((b) => (
        <div key={b.label}>
          <div className="mb-0.5 flex justify-between font-display text-[9px] uppercase tracking-widest text-muted-foreground">
            <span>{b.label}</span>
            <span>{b.current}/{b.required}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-surface-deep">
            <div
              className="h-full rounded-full bg-primary/60 transition-all"
              style={{ width: `${Math.min(100, (b.current / b.required) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Avatar Detail Modal ────────────────────────────────────
function AvatarDetailModal({
  avatar,
  open,
  onClose,
  unlocked,
  isEquipped,
  onEquip,
  heroXp,
  heroLevel,
  streakDays,
}: {
  avatar: AvatarCharacter | null;
  open: boolean;
  onClose: () => void;
  unlocked: boolean;
  isEquipped: boolean;
  onEquip: () => void;
  heroXp: number;
  heroLevel: number;
  streakDays: number;
}) {
  if (!avatar) return null;
  const rarity = RARITY_STYLES[avatar.rarity];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg border-border bg-surface-raised">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase tracking-widest text-gold">
            {avatar.name}
          </DialogTitle>
        </DialogHeader>

        {/* Avatar display */}
        <div
          className="flex flex-col items-center gap-4 rounded-xl border py-6"
          style={{ borderColor: `${avatar.primary_color}40`, background: `linear-gradient(135deg, ${avatar.svgTheme.bg.split(",")[0]}, ${avatar.svgTheme.bg.split(",")[1]})` }}
        >
          <AvatarSvgDisplay avatar={avatar} size={120} locked={!unlocked} animated={avatar.animated} />
          <div className="text-center">
            <p className="font-display text-xs uppercase tracking-widest" style={{ color: avatar.primary_color }}>
              {avatar.title}
            </p>
            <div className="mt-2 flex justify-center gap-2">
              <RarityBadge rarity={avatar.rarity} />
              <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-display uppercase tracking-widest border-border text-muted-foreground`}>
                {TYPE_LABELS[avatar.type]}
              </span>
            </div>
          </div>
        </div>

        {/* Lore */}
        <div className="rounded-lg border border-border bg-card/40 p-4">
          <p className="font-display text-[10px] uppercase tracking-widest text-secondary mb-2">◆ Lore</p>
          <p className="text-sm text-foreground/80 leading-relaxed italic">{avatar.lore}</p>
        </div>

        {/* Cosmetics */}
        <div>
          <p className="mb-2 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Cosmetics</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(avatar.cosmetics).map(([key, value]) => value && (
              <span key={key} className="rounded-full border border-border bg-card/40 px-3 py-1 text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                {value}
              </span>
            ))}
          </div>
        </div>

        {/* Unlock requirements */}
        {!unlocked && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="mb-3 font-display text-[10px] uppercase tracking-widest text-destructive/80">🔒 Unlock Requirements</p>
            <div className="space-y-1 text-sm text-foreground/70">
              <p>Level {avatar.unlock_level} required (you: {heroLevel})</p>
              <p>{avatar.unlock_xp.toLocaleString()} XP required (you: {heroXp.toLocaleString()})</p>
              {avatar.unlock_streak && (
                <p>{avatar.unlock_streak} day streak required (you: {streakDays})</p>
              )}
            </div>
            <UnlockProgress avatar={avatar} heroXp={heroXp} heroLevel={heroLevel} streakDays={streakDays} />
          </div>
        )}

        {/* Equip button */}
        <Button
          variant="hero"
          disabled={!unlocked || isEquipped}
          onClick={onEquip}
          className="w-full font-display uppercase tracking-widest"
        >
          {isEquipped ? "✓ Equipped" : unlocked ? "⚡ Equip Avatar" : "🔒 Locked"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ── Avatar Card ────────────────────────────────────────────
function AvatarCard({
  avatar,
  unlocked,
  isEquipped,
  heroXp,
  heroLevel,
  streakDays,
  onClick,
}: {
  avatar: AvatarCharacter;
  unlocked: boolean;
  isEquipped: boolean;
  heroXp: number;
  heroLevel: number;
  streakDays: number;
  onClick: () => void;
}) {
  const rarity = RARITY_STYLES[avatar.rarity];

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center rounded-xl border p-4 text-center transition-all duration-200 hover:-translate-y-1 ${
        isEquipped
          ? "border-primary bg-primary/15 shadow-gold"
          : unlocked
          ? `${rarity.border} bg-card/60 hover:bg-surface-raised ${rarity.glow}`
          : "border-border/40 bg-card/30 opacity-60 hover:opacity-80"
      }`}
    >
      {/* Equipped indicator */}
      {isEquipped && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full border border-primary bg-primary px-2 py-0.5 font-display text-[9px] uppercase tracking-widest text-primary-foreground">
          Equipped
        </div>
      )}

      <AvatarSvgDisplay
        avatar={avatar}
        size={72}
        locked={!unlocked}
        animated={avatar.animated && unlocked}
      />

      <p className={`mt-2 font-display text-xs uppercase tracking-wide transition-colors line-clamp-1 ${isEquipped ? "text-primary" : "text-foreground group-hover:text-primary/80"}`}>
        {avatar.name}
      </p>
      <p className="text-[10px] text-muted-foreground line-clamp-1">{avatar.title}</p>
      <div className="mt-2">
        <RarityBadge rarity={avatar.rarity} />
      </div>

      {!unlocked && (
        <UnlockProgress avatar={avatar} heroXp={heroXp} heroLevel={heroLevel} streakDays={streakDays} />
      )}
    </button>
  );
}

// ── Main Page ──────────────────────────────────────────────
const AvatarSystem = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [heroXp, setHeroXp] = useState(0);
  const [heroLevel, setHeroLevel] = useState(1);
  const [streakDays, setStreakDays] = useState(0);
  const [equippedAvatarId, setEquippedAvatarId] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarCharacter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterRarity, setFilterRarity] = useState<AvatarRarity | "all">("all");
  const [filterType, setFilterType] = useState<AvatarType | "all">("all");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    (async () => {
      const { data: hero } = await supabase
        .from("heroes")
        .select("xp, level, streak_days, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!hero) { navigate("/awaken"); return; }
      setHeroXp(hero.xp ?? 0);
      setHeroLevel(hero.level ?? 1);
      setStreakDays(hero.streak_days ?? 0);
      // Extract equipped avatar ID from stored URL
      const url = hero.avatar_url ?? "";
      if (url.startsWith("avatar:")) {
        setEquippedAvatarId(url.replace("avatar:", ""));
      }
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const handleEquip = async (avatar: AvatarCharacter) => {
    if (!user) return;
    setSaving(true);
    const avatarUrl = `avatar:${avatar.id}`;
    const { error } = await supabase
      .from("heroes")
      .update({ avatar_url: avatarUrl })
      .eq("user_id", user.id);
    if (error) {
      toast.error("Could not equip avatar: " + error.message);
    } else {
      setEquippedAvatarId(avatar.id);
      toast.success(`⚡ ${avatar.name} equipped!`);
      setSelectedAvatar(null);
    }
    setSaving(false);
  };

  const filtered = useMemo(() => {
    return AVATAR_CHARACTERS.filter((a) => {
      if (filterRarity !== "all" && a.rarity !== filterRarity) return false;
      if (filterType !== "all" && a.type !== filterType) return false;
      return true;
    });
  }, [filterRarity, filterType]);

  const unlockedCount = AVATAR_CHARACTERS.filter((a) =>
    isAvatarUnlocked(a, heroXp, heroLevel, streakDays)
  ).length;

  const equippedAvatar = equippedAvatarId
    ? AVATAR_CHARACTERS.find((a) => a.id === equippedAvatarId) ?? null
    : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 pt-6">
      {/* Header */}
      <div className="px-4 pb-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-1 font-display text-xs uppercase tracking-[0.3em] text-secondary/70">◆ Identity Forge ◆</div>
          <h1 className="font-display text-3xl uppercase tracking-widest text-gold">Avatar Wardrobe</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unlockedCount} of {AVATAR_CHARACTERS.length} avatars unlocked
          </p>
        </div>
      </div>

      {/* Currently Equipped preview */}
      {equippedAvatar && (
        <div className="mx-auto mb-6 max-w-4xl px-4">
          <div
            className="flex items-center gap-4 rounded-xl border p-4"
            style={{
              borderColor: `${equippedAvatar.primary_color}50`,
              background: `linear-gradient(135deg, ${equippedAvatar.svgTheme.bg.split(",")[0]}80, ${equippedAvatar.svgTheme.bg.split(",")[1]}80)`,
            }}
          >
            <AvatarSvgDisplay avatar={equippedAvatar} size={80} animated={equippedAvatar.animated} />
            <div className="flex-1 min-w-0">
              <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">Currently Equipped</p>
              <p className="font-display text-xl uppercase tracking-wide" style={{ color: equippedAvatar.primary_color }}>
                {equippedAvatar.name}
              </p>
              <p className="text-sm text-muted-foreground">{equippedAvatar.title}</p>
              <div className="mt-2">
                <RarityBadge rarity={equippedAvatar.rarity} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mx-auto mb-6 max-w-4xl px-4">
        <div className="rounded-xl border border-border bg-card/40 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Level</p>
              <p className="font-display text-2xl text-primary">{heroLevel}</p>
            </div>
            <div>
              <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Total XP</p>
              <p className="font-display text-2xl text-primary">{heroXp.toLocaleString()}</p>
            </div>
            <div>
              <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Streak</p>
              <p className="font-display text-2xl text-primary">{streakDays}d</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-4 space-y-3">
          {/* Rarity filter */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-1" style={{ width: "max-content" }}>
              {(["all", "common", "rare", "epic", "legendary", "mythic"] as const).map((r) => {
                const style = r === "all" ? null : RARITY_STYLES[r];
                return (
                  <button
                    key={r}
                    onClick={() => setFilterRarity(r)}
                    className={`rounded-full border px-4 py-1.5 font-display text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                      filterRarity === r
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {r === "all" ? "All Rarities" : style?.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Type filter */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-1" style={{ width: "max-content" }}>
              {(["all", "superhero", "bollywood", "kollywood", "cosmic", "shadow", "warrior"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t as AvatarType | "all")}
                  className={`rounded-full border px-4 py-1.5 font-display text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                    filterType === t
                      ? "border-secondary bg-secondary/20 text-secondary"
                      : "border-border text-muted-foreground hover:border-secondary/40"
                  }`}
                >
                  {t === "all" ? "All Types" : TYPE_LABELS[t as AvatarType]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Avatar grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((avatar) => {
            const unlocked = isAvatarUnlocked(avatar, heroXp, heroLevel, streakDays);
            return (
              <AvatarCard
                key={avatar.id}
                avatar={avatar}
                unlocked={unlocked}
                isEquipped={equippedAvatarId === avatar.id}
                heroXp={heroXp}
                heroLevel={heroLevel}
                streakDays={streakDays}
                onClick={() => setSelectedAvatar(avatar)}
              />
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl opacity-40">☠</div>
            <p className="font-display text-lg uppercase tracking-widest text-muted-foreground">No Avatars Found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAvatar && (
        <AvatarDetailModal
          avatar={selectedAvatar}
          open={selectedAvatar !== null}
          onClose={() => setSelectedAvatar(null)}
          unlocked={isAvatarUnlocked(selectedAvatar, heroXp, heroLevel, streakDays)}
          isEquipped={equippedAvatarId === selectedAvatar.id}
          onEquip={() => handleEquip(selectedAvatar)}
          heroXp={heroXp}
          heroLevel={heroLevel}
          streakDays={streakDays}
        />
      )}
    </div>
  );
};

export default AvatarSystem;

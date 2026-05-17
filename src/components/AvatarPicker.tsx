import { useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PRESET_AVATARS, presetIdToUrl, resolveAvatarSrc } from "@/data/avatars";
import { HeroAvatar } from "@/components/HeroAvatar";
import {
  AVATAR_CHARACTERS, RARITY_STYLES, TYPE_LABELS,
  isAvatarUnlocked, generateAvatarSvg,
  type AvatarCharacter, type AvatarRarity, type AvatarType,
} from "@/data/avatarSystem";
import { toast } from "sonner";

const ARCHETYPE_PREFIX = "archetype:";
export const archetypeIdToUrl  = (id: string) => `${ARCHETYPE_PREFIX}${id}`;
export const isArchetypeAvatar = (url: string | null | undefined) =>
  !!url && url.startsWith(ARCHETYPE_PREFIX);

type Tab = "archetypes" | "portraits" | "upload";

/* ── SVG Avatar Card ─────────────────────────────────────── */
function AvatarSvgCard({ avatar, size = 72, locked, selected, onClick }: {
  avatar: AvatarCharacter; size?: number;
  locked: boolean; selected: boolean; onClick: () => void;
}) {
  const svgString = generateAvatarSvg(avatar, size);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  const rs = RARITY_STYLES[avatar.rarity];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      title={locked ? `Lv ${avatar.unlock_level} · ${avatar.unlock_xp.toLocaleString()} XP` : avatar.name}
      className={[
        "group relative flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all duration-200",
        selected
          ? `${rs.border} bg-primary/10 shadow-lg ${rs.glow}`
          : locked
          ? "border-border/40 bg-surface-deep/40 opacity-50 cursor-not-allowed"
          : `${rs.border} bg-surface-raised/60 hover:bg-surface-raised hover:-translate-y-0.5 ${rs.glow} cursor-pointer`,
      ].join(" ")}
    >
      <div className="relative">
        <img
          src={dataUrl} alt={avatar.name} width={size} height={size}
          className={`rounded-full ring-2 transition-all ${selected ? rs.border.replace("border-", "ring-") : "ring-border/40"}`}
          style={{ filter: locked ? "grayscale(0.8) brightness(0.5)" : undefined }}
        />
        {selected && !locked && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ boxShadow: `0 0 0 4px ${avatar.svgTheme.glow}` }} />
        )}
        {locked && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <span className="text-base">🔒</span>
          </div>
        )}
        {selected && !locked && (
          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-black font-bold">✓</div>
        )}
        {avatar.animated && !locked && (
          <span className="absolute top-0.5 left-0.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        )}
      </div>
      <span className={`font-display text-[9px] uppercase tracking-widest text-center leading-tight ${selected ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>
        {avatar.name}
      </span>
      <span className={`font-display text-[8px] uppercase ${rs.color}`}>{rs.label}</span>
    </button>
  );
}

/* ── Unlock progress ─────────────────────────────────────── */
function UnlockBar({ avatar, heroXp, heroLevel }: { avatar: AvatarCharacter; heroXp: number; heroLevel: number }) {
  return (
    <div className="space-y-2 text-xs">
      {[
        { label: "XP", current: heroXp, needed: avatar.unlock_xp, color: "bg-primary/70" },
        { label: "Level", current: heroLevel, needed: avatar.unlock_level, color: "bg-secondary/70" },
      ].map(({ label, current, needed, color }) => (
        <div key={label}>
          <div className="mb-1 flex justify-between font-display text-[9px] uppercase tracking-widest text-muted-foreground">
            <span>{label}</span>
            <span>{current.toLocaleString()} / {needed.toLocaleString()}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-deep">
            <div className={`h-full rounded-full transition-all ${color}`}
              style={{ width: `${Math.min(100, (current / Math.max(1, needed)) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */
interface AvatarPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentAvatarUrl: string | null;
  heroName: string;
  heroXp?: number;
  heroLevel?: number;
  heroStreak?: number;
  onSaved: (newUrl: string | null) => void;
}

export const AvatarPicker = ({
  open, onOpenChange, userId, currentAvatarUrl,
  heroName, heroXp = 0, heroLevel = 1, heroStreak = 0, onSaved,
}: AvatarPickerProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy]               = useState(false);
  const [preview, setPreview]         = useState<string | null>(currentAvatarUrl);
  const [tab, setTab]                 = useState<Tab>("archetypes");
  const [filterRarity, setFilterRarity] = useState<AvatarRarity | "all">("all");
  const [filterType, setFilterType]   = useState<AvatarType | "all">("all");
  const [detailAvatar, setDetailAvatar] = useState<AvatarCharacter | null>(null);

  const persist = async (newUrl: string | null) => {
    setBusy(true);
    const { error } = await supabase.from("heroes").update({ avatar_url: newUrl }).eq("user_id", userId);
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    onSaved(newUrl);
    toast.success("✦ Visage updated");
    onOpenChange(false);
  };

  const handleArchetype = (character: AvatarCharacter) => {
    if (!isAvatarUnlocked(character, heroXp, heroLevel, heroStreak)) {
      setDetailAvatar(character);
      return;
    }
    const url = archetypeIdToUrl(character.id);
    setPreview(url);
    void persist(url);
  };

  const handlePreset = (id: string) => {
    const url = presetIdToUrl(id);
    setPreview(url);
    void persist(url);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { cacheControl: "3600", upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setPreview(data.publicUrl);
      await persist(data.publicUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setBusy(false);
    }
  };

  const filtered = AVATAR_CHARACTERS.filter((a) => {
    if (filterRarity !== "all" && a.rarity !== filterRarity) return false;
    if (filterType   !== "all" && a.type   !== filterType)   return false;
    return true;
  });

  const unlockedCount = AVATAR_CHARACTERS.filter(
    (a) => isAvatarUnlocked(a, heroXp, heroLevel, heroStreak)
  ).length;

  const previewLabel = (() => {
    if (!preview) return "Default initial";
    if (preview.startsWith(ARCHETYPE_PREFIX)) {
      const id = preview.slice(ARCHETYPE_PREFIX.length);
      return AVATAR_CHARACTERS.find((a) => a.id === id)?.name ?? "Archetype";
    }
    if (resolveAvatarSrc(preview)) return "Z-Warrior Portrait";
    return "Custom photo";
  })();

  const RARITIES: (AvatarRarity | "all")[] = ["all", "common", "rare", "epic", "legendary", "mythic"];
  const TYPES: (AvatarType | "all")[] = ["all", ...Object.keys(TYPE_LABELS) as AvatarType[]];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden border-border bg-surface-raised p-0">

          {/* Header */}
          <DialogHeader className="shrink-0 border-b border-border/40 px-6 pt-6 pb-4">
            <DialogTitle className="font-display text-2xl uppercase tracking-widest text-gold">
              Choose Your Visage
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Pick an archetype, portrait, or upload your own photo.
            </DialogDescription>
            <div className="mt-3 flex items-center gap-4">
              <HeroAvatar avatarUrl={preview} name={heroName} size={60} glow />
              <div className="flex-1 min-w-0">
                <p className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">Active Visage</p>
                <p className="font-display text-sm font-bold text-foreground truncate">{previewLabel}</p>
                <p className="font-display text-[10px] text-secondary">
                  {unlockedCount} / {AVATAR_CHARACTERS.length} archetypes unlocked
                </p>
              </div>
              {preview && (
                <button type="button" onClick={() => { setPreview(null); void persist(null); }}
                  disabled={busy}
                  className="shrink-0 font-display text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive transition">
                  Remove
                </button>
              )}
            </div>
          </DialogHeader>

          {/* Tab bar */}
          <div className="shrink-0 flex gap-0 border-b border-border/40 px-6">
            {(["archetypes", "portraits", "upload"] as Tab[]).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`pb-2 pt-2 px-4 font-display text-[10px] uppercase tracking-widest border-b-2 transition-all ${
                  tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}>
                {t === "archetypes" ? "⚡ Archetypes" : t === "portraits" ? "🎨 Portraits" : "⬆ Upload"}
              </button>
            ))}
          </div>

          {/* Scrollable body */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">

            {/* ── ARCHETYPES ── */}
            {tab === "archetypes" && (
              <div className="space-y-4">
                {/* Rarity filter */}
                <div className="flex flex-wrap gap-1.5">
                  {RARITIES.map((r) => (
                    <button key={r} type="button" onClick={() => setFilterRarity(r)}
                      className={`rounded-full px-2.5 py-0.5 font-display text-[9px] uppercase tracking-widest border transition-all ${
                        filterRarity === r
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      } ${r !== "all" ? RARITY_STYLES[r as AvatarRarity].color : ""}`}>
                      {r === "all" ? "All Rarities" : RARITY_STYLES[r as AvatarRarity].label}
                    </button>
                  ))}
                </div>
                {/* Type filter */}
                <div className="flex flex-wrap gap-1.5">
                  {TYPES.map((tp) => (
                    <button key={tp} type="button" onClick={() => setFilterType(tp)}
                      className={`rounded-full px-2.5 py-0.5 font-display text-[9px] uppercase tracking-widest border transition-all ${
                        filterType === tp
                          ? "border-secondary bg-secondary/20 text-secondary"
                          : "border-border text-muted-foreground hover:border-secondary/40"
                      }`}>
                      {tp === "all" ? "All Styles" : TYPE_LABELS[tp as AvatarType]}
                    </button>
                  ))}
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                  <p className="py-10 text-center font-display text-sm text-muted-foreground">No archetypes match</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                    {filtered.map((a) => (
                      <AvatarSvgCard
                        key={a.id}
                        avatar={a}
                        size={68}
                        locked={!isAvatarUnlocked(a, heroXp, heroLevel, heroStreak)}
                        selected={preview === archetypeIdToUrl(a.id)}
                        onClick={() => handleArchetype(a)}
                      />
                    ))}
                  </div>
                )}
                <p className="text-center font-display text-[9px] uppercase tracking-widest text-muted-foreground/50">
                  🔒 Locked archetypes unlock through XP · Level · Streak
                </p>
              </div>
            )}

            {/* ── PORTRAITS ── */}
            {tab === "portraits" && (
              <div className="space-y-4">
                <p className="font-display text-xs uppercase tracking-widest text-secondary">◆ Z-Warrior Portraits ◆</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {PRESET_AVATARS.map((a) => {
                    const isActive = preview === presetIdToUrl(a.id);
                    return (
                      <button key={a.id} type="button" disabled={busy} onClick={() => handlePreset(a.id)}
                        className={`group flex flex-col items-center gap-2 rounded-xl border p-2.5 transition-all ${
                          isActive
                            ? "border-primary bg-primary/10 shadow-[0_0_16px_hsl(45_90%_55%/0.3)]"
                            : "border-border bg-surface-deep hover:border-primary/60 hover:-translate-y-0.5"
                        }`}>
                        <div className="relative">
                          <img src={a.src} alt={a.name} width={96} height={96} loading="lazy"
                            className={`h-16 w-16 rounded-full object-cover ring-2 ${isActive ? "ring-primary" : "ring-border/40"}`} />
                          {isActive && (
                            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-black font-bold">✓</div>
                          )}
                        </div>
                        <span className={`font-display text-[9px] uppercase tracking-widest text-center ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>
                          {a.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── UPLOAD ── */}
            {tab === "upload" && (
              <div className="flex flex-col items-center gap-6 py-8">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-border-bright/40 bg-surface-deep overflow-hidden">
                  {preview && !preview.startsWith("preset:") && !preview.startsWith(ARCHETYPE_PREFIX)
                    ? <img src={preview} alt="Custom" className="h-full w-full object-cover" />
                    : <span className="text-3xl">📷</span>
                  }
                </div>
                <div className="text-center">
                  <p className="font-display text-sm font-semibold text-foreground">Upload a custom photo</p>
                  <p className="mt-1 text-xs text-muted-foreground">JPG · PNG · GIF · Max 5 MB</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                <Button variant="rune" onClick={() => fileRef.current?.click()} disabled={busy}>
                  ⬆ Choose File
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-border/40 px-6 py-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={busy}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Locked avatar detail */}
      {detailAvatar && (
        <Dialog open={!!detailAvatar} onOpenChange={() => setDetailAvatar(null)}>
          <DialogContent className="max-w-sm border-border bg-surface-raised">
            <DialogHeader>
              <DialogTitle className={`font-display text-xl uppercase tracking-widest ${RARITY_STYLES[detailAvatar.rarity].color}`}>
                {detailAvatar.name}
              </DialogTitle>
              <DialogDescription className="italic text-muted-foreground text-xs">{detailAvatar.title}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              {(() => {
                const svg = generateAvatarSvg(detailAvatar, 96);
                const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
                return (
                  <div className="relative">
                    <img src={url} alt={detailAvatar.name} width={96} height={96}
                      className="rounded-full opacity-50 grayscale" />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                      <span className="text-2xl">🔒</span>
                    </div>
                  </div>
                );
              })()}
              <p className="text-center text-sm italic text-muted-foreground">"{detailAvatar.lore}"</p>
              <div className="w-full rounded-lg border border-border/60 bg-surface-deep p-4">
                <p className="mb-3 font-display text-[10px] uppercase tracking-widest text-secondary">Unlock Requirements</p>
                <UnlockBar avatar={detailAvatar} heroXp={heroXp} heroLevel={heroLevel} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDetailAvatar(null)} className="w-full">Keep Training ⚔</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

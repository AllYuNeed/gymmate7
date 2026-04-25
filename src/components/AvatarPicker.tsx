import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PRESET_AVATARS, presetIdToUrl, resolveAvatarSrc } from "@/data/avatars";
import { HeroAvatar } from "@/components/HeroAvatar";
import { toast } from "sonner";

interface AvatarPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentAvatarUrl: string | null;
  heroName: string;
  onSaved: (newUrl: string | null) => void;
}

export const AvatarPicker = ({ open, onOpenChange, userId, currentAvatarUrl, heroName, onSaved }: AvatarPickerProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);

  const persist = async (newUrl: string | null) => {
    setBusy(true);
    const { error } = await supabase.from("heroes").update({ avatar_url: newUrl }).eq("user_id", userId);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    onSaved(newUrl);
    toast.success("Avatar updated");
    onOpenChange(false);
  };

  const handlePreset = (id: string) => {
    const url = presetIdToUrl(id);
    setPreview(url);
    void persist(url);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setPreview(data.publicUrl);
      await persist(data.publicUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
      setBusy(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    void persist(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-surface-raised">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase tracking-widest text-gold">
            Choose Your Visage
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Pick a Z-warrior portrait or upload your own image. Visible to all guildmates and on the leaderboard.
          </DialogDescription>
        </DialogHeader>

        {/* Current preview */}
        <div className="flex items-center justify-center gap-4 py-2">
          <HeroAvatar avatarUrl={preview} name={heroName} size={96} glow />
          <div className="text-left">
            <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Currently</p>
            <p className="font-display text-base text-foreground">
              {preview ? (resolveAvatarSrc(preview) ? "Custom visage" : "—") : "Default initial"}
            </p>
          </div>
        </div>

        <div className="rune-divider" />
        <p className="text-center font-display text-xs uppercase tracking-[0.3em] text-secondary">◆ Z-Warrior Portraits ◆</p>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {PRESET_AVATARS.map((a) => {
            const isActive = preview === presetIdToUrl(a.id);
            return (
              <button
                key={a.id}
                type="button"
                disabled={busy}
                onClick={() => handlePreset(a.id)}
                className={`group flex flex-col items-center gap-2 rounded-lg border p-2 transition-all ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-gold"
                    : "border-border bg-card/60 hover:border-primary/60 hover:-translate-y-0.5"
                }`}
                title={a.name}
              >
                <img
                  src={a.src}
                  alt={a.name}
                  width={96}
                  height={96}
                  loading="lazy"
                  className="h-20 w-20 rounded-full object-cover ring-1 ring-border-bright/60"
                />
                <span className="font-display text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-primary">
                  {a.name}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rune-divider" />

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button variant="hero" onClick={() => fileRef.current?.click()} disabled={busy}>
            ⬆ Upload Custom Image
          </Button>
          <div className="flex gap-2">
            {preview && (
              <Button variant="ghost" onClick={handleRemove} disabled={busy}>
                Remove
              </Button>
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

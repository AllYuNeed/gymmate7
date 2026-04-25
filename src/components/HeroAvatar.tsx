import { resolveAvatarSrc } from "@/data/avatars";

interface HeroAvatarProps {
  avatarUrl?: string | null;
  name: string;
  size?: number;
  className?: string;
  glow?: boolean;
}

/** Round avatar with golden ring. Falls back to the hero's initial. */
export const HeroAvatar = ({ avatarUrl, name, size = 64, className = "", glow = false }: HeroAvatarProps) => {
  const src = resolveAvatarSrc(avatarUrl);
  const initial = (name?.trim()?.[0] ?? "?").toUpperCase();
  const ring = glow ? "ring-2 ring-primary shadow-gold" : "ring-1 ring-border-bright/60";

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-deep ${ring} ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={`${name}'s avatar`}
          width={size}
          height={size}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          className="font-display font-bold text-primary"
          style={{ fontSize: size * 0.4 }}
        >
          {initial}
        </span>
      )}
    </div>
  );
};

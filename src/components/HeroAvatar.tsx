import { resolveAvatarSrc } from "@/data/avatars";
import { AVATAR_CHARACTERS, generateAvatarSvg } from "@/data/avatarSystem";

const ARCHETYPE_PREFIX = "archetype:";

function resolveAnySrc(url: string | null | undefined): string | null {
  if (!url) return null;
  // Handle archetype: prefix — render as inline SVG data URL
  if (url.startsWith(ARCHETYPE_PREFIX)) {
    const id = url.slice(ARCHETYPE_PREFIX.length);
    const character = AVATAR_CHARACTERS.find((a) => a.id === id);
    if (!character) return null;
    const svgString = generateAvatarSvg(character, 128);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
  }
  // Handle preset: prefix
  return resolveAvatarSrc(url);
}

interface HeroAvatarProps {
  avatarUrl?: string | null;
  name: string;
  size?: number;
  className?: string;
  glow?: boolean;
}

/** Round avatar with golden ring. Handles preset:, archetype:, and raw URLs. */
export const HeroAvatar = ({ avatarUrl, name, size = 64, className = "", glow = false }: HeroAvatarProps) => {
  const src = resolveAnySrc(avatarUrl);
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

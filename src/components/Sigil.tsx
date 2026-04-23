interface SigilProps {
  glyph: string;
  size?: number;
  color?: string;
  animate?: boolean;
}

/**
 * Animated arcane sigil — concentric runed rings around a central glyph.
 * Used for class reveals and key moments.
 */
export function Sigil({ glyph, size = 200, color, animate = true }: SigilProps) {
  const accent = color ?? "hsl(45 90% 60%)";
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer rotating ring */}
      <svg
        className={animate ? "absolute inset-0 [animation:spin-slow_18s_linear_infinite]" : "absolute inset-0"}
        viewBox="0 0 200 200"
        style={{ filter: `drop-shadow(0 0 12px ${accent})` }}
      >
        <circle cx="100" cy="100" r="92" fill="none" stroke={accent} strokeWidth="0.6" strokeDasharray="2 6" opacity="0.7" />
        <circle cx="100" cy="100" r="82" fill="none" stroke={accent} strokeWidth="0.4" opacity="0.4" />
      </svg>

      {/* Inner counter-rotating ring with rune marks */}
      <svg
        className={animate ? "absolute inset-0 [animation:spin-slow_12s_linear_infinite_reverse]" : "absolute inset-0"}
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="68" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.6" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          const x1 = 100 + Math.cos(angle) * 64;
          const y1 = 100 + Math.sin(angle) * 64;
          const x2 = 100 + Math.cos(angle) * 72;
          const y2 = 100 + Math.sin(angle) * 72;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="1" opacity="0.8" />;
        })}
      </svg>

      {/* Twelve-pointed star */}
      <svg className="absolute inset-0" viewBox="0 0 200 200" style={{ filter: `drop-shadow(0 0 8px ${accent})` }}>
        <polygon
          points={Array.from({ length: 12 })
            .map((_, i) => {
              const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
              const r = i % 2 === 0 ? 50 : 28;
              return `${100 + Math.cos(angle) * r},${100 + Math.sin(angle) * r}`;
            })
            .join(" ")}
          fill="none"
          stroke={accent}
          strokeWidth="0.8"
          opacity="0.5"
        />
      </svg>

      {/* Central glyph */}
      <div
        className="relative font-display select-none"
        style={{
          fontSize: size * 0.36,
          color: accent,
          textShadow: `0 0 24px ${accent}, 0 0 8px ${accent}`,
          animation: animate ? "rune-glow 3s ease-in-out infinite" : undefined,
        }}
      >
        {glyph}
      </div>
    </div>
  );
}

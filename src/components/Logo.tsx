import logoSrc from "@/assets/logo.png";

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

/** Mortal Gyms shield logo. */
export const Logo = ({ size = 80, className = "", showWordmark = false }: LogoProps) => (
  <div className={`inline-flex items-center gap-3 ${className}`}>
    <img
      src={logoSrc}
      alt="Mortal Gyms — Fitness Evolution logo"
      width={size}
      height={size}
      className="h-auto w-auto select-none drop-shadow-[0_0_24px_hsl(45_90%_55%/0.35)]"
      style={{ maxHeight: size }}
    />
    {showWordmark && (
      <span className="font-display text-lg font-bold uppercase tracking-[0.2em] text-gold">
        Mortal Gyms
      </span>
    )}
  </div>
);

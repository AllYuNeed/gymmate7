import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        display: ['Cinzel', 'Times New Roman', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        "border-bright": "hsl(var(--border-bright))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          deep: "hsl(var(--surface-deep))",
          raised: "hsl(var(--surface-raised))",
          glow: "hsl(var(--surface-glow))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
          deep: "hsl(var(--primary-deep))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          glow: "hsl(var(--secondary-glow))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        rank: {
          untrained: "hsl(var(--rank-untrained))",
          novice: "hsl(var(--rank-novice))",
          adept: "hsl(var(--rank-adept))",
          veteran: "hsl(var(--rank-veteran))",
          elite: "hsl(var(--rank-elite))",
          legend: "hsl(var(--rank-legend))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        "gradient-realm": "var(--gradient-realm)",
        "gradient-gold": "var(--gradient-gold)",
        "gradient-gold-shine": "var(--gradient-gold-shine)",
        "gradient-arcane": "var(--gradient-arcane)",
        "gradient-card": "var(--gradient-card)",
        "gradient-xp": "var(--gradient-xp)",
        "gradient-sigil": "var(--gradient-sigil)",
      },
      boxShadow: {
        gold: "var(--shadow-gold)",
        arcane: "var(--shadow-arcane)",
        deep: "var(--shadow-deep)",
        rune: "var(--shadow-rune)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 20px -4px hsl(45 90% 55% / 0.4)" },
          "50%": { boxShadow: "0 0 40px -4px hsl(45 90% 55% / 0.8)" },
        },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        "rune-glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 8px hsl(45 90% 55% / 0.6))", opacity: "0.85" },
          "50%": { filter: "drop-shadow(0 0 24px hsl(45 90% 65% / 1))", opacity: "1" },
        },
        "fade-up": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-gold": "pulse-gold 2.5s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "rune-glow": "rune-glow 3s ease-in-out infinite",
        "fade-up": "fade-up 0.6s var(--ease-mystic) both",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

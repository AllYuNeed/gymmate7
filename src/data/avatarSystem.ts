// ============================================================
// AVATAR SYSTEM — Original superhero/cinematic-inspired avatars
// All characters are original creations, NOT copyrighted IP.
// Inspired by archetypes from superhero, Bollywood & Kollywood aesthetics.
// ============================================================

export type AvatarRarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export type AvatarType = "superhero" | "bollywood" | "kollywood" | "warrior" | "cosmic" | "shadow";

export interface AvatarCosmetic {
  hair?: string;
  outfit?: string;
  aura?: string;
  gear?: string;
  pose?: string;
  frame?: string;
}

export interface AvatarCharacter {
  id: string;
  name: string;
  title: string;
  lore: string;
  type: AvatarType;
  rarity: AvatarRarity;
  unlock_xp: number;     // 0 = available from start
  unlock_level: number;  // hero level required
  unlock_streak?: number; // optional streak requirement
  primary_color: string; // hex for UI accents
  aura_class: string;    // tailwind ring/glow class
  cosmetics: AvatarCosmetic;
  // SVG-based avatar — rendered inline (no external image dependency)
  svgTheme: {
    bg: string;       // background gradient stops
    cape: string;     // cape/costume color
    glow: string;     // aura glow color
    symbol: string;   // chest symbol glyph
  };
  tags: string[];
  animated: boolean; // whether the avatar has idle animation
}

export const AVATAR_CHARACTERS: AvatarCharacter[] = [
  // ── SUPERHERO-INSPIRED ──────────────────────────────────
  {
    id: "cosmic_warrior",
    name: "Cosmic Warrior",
    title: "Guardian of the Iron Galaxy",
    lore: "Born from the heart of a dying star, the Cosmic Warrior channels stellar energy into every rep. The barbell bends before their will.",
    type: "cosmic",
    rarity: "legendary",
    unlock_xp: 5000,
    unlock_level: 20,
    primary_color: "#f59e0b",
    aura_class: "ring-yellow-400 shadow-yellow-400/50",
    cosmetics: {
      outfit: "Stellar Plate Armor",
      aura: "Golden Star Aura",
      pose: "Power Stance",
      frame: "Cosmic Ring",
    },
    svgTheme: { bg: "#1a0a2e,#3b1f6e", cape: "#f59e0b", glow: "#fbbf24", symbol: "★" },
    tags: ["cosmic", "gold", "premium"],
    animated: true,
  },
  {
    id: "shadow_knight",
    name: "Shadow Knight",
    title: "The Darkness Made Flesh",
    lore: "Forged in the void between galaxies, the Shadow Knight trains in absolute darkness. Their power grows with every shadow they conquer.",
    type: "shadow",
    rarity: "epic",
    unlock_xp: 3000,
    unlock_level: 15,
    primary_color: "#7c3aed",
    aura_class: "ring-purple-500 shadow-purple-500/50",
    cosmetics: {
      outfit: "Void Shroud",
      aura: "Dark Matter Aura",
      pose: "Battle Ready",
      frame: "Shadow Frame",
    },
    svgTheme: { bg: "#0f0a1e,#1e1040", cape: "#7c3aed", glow: "#a855f7", symbol: "◆" },
    tags: ["dark", "purple", "stealth"],
    animated: true,
  },
  {
    id: "thunder_guardian",
    name: "Thunder Guardian",
    title: "Wielder of Storm Power",
    lore: "Lightning obeys the Thunder Guardian. Each deadlift summons storm clouds; each squat shakes the earth. The gym is their battlefield.",
    type: "superhero",
    rarity: "epic",
    unlock_xp: 2500,
    unlock_level: 12,
    primary_color: "#3b82f6",
    aura_class: "ring-blue-400 shadow-blue-400/50",
    cosmetics: {
      outfit: "Storm Armor",
      aura: "Lightning Aura",
      gear: "Thunder Bracers",
      frame: "Electric Frame",
    },
    svgTheme: { bg: "#0a1628,#1e3a6e", cape: "#3b82f6", glow: "#60a5fa", symbol: "⚡" },
    tags: ["lightning", "blue", "power"],
    animated: true,
  },
  {
    id: "iron_titan",
    name: "Iron Titan",
    title: "The Indestructible",
    lore: "Plated in living iron, the Iron Titan cannot be stopped — only rested. They forge themselves in the crucible of max effort.",
    type: "superhero",
    rarity: "rare",
    unlock_xp: 1500,
    unlock_level: 8,
    primary_color: "#ef4444",
    aura_class: "ring-red-400 shadow-red-400/40",
    cosmetics: {
      outfit: "Iron Suit",
      aura: "Heat Aura",
      gear: "Powered Gauntlets",
    },
    svgTheme: { bg: "#1a0a0a,#3d1515", cape: "#ef4444", glow: "#f87171", symbol: "⚙" },
    tags: ["red", "iron", "strength"],
    animated: false,
  },
  {
    id: "speed_phantom",
    name: "Speed Phantom",
    title: "Flash of the Forge",
    lore: "The Speed Phantom exists between heartbeats. Their HIIT circuits finish before others even begin. Speed is their superpower.",
    type: "superhero",
    rarity: "rare",
    unlock_xp: 1200,
    unlock_level: 6,
    primary_color: "#10b981",
    aura_class: "ring-emerald-400 shadow-emerald-400/40",
    cosmetics: {
      outfit: "Velocity Suit",
      aura: "Speed Lines Aura",
      gear: "Turbo Bracers",
    },
    svgTheme: { bg: "#071a12,#0d3d26", cape: "#10b981", glow: "#34d399", symbol: "⟹" },
    tags: ["green", "speed", "cardio"],
    animated: true,
  },
  // ── BOLLYWOOD-INSPIRED ───────────────────────────────────
  {
    id: "mass_hero",
    name: "Mass Hero",
    title: "The People's Champion",
    lore: "Mass Hero lifts for millions. Every curl is a salute to the crowd, every PR a blockbuster moment. The gym is their stage.",
    type: "bollywood",
    rarity: "epic",
    unlock_xp: 2000,
    unlock_level: 10,
    primary_color: "#f97316",
    aura_class: "ring-orange-400 shadow-orange-400/50",
    cosmetics: {
      outfit: "Hero Sherwani",
      aura: "Golden Filmi Glow",
      pose: "Signature Stance",
      frame: "Bollywood Gold Frame",
    },
    svgTheme: { bg: "#1a0a00,#3d2000", cape: "#f97316", glow: "#fb923c", symbol: "♛" },
    tags: ["bollywood", "orange", "mass"],
    animated: true,
  },
  {
    id: "action_king",
    name: "Action King",
    title: "Unstoppable Force of Nature",
    lore: "Action King doesn't dodge challenges — they destroy them. Every training session is a climactic action sequence with zero CGI.",
    type: "bollywood",
    rarity: "legendary",
    unlock_xp: 6000,
    unlock_level: 25,
    unlock_streak: 30,
    primary_color: "#eab308",
    aura_class: "ring-yellow-500 shadow-yellow-500/60",
    cosmetics: {
      outfit: "Legendary Action Suit",
      aura: "Cinematic Explosion Aura",
      pose: "Victory Roar",
      frame: "Blockbuster Frame",
    },
    svgTheme: { bg: "#1a1100,#3d2e00", cape: "#eab308", glow: "#facc15", symbol: "♦" },
    tags: ["legendary", "gold", "bollywood", "premium"],
    animated: true,
  },
  {
    id: "fitness_beast",
    name: "Fitness Beast",
    title: "Iron Will, Steel Body",
    lore: "No script, no shortcuts. Fitness Beast trains with raw hunger — the kind that turns gyms into temples and iron into legend.",
    type: "bollywood",
    rarity: "common",
    unlock_xp: 0,
    unlock_level: 1,
    primary_color: "#6b7280",
    aura_class: "ring-gray-400",
    cosmetics: {
      outfit: "Training Vest",
      aura: "Sweat and Steel Aura",
    },
    svgTheme: { bg: "#0f0f0f,#1f1f1f", cape: "#6b7280", glow: "#9ca3af", symbol: "✊" },
    tags: ["starter", "common", "grind"],
    animated: false,
  },
  {
    id: "stylish_warrior",
    name: "Stylish Warrior",
    title: "Fashion Meets Ferocity",
    lore: "Why choose between style and strength? Stylish Warrior proves the gym is a runway. Every lift is a pose; every pose, a power move.",
    type: "bollywood",
    rarity: "rare",
    unlock_xp: 1000,
    unlock_level: 5,
    primary_color: "#ec4899",
    aura_class: "ring-pink-400 shadow-pink-400/40",
    cosmetics: {
      outfit: "Designer Gym Wear",
      aura: "Glamour Aura",
      hair: "Signature Style",
    },
    svgTheme: { bg: "#1a0812,#3d1530", cape: "#ec4899", glow: "#f472b6", symbol: "✿" },
    tags: ["pink", "style", "bollywood"],
    animated: false,
  },
  // ── KOLLYWOOD-INSPIRED ───────────────────────────────────
  {
    id: "south_warrior",
    name: "South Warrior",
    title: "The Unconquered",
    lore: "From the ancient training grounds of the South, the South Warrior carries centuries of warrior spirit. Every set is a battle hymn.",
    type: "kollywood",
    rarity: "epic",
    unlock_xp: 2200,
    unlock_level: 11,
    primary_color: "#dc2626",
    aura_class: "ring-red-500 shadow-red-500/50",
    cosmetics: {
      outfit: "Ancient Warrior Robes",
      aura: "Blood Red Aura",
      gear: "War Drum Bells",
      pose: "Battle Cry Pose",
    },
    svgTheme: { bg: "#1a0505,#3d0f0f", cape: "#dc2626", glow: "#ef4444", symbol: "⚔" },
    tags: ["kollywood", "red", "warrior", "ancient"],
    animated: true,
  },
  {
    id: "alpha_leader",
    name: "Alpha Leader",
    title: "Born to Command",
    lore: "Alpha Leader walks into any gym and the weights feel lighter — because their presence alone raises everyone's level. Born to inspire.",
    type: "kollywood",
    rarity: "legendary",
    unlock_xp: 7000,
    unlock_level: 30,
    primary_color: "#0ea5e9",
    aura_class: "ring-sky-400 shadow-sky-400/60",
    cosmetics: {
      outfit: "Commander's Armor",
      aura: "Leader's Aura",
      frame: "Crown Frame",
      pose: "Throne Pose",
    },
    svgTheme: { bg: "#040c1a,#08213d", cape: "#0ea5e9", glow: "#38bdf8", symbol: "♛" },
    tags: ["legendary", "blue", "kollywood", "leader"],
    animated: true,
  },
  {
    id: "vintage_hero",
    name: "Vintage Hero",
    title: "Classic Never Dies",
    lore: "Old-school. Raw. Real. Vintage Hero trains the way legends did — no machines, no excuses, just iron and will under the open sky.",
    type: "kollywood",
    rarity: "rare",
    unlock_xp: 800,
    unlock_level: 4,
    primary_color: "#92400e",
    aura_class: "ring-amber-700 shadow-amber-700/30",
    cosmetics: {
      outfit: "Retro Training Gear",
      aura: "Sepia Aura",
    },
    svgTheme: { bg: "#120900,#2e1800", cape: "#92400e", glow: "#b45309", symbol: "⚡" },
    tags: ["vintage", "brown", "classic", "kollywood"],
    animated: false,
  },
  {
    id: "beast_mode",
    name: "Beast Mode Champion",
    title: "No Off Switch",
    lore: "Beast Mode Champion doesn't have a rest day — only heavy day and heavier day. The bar bends. The clock stops. The PR falls.",
    type: "kollywood",
    rarity: "mythic",
    unlock_xp: 15000,
    unlock_level: 50,
    unlock_streak: 100,
    primary_color: "#7c3aed",
    aura_class: "ring-violet-500 shadow-violet-500/70",
    cosmetics: {
      outfit: "Champion's Battle Armor",
      aura: "Mythic Beast Aura",
      frame: "Dragon Frame",
      pose: "Roar Pose",
      gear: "Champion Wristguards",
    },
    svgTheme: { bg: "#0a0014,#1e0040", cape: "#7c3aed", glow: "#c084fc", symbol: "☠" },
    tags: ["mythic", "purple", "elite", "kollywood", "boss"],
    animated: true,
  },
  // ── COSMIC / WARRIOR ────────────────────────────────────
  {
    id: "celestial_monk",
    name: "Celestial Monk",
    title: "Seeker of the Perfect Rep",
    lore: "Through discipline comes enlightenment. The Celestial Monk treats each training session as meditation — form over force, mind over matter.",
    type: "cosmic",
    rarity: "epic",
    unlock_xp: 3500,
    unlock_level: 18,
    primary_color: "#06b6d4",
    aura_class: "ring-cyan-400 shadow-cyan-400/50",
    cosmetics: {
      outfit: "Celestial Gi",
      aura: "Zen Energy Aura",
      pose: "Meditative Stance",
      frame: "Lotus Frame",
    },
    svgTheme: { bg: "#04111a,#062a3d", cape: "#06b6d4", glow: "#22d3ee", symbol: "☯" },
    tags: ["cyan", "monk", "mobility", "yoga"],
    animated: true,
  },
  {
    id: "nova_striker",
    name: "Nova Striker",
    title: "The Supernova Lifter",
    lore: "Once in ten thousand years, a Nova is born. They don't peak — they explode. Every training session releases energy that shakes the cosmos.",
    type: "cosmic",
    rarity: "mythic",
    unlock_xp: 20000,
    unlock_level: 75,
    primary_color: "#f59e0b",
    aura_class: "ring-yellow-400 shadow-yellow-400/80",
    cosmetics: {
      outfit: "Supernova Battle Suit",
      aura: "Cosmic Explosion Aura",
      frame: "Nebula Frame",
      pose: "Nova Burst Pose",
      gear: "Pulsar Wristguards",
    },
    svgTheme: { bg: "#0f0500,#3d1a00", cape: "#f59e0b", glow: "#fcd34d", symbol: "✦" },
    tags: ["mythic", "gold", "cosmic", "ultimate"],
    animated: true,
  },
  {
    id: "web_sentinel",
    name: "Web Sentinel",
    title: "Agility Hero of the Skyline",
    lore: "The Web Sentinel moves with gymnastic control, core strength, and impossible timing. Pull days feel like flying through the city.",
    type: "superhero",
    rarity: "rare",
    unlock_xp: 1800,
    unlock_level: 9,
    primary_color: "#dc2626",
    aura_class: "ring-red-500 shadow-red-500/40",
    cosmetics: {
      outfit: "Crimson Flex Suit",
      aura: "Agility Web Aura",
      pose: "Wall-Crawl Hold",
      frame: "Skyline Frame",
    },
    svgTheme: { bg: "#120606,#351018", cape: "#dc2626", glow: "#38bdf8", symbol: "WS" },
    tags: ["comic", "marvel-inspired", "agility", "calisthenics"],
    animated: true,
  },
  {
    id: "panther_warden",
    name: "Panther Warden",
    title: "Silent King of Strength",
    lore: "The Panther Warden trains with royal discipline: explosive jumps, controlled tempo, and quiet power under pressure.",
    type: "superhero",
    rarity: "epic",
    unlock_xp: 4200,
    unlock_level: 19,
    primary_color: "#8b5cf6",
    aura_class: "ring-violet-400 shadow-violet-400/50",
    cosmetics: {
      outfit: "Obsidian Combat Suit",
      aura: "Violet Kinetic Aura",
      gear: "Claw Bracers",
      pose: "Predator Squat",
    },
    svgTheme: { bg: "#05040a,#19122f", cape: "#111827", glow: "#a78bfa", symbol: "PW" },
    tags: ["comic", "marvel-inspired", "power", "stealth"],
    animated: true,
  },
  {
    id: "night_vigil",
    name: "Night Vigil",
    title: "Guardian of the Dark Rep",
    lore: "Night Vigil is built by discipline, not luck. Every strict rep sharpens the mind and every patrol starts under the squat rack.",
    type: "shadow",
    rarity: "epic",
    unlock_xp: 4600,
    unlock_level: 21,
    primary_color: "#64748b",
    aura_class: "ring-slate-400 shadow-slate-400/40",
    cosmetics: {
      outfit: "Midnight Tactical Armor",
      aura: "Silent Focus Aura",
      gear: "Utility Belt",
      frame: "Gothic Moon Frame",
    },
    svgTheme: { bg: "#020617,#111827", cape: "#0f172a", glow: "#94a3b8", symbol: "NV" },
    tags: ["comic", "dc-inspired", "discipline", "shadow"],
    animated: false,
  },
  {
    id: "solar_champion",
    name: "Solar Champion",
    title: "Last Son of the Sun Rack",
    lore: "The Solar Champion turns clean form into radiant force. Heavy sets look effortless when powered by patience and perfect technique.",
    type: "superhero",
    rarity: "legendary",
    unlock_xp: 9000,
    unlock_level: 34,
    unlock_streak: 45,
    primary_color: "#facc15",
    aura_class: "ring-yellow-300 shadow-yellow-300/60",
    cosmetics: {
      outfit: "Solar Cape Suit",
      aura: "Sunburst Aura",
      pose: "Hero Landing",
      frame: "Solar Crest",
    },
    svgTheme: { bg: "#07162e,#3b1f05", cape: "#2563eb", glow: "#fde047", symbol: "SC" },
    tags: ["comic", "dc-inspired", "strength", "legendary"],
    animated: true,
  },
  {
    id: "dance_dynast",
    name: "Dance Dynast",
    title: "Cardio King of the Silver Screen",
    lore: "Dance Dynast makes conditioning cinematic. Footwork, rhythm, and breath control turn every sweat session into a stage-ready finish.",
    type: "bollywood",
    rarity: "rare",
    unlock_xp: 1400,
    unlock_level: 7,
    primary_color: "#22c55e",
    aura_class: "ring-green-400 shadow-green-400/40",
    cosmetics: {
      outfit: "Neon Stage Tracksuit",
      aura: "Spotlight Aura",
      pose: "Signature Step",
      frame: "Cinema Lights",
    },
    svgTheme: { bg: "#03140a,#12351d", cape: "#22c55e", glow: "#86efac", symbol: "DD" },
    tags: ["bollywood", "dance", "cardio", "cinema"],
    animated: true,
  },
  {
    id: "desi_defender",
    name: "Desi Defender",
    title: "Protector of the Pump",
    lore: "Desi Defender brings blockbuster energy to every session: heavy presses, big confidence, and a crowd-pleasing finish.",
    type: "bollywood",
    rarity: "epic",
    unlock_xp: 3200,
    unlock_level: 16,
    primary_color: "#fb7185",
    aura_class: "ring-rose-400 shadow-rose-400/50",
    cosmetics: {
      outfit: "Festival Battle Jacket",
      aura: "Rose Gold Aura",
      gear: "Hero Bands",
      frame: "Premiere Frame",
    },
    svgTheme: { bg: "#1f0710,#3b1220", cape: "#fb7185", glow: "#fda4af", symbol: "DD" },
    tags: ["bollywood", "action", "hero", "cinema"],
    animated: true,
  },
  {
    id: "mass_commander",
    name: "Mass Commander",
    title: "Opening Day Legend",
    lore: "Mass Commander enters with calm fire. The warm-up is dramatic, the working sets are ruthless, and the finish is pure theatre.",
    type: "kollywood",
    rarity: "legendary",
    unlock_xp: 8200,
    unlock_level: 32,
    unlock_streak: 40,
    primary_color: "#ef4444",
    aura_class: "ring-red-400 shadow-red-400/60",
    cosmetics: {
      outfit: "Command Cape Armor",
      aura: "Theatre Fire Aura",
      pose: "Slow Walk Entry",
      frame: "First Day Frame",
    },
    svgTheme: { bg: "#180404,#3a0b0b", cape: "#ef4444", glow: "#fbbf24", symbol: "MC" },
    tags: ["kollywood", "mass", "leader", "cinema"],
    animated: true,
  },
  {
    id: "silver_spartan",
    name: "Silver Spartan",
    title: "Old-School Iron Hero",
    lore: "Silver Spartan respects discipline above hype. No shortcuts, no excuses, just form, consistency, and the quiet pride of hard training.",
    type: "kollywood",
    rarity: "rare",
    unlock_xp: 1600,
    unlock_level: 8,
    primary_color: "#cbd5e1",
    aura_class: "ring-slate-300 shadow-slate-300/40",
    cosmetics: {
      outfit: "Silver Training Armor",
      aura: "Classic Film Aura",
      gear: "Iron Wrist Wraps",
      pose: "Old-School Flex",
    },
    svgTheme: { bg: "#0f172a,#334155", cape: "#94a3b8", glow: "#e2e8f0", symbol: "SS" },
    tags: ["kollywood", "classic", "strength", "cinema"],
    animated: false,
  },
];

// ---------------------------------------------------------------------------
// Derived utilities
// ---------------------------------------------------------------------------
export const RARITY_STYLES: Record<AvatarRarity, { label: string; color: string; glow: string; border: string }> = {
  common:    { label: "Common",    color: "text-gray-400",    glow: "",                        border: "border-gray-600" },
  rare:      { label: "Rare",      color: "text-blue-400",    glow: "shadow-blue-400/30",      border: "border-blue-500/60" },
  epic:      { label: "Epic",      color: "text-purple-400",  glow: "shadow-purple-500/40",    border: "border-purple-500/60" },
  legendary: { label: "Legendary", color: "text-amber-400",   glow: "shadow-amber-400/50",     border: "border-amber-400/70" },
  mythic:    { label: "Mythic",    color: "text-fuchsia-400", glow: "shadow-fuchsia-500/60",   border: "border-fuchsia-500/70" },
};

export const TYPE_LABELS: Record<AvatarType, string> = {
  superhero: "Superhero",
  bollywood: "Bollywood",
  kollywood: "Kollywood",
  warrior:   "Warrior",
  cosmic:    "Cosmic",
  shadow:    "Shadow",
};

export function isAvatarUnlocked(
  avatar: AvatarCharacter,
  heroXp: number,
  heroLevel: number,
  streakDays: number,
): boolean {
  if (avatar.unlock_xp > heroXp) return false;
  if (avatar.unlock_level > heroLevel) return false;
  if (avatar.unlock_streak && avatar.unlock_streak > streakDays) return false;
  return true;
}

// Generate a simple SVG avatar inline (no external images needed)
export function generateAvatarSvg(avatar: AvatarCharacter, size = 128): string {
  const { bg, cape, glow, symbol } = avatar.svgTheme;
  const [bgStart, bgEnd] = bg.split(",");
  const half = size / 2;
  const bodyY = size * 0.35;
  const headR = size * 0.17;
  const bodyH = size * 0.32;
  const bodyW = size * 0.28;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="bg_${avatar.id}" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${bgEnd}" />
      <stop offset="100%" stop-color="${bgStart}" />
    </radialGradient>
    <radialGradient id="glow_${avatar.id}" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${glow}" stop-opacity="0.4" />
      <stop offset="100%" stop-color="${glow}" stop-opacity="0" />
    </radialGradient>
    <filter id="blur_${avatar.id}"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <!-- Background -->
  <circle cx="${half}" cy="${half}" r="${half}" fill="url(#bg_${avatar.id})"/>
  <!-- Glow halo -->
  <circle cx="${half}" cy="${half}" r="${half * 0.85}" fill="url(#glow_${avatar.id})"/>
  <!-- Cape/body shadow -->
  <ellipse cx="${half}" cy="${bodyY + bodyH * 0.6}" rx="${bodyW * 1.5}" ry="${bodyH * 0.5}" fill="${cape}" opacity="0.35" filter="url(#blur_${avatar.id})"/>
  <!-- Body -->
  <rect x="${half - bodyW / 2}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${bodyW * 0.25}" fill="${cape}" opacity="0.9"/>
  <!-- Head -->
  <circle cx="${half}" cy="${bodyY - headR * 0.6}" r="${headR}" fill="${cape}" opacity="0.85"/>
  <!-- Face highlight -->
  <circle cx="${half - headR * 0.2}" cy="${bodyY - headR * 0.8}" r="${headR * 0.35}" fill="white" opacity="0.25"/>
  <!-- Chest symbol -->
  <text x="${half}" y="${bodyY + bodyH * 0.55}" text-anchor="middle" dominant-baseline="middle" font-size="${size * 0.13}" fill="${glow}" opacity="0.95">${symbol}</text>
  <!-- Aura ring -->
  <circle cx="${half}" cy="${half}" r="${half - 2}" fill="none" stroke="${glow}" stroke-width="1.5" opacity="0.5"/>
</svg>`;
}

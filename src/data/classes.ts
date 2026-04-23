// Class definitions — assigned by the onboarding quiz.
// Each class has a sigil, lore, color theme, and gameplay modifiers.

export type ClassId =
  | "strength_builder"
  | "muscle_gain_specialist"
  | "endurance_athlete"
  | "hybrid_performer"
  | "recovery_focused"
  | "elite_athlete";

export interface HeroClass {
  id: ClassId;
  name: string;
  title: string;
  lore: string;
  sigil: string; // single glyph
  color: string; // hsl token
  bonusLabel: string;
  xpModifier: number;
  bossModifier: number;
}

export const HERO_CLASSES: Record<ClassId, HeroClass> = {
  strength_builder: {
    id: "strength_builder",
    name: "Ironclad",
    title: "The Strength Builder",
    lore: "Forged in the great furnaces of the Northern Peaks, the Ironclad bend steel and shatter limits. Every barbell is an oath.",
    sigil: "⚔",
    color: "hsl(25 90% 55%)",
    bonusLabel: "+25% XP on heavy compound lifts",
    xpModifier: 1.25,
    bossModifier: 1.4,
  },
  muscle_gain_specialist: {
    id: "muscle_gain_specialist",
    name: "Titan",
    title: "The Muscle Gain Specialist",
    lore: "Titans grow vast and unyielding, sculpted through patient hypertrophy. The mirror is their grimoire.",
    sigil: "♆",
    color: "hsl(270 60% 65%)",
    bonusLabel: "+25% XP on hypertrophy volume",
    xpModifier: 1.25,
    bossModifier: 1.2,
  },
  endurance_athlete: {
    id: "endurance_athlete",
    name: "Skyrunner",
    title: "The Endurance Athlete",
    lore: "Light of foot and limitless of breath, Skyrunners chase the horizon until the horizon yields.",
    sigil: "✦",
    color: "hsl(180 70% 55%)",
    bonusLabel: "+30% XP on cardio & metcons",
    xpModifier: 1.3,
    bossModifier: 1.1,
  },
  hybrid_performer: {
    id: "hybrid_performer",
    name: "Warden",
    title: "The Hybrid Performer",
    lore: "Wardens master every art — the lift, the run, the leap. Balance is their blade.",
    sigil: "✠",
    color: "hsl(45 90% 60%)",
    bonusLabel: "+15% XP on all training",
    xpModifier: 1.15,
    bossModifier: 1.25,
  },
  recovery_focused: {
    id: "recovery_focused",
    name: "Mystic",
    title: "The Recovery Focused",
    lore: "Mystics know that the body grows in stillness. Their breath is a ritual, their sleep a forge.",
    sigil: "☾",
    color: "hsl(224 100% 75%)",
    bonusLabel: "+50% recovery, fewer injuries",
    xpModifier: 1.1,
    bossModifier: 1.05,
  },
  elite_athlete: {
    id: "elite_athlete",
    name: "Ascendant",
    title: "The Elite Athlete",
    lore: "Few walk the Ascendant path. They demand more from themselves than the gods would dare ask.",
    sigil: "☀",
    color: "hsl(45 100% 65%)",
    bonusLabel: "+20% XP, +50% boss damage",
    xpModifier: 1.2,
    bossModifier: 1.5,
  },
};

export const CLASS_LIST = Object.values(HERO_CLASSES);

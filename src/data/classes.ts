// Class definitions assigned by the onboarding quiz.
// Existing class ids are preserved so saved heroes continue to render.

export type ClassTier = "basic" | "intermediate" | "advanced" | "elite";

export type ClassId =
  | "strength_initiate"
  | "strength_builder"
  | "strength_vanguard"
  | "strength_legend"
  | "muscle_foundation"
  | "muscle_gain_specialist"
  | "hypertrophy_alchemist"
  | "physique_archon"
  | "conditioning_initiate"
  | "endurance_athlete"
  | "endurance_vanguard"
  | "metabolic_sage"
  | "movement_initiate"
  | "hybrid_performer"
  | "performance_vanguard"
  | "elite_athlete"
  | "recovery_apprentice"
  | "recovery_focused"
  | "mobility_sage"
  | "restoration_oracle";

export interface HeroClass {
  id: ClassId;
  name: string;
  title: string;
  tier: ClassTier;
  tierLabel: string;
  lore: string;
  sigil: string;
  color: string;
  bonusLabel: string;
  xpModifier: number;
  bossModifier: number;
}

export const HERO_CLASSES: Record<ClassId, HeroClass> = {
  strength_initiate: {
    id: "strength_initiate",
    name: "Anvilborn",
    title: "The Basic Strength Initiate",
    tier: "basic",
    tierLabel: "Basic",
    lore: "Anvilborn heroes begin with clean reps, patient bracing, and the first honest weight on the bar.",
    sigil: "+",
    color: "hsl(28 90% 58%)",
    bonusLabel: "+15% XP on foundational strength lifts",
    xpModifier: 1.15,
    bossModifier: 1.15,
  },
  strength_builder: {
    id: "strength_builder",
    name: "Ironclad",
    title: "The Intermediate Strength Builder",
    tier: "intermediate",
    tierLabel: "Intermediate",
    lore: "Forged in the great furnaces of the Northern Peaks, the Ironclad bend steel and shatter limits. Every barbell is an oath.",
    sigil: "X",
    color: "hsl(25 90% 55%)",
    bonusLabel: "+25% XP on heavy compound lifts",
    xpModifier: 1.25,
    bossModifier: 1.4,
  },
  strength_vanguard: {
    id: "strength_vanguard",
    name: "Stoneguard",
    title: "The Advanced Strength Vanguard",
    tier: "advanced",
    tierLabel: "Advanced",
    lore: "Stoneguards train with exact intent: heavy triples, disciplined pauses, and pressure that turns into power.",
    sigil: "^",
    color: "hsl(12 82% 56%)",
    bonusLabel: "+30% XP on strength progressions",
    xpModifier: 1.3,
    bossModifier: 1.45,
  },
  strength_legend: {
    id: "strength_legend",
    name: "Atlas",
    title: "The Elite Strength Legend",
    tier: "elite",
    tierLabel: "Elite",
    lore: "Atlas-class lifters carry impossible loads with calm technique and make maximal effort look inevitable.",
    sigil: "#",
    color: "hsl(5 88% 60%)",
    bonusLabel: "+35% XP, +60% boss damage on max-effort work",
    xpModifier: 1.35,
    bossModifier: 1.6,
  },
  muscle_foundation: {
    id: "muscle_foundation",
    name: "Sculptor",
    title: "The Basic Muscle Foundation",
    tier: "basic",
    tierLabel: "Basic",
    lore: "Sculptors learn the early craft: full range, steady tempo, and enough volume to wake every muscle.",
    sigil: "o",
    color: "hsl(285 65% 68%)",
    bonusLabel: "+15% XP on hypertrophy basics",
    xpModifier: 1.15,
    bossModifier: 1.1,
  },
  muscle_gain_specialist: {
    id: "muscle_gain_specialist",
    name: "Titan",
    title: "The Intermediate Muscle Gain Specialist",
    tier: "intermediate",
    tierLabel: "Intermediate",
    lore: "Titans grow vast and unyielding, sculpted through patient hypertrophy. The mirror is their grimoire.",
    sigil: "*",
    color: "hsl(270 60% 65%)",
    bonusLabel: "+25% XP on hypertrophy volume",
    xpModifier: 1.25,
    bossModifier: 1.2,
  },
  hypertrophy_alchemist: {
    id: "hypertrophy_alchemist",
    name: "Massweaver",
    title: "The Advanced Hypertrophy Alchemist",
    tier: "advanced",
    tierLabel: "Advanced",
    lore: "Massweavers blend mechanical tension, pump work, and recovery into a physique that keeps adapting.",
    sigil: "%",
    color: "hsl(296 72% 63%)",
    bonusLabel: "+30% XP on volume and isolation mastery",
    xpModifier: 1.3,
    bossModifier: 1.3,
  },
  physique_archon: {
    id: "physique_archon",
    name: "Archon",
    title: "The Elite Physique Architect",
    tier: "elite",
    tierLabel: "Elite",
    lore: "Archons refine mass into proportion, turning advanced training into a deliberate work of armor.",
    sigil: "@",
    color: "hsl(312 78% 66%)",
    bonusLabel: "+35% XP on advanced physique training",
    xpModifier: 1.35,
    bossModifier: 1.4,
  },
  conditioning_initiate: {
    id: "conditioning_initiate",
    name: "Emberwalker",
    title: "The Basic Conditioning Initiate",
    tier: "basic",
    tierLabel: "Basic",
    lore: "Emberwalkers build the engine gently: repeatable sessions, better breathing, and a body that moves lighter.",
    sigil: "~",
    color: "hsl(175 72% 56%)",
    bonusLabel: "+15% XP on beginner cardio and circuits",
    xpModifier: 1.15,
    bossModifier: 1.05,
  },
  endurance_athlete: {
    id: "endurance_athlete",
    name: "Skyrunner",
    title: "The Intermediate Endurance Athlete",
    tier: "intermediate",
    tierLabel: "Intermediate",
    lore: "Light of foot and limitless of breath, Skyrunners chase the horizon until the horizon yields.",
    sigil: ">",
    color: "hsl(180 70% 55%)",
    bonusLabel: "+30% XP on cardio and metcons",
    xpModifier: 1.3,
    bossModifier: 1.1,
  },
  endurance_vanguard: {
    id: "endurance_vanguard",
    name: "Stormstrider",
    title: "The Advanced Endurance Vanguard",
    tier: "advanced",
    tierLabel: "Advanced",
    lore: "Stormstriders thrive where pace, grit, and conditioning meet: long efforts, hard intervals, and quick recovery.",
    sigil: "=",
    color: "hsl(194 80% 58%)",
    bonusLabel: "+35% XP on intervals and sustained conditioning",
    xpModifier: 1.35,
    bossModifier: 1.25,
  },
  metabolic_sage: {
    id: "metabolic_sage",
    name: "Tempest",
    title: "The Elite Metabolic Sage",
    tier: "elite",
    tierLabel: "Elite",
    lore: "Tempests control effort like weather, moving between power and endurance with disciplined precision.",
    sigil: "$",
    color: "hsl(204 88% 62%)",
    bonusLabel: "+40% XP on elite conditioning blocks",
    xpModifier: 1.4,
    bossModifier: 1.35,
  },
  movement_initiate: {
    id: "movement_initiate",
    name: "Pathfinder",
    title: "The Basic Athletic Initiate",
    tier: "basic",
    tierLabel: "Basic",
    lore: "Pathfinders build coordination first: hinge, squat, push, pull, carry, rotate, and move well.",
    sigil: "/",
    color: "hsl(46 88% 58%)",
    bonusLabel: "+15% XP on balanced beginner training",
    xpModifier: 1.15,
    bossModifier: 1.1,
  },
  hybrid_performer: {
    id: "hybrid_performer",
    name: "Warden",
    title: "The Intermediate Hybrid Performer",
    tier: "intermediate",
    tierLabel: "Intermediate",
    lore: "Wardens master every art: the lift, the run, the leap. Balance is their blade.",
    sigil: "&",
    color: "hsl(45 90% 60%)",
    bonusLabel: "+15% XP on all training",
    xpModifier: 1.15,
    bossModifier: 1.25,
  },
  performance_vanguard: {
    id: "performance_vanguard",
    name: "Vanguard",
    title: "The Advanced Performance Vanguard",
    tier: "advanced",
    tierLabel: "Advanced",
    lore: "Vanguards chase performance across domains, pairing strength, speed, mobility, and conditioning.",
    sigil: "V",
    color: "hsl(55 95% 58%)",
    bonusLabel: "+25% XP on mixed performance sessions",
    xpModifier: 1.25,
    bossModifier: 1.4,
  },
  elite_athlete: {
    id: "elite_athlete",
    name: "Ascendant",
    title: "The Elite Athlete",
    tier: "elite",
    tierLabel: "Elite",
    lore: "Few walk the Ascendant path. They demand more from themselves than the gods would dare ask.",
    sigil: "A",
    color: "hsl(45 100% 65%)",
    bonusLabel: "+20% XP, +50% boss damage",
    xpModifier: 1.2,
    bossModifier: 1.5,
  },
  recovery_apprentice: {
    id: "recovery_apprentice",
    name: "Mender",
    title: "The Basic Recovery Apprentice",
    tier: "basic",
    tierLabel: "Basic",
    lore: "Menders rebuild trust in the body through gentle progressions, simple mobility, and steady sleep.",
    sigil: ".",
    color: "hsl(220 92% 74%)",
    bonusLabel: "+20% XP on mobility and low-impact sessions",
    xpModifier: 1.2,
    bossModifier: 1.0,
  },
  recovery_focused: {
    id: "recovery_focused",
    name: "Mystic",
    title: "The Intermediate Recovery Focused",
    tier: "intermediate",
    tierLabel: "Intermediate",
    lore: "Mystics know that the body grows in stillness. Their breath is a ritual, their sleep a forge.",
    sigil: "M",
    color: "hsl(224 100% 75%)",
    bonusLabel: "+50% recovery, fewer injuries",
    xpModifier: 1.1,
    bossModifier: 1.05,
  },
  mobility_sage: {
    id: "mobility_sage",
    name: "Restorer",
    title: "The Advanced Mobility Sage",
    tier: "advanced",
    tierLabel: "Advanced",
    lore: "Restorers train around limits without surrendering to them, restoring range and strength together.",
    sigil: "R",
    color: "hsl(234 92% 76%)",
    bonusLabel: "+25% XP on corrective strength and mobility",
    xpModifier: 1.25,
    bossModifier: 1.15,
  },
  restoration_oracle: {
    id: "restoration_oracle",
    name: "Oracle",
    title: "The Elite Restoration Oracle",
    tier: "elite",
    tierLabel: "Elite",
    lore: "Oracles master readiness itself, knowing when to press, when to restore, and how to keep the body durable.",
    sigil: "O",
    color: "hsl(246 100% 78%)",
    bonusLabel: "+30% XP on advanced durability work",
    xpModifier: 1.3,
    bossModifier: 1.25,
  },
};

export const CLASS_LIST = Object.values(HERO_CLASSES);

export const CLASSES_BY_TIER = CLASS_LIST.reduce<Record<ClassTier, HeroClass[]>>(
  (groups, heroClass) => {
    groups[heroClass.tier].push(heroClass);
    return groups;
  },
  { basic: [], intermediate: [], advanced: [], elite: [] }
);

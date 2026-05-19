import type { ClassId } from "./classes";

export type QuizQuestionId =
  | "goal"
  | "experience_level"
  | "body_type"
  | "available_days"
  | "equipment"
  | "sleep_quality"
  | "stress_level"
  | "injuries";

export interface QuizOption {
  value: string;
  label: string;
  description?: string;
  glyph: string;
}

export interface QuizQuestion {
  id: QuizQuestionId;
  prompt: string;
  flavor: string;
  multi?: boolean;
  options: QuizOption[];
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "goal",
    prompt: "What does your hero seek?",
    flavor: "The first oath shapes the entire journey.",
    options: [
      { value: "muscle_gain", label: "Forge of Muscle", description: "Build mass and visible strength.", glyph: "♆" },
      { value: "fat_loss", label: "Path of Lean Steel", description: "Burn fat, reveal definition.", glyph: "✦" },
      { value: "strength", label: "Way of the Mountain", description: "Lift the impossible.", glyph: "⚔" },
      { value: "athletic", label: "Trial of the Athlete", description: "Speed, power, endurance.", glyph: "☀" },
    ],
  },
  {
    id: "experience_level",
    prompt: "How long have you trained?",
    flavor: "Every legend was once unproven.",
    options: [
      { value: "novice", label: "Novice", description: "Less than a year.", glyph: "◯" },
      { value: "adept", label: "Adept", description: "1–3 years.", glyph: "◐" },
      { value: "veteran", label: "Veteran", description: "3–7 years.", glyph: "◉" },
      { value: "master", label: "Master", description: "7+ years.", glyph: "✺" },
    ],
  },
  {
    id: "body_type",
    prompt: "Choose your ancestral form.",
    flavor: "Bloodlines guide the way the body responds.",
    options: [
      { value: "ectomorph", label: "Ectomorph", description: "Slim, fast metabolism.", glyph: "│" },
      { value: "mesomorph", label: "Mesomorph", description: "Athletic, builds easily.", glyph: "▲" },
      { value: "endomorph", label: "Endomorph", description: "Sturdy, gains mass quickly.", glyph: "●" },
    ],
  },
  {
    id: "available_days",
    prompt: "How many days each week shall you train?",
    flavor: "Discipline is the truest enchantment.",
    options: [
      { value: "2", label: "2 days", glyph: "✦" },
      { value: "3", label: "3 days", glyph: "✦✦" },
      { value: "4", label: "4 days", glyph: "✦✦✦" },
      { value: "5", label: "5 days", glyph: "✦✦✦✦" },
      { value: "6", label: "6 days", glyph: "✦✦✦✦✦" },
    ],
  },
  {
    id: "equipment",
    prompt: "Where do you wage your battles?",
    flavor: "Every arena offers different weapons.",
    options: [
      { value: "full_gym", label: "Full Gym", description: "Barbells, machines, the lot.", glyph: "🏛" },
      { value: "home_full", label: "Home — Equipped", description: "Dumbbells, rack, bench.", glyph: "⚒" },
      { value: "home_minimal", label: "Home — Minimal", description: "Bands, bodyweight.", glyph: "✦" },
      { value: "bodyweight", label: "Bodyweight Only", description: "You are the weapon.", glyph: "✋" },
    ],
  },
  {
    id: "sleep_quality",
    prompt: "How well do you rest?",
    flavor: "Recovery is half the spell.",
    options: [
      { value: "poor", label: "Restless", description: "Less than 6 hours.", glyph: "☾" },
      { value: "average", label: "Decent", description: "6–7 hours.", glyph: "☾" },
      { value: "good", label: "Restorative", description: "7–8 hours.", glyph: "☾" },
      { value: "excellent", label: "Mystic Slumber", description: "8+ hours.", glyph: "☾" },
    ],
  },
  {
    id: "stress_level",
    prompt: "How heavy is your burden?",
    flavor: "The mind feeds the body — for good or ill.",
    options: [
      { value: "low", label: "Calm Waters", glyph: "○" },
      { value: "medium", label: "Steady Storm", glyph: "◐" },
      { value: "high", label: "Tempest", glyph: "●" },
    ],
  },
  {
    id: "injuries",
    prompt: "Bear any old wounds?",
    flavor: "Choose all that apply — your training will adapt.",
    multi: true,
    options: [
      { value: "none", label: "None — I am whole", glyph: "✓" },
      { value: "lower_back", label: "Lower back", glyph: "✦" },
      { value: "knee", label: "Knee", glyph: "✦" },
      { value: "shoulder", label: "Shoulder", glyph: "✦" },
      { value: "wrist", label: "Wrist / elbow", glyph: "✦" },
    ],
  },
];

export type QuizAnswers = Partial<Record<QuizQuestionId, string | string[]>>;

export interface ProfileData {
  age: number;
  gender: "male" | "female" | "other";
  height_cm: number;
  weight_kg: number;
  units: "metric" | "imperial";
  username: string;
  gym_name: string;
  country: string;
  city: string;
}

// Compute the player's class from their answers
export function computeClass(answers: QuizAnswers): ClassId {
  const goal = answers.goal as string;
  const experience = answers.experience_level as string;
  const sleep = answers.sleep_quality as string;
  const stress = answers.stress_level as string;
  const days = parseInt((answers.available_days as string) || "3", 10);
  const injuries = (answers.injuries as string[]) ?? [];

  const hasInjuries = injuries.length > 0 && !injuries.includes("none");
  const recoveryRisk = sleep === "poor" || stress === "high" || hasInjuries;

  if (recoveryRisk && (sleep === "poor" || hasInjuries)) {
    switch (experience) {
      case "master":
        return "restoration_oracle";
      case "veteran":
        return "mobility_sage";
      case "adept":
        return "recovery_focused";
      default:
        return "recovery_apprentice";
    }
  }

  const experienceTier = experience || "novice";

  switch (goal) {
    case "strength": {
      if (experienceTier === "master" && days >= 5) return "strength_legend";
      if (experienceTier === "veteran") return "strength_vanguard";
      if (experienceTier === "adept") return "strength_builder";
      return "strength_initiate";
    }
    case "muscle_gain": {
      if (experienceTier === "master" && days >= 5) return "physique_archon";
      if (experienceTier === "veteran") return "hypertrophy_alchemist";
      if (experienceTier === "adept") return "muscle_gain_specialist";
      return "muscle_foundation";
    }
    case "fat_loss":
      if (experienceTier === "master" && days >= 5) return "metabolic_sage";
      if (experienceTier === "veteran" || days >= 5) return "endurance_vanguard";
      if (experienceTier === "adept" || days >= 4) return "endurance_athlete";
      return "conditioning_initiate";
    case "athletic": {
      if (experienceTier === "master" && days >= 5) return "elite_athlete";
      if (experienceTier === "veteran" || days >= 5) return "performance_vanguard";
      if (experienceTier === "adept" || days >= 4) return "hybrid_performer";
      return "movement_initiate";
    }
    default:
      return "hybrid_performer";
  }
}

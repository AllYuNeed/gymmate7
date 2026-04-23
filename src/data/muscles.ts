// 17 muscle realms — each its own kingdom to ascend.
export interface MuscleRealm {
  id: string;
  name: string;
  glyph: string;
  region: "upper" | "core" | "lower";
}

export const MUSCLES: MuscleRealm[] = [
  { id: "chest", name: "Chest", glyph: "✚", region: "upper" },
  { id: "upper_back", name: "Upper Back", glyph: "▲", region: "upper" },
  { id: "lats", name: "Lats", glyph: "◆", region: "upper" },
  { id: "lower_back", name: "Lower Back", glyph: "▽", region: "core" },
  { id: "shoulders", name: "Shoulders", glyph: "◯", region: "upper" },
  { id: "biceps", name: "Biceps", glyph: "❖", region: "upper" },
  { id: "triceps", name: "Triceps", glyph: "✦", region: "upper" },
  { id: "forearms", name: "Forearms", glyph: "✧", region: "upper" },
  { id: "abs", name: "Abs", glyph: "⊟", region: "core" },
  { id: "obliques", name: "Obliques", glyph: "⊠", region: "core" },
  { id: "quads", name: "Quads", glyph: "❉", region: "lower" },
  { id: "hamstrings", name: "Hamstrings", glyph: "❀", region: "lower" },
  { id: "glutes", name: "Glutes", glyph: "❂", region: "lower" },
  { id: "calves", name: "Calves", glyph: "✺", region: "lower" },
  { id: "neck", name: "Neck", glyph: "◉", region: "upper" },
  { id: "traps", name: "Traps", glyph: "△", region: "upper" },
  { id: "cardio", name: "Cardio", glyph: "♥", region: "core" },
];

export const MUSCLE_BY_ID = Object.fromEntries(MUSCLES.map((m) => [m.id, m]));

export const RANK_TIERS = [
  { min: 1, label: "Untrained", color: "hsl(var(--rank-untrained))" },
  { min: 5, label: "Novice", color: "hsl(var(--rank-novice))" },
  { min: 15, label: "Adept", color: "hsl(var(--rank-adept))" },
  { min: 30, label: "Veteran", color: "hsl(var(--rank-veteran))" },
  { min: 50, label: "Elite", color: "hsl(var(--rank-elite))" },
  { min: 75, label: "Legend", color: "hsl(var(--rank-legend))" },
];

export function rankFromXp(xp: number): number {
  // Each rank = 100 * rank^1.4 XP
  let rank = 1;
  let needed = 0;
  while (rank < 100) {
    needed += Math.floor(100 * Math.pow(rank, 1.4));
    if (xp < needed) break;
    rank++;
  }
  return rank;
}

export function tierForRank(rank: number) {
  let current = RANK_TIERS[0];
  for (const t of RANK_TIERS) if (rank >= t.min) current = t;
  return current;
}

// Common exercises with target muscles — used in the workout logger
export interface Exercise {
  id: string;
  name: string;
  muscles: string[]; // muscle ids
  intensity: number; // multiplier
}

export const EXERCISES: Exercise[] = [
  { id: "bench_press", name: "Bench Press", muscles: ["chest", "triceps", "shoulders"], intensity: 1.3 },
  { id: "incline_db_press", name: "Incline DB Press", muscles: ["chest", "shoulders"], intensity: 1.15 },
  { id: "push_up", name: "Push-Up", muscles: ["chest", "triceps", "shoulders"], intensity: 0.9 },
  { id: "pull_up", name: "Pull-Up", muscles: ["lats", "biceps", "upper_back"], intensity: 1.25 },
  { id: "lat_pulldown", name: "Lat Pulldown", muscles: ["lats", "biceps"], intensity: 1.1 },
  { id: "barbell_row", name: "Barbell Row", muscles: ["upper_back", "lats", "biceps"], intensity: 1.2 },
  { id: "deadlift", name: "Deadlift", muscles: ["lower_back", "hamstrings", "glutes", "traps"], intensity: 1.5 },
  { id: "squat", name: "Back Squat", muscles: ["quads", "glutes", "lower_back"], intensity: 1.5 },
  { id: "front_squat", name: "Front Squat", muscles: ["quads", "abs"], intensity: 1.35 },
  { id: "leg_press", name: "Leg Press", muscles: ["quads", "glutes"], intensity: 1.1 },
  { id: "rdl", name: "Romanian Deadlift", muscles: ["hamstrings", "glutes", "lower_back"], intensity: 1.3 },
  { id: "leg_curl", name: "Leg Curl", muscles: ["hamstrings"], intensity: 1.0 },
  { id: "calf_raise", name: "Calf Raise", muscles: ["calves"], intensity: 1.0 },
  { id: "ohp", name: "Overhead Press", muscles: ["shoulders", "triceps"], intensity: 1.25 },
  { id: "lateral_raise", name: "Lateral Raise", muscles: ["shoulders"], intensity: 1.0 },
  { id: "barbell_curl", name: "Barbell Curl", muscles: ["biceps", "forearms"], intensity: 1.05 },
  { id: "tricep_pushdown", name: "Tricep Pushdown", muscles: ["triceps"], intensity: 1.0 },
  { id: "plank", name: "Plank", muscles: ["abs", "obliques"], intensity: 0.9 },
  { id: "russian_twist", name: "Russian Twist", muscles: ["obliques", "abs"], intensity: 0.95 },
  { id: "crunch", name: "Crunch", muscles: ["abs"], intensity: 0.85 },
  { id: "hip_thrust", name: "Hip Thrust", muscles: ["glutes", "hamstrings"], intensity: 1.2 },
  { id: "shrug", name: "Shrug", muscles: ["traps"], intensity: 1.0 },
  { id: "neck_curl", name: "Neck Curl", muscles: ["neck"], intensity: 0.9 },
  { id: "wrist_curl", name: "Wrist Curl", muscles: ["forearms"], intensity: 0.9 },
  { id: "running", name: "Running (15 min)", muscles: ["cardio", "calves", "quads"], intensity: 1.0 },
  { id: "cycling", name: "Cycling (15 min)", muscles: ["cardio", "quads"], intensity: 0.9 },
  { id: "rowing_erg", name: "Rowing Erg (10 min)", muscles: ["cardio", "upper_back", "lats"], intensity: 1.1 },
  { id: "jump_rope", name: "Jump Rope (5 min)", muscles: ["cardio", "calves"], intensity: 0.85 },
];

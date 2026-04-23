// XP & level helpers (mirrors the spec formulas)
export const xpForLevel = (lvl: number) => Math.floor(100 * Math.pow(lvl, 1.5));

export function computeLevelFromXp(totalXp: number) {
  let level = 1;
  let consumed = 0;
  while (level < 999) {
    const need = xpForLevel(level + 1);
    if (totalXp - consumed < need) break;
    consumed += need;
    level++;
  }
  return { level, xpInLevel: totalXp - consumed, xpForNext: xpForLevel(level + 1) };
}

// XP per set: (reps × weight × intensity) — caps for bodyweight (weight=0)
export function setXp(reps: number, weight: number, intensity: number) {
  const w = weight > 0 ? weight : 0.5; // bodyweight reps still earn XP
  const raw = reps * w * intensity;
  return Math.max(1, Math.round(raw / 2));
}

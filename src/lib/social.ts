// Helpers for weekly XP reset (Monday 00:00 UTC).
export function startOfIsoWeek(d: Date = new Date()): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = x.getUTCDay(); // 0=Sun..6=Sat
  const diff = (day === 0 ? -6 : 1 - day);
  x.setUTCDate(x.getUTCDate() + diff);
  return x;
}

// Returns the new weekly_xp value given the previous reset timestamp and gain.
export function addWeeklyXp(prevWeeklyXp: number, prevResetAt: string | Date, gain: number) {
  const reset = typeof prevResetAt === "string" ? new Date(prevResetAt) : prevResetAt;
  const weekStart = startOfIsoWeek();
  const stale = reset < weekStart;
  return {
    weekly_xp: stale ? gain : prevWeeklyXp + gain,
    weekly_xp_reset_at: stale ? weekStart.toISOString() : reset.toISOString(),
    didReset: stale,
  };
}

export function generateInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

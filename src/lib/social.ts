// Helpers for weekly XP reset (Monday 00:00 IST = Sunday 18:30 UTC).
import { nowIST } from "@/lib/ist";

/** Returns the start of the current ISO week in IST (Monday 00:00 IST). */
export function startOfIsoWeekIST(): Date {
  const ist = nowIST(); // Date shifted to IST
  const day = ist.getUTCDay(); // 0=Sun..6=Sat (but in IST context)
  const diff = day === 0 ? -6 : 1 - day; // days back to Monday
  const mondayIST = new Date(ist);
  mondayIST.setUTCDate(ist.getUTCDate() + diff);
  // Set to midnight IST = 18:30 previous day UTC
  mondayIST.setUTCHours(0, 0, 0, 0); // midnight in the shifted "IST" frame
  return mondayIST;
}

// Returns the new weekly_xp value given the previous reset timestamp and gain.
export function addWeeklyXp(prevWeeklyXp: number, prevResetAt: string | Date, gain: number) {
  const reset = typeof prevResetAt === "string" ? new Date(prevResetAt) : prevResetAt;
  const weekStart = startOfIsoWeekIST();
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

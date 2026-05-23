// ══════════════════════════════════════════════════════════════
//  IST TIMEZONE UTILITY
//  India Standard Time = UTC+5:30
//  All date strings used for streaks, quests, workout logs,
//  gym journey, boss keys, and calendar MUST use these helpers.
//  Never use new Date().toISOString().slice(0,10) — that's UTC.
// ══════════════════════════════════════════════════════════════

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // +5:30 in milliseconds

/**
 * Returns a Date object representing "now" shifted to IST.
 * Use this wherever you need getDay(), getMonth(), getDate() etc.
 * in IST rather than the browser's local timezone.
 */
export function nowIST(): Date {
  const utc = Date.now();
  return new Date(utc + IST_OFFSET_MS);
}

/**
 * Returns today's date string in IST as "YYYY-MM-DD".
 * This is the correct replacement for:
 *   new Date().toISOString().slice(0, 10)  ← WRONG (UTC)
 */
export function todayIST(): string {
  return nowIST().toISOString().slice(0, 10);
}

/**
 * Returns the current month key in IST as "YYYY-MM".
 * Replacement for: new Date().toISOString().slice(0, 7)
 */
export function monthKeyIST(): string {
  return nowIST().toISOString().slice(0, 7);
}

/**
 * Returns true if the given "YYYY-MM-DD" string is a Sunday in IST.
 * We append T12:00:00 to avoid any midnight ambiguity — a date string
 * at noon will always resolve to the correct local day.
 */
export function isSundayIST(iso: string): boolean {
  // Parse YYYY-MM-DD as a local noon time in IST
  const [y, m, d] = iso.split("-").map(Number);
  // Create a Date at that calendar date at 12:00 UTC+5:30 (= 06:30 UTC)
  const utcMs = Date.UTC(y, m - 1, d, 6, 30, 0); // noon IST = 06:30 UTC
  return new Date(utcMs).getUTCDay() === 0; // 0 = Sunday
}

/**
 * Returns true if TODAY (in IST) is Sunday.
 */
export function isTodaySundayIST(): boolean {
  return nowIST().getUTCDay() === 0;
}

/**
 * Returns the day-of-week (0=Sun) for today in IST.
 */
export function dayOfWeekIST(): number {
  return nowIST().getUTCDay();
}

/**
 * Returns the 1st of the current month in IST as "YYYY-MM-DD".
 * Replacement for: date_trunc('month', now()) on the client side.
 */
export function monthStartIST(): string {
  const ist = nowIST();
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

/**
 * Returns the 1st of next month in IST as "YYYY-MM-DD".
 */
export function nextMonthStartIST(): string {
  const ist = nowIST();
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth(); // 0-indexed
  if (m === 11) return `${y + 1}-01-01`;
  return `${y}-${String(m + 2).padStart(2, "0")}-01`;
}

/**
 * Days remaining until the 1st of next month (IST).
 */
export function daysUntilMonthResetIST(): number {
  const now = Date.now() + IST_OFFSET_MS; // current ms in IST
  const nextStart = new Date(nextMonthStartIST() + "T00:00:00+05:30").getTime();
  return Math.max(1, Math.ceil((nextStart - now) / 86_400_000));
}

/**
 * Formats a "YYYY-MM-DD" date string for display using IST locale.
 * e.g. "2025-01-15" → "Jan 15"
 */
export function fmtDateIST(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = iso.split("-").map(Number);
  const utcMs = Date.UTC(y, m - 1, d, 6, 30, 0); // noon IST
  return new Date(utcMs).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    ...opts,
  });
}

/**
 * Formats a "YYYY-MM-DD" date with month+year.
 * e.g. "Jan 2025"
 */
export function fmtMonthYearIST(iso: string): string {
  return fmtDateIST(iso, { month: "short", year: "numeric", day: undefined });
}

/**
 * Formats a full ISO timestamp (from Supabase created_at) to IST time.
 * e.g. "14:32 IST"
 */
export function fmtTimeIST(isoTimestamp: string): string {
  const d = new Date(new Date(isoTimestamp).getTime() + IST_OFFSET_MS);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

/**
 * Converts a full ISO timestamp to IST date string "YYYY-MM-DD".
 * Use this to group workout_logs by date in IST.
 */
export function isoToISTDateStr(isoTimestamp: string): string {
  const d = new Date(new Date(isoTimestamp).getTime() + IST_OFFSET_MS);
  return d.toISOString().slice(0, 10);
}

/**
 * Builds the 35-cell calendar grid (5 weeks) for the current IST month.
 * Replaces buildCalendarGrid() in streak.ts.
 */
export interface CalendarDay {
  iso: string;
  dayOfMonth: number;
  isSunday: boolean;
  isToday: boolean;
  isFuture: boolean;
  isCurrentMonth: boolean;
}

export function buildCalendarGridIST(): CalendarDay[] {
  const todayStr = todayIST();
  const ist = nowIST();
  const currentMonth = ist.getUTCMonth();
  const currentYear = ist.getUTCFullYear();

  // First day of current month in IST
  const firstOfMonthUtcMs = Date.UTC(currentYear, currentMonth, 1, 6, 30, 0);
  const firstDow = new Date(firstOfMonthUtcMs).getUTCDay(); // 0=Sun

  // Start from the Sunday of the week containing the 1st
  const gridStartMs = firstOfMonthUtcMs - firstDow * 86_400_000;

  const days: CalendarDay[] = [];
  for (let i = 0; i < 35; i++) {
    const ms = gridStartMs + i * 86_400_000;
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    const mo = d.getUTCMonth();
    const day = d.getUTCDate();
    const iso = `${y}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    days.push({
      iso,
      dayOfMonth: day,
      isSunday: d.getUTCDay() === 0,
      isToday: iso === todayStr,
      isFuture: iso > todayStr,
      isCurrentMonth: mo === currentMonth && y === currentYear,
    });
  }
  return days;
}

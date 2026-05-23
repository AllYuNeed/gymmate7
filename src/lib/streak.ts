// ══════════════════════════════════════════════════════════════
//  STREAK LOGIC — client-side helpers
//  All heavy logic runs server-side via process_streak_on_workout()
//  These helpers are for display, calendar, and UI calculations.
// ══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface StreakState {
  streak_days: number;
  longest_streak: number;
  streak_shield_count: number;
  shield_reset_date: string;       // ISO date "YYYY-MM-DD"
  sunday_protection: boolean;
  last_workout_date: string | null;
}

export interface ShieldLogEntry {
  id: string;
  used_date: string;
  auto_triggered: boolean;
  streak_preserved: number;
  is_sunday: boolean;
  created_at: string;
}

export type StreakAction =
  | "started"
  | "extended"
  | "sunday_protected"
  | "shield_used"
  | "broken"
  | "already_logged";

export interface StreakResult {
  action: StreakAction;
  streak: number;
  message?: string;
  shields_remaining?: number;
  shields_used?: number;
}

// ── Date helpers ───────────────────────────────────────────────
export const todayISO = (): string => new Date().toISOString().slice(0, 10);
export const isSunday = (date: Date = new Date()): boolean => date.getDay() === 0;
export const isSundayStr = (iso: string): boolean => new Date(iso + "T12:00:00").getDay() === 0;

/** Days until next monthly shield reset */
export function daysUntilMonthReset(): number {
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 1));
  return Math.ceil((nextMonth.getTime() - now.getTime()) / 86_400_000);
}

/** Human-readable shield reset countdown */
export function shieldResetLabel(): string {
  const d = daysUntilMonthReset();
  if (d <= 1) return "Resets tomorrow";
  return `Resets in ${d} days`;
}

/** Format streak duration nicely */
export function formatStreak(days: number): string {
  if (days === 0) return "No streak yet";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  const rem = days % 7;
  if (rem === 0) return `${weeks} week${weeks > 1 ? "s" : ""}`;
  return `${weeks}w ${rem}d`;
}

/** Flame intensity tier based on streak length */
export function streakTier(days: number): "none" | "warm" | "hot" | "blazing" | "inferno" {
  if (days === 0) return "none";
  if (days < 7) return "warm";
  if (days < 30) return "hot";
  if (days < 100) return "blazing";
  return "inferno";
}

export const STREAK_TIER_META = {
  none:    { label: "Cold",    color: "text-muted-foreground",  glow: "",                                flame: "🌑", xpBonus: 1.0 },
  warm:    { label: "Warm",    color: "text-amber-400",         glow: "shadow-[0_0_12px_#f59e0b80]",     flame: "🔥", xpBonus: 1.05 },
  hot:     { label: "Hot",     color: "text-orange-400",        glow: "shadow-[0_0_18px_#fb923c90]",     flame: "🔥", xpBonus: 1.1 },
  blazing: { label: "Blazing", color: "text-red-400",           glow: "shadow-[0_0_24px_#f87171aa]",     flame: "💥", xpBonus: 1.2 },
  inferno: { label: "Inferno", color: "text-primary",           glow: "shadow-[0_0_32px_hsl(45_90%_60%/0.9)]", flame: "⚡", xpBonus: 1.35 },
} as const;

/** Build 35-day calendar grid (5 weeks) centred on today */
export interface CalendarDay {
  iso: string;           // "YYYY-MM-DD"
  date: Date;
  dayOfMonth: number;
  isSunday: boolean;
  isToday: boolean;
  isFuture: boolean;
  isCurrentMonth: boolean;
}

export function buildCalendarGrid(): CalendarDay[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  // Start from the Sunday of the week containing the 1st of this month
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  firstOfMonth.setHours(12, 0, 0, 0);
  const startOffset = firstOfMonth.getDay(); // 0=Sun
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(gridStart.getDate() - startOffset);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 35; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    d.setHours(12, 0, 0, 0);
    const iso = d.toISOString().slice(0, 10);
    days.push({
      iso,
      date: d,
      dayOfMonth: d.getDate(),
      isSunday: d.getDay() === 0,
      isToday: iso === todayStr,
      isFuture: iso > todayStr,
      isCurrentMonth: d.getMonth() === today.getMonth(),
    });
  }
  return days;
}

/** Call the server-side streak function after logging a workout */
export async function processStreakOnWorkout(userId: string): Promise<StreakResult> {
  const { data, error } = await supabase.rpc("process_streak_on_workout", {
    p_user_id: userId,
  });
  if (error) {
    console.error("streak rpc error:", error);
    return { action: "already_logged", streak: 0 };
  }
  return data as StreakResult;
}

/** Refresh shields if new month (client calls this on app open) */
export async function refreshShieldsIfNeeded(userId: string): Promise<void> {
  await supabase.rpc("check_and_refresh_shields", { p_user_id: userId });
}

/** Fetch full streak state for a user */
export async function fetchStreakState(userId: string): Promise<StreakState | null> {
  const { data } = await supabase
    .from("heroes")
    .select("streak_days, longest_streak, streak_shield_count, shield_reset_date, sunday_protection, last_workout_date")
    .eq("user_id", userId)
    .maybeSingle();
  return data as StreakState | null;
}

/** Fetch shield usage history (last 30 days) */
export async function fetchShieldLog(userId: string): Promise<ShieldLogEntry[]> {
  const { data } = await supabase
    .from("streak_shield_log")
    .select("*")
    .eq("user_id", userId)
    .order("used_date", { ascending: false })
    .limit(30);
  return (data ?? []) as ShieldLogEntry[];
}

/** Fetch workout dates for the calendar (last 60 days) */
export async function fetchWorkoutDates(userId: string): Promise<Set<string>> {
  const since = new Date();
  since.setDate(since.getDate() - 60);
  const { data } = await supabase
    .from("workout_logs")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", since.toISOString());
  const set = new Set<string>();
  for (const row of data ?? []) {
    set.add((row.created_at as string).slice(0, 10));
  }
  return set;
}

/** XP multiplier string for current tier */
export function xpBonusLabel(days: number): string {
  const tier = streakTier(days);
  const bonus = STREAK_TIER_META[tier].xpBonus;
  if (bonus === 1.0) return "";
  return `+${Math.round((bonus - 1) * 100)}% XP`;
}

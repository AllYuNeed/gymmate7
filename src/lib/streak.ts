// ══════════════════════════════════════════════════════════════
//  STREAK LOGIC — client-side helpers (IST-aware)
//  All heavy logic runs server-side via process_streak_on_workout()
//  These helpers are for display, calendar, and UI calculations.
// ══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import {
  todayIST, isSundayIST, isTodaySundayIST,
  daysUntilMonthResetIST, buildCalendarGridIST, isoToISTDateStr,
  type CalendarDay,
} from "@/lib/ist";

export type { CalendarDay };

export interface StreakState {
  streak_days: number;
  longest_streak: number;
  streak_shield_count: number;
  shield_reset_date: string;
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
  | "started" | "extended" | "sunday_protected"
  | "shield_used" | "broken" | "already_logged";

export interface StreakResult {
  action: StreakAction;
  streak: number;
  message?: string;
  shields_remaining?: number;
  shields_used?: number;
}

// ── Re-export IST helpers used by StreakDashboard ──────────────
export { isSundayIST, isTodaySundayIST, daysUntilMonthResetIST, buildCalendarGridIST, todayIST };
export const isSunday = isTodaySundayIST;
export const isSundayStr = isSundayIST;

/** Days until next monthly shield reset (IST) */
export const daysUntilMonthReset = daysUntilMonthResetIST;

/** Human-readable shield reset countdown */
export function shieldResetLabel(): string {
  const d = daysUntilMonthResetIST();
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
  none:    { label: "Cold",    color: "text-muted-foreground", glow: "",                                             flame: "🌑", xpBonus: 1.0  },
  warm:    { label: "Warm",    color: "text-amber-400",        glow: "shadow-[0_0_12px_#f59e0b80]",                  flame: "🔥", xpBonus: 1.05 },
  hot:     { label: "Hot",     color: "text-orange-400",       glow: "shadow-[0_0_18px_#fb923c90]",                  flame: "🔥", xpBonus: 1.1  },
  blazing: { label: "Blazing", color: "text-red-400",          glow: "shadow-[0_0_24px_#f87171aa]",                  flame: "💥", xpBonus: 1.2  },
  inferno: { label: "Inferno", color: "text-primary",          glow: "shadow-[0_0_32px_hsl(45_90%_60%/0.9)]",        flame: "⚡", xpBonus: 1.35 },
} as const;

/** Build 35-day IST calendar grid */
export function buildCalendarGrid(): CalendarDay[] {
  return buildCalendarGridIST();
}

/** Call the server-side streak RPC after logging a workout */
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

/** Refresh shields if new month */
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

/** Fetch workout dates for the IST calendar (last 60 days) */
export async function fetchWorkoutDates(userId: string): Promise<Set<string>> {
  const since = new Date(Date.now() - 60 * 86_400_000).toISOString();
  const { data } = await supabase
    .from("workout_logs")
    .select("created_at")
    .eq("user_id", userId)
    .gte("created_at", since);
  const set = new Set<string>();
  for (const row of data ?? []) {
    // Convert UTC timestamp → IST date string
    set.add(isoToISTDateStr(row.created_at as string));
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

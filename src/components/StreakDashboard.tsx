import { useEffect, useState, useCallback } from "react";
import {
  fetchStreakState, fetchShieldLog, fetchWorkoutDates,
  buildCalendarGrid, formatStreak, streakTier, STREAK_TIER_META,
  daysUntilMonthReset, xpBonusLabel,
  type StreakState, type ShieldLogEntry,
} from "@/lib/streak";
import { type CalendarDay, fmtDateIST, isTodaySundayIST } from "@/lib/ist";
import { refreshShieldsIfNeeded } from "@/lib/streak";

// ── Flame animation component ──────────────────────────────────
function FlameCounter({ days }: { days: number }) {
  const tier = streakTier(days);
  const meta = STREAK_TIER_META[tier];

  return (
    <div className={`relative flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-surface-deep p-6 text-center ${meta.glow} transition-all duration-500`}>
      {/* Animated flame */}
      <div
        className="relative mb-1 select-none"
        style={{ fontSize: days === 0 ? "3rem" : "4rem", filter: days > 0 ? `drop-shadow(0 0 16px ${tier === "inferno" ? "hsl(45 90% 60%)" : tier === "blazing" ? "#f87171" : tier === "hot" ? "#fb923c" : "#f59e0b"})` : undefined }}
      >
        <span
          className={days > 0 ? "animate-[flame_1.8s_ease-in-out_infinite]" : ""}
          style={days > 0 ? { display: "inline-block", transformOrigin: "bottom center" } : undefined}
        >
          {meta.flame}
        </span>
        {/* Pulse ring for blazing+ */}
        {(tier === "blazing" || tier === "inferno") && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: tier === "inferno" ? "hsl(45 90% 60%)" : "#f87171", borderRadius: "50%" }}
          />
        )}
      </div>

      <p className={`font-display text-5xl font-bold tabular-nums ${meta.color}`}>{days}</p>
      <p className="mt-1 font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {days === 1 ? "Day Streak" : "Day Streak"}
      </p>
      {tier !== "none" && (
        <span className={`mt-2 inline-flex items-center rounded-full border px-3 py-0.5 font-display text-[10px] uppercase tracking-widest ${meta.color} border-current/30 bg-current/5`}>
          {meta.label}
        </span>
      )}
      {xpBonusLabel(days) && (
        <span className="mt-1.5 font-display text-[10px] text-primary/70 uppercase tracking-widest">
          {xpBonusLabel(days)} Bonus Active
        </span>
      )}
    </div>
  );
}

// ── Shield pills ───────────────────────────────────────────────
function ShieldBar({ count, resetDays }: { count: number; resetDays: number }) {
  const total = 5;
  return (
    <div className="rounded-xl border border-border/60 bg-surface-deep p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">
          🛡 Streak Shields
        </p>
        <p className="font-display text-[10px] text-secondary">
          Resets in {resetDays}d
        </p>
      </div>
      <div className="flex gap-2 mb-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-7 rounded-md border transition-all duration-300 flex items-center justify-center font-display text-sm ${
              i < count
                ? "border-primary/60 bg-primary/20 text-primary shadow-[0_0_8px_hsl(45_90%_55%/0.4)]"
                : "border-border/30 bg-surface-raised/20 text-muted-foreground/30"
            }`}
          >
            {i < count ? "🛡" : "○"}
          </div>
        ))}
      </div>
      <p className="font-display text-[10px] text-muted-foreground/70 text-center">
        {count}/{total} shields remaining · Auto-activates on missed days
      </p>
    </div>
  );
}

// ── Sunday protection banner ───────────────────────────────────
function SundayBanner({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 animate-pulse-slow">
      <span className="text-xl">☀️</span>
      <div>
        <p className="font-display text-xs font-bold uppercase tracking-widest text-amber-400">
          Sunday Recovery Day
        </p>
        <p className="text-xs text-muted-foreground">
          Rest is protected · Your streak is safe today
        </p>
      </div>
    </div>
  );
}

// ── Streak calendar ────────────────────────────────────────────
function StreakCalendar({
  workoutDates,
  shieldDates,
  sundayDates,
}: {
  workoutDates: Set<string>;
  shieldDates: Set<string>;
  sundayDates: Set<string>;
}) {
  const grid = buildCalendarGrid();
  const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDayStyle = (day: CalendarDay) => {
    const protectedSunday = sundayDates.has(day.iso);

    if (day.isFuture) return "bg-surface-deep/30 text-muted-foreground/20 border-transparent";
    if (!day.isCurrentMonth) return "bg-transparent text-muted-foreground/20 border-transparent";
    if (workoutDates.has(day.iso)) return "bg-primary/80 text-black font-bold border-primary shadow-[0_0_8px_hsl(45_90%_55%/0.5)]";
    if (protectedSunday) return "bg-amber-400/20 text-amber-400 border-amber-400/40";
    if (shieldDates.has(day.iso)) return "bg-blue-500/20 text-blue-400 border-blue-400/40";
    if (day.isToday) return "bg-surface-raised border-primary/60 text-primary";
    if (day.isSunday) return "bg-surface-deep/60 text-amber-400/60 border-amber-400/20";
    return "bg-surface-deep/60 text-muted-foreground/60 border-border/20";
  };

  return (
    <div className="rounded-xl border border-border/60 bg-surface-deep p-4">
      <p className="mb-3 font-display text-xs uppercase tracking-widest text-muted-foreground">
        📅 Activity Calendar
      </p>

      {/* Day labels */}
      <div className="mb-1.5 grid grid-cols-7 gap-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className={`text-center font-display text-[9px] uppercase tracking-widest ${d === "Su" ? "text-amber-400/70" : "text-muted-foreground/50"}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {grid.map((day) => {
          const protectedSunday = sundayDates.has(day.iso);

          return (
          <div
            key={day.iso}
            title={
              protectedSunday
                ? "☀️ Sunday protection used"
                : shieldDates.has(day.iso)
                ? "🛡 Shield used — streak saved"
                : workoutDates.has(day.iso)
                ? "✦ Workout logged"
                : day.isSunday && !day.isFuture
                ? "☀️ Sunday rest day"
                : day.isToday
                ? "Today"
                : ""
            }
            className={`relative flex h-8 w-full items-center justify-center rounded-md border text-[10px] transition-all ${getDayStyle(day)}`}
          >
            <span>{day.dayOfMonth}</span>
            {protectedSunday && day.isCurrentMonth && !workoutDates.has(day.iso) && (
              <span className="absolute -top-0.5 -right-0.5 text-[7px]">☀</span>
            )}
            {shieldDates.has(day.iso) && !workoutDates.has(day.iso) && (
              <span className="absolute -top-0.5 -right-0.5 text-[7px]">🛡</span>
            )}
          </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-[9px] font-display uppercase tracking-widest text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary/80 inline-block" />Workout</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-400/40 inline-block" />Protected Sunday</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-blue-500/30 inline-block" />Shield</span>
      </div>
    </div>
  );
}

// ── Shield history list ────────────────────────────────────────
function ShieldHistory({ log }: { log: ShieldLogEntry[] }) {
  if (log.length === 0) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-surface-deep p-4">
      <p className="mb-3 font-display text-xs uppercase tracking-widest text-muted-foreground">
        🛡 Shield History
      </p>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {log.slice(0, 10).map((entry) => (
          <div key={entry.id} className="flex items-center justify-between rounded-lg bg-surface-raised/40 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">{entry.is_sunday ? "☀️" : "🛡"}</span>
              <div>
                <p className="font-display text-xs text-foreground">
                  {entry.is_sunday ? "Sunday Protection" : "Shield Used"}
                </p>
                <p className="font-display text-[9px] text-muted-foreground">
                  {fmtDateIST(entry.used_date)}
                </p>
              </div>
            </div>
            <span className="font-display text-xs text-secondary">
              {entry.streak_preserved}d preserved
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Milestone badges ───────────────────────────────────────────
function MilestoneBadges({ days, longest }: { days: number; longest: number }) {
  const milestones = [
    { days: 7,   label: "Week Warrior",   icon: "⚔️",  desc: "7-day streak" },
    { days: 14,  label: "Iron Resolve",   icon: "🔩",  desc: "14-day streak" },
    { days: 30,  label: "Month Champion", icon: "🏆",  desc: "30-day streak" },
    { days: 60,  label: "Ironclad",       icon: "🛡️",  desc: "60-day streak" },
    { days: 100, label: "Legend",         icon: "⚡",  desc: "100-day streak" },
    { days: 365, label: "Immortal",       icon: "✨",  desc: "365-day streak" },
  ];

  return (
    <div className="rounded-xl border border-border/60 bg-surface-deep p-4">
      <p className="mb-3 font-display text-xs uppercase tracking-widest text-muted-foreground">
        🏅 Streak Milestones
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {milestones.map((m) => {
          const achieved = longest >= m.days;
          const current = days >= m.days && days < (milestones[milestones.indexOf(m) + 1]?.days ?? Infinity);
          return (
            <div
              key={m.days}
              title={`${m.desc}${achieved ? " — Achieved!" : ` — ${m.days - Math.min(days, m.days)} days to go`}`}
              className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-all ${
                achieved
                  ? current
                    ? "border-primary/60 bg-primary/10 shadow-[0_0_12px_hsl(45_90%_55%/0.3)]"
                    : "border-border/40 bg-surface-raised/40"
                  : "border-border/20 bg-surface-deep/40 opacity-30"
              }`}
            >
              <span className={`text-xl ${!achieved ? "grayscale" : ""}`}>{m.icon}</span>
              <span className={`font-display text-[8px] uppercase tracking-widest text-center leading-tight ${achieved ? "text-primary" : "text-muted-foreground"}`}>
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main StreakDashboard ───────────────────────────────────────
interface StreakDashboardProps {
  userId: string;
  initialStreak?: number;
}

export function StreakDashboard({ userId, initialStreak = 0 }: StreakDashboardProps) {
  const [state, setState] = useState<StreakState | null>(null);
  const [shieldLog, setShieldLog] = useState<ShieldLogEntry[]>([]);
  const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    await refreshShieldsIfNeeded(userId);
    const [s, log, wDates] = await Promise.all([
      fetchStreakState(userId),
      fetchShieldLog(userId),
      fetchWorkoutDates(userId),
    ]);
    setState(s);
    setShieldLog(log);
    setWorkoutDates(wDates);
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (loading || !state) {
    return (
      <div className="rounded-xl border border-border/60 bg-surface-deep p-6 text-center">
        <div className="font-display text-xs text-muted-foreground animate-pulse uppercase tracking-widest">
          Loading streak data...
        </div>
      </div>
    );
  }

  // Build sets for calendar
  const shieldDateSet = new Set(shieldLog.filter((l) => !l.is_sunday).map((l) => l.used_date));
  const sundayDateSet = new Set(shieldLog.filter((l) => l.is_sunday).map((l) => l.used_date));
  const resetDays = daysUntilMonthReset();
  const isSundayToday = isTodaySundayIST();
  const sundayProtectionActiveToday = state.sunday_protection && isSundayToday;

  return (
    <div className="space-y-4">
      {/* Sunday banner (only shows on Sundays) */}
      <SundayBanner active={sundayProtectionActiveToday} />

      {/* Main streak counter + stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Flame counter spans 2 cols on mobile */}
        <div className="col-span-2 sm:col-span-1">
          <FlameCounter days={state.streak_days} />
        </div>

        {/* Best streak */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-surface-deep p-4 text-center">
          <span className="text-2xl">🏆</span>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{state.longest_streak}</p>
          <p className="font-display text-[9px] uppercase tracking-widest text-muted-foreground">Best Streak</p>
        </div>

        {/* Shields */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-surface-deep p-4 text-center">
          <span className="text-2xl">🛡</span>
          <p className="mt-1 font-display text-2xl font-bold text-primary">{state.streak_shield_count}<span className="text-base text-muted-foreground">/5</span></p>
          <p className="font-display text-[9px] uppercase tracking-widest text-muted-foreground">Shields</p>
          <p className="font-display text-[8px] text-secondary mt-0.5">{resetDays}d reset</p>
        </div>

        {/* Sunday protection */}
        <div className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-all ${
          sundayProtectionActiveToday
            ? "border-amber-400/40 bg-amber-400/10"
            : state.sunday_protection
            ? "border-amber-400/20 bg-surface-deep"
            : "border-border/60 bg-surface-deep opacity-50"
        }`}>
          <span className="text-2xl">☀️</span>
          <p className="mt-1 font-display text-sm font-bold text-amber-400">
            {sundayProtectionActiveToday ? "Active Today" : state.sunday_protection ? "Ready" : "Off"}
          </p>
          <p className="font-display text-[9px] uppercase tracking-widest text-muted-foreground">
            Sunday Protection
          </p>
          <p className="font-display text-[8px] text-muted-foreground/60 mt-0.5">
            {sundayProtectionActiveToday ? "Rest day safe" : state.sunday_protection ? "Only Sundays" : "Disabled"}
          </p>
        </div>
      </div>

      {/* Shield bar */}
      <ShieldBar count={state.streak_shield_count} resetDays={resetDays} />

      {/* Expand/collapse for detailed view */}
      <button
        type="button"
        onClick={() => setExpanded((x) => !x)}
        className="w-full rounded-xl border border-border/60 bg-surface-deep px-4 py-2.5 font-display text-xs uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-2"
      >
        {expanded ? "▲ Hide Details" : "▼ Streak Details & Calendar"}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
          <StreakCalendar
            workoutDates={workoutDates}
            shieldDates={shieldDateSet}
            sundayDates={sundayDateSet}
          />
          <MilestoneBadges days={state.streak_days} longest={state.longest_streak} />
          <ShieldHistory log={shieldLog} />

          {/* How it works */}
          <div className="rounded-xl border border-border/60 bg-surface-deep p-4">
            <p className="mb-3 font-display text-xs uppercase tracking-widest text-muted-foreground">ℹ How Streak Protection Works</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">☀️</span>
                <span><span className="text-amber-400 font-semibold">Sunday Protection</span> — Sundays are automatic rest days. Missing a workout on Sunday never breaks your streak.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">🛡</span>
                <span><span className="text-primary font-semibold">Streak Shields</span> — You get 5 shields per month. A shield auto-activates whenever you miss a non-Sunday workout. No action needed.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">🔄</span>
                <span><span className="text-secondary font-semibold">Monthly Reset</span> — Shields refill to 5 on the 1st of every month. Your streak count is never reset.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 shrink-0">⚡</span>
                <span><span className="text-primary font-semibold">XP Bonus</span> — Longer streaks earn XP multipliers: 7 days (+5%), 30 days (+10%), 60 days (+20%), 100 days (+35%).</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

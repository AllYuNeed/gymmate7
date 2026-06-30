import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Maximize2, Pause, Play, Search, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  EXERCISE_LIBRARY,
  EXERCISE_CATEGORIES,
  EQUIPMENT_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  getExerciseDemoFrames,
  type LibraryExercise,
  type WorkoutCategory,
  type Difficulty,
  type Equipment,
  type ExerciseType,
  type WorkoutType,
  type SortOption,
} from "@/data/exerciseLibrary";
import { useAuth } from "@/hooks/useAuth";

// ── Helpers ────────────────────────────────────────────────
const ALL = "all";
const FAVORITES_STORAGE_KEY = "mortalgyms.exerciseFavorites";

const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  compound: "Compound",
  isolation: "Isolation",
};

const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  strength: "Strength",
  hypertrophy: "Hypertrophy",
  power: "Power",
  conditioning: "Conditioning",
  mobility: "Mobility",
  recovery: "Recovery",
  skill: "Skill",
  endurance: "Endurance",
};

const SORT_LABELS: Record<SortOption, string> = {
  alphabetical: "Alphabetical",
  popular: "Most Popular",
  recent: "Recently Added",
  xp: "Highest XP",
  favorites: "Favorites",
};

const readStoredFavorites = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
};

function DifficultyBadge({ d }: { d: Difficulty }) {
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-display uppercase tracking-widest ${DIFFICULTY_COLORS[d]}`}>
      {DIFFICULTY_LABELS[d]}
    </span>
  );
}

function XpBadge({ xp }: { xp: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest text-primary">
      +{xp} XP
    </span>
  );
}

// ── Exercise Detail Modal ──────────────────────────────────
function ExerciseModal({
  exercise,
  open,
  onClose,
  isFavorite,
  onToggleFavorite,
}: {
  exercise: LibraryExercise | null;
  open: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const demoFrames = useMemo(() => (exercise ? getExerciseDemoFrames(exercise) : []), [exercise]);
  const [demoReady, setDemoReady] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(true);
  const [demoUnavailable, setDemoUnavailable] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setDemoReady(false);
    setDemoPlaying(true);
    setDemoUnavailable(false);
    setFrameIndex(0);
    setPreviewOpen(false);
  }, [exercise?.id]);

  useEffect(() => {
    if (!exercise || demoFrames.length === 0) return;

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setDemoUnavailable(true);
        setDemoReady(true);
      }
    }, 8000);

    Promise.all(
      demoFrames.map(
        (src) =>
          new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Could not load ${src}`));
            img.src = src;
          })
      )
    )
      .then(() => {
        if (!cancelled) {
          setDemoReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDemoUnavailable(true);
          setDemoReady(true);
        }
      })
      .finally(() => window.clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [demoFrames, exercise]);

  useEffect(() => {
    if (!demoReady || demoUnavailable || !demoPlaying || demoFrames.length < 2) return;

    const intervalId = window.setInterval(() => {
      setFrameIndex((index) => (index + 1) % demoFrames.length);
    }, 850);

    return () => window.clearInterval(intervalId);
  }, [demoFrames.length, demoPlaying, demoReady, demoUnavailable]);

  if (!exercise) return null;

  const togglePlay = () => {
    if (demoUnavailable || demoFrames.length < 2) return;
    setDemoPlaying((p) => !p);
  };

  const demoSrc = demoUnavailable
    ? exercise.thumbnail_url
    : demoFrames[frameIndex] ?? exercise.thumbnail_url;
  const demoLabel = demoUnavailable ? "Static Preview" : demoPlaying ? "Live Demo" : "Paused";
  const categoryLabel = EXERCISE_CATEGORIES.find((c) => c.id === exercise.category)?.label ?? exercise.category;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-hidden border-border bg-surface-raised p-0">
        <ScrollArea className="h-full max-h-[92vh]">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <div className="flex items-start justify-between gap-3">
                <DialogTitle className="font-display text-2xl uppercase tracking-widest text-gold">
                  {exercise.name}
                </DialogTitle>
                <button
                  type="button"
                  onClick={onToggleFavorite}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isFavorite
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border bg-card/60 text-muted-foreground hover:border-primary/60 hover:text-primary"
                  }`}
                  title={isFavorite ? "Remove favorite" : "Add favorite"}
                >
                  <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest text-gold">
                  {categoryLabel}
                </span>
                <DifficultyBadge d={exercise.difficulty} />
                <XpBadge xp={exercise.xp_value} />
                <span className="rounded border border-border bg-card/60 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                  {EXERCISE_TYPE_LABELS[exercise.exercise_type]}
                </span>
                {exercise.equipment.slice(0, 3).map((eq) => (
                  <span key={eq} className="rounded border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest text-secondary">
                    {EQUIPMENT_LABELS[eq]}
                  </span>
                ))}
              </div>
            </DialogHeader>

            {/* Demo player */}
            <div className="relative mb-6 overflow-hidden rounded-xl border border-border bg-surface-deep">
              <div className="relative aspect-video flex items-center justify-center bg-black/40">
                {!demoReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
                <img
                  src={demoSrc}
                  alt={`${exercise.name} demonstration`}
                  className={`h-full w-full object-contain transition-opacity duration-500 ${demoReady ? "opacity-100" : "opacity-0"}`}
                  onError={() => {
                    setDemoUnavailable(true);
                    setDemoReady(true);
                  }}
                />
                {/* Controls overlay */}
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button
                    onClick={() => setPreviewOpen(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                    title="Full screen preview"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={togglePlay}
                    disabled={demoUnavailable || demoFrames.length < 2}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
                    title={demoPlaying ? "Pause" : "Play"}
                  >
                    {demoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                </div>
                <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-[10px] font-display uppercase tracking-widest text-white/80 backdrop-blur-sm">
                  {demoUnavailable && <AlertCircle className="h-3 w-3" />}
                  {demoLabel}
                </div>
                {exercise.media_status === "placeholder" && (
                  <div className="absolute top-3 right-3 rounded bg-black/60 px-2 py-1 text-[10px] font-display uppercase tracking-widest text-white/70 backdrop-blur-sm">
                    Media Fallback
                  </div>
                )}
              </div>
            </div>

            {/* Muscles */}
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-card/60 p-3">
                <p className="mb-1 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Primary</p>
                <p className="font-display text-sm text-primary">{exercise.primary_muscle}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-3">
                <p className="mb-1 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Secondary</p>
                <p className="font-display text-sm text-foreground/80">
                  {exercise.secondary_muscles.length > 0 ? exercise.secondary_muscles.join(", ") : "—"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-3">
                <p className="mb-1 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Sets</p>
                <p className="font-display text-sm text-foreground">{exercise.recommended_sets}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-3">
                <p className="mb-1 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Reps</p>
                <p className="font-display text-sm text-foreground">{exercise.recommended_reps}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-3">
                <p className="mb-1 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Rest</p>
                <p className="font-display text-sm text-foreground">{exercise.recommended_rest}</p>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-3">
                <p className="mb-1 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Calories</p>
                <p className="font-display text-sm text-foreground">~{exercise.calories_estimate}/set</p>
              </div>
              <div className="rounded-lg border border-border bg-card/60 p-3">
                <p className="mb-1 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Type</p>
                <p className="font-display text-sm text-foreground">{WORKOUT_TYPE_LABELS[exercise.workout_type]}</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-5">
              <p className="mb-3 font-display text-xs uppercase tracking-widest text-secondary">◆ Instructions</p>
              <ol className="space-y-2">
                {exercise.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground/80 leading-relaxed">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/20 font-display text-[10px] text-primary">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="mb-5 grid gap-4 md:grid-cols-2">
              <InfoList title="Breathing" tone="secondary" items={exercise.breathing} />
              <InfoList title="Safety Tips" tone="primary" items={exercise.safety_tips} />
              <InfoList title="Beginner Mods" tone="muted" items={exercise.beginner_modifications} />
              <InfoList title="Advanced Variations" tone="gold" items={exercise.advanced_variations} />
            </div>

            {/* Common Mistakes */}
            <div className="mb-4">
              <p className="mb-3 font-display text-xs uppercase tracking-widest text-destructive/80">⚠ Common Mistakes</p>
              <ul className="space-y-2">
                {exercise.common_mistakes.map((m, i) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground/70 leading-relaxed">
                    <span className="mt-1 flex-shrink-0 text-destructive/70">•</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {exercise.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-card/40 px-3 py-1 text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogContent className="max-w-5xl border-border bg-black/95 p-2">
                <img
                  src={demoSrc || exercise.image_url}
                  alt={`${exercise.name} full screen preview`}
                  className="max-h-[85vh] w-full rounded-lg object-contain"
                />
              </DialogContent>
            </Dialog>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function InfoList({ title, items, tone }: { title: string; items: string[]; tone: "primary" | "secondary" | "gold" | "muted" }) {
  const toneClass =
    tone === "primary" ? "text-primary" :
    tone === "secondary" ? "text-secondary" :
    tone === "gold" ? "text-gold" : "text-muted-foreground";

  return (
    <div className="rounded-lg border border-border bg-card/50 p-3">
      <p className={`mb-2 font-display text-[10px] uppercase tracking-widest ${toneClass}`}>{title}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-xs leading-relaxed text-foreground/75">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Exercise Card ──────────────────────────────────────────
function ExerciseCard({
  exercise,
  onClick,
  isFavorite,
  onToggleFavorite,
}: {
  exercise: LibraryExercise;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const previewFrames = useMemo(() => getExerciseDemoFrames(exercise), [exercise]);
  const previewSrc = previewFrames[0] ?? exercise.thumbnail_url;
  const categoryLabel = EXERCISE_CATEGORIES.find((c) => c.id === exercise.category)?.label ?? exercise.category;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      aria-label={exercise.name}
      className="group relative overflow-hidden rounded-xl border border-border bg-card/60 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/60 hover:bg-surface-raised hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-surface-deep">
        <img
          src={imgError ? exercise.thumbnail_url : previewSrc}
          alt={exercise.name}
          className="h-full w-full object-cover opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        {/* Difficulty badge */}
        <div className="absolute top-2 left-2">
          <DifficultyBadge d={exercise.difficulty} />
        </div>
        {/* XP badge */}
        <div className="absolute top-2 right-2">
          <XpBadge xp={exercise.xp_value} />
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-sm transition-colors ${
            isFavorite
              ? "border-primary bg-primary/30 text-primary"
              : "border-white/20 bg-black/50 text-white/70 hover:text-primary"
          }`}
          title={isFavorite ? "Remove favorite" : "Add favorite"}
        >
          <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
        {/* Play hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-black/60 p-3 text-white backdrop-blur-sm">
            <Play className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-display text-sm uppercase tracking-wide text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {exercise.name}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
          {exercise.primary_muscle}
          {exercise.secondary_muscles.length > 0 && ` · ${exercise.secondary_muscles[0]}`}
        </p>
        <p className="mt-1 text-[10px] font-display uppercase tracking-widest text-secondary/80 line-clamp-1">
          {categoryLabel} / {EXERCISE_TYPE_LABELS[exercise.exercise_type]}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {exercise.equipment.slice(0, 2).map((eq) => (
            <span key={eq} className="rounded border border-border/60 px-1.5 py-0.5 text-[9px] font-display uppercase tracking-widest text-muted-foreground">
              {EQUIPMENT_LABELS[eq]}
            </span>
          ))}
          <span className="rounded border border-border/60 px-1.5 py-0.5 text-[9px] font-display uppercase tracking-widest text-muted-foreground">
            {exercise.recommended_reps}
          </span>
        </div>
      </div>
    </article>
  );
}

// ── Main Page ──────────────────────────────────────────────
const ExerciseLibrary = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<WorkoutCategory | typeof ALL>(ALL);
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | typeof ALL>(ALL);
  const [activeEquipment, setActiveEquipment] = useState<Equipment | typeof ALL>(ALL);
  const [activeExerciseType, setActiveExerciseType] = useState<ExerciseType | typeof ALL>(ALL);
  const [activeWorkoutType, setActiveWorkoutType] = useState<WorkoutType | typeof ALL>(ALL);
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");
  const [favorites, setFavorites] = useState<string[]>(readStoredFavorites);
  const [selectedExercise, setSelectedExercise] = useState<LibraryExercise | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  // Derive all equipment options present in the library
  const allEquipment = useMemo(() => {
    const set = new Set<Equipment>();
    EXERCISE_LIBRARY.forEach((e) => e.equipment.forEach((eq) => set.add(eq)));
    return Array.from(set);
  }, []);

  const allWorkoutTypes = useMemo(() => {
    const set = new Set<WorkoutType>();
    EXERCISE_LIBRARY.forEach((e) => set.add(e.workout_type));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const matches = EXERCISE_LIBRARY.filter((e) => {
      if (activeCategory !== ALL && e.category !== activeCategory) return false;
      if (activeDifficulty !== ALL && e.difficulty !== activeDifficulty) return false;
      if (activeEquipment !== ALL && !e.equipment.includes(activeEquipment)) return false;
      if (activeExerciseType !== ALL && e.exercise_type !== activeExerciseType) return false;
      if (activeWorkoutType !== ALL && e.workout_type !== activeWorkoutType) return false;
      if (q) {
        const categoryLabel = EXERCISE_CATEGORIES.find((c) => c.id === e.category)?.label ?? e.category;
        const haystack = [
          e.name,
          categoryLabel,
          e.primary_muscle,
          ...e.secondary_muscles,
          ...e.aliases,
          ...e.tags,
          ...e.equipment.map((eq) => EQUIPMENT_LABELS[eq]),
          EXERCISE_TYPE_LABELS[e.exercise_type],
          WORKOUT_TYPE_LABELS[e.workout_type],
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return [...matches].sort((a, b) => {
      if (sortBy === "favorites") {
        const favoriteDelta = Number(favoriteSet.has(b.id)) - Number(favoriteSet.has(a.id));
        if (favoriteDelta !== 0) return favoriteDelta;
      }
      if (sortBy === "popular") return b.popularity_score - a.popularity_score;
      if (sortBy === "recent") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "xp") return b.xp_value - a.xp_value;
      return a.name.localeCompare(b.name);
    });
  }, [search, activeCategory, activeDifficulty, activeEquipment, activeExerciseType, activeWorkoutType, sortBy, favoriteSet]);

  const clearFilters = () => {
    setSearch("");
    setActiveCategory(ALL);
    setActiveDifficulty(ALL);
    setActiveEquipment(ALL);
    setActiveExerciseType(ALL);
    setActiveWorkoutType(ALL);
    setSortBy("alphabetical");
  };

  const toggleFavorite = (exerciseId: string) => {
    setFavorites((current) => {
      const next = current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId];
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const hasFilters =
    activeCategory !== ALL ||
    activeDifficulty !== ALL ||
    activeEquipment !== ALL ||
    activeExerciseType !== ALL ||
    activeWorkoutType !== ALL ||
    sortBy !== "alphabetical" ||
    search !== "";
  const shouldRedirectToAuth = !authLoading && !user;

  useEffect(() => {
    if (shouldRedirectToAuth) {
      navigate("/auth");
    }
  }, [navigate, shouldRedirectToAuth]);

  if (shouldRedirectToAuth) {
    return null;
  }

  return (
    <div className="min-h-screen pb-28 pt-6">
      {/* Header */}
      <div className="px-4 pb-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-1 font-display text-xs uppercase tracking-[0.3em] text-secondary/70">◆ Knowledge Vault ◆</div>
          <h1 className="font-display text-3xl uppercase tracking-widest text-gold">Exercise Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {EXERCISE_LIBRARY.length} exercises · Tap any card for animated demonstration
          </p>
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="sticky top-0 z-20 border-b border-border bg-surface-deep/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search exercises, muscles, equipment..."
                className="bg-surface-raised border-border pl-9 font-display text-sm placeholder:text-muted-foreground"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters((p) => !p)}
              className={`shrink-0 font-display text-xs uppercase tracking-widest ${showFilters ? "border-primary text-primary" : ""}`}
            >
              ⚙ Filters {hasFilters && "●"}
            </Button>
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="shrink-0 font-display text-xs uppercase tracking-widest text-muted-foreground">
                ✕ Clear
              </Button>
            )}
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <div className="space-y-3 rounded-xl border border-border bg-card/60 p-4">
              {/* Difficulty */}
              <div>
                <p className="mb-2 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Difficulty</p>
                <div className="flex flex-wrap gap-2">
                  {([ALL, "beginner", "intermediate", "advanced"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setActiveDifficulty(d)}
                      className={`rounded border px-3 py-1 font-display text-xs uppercase tracking-widest transition-all ${
                        activeDifficulty === d
                          ? "border-primary bg-primary/20 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {d === ALL ? "All" : DIFFICULTY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>
              {/* Equipment */}
              <div>
                <p className="mb-2 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Equipment</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveEquipment(ALL)}
                    className={`rounded border px-3 py-1 font-display text-xs uppercase tracking-widest transition-all ${
                      activeEquipment === ALL ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    All
                  </button>
                  {allEquipment.map((eq) => (
                    <button
                      key={eq}
                      onClick={() => setActiveEquipment(eq)}
                      className={`rounded border px-3 py-1 font-display text-xs uppercase tracking-widest transition-all ${
                        activeEquipment === eq ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {EQUIPMENT_LABELS[eq]}
                    </button>
                  ))}
                </div>
              </div>
              {/* Exercise Type */}
              <div>
                <p className="mb-2 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Exercise Type</p>
                <div className="flex flex-wrap gap-2">
                  {([ALL, "compound", "isolation"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveExerciseType(type)}
                      className={`rounded border px-3 py-1 font-display text-xs uppercase tracking-widest transition-all ${
                        activeExerciseType === type ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {type === ALL ? "All" : EXERCISE_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
              {/* Workout Type */}
              <div>
                <p className="mb-2 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Workout Type</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveWorkoutType(ALL)}
                    className={`rounded border px-3 py-1 font-display text-xs uppercase tracking-widest transition-all ${
                      activeWorkoutType === ALL ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    All
                  </button>
                  {allWorkoutTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveWorkoutType(type)}
                      className={`rounded border px-3 py-1 font-display text-xs uppercase tracking-widest transition-all ${
                        activeWorkoutType === type ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {WORKOUT_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
              {/* Sort */}
              <div>
                <p className="mb-2 font-display text-[10px] uppercase tracking-widest text-muted-foreground">Sort</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`rounded border px-3 py-1 font-display text-xs uppercase tracking-widest transition-all ${
                        sortBy === sort ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {SORT_LABELS[sort]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-4">
        {/* Category tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2" style={{ width: "max-content" }}>
            <button
              onClick={() => setActiveCategory(ALL)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 font-display text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                activeCategory === ALL
                  ? "border-primary bg-primary/20 text-primary shadow-gold"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary/80"
              }`}
            >
              ✜ All ({EXERCISE_LIBRARY.length})
            </button>
            {EXERCISE_CATEGORIES.map((cat) => {
              const count = EXERCISE_LIBRARY.filter((e) => e.category === cat.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 font-display text-xs uppercase tracking-widest whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? "border-primary bg-primary/20 text-primary shadow-gold"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-primary/80"
                  }`}
                >
                  {cat.glyph} {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">
            {filtered.length} exercise{filtered.length !== 1 ? "s" : ""} found
          </p>
          {activeCategory !== ALL && (
            <p className="font-display text-xs uppercase tracking-widest text-primary/70">
              {EXERCISE_CATEGORIES.find((c) => c.id === activeCategory)?.label ?? activeCategory}
            </p>
          )}
        </div>

        {/* Exercise grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 text-5xl opacity-40">⚔</div>
            <p className="font-display text-lg uppercase tracking-widest text-muted-foreground">No Exercises Found</p>
            <p className="mt-2 text-sm text-muted-foreground/70">Try different filters or search terms</p>
            <Button variant="ghost" onClick={clearFilters} className="mt-4 font-display text-xs uppercase tracking-widest">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onClick={() => setSelectedExercise(exercise)}
                isFavorite={favoriteSet.has(exercise.id)}
                onToggleFavorite={() => toggleFavorite(exercise.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ExerciseModal
        exercise={selectedExercise}
        open={selectedExercise !== null}
        onClose={() => setSelectedExercise(null)}
        isFavorite={selectedExercise ? favoriteSet.has(selectedExercise.id) : false}
        onToggleFavorite={() => selectedExercise && toggleFavorite(selectedExercise.id)}
      />
    </div>
  );
};

export default ExerciseLibrary;

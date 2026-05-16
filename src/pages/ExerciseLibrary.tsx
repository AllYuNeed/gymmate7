import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  EXERCISE_LIBRARY,
  EXERCISE_CATEGORIES,
  EQUIPMENT_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  type LibraryExercise,
  type WorkoutCategory,
  type Difficulty,
  type Equipment,
} from "@/data/exerciseLibrary";
import { useAuth } from "@/hooks/useAuth";

// ── Helpers ────────────────────────────────────────────────
const ALL = "all";

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
}: {
  exercise: LibraryExercise | null;
  open: boolean;
  onClose: () => void;
}) {
  const [gifLoaded, setGifLoaded] = useState(false);
  const [gifPlaying, setGifPlaying] = useState(true);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  // reset when exercise changes
  if (exercise && imgSrc !== exercise.gif_url && gifPlaying) {
    setImgSrc(exercise.gif_url);
    setGifLoaded(false);
  }

  if (!exercise) return null;

  const togglePlay = () => {
    if (gifPlaying) {
      setImgSrc(exercise.thumbnail_url);
    } else {
      setImgSrc(exercise.gif_url);
    }
    setGifPlaying((p) => !p);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-hidden border-border bg-surface-raised p-0">
        <ScrollArea className="h-full max-h-[92vh]">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="font-display text-2xl uppercase tracking-widest text-gold">
                {exercise.name}
              </DialogTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <DifficultyBadge d={exercise.difficulty} />
                <XpBadge xp={exercise.xp_value} />
                {exercise.equipment.slice(0, 3).map((eq) => (
                  <span key={eq} className="rounded border border-secondary/30 bg-secondary/10 px-2 py-0.5 text-[10px] font-display uppercase tracking-widest text-secondary">
                    {EQUIPMENT_LABELS[eq]}
                  </span>
                ))}
              </div>
            </DialogHeader>

            {/* GIF Demo */}
            <div className="relative mb-6 overflow-hidden rounded-xl border border-border bg-surface-deep">
              <div className="relative aspect-video flex items-center justify-center bg-black/40">
                {!gifLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
                <img
                  src={imgSrc ?? exercise.gif_url}
                  alt={`${exercise.name} demonstration`}
                  className={`h-full w-full object-contain transition-opacity duration-500 ${gifLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setGifLoaded(true)}
                  onError={() => {
                    setImgSrc(exercise.thumbnail_url);
                    setGifLoaded(true);
                  }}
                />
                {/* Controls overlay */}
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button
                    onClick={togglePlay}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm hover:bg-black/80 transition-colors"
                    title={gifPlaying ? "Pause" : "Play"}
                  >
                    {gifPlaying ? "⏸" : "▶"}
                  </button>
                </div>
                <div className="absolute top-3 left-3 rounded bg-black/60 px-2 py-1 text-[10px] font-display uppercase tracking-widest text-white/80 backdrop-blur-sm">
                  {gifPlaying ? "● Live Demo" : "Paused"}
                </div>
              </div>
            </div>

            {/* Muscles */}
            <div className="mb-5 grid grid-cols-2 gap-4">
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ── Exercise Card ──────────────────────────────────────────
function ExerciseCard({ exercise, onClick }: { exercise: LibraryExercise; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-border bg-card/60 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/60 hover:bg-surface-raised hover:shadow-lg hover:shadow-primary/10 active:scale-[0.98]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-surface-deep">
        <img
          src={imgError ? exercise.thumbnail_url : exercise.gif_url}
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
        {/* Play hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-black/60 p-3 text-2xl backdrop-blur-sm">▶</div>
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
        <div className="mt-2 flex flex-wrap gap-1">
          {exercise.equipment.slice(0, 2).map((eq) => (
            <span key={eq} className="rounded border border-border/60 px-1.5 py-0.5 text-[9px] font-display uppercase tracking-widest text-muted-foreground">
              {EQUIPMENT_LABELS[eq]}
            </span>
          ))}
        </div>
      </div>
    </button>
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
  const [selectedExercise, setSelectedExercise] = useState<LibraryExercise | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  // Derive all equipment options present in the library
  const allEquipment = useMemo(() => {
    const set = new Set<Equipment>();
    EXERCISE_LIBRARY.forEach((e) => e.equipment.forEach((eq) => set.add(eq)));
    return Array.from(set);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return EXERCISE_LIBRARY.filter((e) => {
      if (activeCategory !== ALL && e.category !== activeCategory) return false;
      if (activeDifficulty !== ALL && e.difficulty !== activeDifficulty) return false;
      if (activeEquipment !== ALL && !e.equipment.includes(activeEquipment)) return false;
      if (q && !e.name.toLowerCase().includes(q) && !e.primary_muscle.toLowerCase().includes(q) && !e.tags.join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, activeCategory, activeDifficulty, activeEquipment]);

  const clearFilters = () => {
    setSearch("");
    setActiveCategory(ALL);
    setActiveDifficulty(ALL);
    setActiveEquipment(ALL);
  };

  const hasFilters = activeCategory !== ALL || activeDifficulty !== ALL || activeEquipment !== ALL || search !== "";

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
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search exercises, muscles, tags..."
              className="flex-1 bg-surface-raised border-border font-display text-sm placeholder:text-muted-foreground"
            />
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
      />
    </div>
  );
};

export default ExerciseLibrary;

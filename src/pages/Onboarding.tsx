import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QUIZ, computeClass, type QuizAnswers } from "@/data/quiz";
import { HERO_CLASSES } from "@/data/classes";
import { Sigil } from "@/components/Sigil";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Step = number; // 0..QUIZ.length (last = name + reveal)

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [heroName, setHeroName] = useState("");
  const [revealing, setRevealing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Redirect to auth if not signed in
  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  // Redirect to sanctum if already has a hero
  useEffect(() => {
    if (!user) return;
    supabase.from("heroes").select("id").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) navigate("/sanctum");
    });
  }, [user, navigate]);

  const totalSteps = QUIZ.length + 1; // +1 for name/reveal
  const progress = ((step + 1) / totalSteps) * 100;

  const isQuizStep = step < QUIZ.length;
  const currentQuestion = isQuizStep ? QUIZ[step] : null;
  const isNameStep = step === QUIZ.length;

  const computedClass = computeClass(answers);
  const heroClass = HERO_CLASSES[computedClass];

  const selectOption = (qid: string, value: string, multi = false) => {
    setAnswers((prev) => {
      if (!multi) return { ...prev, [qid]: value };
      const current = (prev[qid as keyof QuizAnswers] as string[]) ?? [];
      // "none" exclusivity
      if (value === "none") return { ...prev, [qid]: ["none"] };
      const filtered = current.filter((v) => v !== "none");
      const next = filtered.includes(value) ? filtered.filter((v) => v !== value) : [...filtered, value];
      return { ...prev, [qid]: next };
    });
  };

  const canAdvance = () => {
    if (!currentQuestion) return true;
    const v = answers[currentQuestion.id];
    if (currentQuestion.multi) return Array.isArray(v) && v.length > 0;
    return typeof v === "string" && v.length > 0;
  };

  const handleNext = () => {
    if (step < QUIZ.length) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleReveal = async () => {
    if (!heroName.trim()) {
      toast.error("Your hero must have a name.");
      return;
    }
    setRevealing(true);
    // pause for drama, then save
    setTimeout(() => void saveHero(), 2400);
  };

  const saveHero = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const injuriesArr = (answers.injuries as string[]) ?? [];
      const cleanInjuries = injuriesArr.includes("none") ? [] : injuriesArr;

      const { error } = await supabase.from("heroes").insert({
        user_id: user.id,
        hero_name: heroName.trim(),
        class: computedClass,
        goal: answers.goal as string,
        experience_level: answers.experience_level as string,
        body_type: answers.body_type as string,
        available_days: parseInt((answers.available_days as string) || "3", 10),
        equipment: answers.equipment as string,
        sleep_quality: answers.sleep_quality as string,
        stress_level: answers.stress_level as string,
        injuries: cleanInjuries,
      });
      if (error) throw error;
      toast.success(`${heroName} has awakened!`);
      navigate("/sanctum");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to awaken hero";
      toast.error(msg);
      setRevealing(false);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="starfield" />

      {/* Progress bar */}
      <div className="fixed left-0 right-0 top-0 z-20 h-1 bg-surface-deep">
        <motion.div
          className="h-full bg-gradient-xp"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
        {/* Step counter */}
        {!revealing && (
          <p className="mb-4 font-display text-xs uppercase tracking-[0.4em] text-primary/70">
            {isNameStep ? "Final Rite" : `Trial ${step + 1} of ${QUIZ.length}`}
          </p>
        )}

        <AnimatePresence mode="wait">
          {/* QUIZ STEPS */}
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <h2 className="text-balance text-center font-display text-3xl font-bold text-gold sm:text-5xl">
                {currentQuestion.prompt}
              </h2>
              <p className="mt-4 text-center text-sm italic text-muted-foreground sm:text-base">
                {currentQuestion.flavor}
              </p>

              <div className={`mt-10 grid gap-3 ${currentQuestion.options.length > 4 ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
                {currentQuestion.options.map((opt) => {
                  const selected = currentQuestion.multi
                    ? ((answers[currentQuestion.id] as string[]) ?? []).includes(opt.value)
                    : answers[currentQuestion.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => selectOption(currentQuestion.id, opt.value, currentQuestion.multi)}
                      className={`group relative overflow-hidden rounded-lg border p-5 text-left transition-all duration-300 ${
                        selected
                          ? "border-primary bg-primary/10 shadow-gold"
                          : "border-border bg-card/60 hover:border-primary/60 hover:bg-card hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md border font-display text-2xl transition-all ${
                            selected
                              ? "border-primary bg-primary/20 text-primary shadow-gold"
                              : "border-border bg-surface-deep text-primary/70 group-hover:border-primary/60"
                          }`}
                          style={selected ? { textShadow: "0 0 12px hsl(45 90% 60%)" } : undefined}
                        >
                          {opt.glyph}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-base uppercase tracking-wider text-foreground">{opt.label}</p>
                          {opt.description && (
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{opt.description}</p>
                          )}
                        </div>
                        {selected && (
                          <div className="font-display text-xl text-primary" style={{ textShadow: "0 0 8px hsl(45 90% 60%)" }}>
                            ✓
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex items-center justify-between gap-4">
                <Button variant="ghost" onClick={handleBack} disabled={step === 0}>
                  ← Back
                </Button>
                <Button variant="hero" size="lg" onClick={handleNext} disabled={!canAdvance()}>
                  Continue →
                </Button>
              </div>
            </motion.div>
          )}

          {/* NAME + REVEAL STEP */}
          {isNameStep && !revealing && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
              className="w-full max-w-xl text-center"
            >
              <h2 className="text-balance font-display text-3xl font-bold text-gold sm:text-5xl">
                Speak your true name.
              </h2>
              <p className="mt-4 text-sm italic text-muted-foreground sm:text-base">
                The realm shall remember it for ages to come.
              </p>

              <div className="mt-10 panel p-8">
                <input
                  type="text"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  maxLength={24}
                  placeholder="Aria of the Northern Pines"
                  className="w-full bg-transparent text-center font-display text-2xl tracking-wider text-foreground outline-none placeholder:text-muted-foreground/50"
                  autoFocus
                />
              </div>

              <div className="mt-10 flex items-center justify-between gap-4">
                <Button variant="ghost" onClick={handleBack}>
                  ← Back
                </Button>
                <Button variant="hero" size="lg" onClick={handleReveal} disabled={!heroName.trim() || saving}>
                  Reveal my Class ✦
                </Button>
              </div>
            </motion.div>
          )}

          {/* CLASS REVEAL */}
          {revealing && heroClass && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full text-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-display text-xs uppercase tracking-[0.4em] text-primary/70"
              >
                The runes have spoken
              </motion.p>

              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 flex justify-center"
              >
                <Sigil glyph={heroClass.sigil} size={260} color={heroClass.color} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-10 font-display text-5xl font-black text-gold sm:text-7xl"
              >
                {heroClass.name}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-2 font-display text-sm uppercase tracking-[0.3em] text-secondary"
              >
                {heroClass.title}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 }}
                className="mx-auto mt-6 max-w-xl text-balance text-base italic leading-relaxed text-muted-foreground"
              >
                "{heroClass.lore}"
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.1 }}
                className="mt-8 inline-block rounded-md border border-primary/40 bg-primary/10 px-6 py-3 font-display text-sm uppercase tracking-widest text-primary shadow-gold"
              >
                {heroClass.bonusLabel}
              </motion.div>

              {saving && (
                <p className="mt-8 font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Inscribing your name into the codex...
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default Onboarding;

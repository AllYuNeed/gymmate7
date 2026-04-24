import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QUIZ, computeClass, type QuizAnswers, type ProfileData } from "@/data/quiz";
import { HERO_CLASSES } from "@/data/classes";
import { MUSCLES } from "@/data/muscles";
import { Sigil } from "@/components/Sigil";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  // Steps: 0..QUIZ.length-1 (quiz) | QUIZ.length (profile) | QUIZ.length+1 (name+reveal)
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [profile, setProfile] = useState<ProfileData>({
    age: 25,
    gender: "male",
    height_cm: 175,
    weight_kg: 75,
    units: "metric",
    username: "",
    gym_name: "",
    country: "",
    city: "",
  });
  const [heroName, setHeroName] = useState("");
  const [revealing, setRevealing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("heroes").select("id").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) navigate("/sanctum");
    });
  }, [user, navigate]);

  const PROFILE_STEP = QUIZ.length;
  const NAME_STEP = QUIZ.length + 1;
  const totalSteps = QUIZ.length + 2;
  const progress = ((step + 1) / totalSteps) * 100;

  const isQuizStep = step < QUIZ.length;
  const isProfileStep = step === PROFILE_STEP;
  const isNameStep = step === NAME_STEP;
  const currentQuestion = isQuizStep ? QUIZ[step] : null;

  const computedClass = computeClass(answers);
  const heroClass = HERO_CLASSES[computedClass];

  const selectOption = (qid: string, value: string, multi = false) => {
    setAnswers((prev) => {
      if (!multi) return { ...prev, [qid]: value };
      const current = (prev[qid as keyof QuizAnswers] as string[]) ?? [];
      if (value === "none") return { ...prev, [qid]: ["none"] };
      const filtered = current.filter((v) => v !== "none");
      const next = filtered.includes(value) ? filtered.filter((v) => v !== value) : [...filtered, value];
      return { ...prev, [qid]: next };
    });
  };

  const canAdvance = () => {
    if (isProfileStep) {
      return (
        profile.age >= 12 && profile.age <= 100 &&
        profile.height_cm > 80 && profile.weight_kg > 25 &&
        profile.username.trim().length >= 3 &&
        /^[a-zA-Z0-9_]+$/.test(profile.username.trim())
      );
    }
    if (!currentQuestion) return true;
    const v = answers[currentQuestion.id];
    if (currentQuestion.multi) return Array.isArray(v) && v.length > 0;
    return typeof v === "string" && v.length > 0;
  };

  const handleNext = () => {
    if (step < NAME_STEP) setStep((s) => s + 1);
  };
  const handleBack = () => { if (step > 0) setStep((s) => s - 1); };

  const handleReveal = async () => {
    if (!heroName.trim()) { toast.error("Your hero must have a name."); return; }
    setRevealing(true);
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
        age: profile.age,
        gender: profile.gender,
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        units: profile.units,
        username: profile.username.trim().toLowerCase(),
        gym_name: profile.gym_name.trim() || null,
        country: profile.country.trim() || null,
        city: profile.city.trim() || null,
      });
      if (error) throw error;

      // Seed muscle realms
      const realmRows = MUSCLES.map((m) => ({ user_id: user.id, muscle: m.id, xp: 0, rank: 1 }));
      await supabase.from("muscle_realms").insert(realmRows);

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

  // Imperial conversions
  const cmToFtIn = (cm: number) => {
    const totalIn = cm / 2.54;
    return { ft: Math.floor(totalIn / 12), inches: Math.round(totalIn % 12) };
  };
  const kgToLb = (kg: number) => Math.round(kg * 2.20462);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="starfield" />
      <div className="fixed left-0 right-0 top-0 z-20 h-1 bg-surface-deep">
        <motion.div
          className="h-full bg-gradient-xp"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
        {!revealing && (
          <p className="mb-4 font-display text-xs uppercase tracking-[0.4em] text-primary/70">
            {isNameStep ? "Final Rite" : isProfileStep ? "Vital Runes" : `Trial ${step + 1} of ${QUIZ.length}`}
          </p>
        )}

        <AnimatePresence mode="wait">
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
              <p className="mt-4 text-center text-sm italic text-muted-foreground sm:text-base">{currentQuestion.flavor}</p>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {currentQuestion.options.map((opt) => {
                  const selected = currentQuestion.multi
                    ? ((answers[currentQuestion.id] as string[]) ?? []).includes(opt.value)
                    : answers[currentQuestion.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => selectOption(currentQuestion.id, opt.value, currentQuestion.multi)}
                      className={`group relative overflow-hidden rounded-lg border p-5 text-left transition-all duration-300 ${
                        selected ? "border-primary bg-primary/10 shadow-gold" : "border-border bg-card/60 hover:border-primary/60 hover:bg-card hover:-translate-y-0.5"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-md border font-display text-2xl transition-all ${selected ? "border-primary bg-primary/20 text-primary shadow-gold" : "border-border bg-surface-deep text-primary/70 group-hover:border-primary/60"}`}>
                          {opt.glyph}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-base uppercase tracking-wider text-foreground">{opt.label}</p>
                          {opt.description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{opt.description}</p>}
                        </div>
                        {selected && <div className="font-display text-xl text-primary">✓</div>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex items-center justify-between gap-4">
                <Button variant="ghost" onClick={handleBack} disabled={step === 0}>← Back</Button>
                <Button variant="hero" size="lg" onClick={handleNext} disabled={!canAdvance()}>Continue →</Button>
              </div>
            </motion.div>
          )}

          {/* PROFILE STEP */}
          {isProfileStep && !revealing && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
              className="w-full"
            >
              <h2 className="text-balance text-center font-display text-3xl font-bold text-gold sm:text-5xl">
                Inscribe your form into the codex.
              </h2>
              <p className="mt-4 text-center text-sm italic text-muted-foreground sm:text-base">
                Your handle, gym, and stature shape every quest, plan, and leaderboard rank.
              </p>

              <div className="mt-10 panel p-8 space-y-6">
                {/* Units toggle */}
                <div className="flex justify-center gap-2">
                  {(["metric", "imperial"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, units: u }))}
                      className={`rounded-md border px-4 py-1.5 font-display text-xs uppercase tracking-widest transition-all ${
                        profile.units === u
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {u === "metric" ? "Metric (kg / cm)" : "Imperial (lb / ft)"}
                    </button>
                  ))}
                </div>

                {/* Gender */}
                <div>
                  <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">Gender</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {([
                      { v: "male", g: "♂", l: "Male" },
                      { v: "female", g: "♀", l: "Female" },
                      { v: "other", g: "✦", l: "Other" },
                    ] as const).map((g) => (
                      <button
                        key={g.v}
                        type="button"
                        onClick={() => setProfile((p) => ({ ...p, gender: g.v as ProfileData["gender"] }))}
                        className={`flex flex-col items-center rounded-md border px-3 py-3 transition-all ${
                          profile.gender === g.v
                            ? "border-primary bg-primary/15 shadow-gold"
                            : "border-border bg-card/60 hover:border-primary/40"
                        }`}
                      >
                        <span className="font-display text-2xl text-primary">{g.g}</span>
                        <span className="mt-1 font-display text-xs uppercase tracking-widest">{g.l}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div>
                  <Label htmlFor="age" className="font-display text-xs uppercase tracking-widest text-muted-foreground">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min={12}
                    max={100}
                    value={profile.age}
                    onChange={(e) => setProfile((p) => ({ ...p, age: parseInt(e.target.value || "0", 10) }))}
                    className="mt-2 bg-surface-deep font-display text-lg"
                  />
                </div>

                {/* Height */}
                <div>
                  <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                    Height {profile.units === "metric" ? "(cm)" : "(ft / in)"}
                  </Label>
                  {profile.units === "metric" ? (
                    <Input
                      type="number"
                      min={100}
                      max={230}
                      value={profile.height_cm}
                      onChange={(e) => setProfile((p) => ({ ...p, height_cm: parseFloat(e.target.value || "0") }))}
                      className="mt-2 bg-surface-deep font-display text-lg"
                    />
                  ) : (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min={3}
                        max={7}
                        value={cmToFtIn(profile.height_cm).ft}
                        onChange={(e) => {
                          const ft = parseInt(e.target.value || "0", 10);
                          const inches = cmToFtIn(profile.height_cm).inches;
                          setProfile((p) => ({ ...p, height_cm: Math.round((ft * 12 + inches) * 2.54) }));
                        }}
                        className="bg-surface-deep font-display text-lg"
                        placeholder="ft"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={11}
                        value={cmToFtIn(profile.height_cm).inches}
                        onChange={(e) => {
                          const inches = parseInt(e.target.value || "0", 10);
                          const ft = cmToFtIn(profile.height_cm).ft;
                          setProfile((p) => ({ ...p, height_cm: Math.round((ft * 12 + inches) * 2.54) }));
                        }}
                        className="bg-surface-deep font-display text-lg"
                        placeholder="in"
                      />
                    </div>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <Label className="font-display text-xs uppercase tracking-widest text-muted-foreground">
                    Weight {profile.units === "metric" ? "(kg)" : "(lb)"}
                  </Label>
                  <Input
                    type="number"
                    min={profile.units === "metric" ? 30 : 66}
                    max={profile.units === "metric" ? 250 : 550}
                    value={profile.units === "metric" ? profile.weight_kg : kgToLb(profile.weight_kg)}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value || "0");
                      setProfile((p) => ({ ...p, weight_kg: profile.units === "metric" ? v : Math.round((v / 2.20462) * 10) / 10 }));
                    }}
                    className="mt-2 bg-surface-deep font-display text-lg"
                  />
                </div>
              </div>

              <div className="mt-10 flex items-center justify-between gap-4">
                <Button variant="ghost" onClick={handleBack}>← Back</Button>
                <Button variant="hero" size="lg" onClick={handleNext} disabled={!canAdvance()}>Continue →</Button>
              </div>
            </motion.div>
          )}

          {/* NAME STEP */}
          {isNameStep && !revealing && (
            <motion.div key="name" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.45 }} className="w-full max-w-xl text-center">
              <h2 className="text-balance font-display text-3xl font-bold text-gold sm:text-5xl">Speak your true name.</h2>
              <p className="mt-4 text-sm italic text-muted-foreground sm:text-base">The realm shall remember it for ages to come.</p>
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
                <Button variant="ghost" onClick={handleBack}>← Back</Button>
                <Button variant="hero" size="lg" onClick={handleReveal} disabled={!heroName.trim() || saving}>Reveal my Class ✦</Button>
              </div>
            </motion.div>
          )}

          {revealing && heroClass && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="w-full text-center">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="font-display text-xs uppercase tracking-[0.4em] text-primary/70">
                The runes have spoken
              </motion.p>
              <motion.div initial={{ scale: 0.5, opacity: 0, rotate: -15 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="mt-8 flex justify-center">
                <Sigil glyph={heroClass.sigil} size={260} color={heroClass.color} />
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="mt-10 font-display text-5xl font-black text-gold sm:text-7xl">
                {heroClass.name}
              </motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="mt-2 font-display text-sm uppercase tracking-[0.3em] text-secondary">
                {heroClass.title}
              </motion.p>
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }} className="mx-auto mt-6 max-w-xl text-balance text-base italic leading-relaxed text-muted-foreground">
                "{heroClass.lore}"
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.1 }} className="mt-8 inline-block rounded-md border border-primary/40 bg-primary/10 px-6 py-3 font-display text-sm uppercase tracking-widest text-primary shadow-gold">
                {heroClass.bonusLabel}
              </motion.div>
              {saving && <p className="mt-8 font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">Inscribing your name into the codex...</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default Onboarding;

-- Add personal profile fields to heroes
ALTER TABLE public.heroes
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS height_cm numeric,
  ADD COLUMN IF NOT EXISTS weight_kg numeric,
  ADD COLUMN IF NOT EXISTS units text NOT NULL DEFAULT 'metric';

-- Muscle realms: 17 muscle groups, each with rank/xp per hero
CREATE TABLE IF NOT EXISTS public.muscle_realms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  muscle text NOT NULL,
  xp integer NOT NULL DEFAULT 0,
  rank integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, muscle)
);
ALTER TABLE public.muscle_realms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "MR view own" ON public.muscle_realms FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "MR insert own" ON public.muscle_realms FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "MR update own" ON public.muscle_realms FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "MR delete own" ON public.muscle_realms FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_mr_updated BEFORE UPDATE ON public.muscle_realms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Workout logs
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise text NOT NULL,
  muscles text[] NOT NULL DEFAULT '{}',
  sets integer NOT NULL DEFAULT 1,
  reps integer NOT NULL DEFAULT 0,
  weight_kg numeric NOT NULL DEFAULT 0,
  intensity numeric NOT NULL DEFAULT 1,
  xp_earned integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "WL view own" ON public.workout_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "WL insert own" ON public.workout_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "WL update own" ON public.workout_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "WL delete own" ON public.workout_logs FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_wl_user_created ON public.workout_logs(user_id, created_at DESC);

-- Daily quests
CREATE TABLE IF NOT EXISTS public.daily_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quest_date date NOT NULL DEFAULT CURRENT_DATE,
  title text NOT NULL,
  description text,
  type text NOT NULL,
  target integer NOT NULL DEFAULT 1,
  progress integer NOT NULL DEFAULT 0,
  xp_reward integer NOT NULL DEFAULT 50,
  coin_reward integer NOT NULL DEFAULT 10,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "DQ view own" ON public.daily_quests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "DQ insert own" ON public.daily_quests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "DQ update own" ON public.daily_quests FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "DQ delete own" ON public.daily_quests FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_dq_user_date ON public.daily_quests(user_id, quest_date DESC);

-- Boss battles
CREATE TABLE IF NOT EXISTS public.boss_battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  boss_name text NOT NULL,
  boss_lore text,
  boss_sigil text NOT NULL DEFAULT '☠',
  max_hp integer NOT NULL,
  current_hp integer NOT NULL,
  month_key text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  loot text[] NOT NULL DEFAULT '{}',
  defeated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, month_key)
);
ALTER TABLE public.boss_battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "BB view own" ON public.boss_battles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "BB insert own" ON public.boss_battles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "BB update own" ON public.boss_battles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Diet plans (AI generated)
CREATE TABLE IF NOT EXISTS public.diet_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  summary text,
  daily_calories integer,
  protein_g integer,
  carbs_g integer,
  fats_g integer,
  meals jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "DP view own" ON public.diet_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "DP insert own" ON public.diet_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "DP update own" ON public.diet_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "DP delete own" ON public.diet_plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Workout routines (AI or preset)
CREATE TABLE IF NOT EXISTS public.workout_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  summary text,
  source text NOT NULL DEFAULT 'ai',
  days_per_week integer NOT NULL DEFAULT 3,
  schedule jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "WR view own" ON public.workout_routines FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "WR insert own" ON public.workout_routines FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "WR update own" ON public.workout_routines FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "WR delete own" ON public.workout_routines FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- HEROES table: stores the player's RPG profile
CREATE TABLE public.heroes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  hero_name TEXT NOT NULL,
  class TEXT NOT NULL,
  goal TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  body_type TEXT NOT NULL,
  available_days INTEGER NOT NULL DEFAULT 3,
  equipment TEXT NOT NULL,
  sleep_quality TEXT NOT NULL,
  stress_level TEXT NOT NULL,
  injuries TEXT[] NOT NULL DEFAULT '{}',
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  coins INTEGER NOT NULL DEFAULT 100,
  streak_days INTEGER NOT NULL DEFAULT 0,
  streak_freezes INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.heroes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Heroes view own" ON public.heroes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Heroes insert own" ON public.heroes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Heroes update own" ON public.heroes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Heroes delete own" ON public.heroes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER heroes_set_updated_at
  BEFORE UPDATE ON public.heroes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

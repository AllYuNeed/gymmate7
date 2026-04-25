-- Group/Guild Boss Battles
CREATE TABLE public.guild_bosses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
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
  UNIQUE(guild_id, month_key)
);

CREATE TABLE public.guild_boss_damage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_boss_id uuid NOT NULL REFERENCES public.guild_bosses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  damage integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(guild_boss_id, user_id)
);

ALTER TABLE public.guild_bosses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_boss_damage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "GB member view" ON public.guild_bosses FOR SELECT TO authenticated
  USING (public.is_guild_member(auth.uid(), guild_id));
CREATE POLICY "GB leader insert" ON public.guild_bosses FOR INSERT TO authenticated
  WITH CHECK (public.is_guild_leader(auth.uid(), guild_id));
CREATE POLICY "GB member update" ON public.guild_bosses FOR UPDATE TO authenticated
  USING (public.is_guild_member(auth.uid(), guild_id));

CREATE POLICY "GBD member view" ON public.guild_boss_damage FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.guild_bosses gb WHERE gb.id = guild_boss_id AND public.is_guild_member(auth.uid(), gb.guild_id)));
CREATE POLICY "GBD self insert" ON public.guild_boss_damage FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "GBD self update" ON public.guild_boss_damage FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Push Subscriptions
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "PS view own" ON public.push_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "PS insert own" ON public.push_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "PS delete own" ON public.push_subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Season tracking on heroes (monthly XP)
ALTER TABLE public.heroes ADD COLUMN IF NOT EXISTS monthly_xp integer NOT NULL DEFAULT 0;
ALTER TABLE public.heroes ADD COLUMN IF NOT EXISTS monthly_xp_reset_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.heroes ADD COLUMN IF NOT EXISTS last_workout_date date;

-- Enable extensions for cron + http
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Realtime for guild bosses
ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_bosses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_boss_damage;
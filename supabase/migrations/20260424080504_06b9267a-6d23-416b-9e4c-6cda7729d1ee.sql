-- 1. Extend heroes with social/leaderboard fields
ALTER TABLE public.heroes
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS gym_name text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS weekly_xp integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekly_xp_reset_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_heroes_xp ON public.heroes (xp DESC);
CREATE INDEX IF NOT EXISTS idx_heroes_weekly_xp ON public.heroes (weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_heroes_country ON public.heroes (country);

-- Allow signed-in users to view public leaderboard hero rows
DROP POLICY IF EXISTS "Heroes leaderboard view" ON public.heroes;
CREATE POLICY "Heroes leaderboard view"
  ON public.heroes FOR SELECT
  TO authenticated
  USING (true);

-- 2. Guilds
CREATE TABLE IF NOT EXISTS public.guilds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT '⚔',
  invite_code text NOT NULL UNIQUE,
  country text,
  total_xp integer NOT NULL DEFAULT 0,
  leader_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_guilds_total_xp ON public.guilds (total_xp DESC);

-- 3. Guild members
CREATE TABLE IF NOT EXISTS public.guild_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  contributed_xp integer NOT NULL DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guild_id, user_id)
);
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_guild_members_user ON public.guild_members (user_id);
CREATE INDEX IF NOT EXISTS idx_guild_members_guild ON public.guild_members (guild_id);

-- 4. Security definer helper for RLS
CREATE OR REPLACE FUNCTION public.is_guild_member(_user_id uuid, _guild_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guild_members
    WHERE user_id = _user_id AND guild_id = _guild_id
  )
$$;

CREATE OR REPLACE FUNCTION public.is_guild_leader(_user_id uuid, _guild_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guilds
    WHERE id = _guild_id AND leader_user_id = _user_id
  )
$$;

-- 5. Guilds policies
DROP POLICY IF EXISTS "Guilds view all" ON public.guilds;
CREATE POLICY "Guilds view all" ON public.guilds FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Guilds insert own" ON public.guilds;
CREATE POLICY "Guilds insert own" ON public.guilds FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = leader_user_id);

DROP POLICY IF EXISTS "Guilds leader update" ON public.guilds;
CREATE POLICY "Guilds leader update" ON public.guilds FOR UPDATE TO authenticated
  USING (auth.uid() = leader_user_id);

DROP POLICY IF EXISTS "Guilds leader delete" ON public.guilds;
CREATE POLICY "Guilds leader delete" ON public.guilds FOR DELETE TO authenticated
  USING (auth.uid() = leader_user_id);

-- 6. Guild members policies
DROP POLICY IF EXISTS "GM view all" ON public.guild_members;
CREATE POLICY "GM view all" ON public.guild_members FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "GM join self" ON public.guild_members;
CREATE POLICY "GM join self" ON public.guild_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "GM update self or leader" ON public.guild_members;
CREATE POLICY "GM update self or leader" ON public.guild_members FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_guild_leader(auth.uid(), guild_id));

DROP POLICY IF EXISTS "GM leave self or leader kick" ON public.guild_members;
CREATE POLICY "GM leave self or leader kick" ON public.guild_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_guild_leader(auth.uid(), guild_id));

-- 7. Guild messages
CREATE TABLE IF NOT EXISTS public.guild_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.guild_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_guild_messages_guild ON public.guild_messages (guild_id, created_at DESC);

DROP POLICY IF EXISTS "GMsg member view" ON public.guild_messages;
CREATE POLICY "GMsg member view" ON public.guild_messages FOR SELECT TO authenticated
  USING (public.is_guild_member(auth.uid(), guild_id));

DROP POLICY IF EXISTS "GMsg member post" ON public.guild_messages;
CREATE POLICY "GMsg member post" ON public.guild_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_guild_member(auth.uid(), guild_id));

DROP POLICY IF EXISTS "GMsg author delete" ON public.guild_messages;
CREATE POLICY "GMsg author delete" ON public.guild_messages FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_guild_leader(auth.uid(), guild_id));

-- 8. Guild quests
CREATE TABLE IF NOT EXISTS public.guild_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id uuid NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_xp integer NOT NULL DEFAULT 5000,
  current_xp integer NOT NULL DEFAULT 0,
  reward text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.guild_quests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "GQ member view" ON public.guild_quests;
CREATE POLICY "GQ member view" ON public.guild_quests FOR SELECT TO authenticated
  USING (public.is_guild_member(auth.uid(), guild_id));

DROP POLICY IF EXISTS "GQ leader insert" ON public.guild_quests;
CREATE POLICY "GQ leader insert" ON public.guild_quests FOR INSERT TO authenticated
  WITH CHECK (public.is_guild_leader(auth.uid(), guild_id));

DROP POLICY IF EXISTS "GQ leader update" ON public.guild_quests;
CREATE POLICY "GQ leader update" ON public.guild_quests FOR UPDATE TO authenticated
  USING (public.is_guild_leader(auth.uid(), guild_id));

DROP POLICY IF EXISTS "GQ leader delete" ON public.guild_quests;
CREATE POLICY "GQ leader delete" ON public.guild_quests FOR DELETE TO authenticated
  USING (public.is_guild_leader(auth.uid(), guild_id));

-- 9. Custom workout plans
CREATE TABLE IF NOT EXISTS public.custom_workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  guild_id uuid REFERENCES public.guilds(id) ON DELETE SET NULL,
  title text NOT NULL,
  summary text,
  days_per_week integer NOT NULL DEFAULT 3,
  schedule jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_template boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_workout_plans ENABLE ROW LEVEL SECURITY;

-- 10. Custom diet plans
CREATE TABLE IF NOT EXISTS public.custom_diet_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  guild_id uuid REFERENCES public.guilds(id) ON DELETE SET NULL,
  title text NOT NULL,
  summary text,
  daily_calories integer,
  protein_g integer,
  carbs_g integer,
  fats_g integer,
  meals jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_template boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_diet_plans ENABLE ROW LEVEL SECURITY;

-- 11. Plan assignments
CREATE TABLE IF NOT EXISTS public.plan_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_kind text NOT NULL CHECK (plan_kind IN ('workout','diet')),
  workout_plan_id uuid REFERENCES public.custom_workout_plans(id) ON DELETE CASCADE,
  diet_plan_id uuid REFERENCES public.custom_diet_plans(id) ON DELETE CASCADE,
  assigned_by uuid NOT NULL,
  assigned_to uuid NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.plan_assignments ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_pa_to ON public.plan_assignments (assigned_to);
CREATE INDEX IF NOT EXISTS idx_pa_by ON public.plan_assignments (assigned_by);

-- 12. Helper functions for plan visibility
CREATE OR REPLACE FUNCTION public.has_workout_plan_access(_user_id uuid, _plan_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.custom_workout_plans p
    WHERE p.id = _plan_id AND (
      p.owner_user_id = _user_id
      OR (p.guild_id IS NOT NULL AND public.is_guild_member(_user_id, p.guild_id))
      OR EXISTS (
        SELECT 1 FROM public.plan_assignments a
        WHERE a.workout_plan_id = _plan_id AND a.assigned_to = _user_id
      )
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.has_diet_plan_access(_user_id uuid, _plan_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.custom_diet_plans p
    WHERE p.id = _plan_id AND (
      p.owner_user_id = _user_id
      OR (p.guild_id IS NOT NULL AND public.is_guild_member(_user_id, p.guild_id))
      OR EXISTS (
        SELECT 1 FROM public.plan_assignments a
        WHERE a.diet_plan_id = _plan_id AND a.assigned_to = _user_id
      )
    )
  )
$$;

-- 13. Custom plan policies
DROP POLICY IF EXISTS "CWP owner all" ON public.custom_workout_plans;
CREATE POLICY "CWP owner all" ON public.custom_workout_plans FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "CWP shared view" ON public.custom_workout_plans;
CREATE POLICY "CWP shared view" ON public.custom_workout_plans FOR SELECT TO authenticated
  USING (public.has_workout_plan_access(auth.uid(), id));

DROP POLICY IF EXISTS "CDP owner all" ON public.custom_diet_plans;
CREATE POLICY "CDP owner all" ON public.custom_diet_plans FOR ALL TO authenticated
  USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "CDP shared view" ON public.custom_diet_plans;
CREATE POLICY "CDP shared view" ON public.custom_diet_plans FOR SELECT TO authenticated
  USING (public.has_diet_plan_access(auth.uid(), id));

-- 14. Plan assignments policies
DROP POLICY IF EXISTS "PA view involved" ON public.plan_assignments;
CREATE POLICY "PA view involved" ON public.plan_assignments FOR SELECT TO authenticated
  USING (auth.uid() = assigned_by OR auth.uid() = assigned_to);

DROP POLICY IF EXISTS "PA insert by owner" ON public.plan_assignments;
CREATE POLICY "PA insert by owner" ON public.plan_assignments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = assigned_by);

DROP POLICY IF EXISTS "PA delete by owner" ON public.plan_assignments;
CREATE POLICY "PA delete by owner" ON public.plan_assignments FOR DELETE TO authenticated
  USING (auth.uid() = assigned_by);

-- 15. Realtime publication
ALTER TABLE public.guild_messages REPLICA IDENTITY FULL;
ALTER TABLE public.guild_members REPLICA IDENTITY FULL;
ALTER TABLE public.guilds REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_members; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.guilds; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- 16. Updated_at triggers
DROP TRIGGER IF EXISTS trg_guilds_updated ON public.guilds;
CREATE TRIGGER trg_guilds_updated BEFORE UPDATE ON public.guilds
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_cwp_updated ON public.custom_workout_plans;
CREATE TRIGGER trg_cwp_updated BEFORE UPDATE ON public.custom_workout_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_cdp_updated ON public.custom_diet_plans;
CREATE TRIGGER trg_cdp_updated BEFORE UPDATE ON public.custom_diet_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
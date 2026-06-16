-- Guild roles, reporting, and Sunday-safe streak processing.

-- Reports for chat, guild, and profile safety moderation.
CREATE TABLE IF NOT EXISTS public.user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  reported_user_id uuid NOT NULL,
  reason text NOT NULL CHECK (char_length(reason) BETWEEN 3 AND 120),
  details text,
  context text NOT NULL CHECK (context IN ('direct_message', 'guild_chat', 'guild_member', 'profile')),
  context_id text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  resolved_at timestamptz,
  CHECK (reporter_id <> reported_user_id)
);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON public.user_reports (reporter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON public.user_reports (reported_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON public.user_reports (status, created_at DESC);

DROP POLICY IF EXISTS "UR insert own" ON public.user_reports;
CREATE POLICY "UR insert own" ON public.user_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "UR view own" ON public.user_reports;
CREATE POLICY "UR view own" ON public.user_reports FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

-- Role ranking helpers. Higher rank can manage lower rank.
CREATE OR REPLACE FUNCTION public.guild_role_rank(_role text)
RETURNS integer
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE _role
    WHEN 'leader' THEN 100
    WHEN 'co_leader' THEN 80
    WHEN 'admin' THEN 60
    ELSE 10
  END
$$;

CREATE OR REPLACE FUNCTION public.guild_actor_rank(_user_id uuid, _guild_id uuid)
RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT GREATEST(
    COALESCE((SELECT 100 FROM public.guilds WHERE id = _guild_id AND leader_user_id = _user_id), 0),
    COALESCE((SELECT public.guild_role_rank(role) FROM public.guild_members WHERE guild_id = _guild_id AND user_id = _user_id), 0)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_guild_manager(_user_id uuid, _guild_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.guild_actor_rank(_user_id, _guild_id) >= 60
$$;

CREATE OR REPLACE FUNCTION public.can_manage_guild_member(
  _actor_user_id uuid,
  _guild_id uuid,
  _target_user_id uuid,
  _target_role text
)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    _actor_user_id <> _target_user_id
    AND public.guild_actor_rank(_actor_user_id, _guild_id) >= 60
    AND public.guild_actor_rank(_actor_user_id, _guild_id) > public.guild_role_rank(_target_role)
$$;

DROP POLICY IF EXISTS "GM update self or leader" ON public.guild_members;
DROP POLICY IF EXISTS "GM update self or manager" ON public.guild_members;
CREATE POLICY "GM update self or manager" ON public.guild_members FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    OR public.can_manage_guild_member(auth.uid(), guild_id, user_id, role)
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.guild_actor_rank(auth.uid(), guild_id) > public.guild_role_rank(role)
  );

DROP POLICY IF EXISTS "GM leave self or leader kick" ON public.guild_members;
DROP POLICY IF EXISTS "GM leave self or manager kick" ON public.guild_members;
CREATE POLICY "GM leave self or manager kick" ON public.guild_members FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    OR public.can_manage_guild_member(auth.uid(), guild_id, user_id, role)
  );

-- Ownership transfer needs to set another member to leader, so keep it in a checked RPC.
CREATE OR REPLACE FUNCTION public.transfer_guild_ownership(
  p_guild_id uuid,
  p_new_leader_user_id uuid
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.guilds
    WHERE id = p_guild_id AND leader_user_id = v_actor
  ) THEN
    RAISE EXCEPTION 'Only the guild leader can transfer ownership';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.guild_members
    WHERE guild_id = p_guild_id AND user_id = p_new_leader_user_id
  ) THEN
    RAISE EXCEPTION 'New leader must be a guild member';
  END IF;

  UPDATE public.guild_members
  SET role = 'member'
  WHERE guild_id = p_guild_id AND user_id = v_actor;

  UPDATE public.guild_members
  SET role = 'leader'
  WHERE guild_id = p_guild_id AND user_id = p_new_leader_user_id;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'guilds' AND column_name = 'owner_id'
  ) THEN
    EXECUTE 'UPDATE public.guilds SET leader_user_id = $1, owner_id = $1 WHERE id = $2'
      USING p_new_leader_user_id, p_guild_id;
  ELSE
    UPDATE public.guilds
    SET leader_user_id = p_new_leader_user_id
    WHERE id = p_guild_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_guild_ownership(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_guild_ownership(uuid, uuid) TO authenticated;

-- Co-leaders can summon guild bosses. Admins cannot.
DROP POLICY IF EXISTS "GB leader insert" ON public.guild_bosses;
DROP POLICY IF EXISTS "GB commander insert" ON public.guild_bosses;
CREATE POLICY "GB commander insert" ON public.guild_bosses FOR INSERT TO authenticated
  WITH CHECK (public.guild_actor_rank(auth.uid(), guild_id) >= 80);

-- Server-side streak safety. Sundays are automatic rest days in IST.
ALTER TABLE public.heroes
  ADD COLUMN IF NOT EXISTS streak_shield_count integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS shield_reset_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'Asia/Kolkata')::date),
  ADD COLUMN IF NOT EXISTS sunday_protection boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_workout_date date;

CREATE TABLE IF NOT EXISTS public.streak_shield_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  used_date date NOT NULL,
  auto_triggered boolean NOT NULL DEFAULT true,
  streak_preserved integer NOT NULL,
  is_sunday boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.streak_shield_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "SSL view own" ON public.streak_shield_log;
CREATE POLICY "SSL view own" ON public.streak_shield_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.check_and_refresh_shields(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_month_start date := date_trunc('month', (now() AT TIME ZONE 'Asia/Kolkata'))::date;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Cannot refresh another user streak';
  END IF;

  UPDATE public.heroes
  SET streak_shield_count = 5,
      shield_reset_date = v_month_start
  WHERE user_id = p_user_id
    AND (shield_reset_date IS NULL OR shield_reset_date < v_month_start);
END;
$$;

CREATE OR REPLACE FUNCTION public.process_streak_on_workout(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_today date := (now() AT TIME ZONE 'Asia/Kolkata')::date;
  v_yesterday date := ((now() AT TIME ZONE 'Asia/Kolkata')::date - 1);
  v_last date;
  v_streak integer;
  v_longest integer;
  v_shields integer;
  v_new_streak integer;
BEGIN
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'Cannot process another user streak';
  END IF;

  PERFORM public.check_and_refresh_shields(p_user_id);

  SELECT last_workout_date, streak_days, longest_streak, streak_shield_count
  INTO v_last, v_streak, v_longest, v_shields
  FROM public.heroes
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Hero not found';
  END IF;

  IF v_last = v_today THEN
    RETURN jsonb_build_object('action', 'already_logged', 'streak', v_streak);
  END IF;

  IF v_last IS NULL OR v_streak = 0 THEN
    v_new_streak := 1;
    UPDATE public.heroes
    SET streak_days = v_new_streak,
        longest_streak = GREATEST(COALESCE(v_longest, 0), v_new_streak),
        last_workout_date = v_today
    WHERE user_id = p_user_id;
    RETURN jsonb_build_object('action', 'started', 'streak', v_new_streak);
  END IF;

  IF v_last = v_yesterday THEN
    v_new_streak := v_streak + 1;
    UPDATE public.heroes
    SET streak_days = v_new_streak,
        longest_streak = GREATEST(COALESCE(v_longest, 0), v_new_streak),
        last_workout_date = v_today
    WHERE user_id = p_user_id;
    RETURN jsonb_build_object('action', 'extended', 'streak', v_new_streak);
  END IF;

  IF EXTRACT(DOW FROM v_yesterday) = 0 AND v_last = (v_yesterday - 1) THEN
    v_new_streak := v_streak + 1;
    UPDATE public.heroes
    SET streak_days = v_new_streak,
        longest_streak = GREATEST(COALESCE(v_longest, 0), v_new_streak),
        last_workout_date = v_today
    WHERE user_id = p_user_id;

    INSERT INTO public.streak_shield_log (user_id, used_date, auto_triggered, streak_preserved, is_sunday)
    VALUES (p_user_id, v_yesterday, true, v_streak, true);

    RETURN jsonb_build_object('action', 'sunday_protected', 'streak', v_new_streak);
  END IF;

  IF COALESCE(v_shields, 0) > 0 THEN
    UPDATE public.heroes
    SET streak_shield_count = v_shields - 1,
        last_workout_date = v_today
    WHERE user_id = p_user_id;

    INSERT INTO public.streak_shield_log (user_id, used_date, auto_triggered, streak_preserved, is_sunday)
    VALUES (p_user_id, v_today, true, v_streak, false);

    RETURN jsonb_build_object(
      'action', 'shield_used',
      'streak', v_streak,
      'shields_remaining', v_shields - 1,
      'shields_used', 1
    );
  END IF;

  UPDATE public.heroes
  SET streak_days = 1,
      longest_streak = GREATEST(COALESCE(v_longest, 0), 1),
      last_workout_date = v_today
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('action', 'broken', 'streak', 1);
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_refresh_shields(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_streak_on_workout(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_refresh_shields(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_streak_on_workout(uuid) TO authenticated;

-- ============ FRIENDSHIPS ============
CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','blocked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (requester_id <> addressee_id)
);

-- Unique pair regardless of who requested
CREATE UNIQUE INDEX friendships_pair_unique
  ON public.friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));

CREATE INDEX friendships_addressee_idx ON public.friendships(addressee_id, status);
CREATE INDEX friendships_requester_idx ON public.friendships(requester_id, status);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "FR view involved" ON public.friendships FOR SELECT TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "FR send as requester" ON public.friendships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "FR addressee respond" ON public.friendships FOR UPDATE TO authenticated
  USING (auth.uid() = addressee_id OR auth.uid() = requester_id);
CREATE POLICY "FR either delete" ON public.friendships FOR DELETE TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE TRIGGER friendships_updated_at BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============ CONVERSATIONS ============
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL,
  user_b uuid NOT NULL,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (user_a < user_b)
);

CREATE UNIQUE INDEX conversations_pair_unique ON public.conversations(user_a, user_b);
CREATE INDEX conversations_user_a_idx ON public.conversations(user_a, last_message_at DESC);
CREATE INDEX conversations_user_b_idx ON public.conversations(user_b, last_message_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Helper function to check participation (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = _conversation_id AND (user_a = _user_id OR user_b = _user_id)
  )
$$;

CREATE POLICY "CV view own" ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "CV insert participant" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY "CV update own" ON public.conversations FOR UPDATE TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- ============ MESSAGES ============
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text,
  image_url text,
  attachment jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_conv_idx ON public.messages(conversation_id, created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "MSG view participant" ON public.messages FOR SELECT TO authenticated
  USING (public.is_conversation_participant(auth.uid(), conversation_id));
CREATE POLICY "MSG send as participant" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id AND public.is_conversation_participant(auth.uid(), conversation_id));
CREATE POLICY "MSG update participant" ON public.messages FOR UPDATE TO authenticated
  USING (public.is_conversation_participant(auth.uid(), conversation_id));
CREATE POLICY "MSG delete own" ON public.messages FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);

-- Bump conversation last_message_at on new message
CREATE OR REPLACE FUNCTION public.bump_conversation_on_message()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;
CREATE TRIGGER messages_bump_conv AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_conversation_on_message();

-- ============ TYPING INDICATORS ============
CREATE TABLE public.typing_indicators (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "TI view participant" ON public.typing_indicators FOR SELECT TO authenticated
  USING (public.is_conversation_participant(auth.uid(), conversation_id));
CREATE POLICY "TI upsert self" ON public.typing_indicators FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.is_conversation_participant(auth.uid(), conversation_id));
CREATE POLICY "TI update self" ON public.typing_indicators FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "TI delete self" ON public.typing_indicators FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============ STORAGE BUCKET FOR CHAT IMAGES ============
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Chat images public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-images');
CREATE POLICY "Chat images upload own folder" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Chat images delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============ REALTIME ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.typing_indicators REPLICA IDENTITY FULL;
ALTER TABLE public.friendships REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
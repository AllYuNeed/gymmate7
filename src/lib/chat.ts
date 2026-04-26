import { supabase } from "@/integrations/supabase/client";

/** Get or create a 1:1 conversation between two users. Returns conversation id. */
export async function getOrCreateConversation(meId: string, otherId: string): Promise<string> {
  const [a, b] = [meId, otherId].sort();
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("user_a", a)
    .eq("user_b", b)
    .maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_a: a, user_b: b })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export interface AchievementCard {
  kind: "level_up" | "boss_damage" | "workout";
  title: string;
  detail: string;
  xp?: number;
  icon?: string;
}

export async function sendMessage(opts: {
  conversationId: string;
  senderId: string;
  content?: string;
  imageUrl?: string;
  attachment?: AchievementCard;
}) {
  const { error } = await supabase.from("messages").insert({
    conversation_id: opts.conversationId,
    sender_id: opts.senderId,
    content: opts.content ?? null,
    image_url: opts.imageUrl ?? null,
    attachment: (opts.attachment as unknown as never) ?? null,
  });
  if (error) throw error;
}

export async function markConversationRead(conversationId: string, meId: string) {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", meId)
    .is("read_at", null);
}

export async function setTyping(conversationId: string, userId: string) {
  await supabase
    .from("typing_indicators")
    .upsert({ conversation_id: conversationId, user_id: userId, updated_at: new Date().toISOString() });
}

export async function clearTyping(conversationId: string, userId: string) {
  await supabase
    .from("typing_indicators")
    .delete()
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);
}

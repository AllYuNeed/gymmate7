import { supabase } from "@/integrations/supabase/client";

export type ReportContext = "direct_message" | "guild_chat" | "guild_member" | "profile";

export async function submitUserReport(input: {
  reporterId: string;
  reportedUserId: string;
  reason: string;
  details?: string;
  context: ReportContext;
  contextId?: string | null;
}) {
  const { error } = await supabase.from("user_reports").insert({
    reporter_id: input.reporterId,
    reported_user_id: input.reportedUserId,
    reason: input.reason,
    details: input.details?.trim() || null,
    context: input.context,
    context_id: input.contextId ?? null,
  });

  if (error) throw error;
}

import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getAuthUrlParams } from "@/lib/authRedirect";

export const completeSupabaseAuthFromUrl = async (url: string): Promise<Session | null> => {
  const params = getAuthUrlParams(url);
  const errorDescription = params.get("error_description") ?? params.get("error");

  if (errorDescription) {
    throw new Error(errorDescription.replace(/\+/g, " "));
  }

  const code = params.get("code");
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return data.session;
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return data.session;
  }

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  return session;
};

export const getPostAuthRedirectPath = async (userId: string) => {
  const { data: hero, error } = await supabase
    .from("heroes")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return hero ? "/sanctum" : "/awaken";
};

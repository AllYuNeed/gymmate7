import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getPostAuthRedirectPath } from "@/lib/authSession";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const routeSignedInUser = async (userId: string) => {
      const destination = await getPostAuthRedirectPath(userId);
      navigate(destination, { replace: true });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await routeSignedInUser(session.user.id);
      }
    });

    // Also handle the case where session is already set on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await routeSignedInUser(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="starfield" />
      <div className="relative text-center">
        <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/80">◆ Channeling ◆</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-gold">Awakening your hero...</h1>
      </div>
    </main>
  );
};

export default AuthCallback;

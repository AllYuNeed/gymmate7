import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Sigil } from "@/components/Sigil";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/awaken` },
        });
        if (error) throw error;
        toast.success("Covenant sealed. Awaken your hero.");
        navigate("/awaken");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back, traveler.");
        // Check if hero exists; route accordingly
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: hero } = await supabase.from("heroes").select("id").eq("user_id", user.id).maybeSingle();
          navigate(hero ? "/sanctum" : "/awaken");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="starfield" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" aria-label="Mortal Gyms home" className="mb-6 inline-block">
            <Logo size={140} />
          </Link>
          <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/80">◆ Sacred Covenant ◆</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-gold">
            {mode === "signup" ? "Forge a Pact" : "Return, Hero"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Bind your soul to Mortal Gyms to begin your ascension."
              : "Step back into Mortal Gyms."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="panel space-y-4 p-8">
          <div>
            <label className="mb-2 block font-display text-xs uppercase tracking-widest text-muted-foreground">
              Sigil Mark (Email)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-input/50 px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:shadow-gold"
              placeholder="hero@realm.io"
            />
          </div>
          <div>
            <label className="mb-2 block font-display text-xs uppercase tracking-widest text-muted-foreground">
              Secret Incantation (Password)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-input/50 px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:shadow-gold"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
            {loading ? "Channeling..." : mode === "signup" ? "Seal the Covenant" : "Enter the Realm"}
          </Button>

          {mode === "signin" && (
            <div className="text-right">
              <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
                Forgotten thy incantation?
              </Link>
            </div>
          )}

          <div className="rune-divider" />

          <Button
            type="button"
            variant="rune"
            size="lg"
            className="w-full"
            onClick={async () => {
              setLoading(true);
              try {
                const result = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: `${window.location.origin}/sanctum`,
                });
                if (result.error) throw result.error;
                if (!result.redirected) {
                  // Tokens received inline — check hero
                  const { data: { user } } = await supabase.auth.getUser();
                  if (user) {
                    const { data: hero } = await supabase
                      .from("heroes").select("id").eq("user_id", user.id).maybeSingle();
                    navigate(hero ? "/sanctum" : "/awaken");
                  }
                }
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Google sign-in failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            <span className="text-base">◉</span> Continue with Google
          </Button>

          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {mode === "signup"
              ? "Already bound? Return to the realm →"
              : "New to the realm? Forge a covenant →"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="font-display text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
            ← Back to the gates
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Auth;

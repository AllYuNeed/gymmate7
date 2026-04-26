import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sigil } from "@/components/Sigil";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-handles the recovery token from the URL hash and creates a session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Incantations do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Key reforged. Step into the realm.");
      navigate("/sanctum");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-12">
      <div className="starfield" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <Sigil glyph="✠" size={120} />
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold text-gold">Forge New Key</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {ready ? "Inscribe a new incantation." : "Verifying ancient rune..."}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="panel space-y-4 p-8">
          <div>
            <label className="mb-2 block font-display text-xs uppercase tracking-widest text-muted-foreground">
              New Incantation
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
          <div>
            <label className="mb-2 block font-display text-xs uppercase tracking-widest text-muted-foreground">
              Confirm
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-md border border-border bg-input/50 px-4 py-3 text-foreground outline-none transition-colors focus:border-primary focus:shadow-gold"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || !ready}>
            {loading ? "Forging..." : "Forge New Key"}
          </Button>
        </form>
      </div>
    </main>
  );
};

export default ResetPassword;

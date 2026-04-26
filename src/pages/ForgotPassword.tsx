import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sigil } from "@/components/Sigil";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Reset rune dispatched. Check thy scrolls.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
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
            <Sigil glyph="❦" size={120} />
          </div>
          <p className="font-display text-xs uppercase tracking-[0.4em] text-primary/80">◆ Lost Incantation ◆</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-gold">Reforge Thy Key</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            We shall send a reset rune to your sigil mark.
          </p>
        </div>

        {sent ? (
          <div className="panel space-y-4 p-8 text-center">
            <p className="font-display text-lg text-primary">✦ Rune Sent ✦</p>
            <p className="text-sm text-muted-foreground">
              Check thy email at <span className="text-foreground">{email}</span>. Click the link to forge a new password.
            </p>
            <Link to="/auth" className="inline-block">
              <Button variant="rune">Return to Gates</Button>
            </Link>
          </div>
        ) : (
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
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? "Channeling..." : "Send Reset Rune"}
            </Button>
            <div className="rune-divider" />
            <Link to="/auth" className="block text-center text-sm text-muted-foreground hover:text-primary">
              ← Back to the gates
            </Link>
          </form>
        )}
      </div>
    </main>
  );
};

export default ForgotPassword;

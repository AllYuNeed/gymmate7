import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Privacy = () => (
  <main className="relative min-h-screen px-6 py-16">
    <div className="starfield" />
    <article className="relative mx-auto max-w-3xl">
      <header className="mb-10 text-center">
        <Link to="/" aria-label="Mortal Gyms home" className="inline-block">
          <Logo size={96} />
        </Link>
        <p className="mt-6 font-display text-xs uppercase tracking-[0.4em] text-primary/80">◆ Legal ◆</p>
        <h1 className="mt-2 font-display text-4xl font-black text-gold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: April 28, 2026</p>
      </header>

      <section className="prose prose-invert max-w-none space-y-6 text-foreground/90">
        <p>
          Mortal Gyms ("we", "us", "our") respects your privacy. This policy explains what data we
          collect, why we collect it, and the choices you have.
        </p>

        <h2 className="font-display text-2xl text-primary">1. Data We Collect</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li><strong>Account data:</strong> email, username, hero name, class, avatar.</li>
          <li><strong>Profile from Google Sign-In:</strong> name, email, profile image (only if you choose Google login).</li>
          <li><strong>Fitness activity:</strong> workouts, sets, reps, XP, streaks, muscle ranks.</li>
          <li><strong>Social data:</strong> friend requests, guild membership, chat messages and shared images.</li>
          <li><strong>Device data:</strong> push subscription tokens (only if you enable notifications).</li>
        </ul>

        <h2 className="font-display text-2xl text-primary">2. How We Use Your Data</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>To run the app: track XP, level, ranks, quests, and boss progress.</li>
          <li>To enable social features: friends, guild chat, direct messages.</li>
          <li>To send push notifications you opt into (quest reminders, new DMs).</li>
          <li>To improve the experience and prevent abuse.</li>
        </ul>

        <h2 className="font-display text-2xl text-primary">3. Data Sharing</h2>
        <p>
          We do <strong>not</strong> sell your personal data. Your hero name, level, avatar, and
          public stats are visible to other players on leaderboards and within guilds. Direct
          messages are visible only to participants.
        </p>

        <h2 className="font-display text-2xl text-primary">4. Data Storage & Security</h2>
        <p>
          Data is transmitted over HTTPS/TLS and stored on encrypted servers (Vercel / Supabase).
          Access is protected by row-level security so users can only access their own private data.
        </p>

        <h2 className="font-display text-2xl text-primary">5. Your Rights</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Access, correct, or export your data.</li>
          <li>Delete your account and all associated data from <Link className="text-primary underline" to="/deleteuserdata">Delete User Data</Link> or by contacting us.</li>
          <li>Disable push notifications from your device or in the Sanctum.</li>
          <li>Revoke Google Sign-In access from your Google account settings.</li>
        </ul>

        <h2 className="font-display text-2xl text-primary">6. Children</h2>
        <p>Mortal Gyms is not intended for children under 13 (or 16 in the EU).</p>

        <h2 className="font-display text-2xl text-primary">7. Changes</h2>
        <p>We may update this policy. Material changes will be announced in-app.</p>

        <h2 className="font-display text-2xl text-primary">8. Contact</h2>
        <p>
          For privacy questions or data deletion requests, email{" "}
          <a className="text-primary underline" href="mailto:mortalgyms@gmail.com">
            mortalgyms@gmail.com
          </a>.
        </p>
      </section>

      <footer className="mt-16 text-center text-xs text-muted-foreground">
        <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
        <span className="mx-3">·</span>
        <Link to="/deleteuserdata" className="text-primary hover:underline">Delete User Data</Link>
        <span className="mx-3">.</span>
        <Link to="/" className="text-primary hover:underline">Home</Link>
      </footer>
    </article>
  </main>
);

export default Privacy;

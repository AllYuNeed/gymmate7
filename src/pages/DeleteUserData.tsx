import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

const DeleteUserData = () => (
  <main className="relative min-h-screen px-6 py-16">
    <div className="starfield" />
    <article className="relative mx-auto max-w-3xl">
      <header className="mb-10 text-center">
        <Link to="/" aria-label="Mortal Gyms home" className="inline-block">
          <Logo size={96} />
        </Link>
        <p className="mt-6 font-display text-xs uppercase tracking-[0.35em] text-primary/80">Data Controls</p>
        <h1 className="mt-2 font-display text-4xl font-black text-gold">Delete User Data</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Use this page to request deletion of your Mortal Gyms account data, Google Sign-In profile data,
          workouts, chats, guild data, avatars, and push notification tokens.
        </p>
      </header>

      <section className="panel-glow p-6">
        <h2 className="font-display text-xl text-primary">Fastest method</h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/90">
          Email us from the same email address used for your Mortal Gyms account. Include your hero name
          or username so we can identify the correct account.
        </p>
        <Button asChild variant="hero" className="mt-5">
          <a href="mailto:mortalgyms@gmail.com?subject=Mortal%20Gyms%20Data%20Deletion%20Request">
            Request Deletion
          </a>
        </Button>
      </section>

      <section className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="panel p-5">
          <h2 className="font-display text-lg text-primary">What We Delete</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Account profile, hero profile, avatar links, and Google Sign-In profile data.</li>
            <li>Workout logs, XP, streaks, quests, gym history, routines, and diet plans.</li>
            <li>Friendships, direct messages, guild messages, reports made by you, and push tokens.</li>
          </ul>
        </div>
        <div className="panel p-5">
          <h2 className="font-display text-lg text-primary">Timeline</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>We acknowledge requests within 7 days.</li>
            <li>Deletion is completed within 30 days unless legal or abuse-prevention records must be retained.</li>
            <li>Backups and logs age out according to provider retention schedules.</li>
          </ul>
        </div>
      </section>

      <section className="mt-8 panel p-6">
        <h2 className="font-display text-lg text-primary">Report Safety Issues</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          To report harassment, spam, fake workout data, or abusive chat content, use the in-app Report
          button on chat and guild screens, or email us directly.
        </p>
      </section>

      <footer className="mt-16 text-center text-xs text-muted-foreground">
        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        <span className="mx-3">.</span>
        <Link to="/data-safety" className="text-primary hover:underline">Data Safety</Link>
        <span className="mx-3">.</span>
        <Link to="/" className="text-primary hover:underline">Home</Link>
      </footer>
    </article>
  </main>
);

export default DeleteUserData;

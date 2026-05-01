import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

interface Row {
  type: string;
  collected: string;
  shared: string;
  optional: string;
  purpose: string;
}

const ROWS: Row[] = [
  { type: "Email address", collected: "Yes", shared: "No", optional: "No", purpose: "Account, login, password reset" },
  { type: "Name / Username", collected: "Yes", shared: "Yes (in-app)", optional: "No", purpose: "Identify you to friends and on leaderboards" },
  { type: "Profile photo", collected: "Optional", shared: "Yes (in-app)", optional: "Yes", purpose: "Hero avatar" },
  { type: "Fitness info (workouts, XP)", collected: "Yes", shared: "Yes (stats only, in-app)", optional: "No", purpose: "Core gameplay & leaderboards" },
  { type: "Messages & shared images", collected: "Yes", shared: "Only with chat participants", optional: "Yes", purpose: "Direct messages and guild chat" },
  { type: "Push token", collected: "Optional", shared: "No", optional: "Yes", purpose: "Send notifications you enable" },
];

const DataSafety = () => (
  <main className="relative min-h-screen px-6 py-16">
    <div className="starfield" />
    <article className="relative mx-auto max-w-4xl">
      <header className="mb-10 text-center">
        <Link to="/" aria-label="Mortal Gyms home" className="inline-block">
          <Logo size={96} />
        </Link>
        <p className="mt-6 font-display text-xs uppercase tracking-[0.4em] text-primary/80">◆ Transparency ◆</p>
        <h1 className="mt-2 font-display text-4xl font-black text-gold">Data Safety</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A summary of the data Mortal Gyms collects, why, and how it is protected — mirroring our
          Google Play Data Safety declaration.
        </p>
      </header>

      <section className="panel overflow-x-auto p-6">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-bright/40 font-display text-xs uppercase tracking-widest text-primary">
              <th className="py-3 pr-4">Data Type</th>
              <th className="py-3 pr-4">Collected</th>
              <th className="py-3 pr-4">Shared</th>
              <th className="py-3 pr-4">Optional</th>
              <th className="py-3">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {ROWS.map((r) => (
              <tr key={r.type}>
                <td className="py-3 pr-4 font-medium text-foreground">{r.type}</td>
                <td className="py-3 pr-4 text-muted-foreground">{r.collected}</td>
                <td className="py-3 pr-4 text-muted-foreground">{r.shared}</td>
                <td className="py-3 pr-4 text-muted-foreground">{r.optional}</td>
                <td className="py-3 text-muted-foreground">{r.purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="panel p-6">
          <h2 className="font-display text-lg uppercase tracking-widest text-primary">Security Practices</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/90">
            <li>Data is encrypted in transit (HTTPS / TLS).</li>
            <li>Data is encrypted at rest on our cloud provider.</li>
            <li>Row-level security ensures users only access their own private data.</li>
            <li>Passwords are hashed; we never see them in plain text.</li>
          </ul>
        </div>
        <div className="panel p-6">
          <h2 className="font-display text-lg uppercase tracking-widest text-primary">Your Controls</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground/90">
            <li>Request data export or deletion via <a className="text-primary underline" href="mailto:mortalgyms@gmail.com">mortalgyms@gmail.com</a>.</li>
            <li>Disable push notifications anytime from the Sanctum.</li>
            <li>Choose a generic preset avatar to avoid uploading a photo.</li>
            <li>Block or unfriend users to stop receiving their messages.</li>
          </ul>
        </div>
      </section>

      <section className="mt-10 panel p-6">
        <h2 className="font-display text-lg uppercase tracking-widest text-primary">Content Rating</h2>
        <p className="mt-2 text-sm text-foreground/90">
          Mortal Gyms is rated <strong>Teen (13+)</strong> / PEGI 12. The app contains:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Mild fantasy combat references (boss battles, "slay")</li>
          <li>User-generated chat between friends and guild members</li>
          <li>No gambling, no real-money loot boxes, no explicit content</li>
        </ul>
      </section>

      <footer className="mt-16 text-center text-xs text-muted-foreground">
        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        <span className="mx-3">·</span>
        <Link to="/terms" className="text-primary hover:underline">Terms</Link>
        <span className="mx-3">·</span>
        <Link to="/" className="text-primary hover:underline">Home</Link>
      </footer>
    </article>
  </main>
);

export default DataSafety;

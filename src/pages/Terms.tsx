import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

const Terms = () => (
  <main className="relative min-h-screen px-6 py-16">
    <div className="starfield" />
    <article className="relative mx-auto max-w-3xl">
      <header className="mb-10 text-center">
        <Link to="/" aria-label="Mortal Gyms home" className="inline-block">
          <Logo size={96} />
        </Link>
        <p className="mt-6 font-display text-xs uppercase tracking-[0.4em] text-primary/80">◆ Legal ◆</p>
        <h1 className="mt-2 font-display text-4xl font-black text-gold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: April 28, 2026</p>
      </header>

      <section className="space-y-6 text-foreground/90">
        <h2 className="font-display text-2xl text-primary">1. Acceptance</h2>
        <p>By using Mortal Gyms you agree to these Terms. If you do not agree, do not use the app.</p>

        <h2 className="font-display text-2xl text-primary">2. Eligibility</h2>
        <p>You must be 13+ (16+ in the EU) and physically able to perform the exercises you log.</p>

        <h2 className="font-display text-2xl text-primary">3. Health Disclaimer</h2>
        <p>
          Mortal Gyms is a gamified fitness tracker, <strong>not medical advice</strong>. Consult a
          qualified professional before starting any exercise program. You assume all risk for
          activities you perform.
        </p>

        <h2 className="font-display text-2xl text-primary">4. Acceptable Use</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>No harassment, hate speech, or threats in chats or guilds.</li>
          <li>No cheating, botting, or fabricating workout data to manipulate leaderboards.</li>
          <li>No sharing of illegal, sexual, or violent imagery.</li>
        </ul>

        <h2 className="font-display text-2xl text-primary">5. User Content</h2>
        <p>
          You retain ownership of content you post (messages, images, hero data). You grant us a
          license to display it within the app. We may remove content that violates these Terms.
        </p>

        <h2 className="font-display text-2xl text-primary">6. Termination</h2>
        <p>We may suspend or terminate accounts that violate these Terms.</p>

        <h2 className="font-display text-2xl text-primary">7. Liability</h2>
        <p>
          The app is provided "as is" without warranties. To the maximum extent permitted by law,
          we are not liable for any indirect or consequential damages.
        </p>

        <h2 className="font-display text-2xl text-primary">8. Contact</h2>
        <p>
          Questions: <a className="text-primary underline" href="mailto:support@mortalgyms.app">support@mortalgyms.app</a>
        </p>
      </section>

      <footer className="mt-16 text-center text-xs text-muted-foreground">
        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        <span className="mx-3">·</span>
        <Link to="/" className="text-primary hover:underline">Home</Link>
      </footer>
    </article>
  </main>
);

export default Terms;

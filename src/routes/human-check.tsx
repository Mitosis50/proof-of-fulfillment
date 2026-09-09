import { createFileRoute } from "@tanstack/react-router";
import { HUMAN_CHECK } from "@/lib/fulfillment";

export const Route = createFileRoute("/human-check")({
  component: HumanCheckPage,
});

function HumanCheckPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-2xs uppercase tracking-caps text-fg-subtle">
        Independent human check
      </p>
      <h1 className="mt-2 font-display text-4xl">Five people. Twenty minutes.</h1>
      <p className="mt-4 text-lg text-fg-muted">{HUMAN_CHECK.tagline}</p>
      <p className="mt-3 text-fg-muted">
        Pay {HUMAN_CHECK.pay} each, from you. This explorer is synthetic. It is
        not a production authority. Do not coach. Do not put a real name into
        the workshop.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Who</h2>
        <p className="mt-2 text-fg-muted">{HUMAN_CHECK.who}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Do not</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-fg-muted">
          {HUMAN_CHECK.do_not.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Tasks</h2>
        <ol className="mt-6 space-y-8">
          {HUMAN_CHECK.tasks.map((t) => (
            <li key={t.n}>
              <p className="font-mono text-2xs text-fg-subtle">0{t.n}</p>
              <h3 className="mt-1 font-display text-xl">{t.title}</h3>
              <p className="mt-2">
                <a
                  href={t.path}
                  className="font-mono text-sm text-primary underline-offset-4 hover:underline"
                >
                  {t.path}
                </a>
              </p>
              <p className="mt-2 text-fg-muted">{t.ask}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="font-display text-2xl">Write down</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-fg-muted">
          <li>What they said they saw</li>
          <li>Whether they found a person</li>
          <li>Whether they thought Verified meant a student passed</li>
          <li>Whether they would send this about a real child — and why</li>
        </ul>
        <p className="mt-4 text-sm text-fg-muted">
          Keep tester names off this explorer. If three of five saw a person,
          or thought Verified meant a student passed, this is not ready.
        </p>
      </section>
    </div>
  );
}

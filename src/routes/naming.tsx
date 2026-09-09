import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ALLOWED_WORDS,
  BANNED_WORDS,
  PRODUCT_NAMES,
} from "@/lib/fulfillment";

export const Route = createFileRoute("/naming")({ component: NamingPage });

function NamingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-2xs uppercase tracking-caps text-fg-subtle">
        Product · Fulfilled
      </p>
      <h1 className="mt-2 font-display text-4xl">Naming</h1>
      <p className="mt-4 text-lg text-fg-muted">{PRODUCT_NAMES.tagline}</p>
      <p className="mt-4 text-fg-muted">
        Language is load-bearing here. The wrong word turns a receipt into a
        score, a diagnosis, or a person. This page is the public list of what
        we are allowed to say, and what we will not say.
      </p>

      <dl className="mt-10 grid gap-4 sm:grid-cols-2">
        <NameCard label="Protocol" value={PRODUCT_NAMES.protocol} />
        <NameCard label="Product" value={PRODUCT_NAMES.product} />
        <NameCard label="Object" value={PRODUCT_NAMES.object} />
        <NameCard label="Org / repo" value={`${PRODUCT_NAMES.org} / ${PRODUCT_NAMES.repo}`} />
      </dl>

      <section className="mt-14">
        <h2 className="font-display text-3xl">Allowed</h2>
        <p className="mt-2 text-fg-muted">
          Use these words. They describe obligations, evidence, and artifacts —
          never a ranked human being.
        </p>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {ALLOWED_WORDS.map((row) => (
            <li key={row.term} className="py-4">
              <p className="font-medium">{row.term}</p>
              <p className="mt-1 text-sm text-fg-muted">{row.meaning}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl">Banned</h2>
        <p className="mt-2 text-fg-muted">
          If copy, a demo, or an agent uses these, it is not this protocol.
        </p>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {BANNED_WORDS.map((row) => (
            <li key={row.term} className="py-4">
              <p className="font-medium text-failed">{row.term}</p>
              <p className="mt-1 text-sm text-fg-muted">{row.why}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm text-fg-muted">
        Doctrine stays at{" "}
        <Link to="/doctrine" className="text-primary underline-offset-4 hover:underline">
          what we believe
        </Link>
        . This page is how we speak.
      </p>
    </div>
  );
}

function NameCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-elevated p-4">
      <dt className="text-2xs uppercase tracking-label text-fg-subtle">{label}</dt>
      <dd className="mt-1 font-display text-xl">{value}</dd>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { AGENT_CONTRACT } from "@/lib/fulfillment";

export const Route = createFileRoute("/agents")({ component: AgentsPage });

function AgentsPage() {
  const contractJson = `${JSON.stringify(AGENT_CONTRACT, null, 2)}\n`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-2xs uppercase tracking-caps text-fg-subtle">
        Machine contract
      </p>
      <h1 className="mt-2 font-display text-4xl">For agents</h1>
      <p className="mt-4 text-lg text-fg-muted">{AGENT_CONTRACT.tagline}</p>
      <p className="mt-4 text-fg-muted">
        You may check a fulfillment receipt. You may not become the issuer.
        You may not mint <span className="font-medium text-fg">VERIFIED</span>.
        You may not publish a person. This page is the contract. A chat is
        not.
      </p>

      <section className="mt-12">
        <h2 className="font-display text-3xl">The bytes</h2>
        <dl className="mt-6 divide-y divide-border border-y border-border text-sm">
          <Row term="Digest tag" detail={AGENT_CONTRACT.digest_tag} mono />
          <Row term="Receipt record" detail={AGENT_CONTRACT.receipt_record} mono />
          <Row term="Portable record" detail={AGENT_CONTRACT.portable_record} mono />
          <Row term="Canonical form" detail={AGENT_CONTRACT.canonical} />
          <Row term="Hash" detail={AGENT_CONTRACT.hash} />
          <Row
            term="Signature"
            detail={`${AGENT_CONTRACT.signature_alg}. ${AGENT_CONTRACT.signature_on}.`}
          />
          <Row
            term="Share fragment"
            detail={`#${AGENT_CONTRACT.fragment_prefix}… — never a query string.`}
            mono
          />
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">How to check</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-fg-muted">
          <li>
            Accept a <code className="text-fg">{AGENT_CONTRACT.portable_record}</code>{" "}
            file, pasted JSON, or a link whose fragment starts with{" "}
            <code className="text-fg">#{AGENT_CONTRACT.fragment_prefix}</code>.
            Refuse names, emails, and diagnoses.
          </li>
          <li>
            Detach <code className="text-fg">receipt_digest</code> and{" "}
            <code className="text-fg">signature</code>. Canonicalize the rest.
            Hash with tag <code className="text-fg">{AGENT_CONTRACT.digest_tag}</code>.
          </li>
          <li>
            Check the Ed25519 signature over that digest. Confirm the policy
            hash is in the published registry. Confirm every required assertion
            and every not-asserted claim.
          </li>
          <li>
            Say <span className="text-fg">Holds</span> only if every check
            below is true. Otherwise say{" "}
            <span className="text-fg">Does not hold</span> and name the check
            that failed.
          </li>
        </ol>
        <p className="mt-4 text-sm text-fg-muted">
          Humans and agents use the same path:{" "}
          <Link to="/verify" className="text-primary underline-offset-4 hover:underline">
            independent verify
          </Link>
          . The issuer is a different engine. Do not call it to “confirm.”
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">Holds</h2>
        <p className="mt-2 text-fg-muted">
          All of these must be true. One false is Does not hold.
        </p>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {AGENT_CONTRACT.holds_when.map((check) => (
            <li key={check} className="py-3 font-mono text-sm">
              {check}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">You may</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-fg-muted">
          {AGENT_CONTRACT.may.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">You may not</h2>
        <ul className="mt-4 space-y-3">
          {AGENT_CONTRACT.must_not.map((line) => (
            <li
              key={line}
              className="border-l-2 border-failed pl-4 text-fg-muted"
            >
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-3xl">The contract as JSON</h2>
        <p className="mt-2 text-fg-muted">
          This object is frozen in tests. If a future edit lets an agent mint
          VERIFIED or drop a not-asserted check, the suite fails.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-bg-elevated p-4 font-mono text-2xs leading-relaxed text-fg-muted">
          {contractJson}
        </pre>
      </section>

      <p className="mt-12 text-sm text-fg-muted">
        Language is on{" "}
        <Link to="/naming" className="text-primary underline-offset-4 hover:underline">
          naming
        </Link>
        . Doctrine is on{" "}
        <Link to="/doctrine" className="text-primary underline-offset-4 hover:underline">
          doctrine
        </Link>
        . Neither is a verification run.
      </p>
    </div>
  );
}

function Row({
  term,
  detail,
  mono = false,
}: {
  term: string;
  detail: string;
  mono?: boolean;
}) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[11rem_1fr] sm:gap-6">
      <dt className="text-2xs uppercase tracking-wider text-fg-subtle">{term}</dt>
      <dd className={mono ? "font-mono text-fg" : "text-fg-muted"}>{detail}</dd>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EDU_TUITION_V1, CARE_CONSULT_V1, HOUSING_RENT_V1, signPolicy, shortDigest } from "@/lib/fulfillment";
import type { SignedPolicy } from "@/lib/fulfillment";

export const Route = createFileRoute("/policies")({ component: PoliciesPage });

function PoliciesPage() {
  const [edu, setEdu] = useState<SignedPolicy | null>(null);
  const [care, setCare] = useState<SignedPolicy | null>(null);
  const [rent, setRent] = useState<SignedPolicy | null>(null);

  useEffect(() => {
    void signPolicy(EDU_TUITION_V1).then(setEdu);
    void signPolicy(CARE_CONSULT_V1).then(setCare);
    void signPolicy(HOUSING_RENT_V1).then(setRent);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-2xs uppercase tracking-caps text-fg-subtle">
        Immutable policy artifacts
      </p>
      <h1 className="mt-2 font-display text-4xl">Three policies. Frozen in place.</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">
        A policy version never mutates after it has issued receipts. A one-byte
        change is a new version, with a new hash. The pin is on{" "}
        <Link to="/registry" className="text-primary underline-offset-4 hover:underline">
          the registry
        </Link>
        .

      </p>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {edu ? <PolicyCard policy={edu} /> : null}
        {care ? <PolicyCard policy={care} /> : null}
        {rent ? <PolicyCard policy={rent} /> : null}
      </div>
    </div>
  );
}

function PolicyCard({ policy }: { policy: SignedPolicy }) {
  return (
    <article className="rounded-xl border border-border bg-bg-elevated p-6">
      <p className="font-mono text-2xs text-fg-subtle">
        {policy.policy_id} v{policy.version}
      </p>
      <h2 className="mt-2 font-display text-2xl">{policy.title}</h2>
      <p className="mt-2 text-sm text-fg-muted">{policy.scope}</p>
      <h3 className="mt-6 text-2xs uppercase tracking-label text-fg-subtle">
        Required
      </h3>
      <ul className="mt-2 space-y-1 text-sm">
        {policy.required.map((r) => (
          <li key={r.code} className="flex justify-between gap-3">
            <span>{r.label}</span>
            <span className="font-mono text-2xs text-fg-subtle">≥ {r.min_level}</span>
          </li>
        ))}
      </ul>
      <h3 className="mt-6 text-2xs uppercase tracking-label text-fg-subtle">
        Not asserted
      </h3>
      <ul className="mt-2 space-y-1 text-sm text-fg-muted">
        {policy.not_asserted.map((n) => (
          <li key={n.code}>{n.label}</li>
        ))}
      </ul>
      <p className="mt-6 font-mono text-2xs text-fg-subtle">
        Hash {shortDigest(policy.policy_hash, 16)}
      </p>
    </article>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { CIRCLE_DEMO, formatMoney } from "@/lib/fulfillment";
import { SeedGate } from "@/components/layout/SeedGate";
import { Badge, verdictTone } from "@/components/ui/badge";

export const Route = createFileRoute("/circles")({ component: CirclesPage });

function CirclesPage() {
  return (
    <SeedGate>
      <CirclesInner />
    </SeedGate>
  );
}

function CirclesInner() {
  const c = CIRCLE_DEMO;
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-2xs uppercase tracking-caps text-fg-subtle">
        Care circle · synthetic
      </p>
      <h1 className="mt-2 font-display text-4xl">{c.title}</h1>
      <p className="mt-3 text-fg-muted">
        Contributors fund a bounded obligation together. They see outcomes in
        plain language. No wallets. No names. This circle is labeled synthetic
        because live family data does not belong in a public demo.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-bg-elevated p-6 shadow-paper">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xs uppercase tracking-wider text-fg-subtle">Target</p>
            <p className="font-display text-3xl tabular-nums">
              {formatMoney(c.target.minor_units, c.target.currency)}
            </p>
          </div>
          <Badge tone="muted">{c.policy}</Badge>
        </div>

        <h2 className="mt-8 text-2xs uppercase tracking-label text-fg-subtle">
          Contributors
        </h2>
        <ul className="mt-3 divide-y divide-border">
          {c.contributors.map((p) => (
            <li key={p.role} className="flex items-center justify-between py-3 text-sm">
              <span>{p.role}</span>
              <span className="tabular-nums">
                {formatMoney(p.minor_units, c.target.currency)}
              </span>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 text-2xs uppercase tracking-label text-fg-subtle">
          Bundle
        </h2>
        <ul className="mt-3 space-y-2">
          {c.bundle.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between rounded-md border border-border px-3 py-3"
            >
              <span>{row.label}</span>
              {row.receipt_id ? (
                <Link to="/receipts/$id" params={{ id: row.receipt_id }}>
                  <Badge tone={verdictTone(row.status)}>{row.status}</Badge>
                </Link>
              ) : (
                <Badge tone={verdictTone(row.status)}>{row.status}</Badge>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SeedGate } from "@/components/layout/SeedGate";
import { Button } from "@/components/ui/button";
import { Badge, verdictTone } from "@/components/ui/badge";
import { useReceipts } from "@/store/receipts";
import {
  PUBLIC_EXAMPLE_RECEIPT_ID,
  refusalCard,
  verdictLabel,
  verifyIndependently,
} from "@/lib/fulfillment";

export const Route = createFileRoute("/refusal/$id")({
  component: RefusalPage,
});

function RefusalPage() {
  return (
    <SeedGate>
      <RefusalInner />
    </SeedGate>
  );
}

function RefusalInner() {
  const { id } = Route.useParams();
  const receipt = useReceipts((s) => s.byId(id));
  const receipts = useReceipts((s) => s.receipts);
  const [holds, setHolds] = useState<boolean | null>(null);

  useEffect(() => {
    if (!receipt) return;
    void verifyIndependently(receipt, receipts).then((r) => setHolds(r.ok));
  }, [receipt, receipts]);

  if (!receipt) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Receipt not found</h1>
        <p className="mt-3 text-fg-muted">
          A refusal card can only be printed from a receipt this explorer
          already holds.
        </p>
        <Button asChild className="mt-6">
          <Link
            to="/refusal/$id"
            params={{ id: PUBLIC_EXAMPLE_RECEIPT_ID }}
          >
            See the public example
          </Link>
        </Button>
      </div>
    );
  }

  const card = refusalCard(receipt);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-print-hide>
        <p className="text-sm text-fg-muted">
          Print or save as PDF. This card is not a person.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => window.print()}>
            Print refusal card
          </Button>
          <Button asChild variant="outline">
            <Link to="/paper/$id" params={{ id: receipt.receipt_id }}>
              Paper receipt
            </Link>
          </Button>
        </div>
      </div>

      <article className="paper-receipt relative bg-bg-elevated p-6 shadow-paper sm:p-10">
        <div className="pointer-events-none absolute inset-2 rounded-md border border-border" />
        <p className="relative text-2xs uppercase tracking-caps text-fg-subtle">
          Fulfilled · refusal card
        </p>
        <h1 className="relative mt-2 font-display text-3xl sm:text-4xl">
          What this receipt will not say
        </h1>
        <p className="relative mt-3 text-lg text-fg-muted">{card.tagline}</p>

        <div className="relative mt-10 grid gap-10 sm:grid-cols-2">
          <section>
            <p className="text-2xs uppercase tracking-label text-fg-subtle">
              Independent check
            </p>
            <p className="mt-2 font-display text-3xl">
              {holds === null ? "Checking…" : holds ? "Holds" : "Does not hold"}
            </p>
            <p className="mt-3 text-sm text-fg-muted">{card.purpose}</p>
            <p className="mt-1 text-sm text-fg-muted">{card.period}</p>
            <div className="mt-4">
              <Badge tone={verdictTone(card.verdict)}>
                {verdictLabel(card.verdict)}
              </Badge>
            </div>
          </section>
          <section>
            <p className="text-2xs uppercase tracking-label text-fg-subtle">
              Not asserted
            </p>
            <ul className="mt-3 divide-y divide-border border-y border-border">
              {card.not_asserted.map((n) => (
                <li key={n.code} className="py-3">
                  <p className="text-fg">{n.label}</p>
                  <p className="font-mono text-2xs text-fg-subtle">{n.code}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="relative mt-10 space-y-1 border-t border-border pt-5 font-mono text-2xs text-fg-subtle">
          <p>ID {card.receipt_id}</p>
          <p>Policy {card.policy}</p>
          <p>Digest {card.digest}</p>
        </footer>
      </article>
    </div>
  );
}

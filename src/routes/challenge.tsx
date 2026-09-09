import { createFileRoute, Link } from "@tanstack/react-router";
import { SeedGate } from "@/components/layout/SeedGate";
import { Button } from "@/components/ui/button";
import { FulfillmentReceipt } from "@/components/receipt/FulfillmentReceipt";
import { useReceipts } from "@/store/receipts";

export const Route = createFileRoute("/challenge")({
  component: ChallengePage,
});

function ChallengePage() {
  return (
    <SeedGate>
      <ChallengeInner />
    </SeedGate>
  );
}

function ChallengeInner() {
  const issued = useReceipts((s) => s.byId("pof_edu_t2_ok"));
  const challenged = useReceipts((s) => s.byId("pof_edu_t2_ch"));
  const corrected = useReceipts((s) => s.byId("pof_edu_t2_cr"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-2xs uppercase tracking-caps text-fg-subtle">
        Immutable history, correctable conclusions
      </p>
      <h1 className="mt-2 font-display text-4xl">A receipt can be wrong. It cannot vanish.</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">
        After Term 2 was marked verified, the payment rail reversed the
        settlement. Review opened a challenge, then issued a correction. The
        original digest still verifies as a historical artifact. To run this
        yourself, use the workshop.
      </p>

      <ol className="mt-10 grid gap-6 lg:grid-cols-3">
        {[
          { title: "1 · Issued", receipt: issued },
          { title: "2 · Challenged", receipt: challenged },
          { title: "3 · Corrected", receipt: corrected },
        ].map((col) =>
          col.receipt ? (
            <li key={col.title}>
              <h2 className="mb-4 font-display text-xl">{col.title}</h2>
              <Link
                to="/receipts/$id"
                params={{ id: col.receipt.receipt_id }}
                className="block"
              >
                <FulfillmentReceipt receipt={col.receipt} compact />
              </Link>
            </li>
          ) : null,
        )}
      </ol>
      <Button asChild className="mt-10">
        <Link to="/workshop">Issue, challenge, and correct live</Link>
      </Button>
    </div>
  );
}

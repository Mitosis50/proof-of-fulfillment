import { createFileRoute, Link } from "@tanstack/react-router";
import { SeedGate } from "@/components/layout/SeedGate";
import { Button } from "@/components/ui/button";
import { FulfillmentReceipt } from "@/components/receipt/FulfillmentReceipt";
import { useReceipts } from "@/store/receipts";

export const Route = createFileRoute("/demo/consult")({
  component: ConsultDemo,
});

function ConsultDemo() {
  return (
    <SeedGate>
      <ConsultInner />
    </SeedGate>
  );
}

function ConsultInner() {
  const pass = useReceipts((s) => s.byId("pof_care_c1_ok"));
  const fail = useReceipts((s) => s.byId("pof_care_c1_exp"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-2xs uppercase tracking-caps text-fg-subtle">
        Synthetic care flow
      </p>
      <h1 className="mt-2 font-display text-4xl">A consult occurred. That is all.</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">
        CARE-CONSULT v1.0.0 may assert provider identity, occurrence, process, and
        payment. It must not assert diagnosis, correctness, or medical necessity.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {pass ? (
          <div>
            <h2 className="mb-4 font-display text-2xl">Credential active</h2>
            <Link to="/receipts/$id" params={{ id: pass.receipt_id }} className="block">
              <FulfillmentReceipt receipt={pass} compact />
            </Link>
          </div>
        ) : null}
        {fail ? (
          <div>
            <h2 className="mb-4 font-display text-2xl">Credential expired</h2>
            <Link to="/receipts/$id" params={{ id: fail.receipt_id }} className="block">
              <FulfillmentReceipt receipt={fail} compact />
            </Link>
          </div>
        ) : null}
      </div>

      <Button asChild className="mt-10">
        <Link to="/policies">Read CARE-CONSULT v1.0.0</Link>
      </Button>
    </div>
  );
}

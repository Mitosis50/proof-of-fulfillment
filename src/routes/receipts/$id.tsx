import { createFileRoute, Link } from "@tanstack/react-router";
import { SeedGate } from "@/components/layout/SeedGate";
import { Button } from "@/components/ui/button";
import { FulfillmentReceipt } from "@/components/receipt/FulfillmentReceipt";
import { useReceipts } from "@/store/receipts";
import { PaperPrint } from "@/components/receipt/PaperPrint";
import { PortableDownload } from "@/components/receipt/PortableDownload";
import {
  packPortable,
  serializePortable,
  shortDigest,
} from "@/lib/fulfillment";

export const Route = createFileRoute("/receipts/$id")({
  component: ReceiptPage,
});

function ReceiptPage() {
  return (
    <SeedGate>
      <ReceiptInner />
    </SeedGate>
  );
}

function ReceiptInner() {
  const { id } = Route.useParams();
  const receipt = useReceipts((s) => s.byId(id));
  const receipts = useReceipts((s) => s.receipts);
  const ctx = useReceipts((s) => s.runFor(id));

  if (!receipt) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Receipt not found</h1>
        <p className="mt-3 text-fg-muted">
          This explorer only holds synthetic demo receipts and receipts issued
          in this session.
        </p>
        <Button asChild className="mt-6">
          <Link to="/workshop">Go to the workshop</Link>
        </Button>
      </div>
    );
  }

  const chain = receipts.filter(
    (r) =>
      r.receipt_id === receipt.previous_receipt_id ||
      r.receipt_id === receipt.supersedes_receipt_id ||
      r.previous_receipt_id === receipt.receipt_id ||
      r.supersedes_receipt_id === receipt.receipt_id,
  );

  async function copy() {
    if (!receipt) return;
    await navigator.clipboard.writeText(
      serializePortable(packPortable(receipt, receipts)),
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] sm:px-6">
      <FulfillmentReceipt receipt={receipt} />
      <aside className="space-y-6" data-print-hide>
        <section>
          <h1 className="font-display text-3xl">What this receipt means</h1>
          <p className="mt-3 text-fg-muted">
            It is the durable output of one verification run against one
            immutable policy version. It is not a statement about a person, a
            grade, or a diagnosis.
          </p>
        </section>
        <section className="rounded-lg border border-border bg-bg-elevated p-5">
          <h2 className="text-2xs uppercase tracking-label text-fg-subtle">
            Provenance
          </h2>
          <dl className="mt-3 space-y-2 font-mono text-xs text-fg-muted">
            <div className="flex justify-between gap-3">
              <dt>Policy hash</dt>
              <dd>{shortDigest(receipt.policy.hash)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Evidence root</dt>
              <dd>{shortDigest(receipt.verification.evidence_root)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Verifier build</dt>
              <dd>{shortDigest(receipt.verification.verifier_build_hash)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Verified at</dt>
              <dd>{receipt.verification.verified_at}</dd>
            </div>
          </dl>
        </section>
        {chain.length > 0 ? (
          <section>
            <h2 className="text-2xs uppercase tracking-label text-fg-subtle">
              Correction chain
            </h2>
            <ul className="mt-3 space-y-2 text-sm">
              {chain.map((r) => (
                <li key={r.receipt_id}>
                  <Link
                    to="/receipts/$id"
                    params={{ id: r.receipt_id }}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {r.receipt_id}
                  </Link>
                  <span className="text-fg-subtle"> · {r.challenge_status.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {ctx ? (
          <p className="text-sm text-fg-muted">
            This receipt was issued in the workshop. Challenge and correction
            happen there, against the stored evidence run. The original digest
            is not rewritten.
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link to="/verify">Independent verify</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/workshop">{ctx ? "Continue in workshop" : "Issue your own"}</Link>
          </Button>
          <Button type="button" variant="outline" onClick={() => void copy()}>
            Copy portable JSON
          </Button>
          <PortableDownload receipt={receipt} library={receipts} />
          <PaperPrint receipt={receipt} />
          <Button asChild variant="outline">
            <Link to="/paper/$id" params={{ id: receipt.receipt_id }}>
              Open paper sheet
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/refusal/$id" params={{ id: receipt.receipt_id }}>
              What it will not say
            </Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SeedGate } from "@/components/layout/SeedGate";
import { PaperPrint } from "@/components/receipt/PaperPrint";
import { FulfillmentReceipt } from "@/components/receipt/FulfillmentReceipt";
import { Button } from "@/components/ui/button";
import { useReceipts } from "@/store/receipts";

export const Route = createFileRoute("/paper/$id")({
  component: PaperPage,
});

function PaperPage() {
  return (
    <SeedGate>
      <PaperInner />
    </SeedGate>
  );
}

function PaperInner() {
  const { id } = Route.useParams();
  const receipt = useReceipts((s) => s.byId(id));
  const [copied, setCopied] = useState(false);

  if (!receipt) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Receipt not found</h1>
        <p className="mt-3 text-fg-muted">
          A paper receipt can only be printed from a receipt this explorer
          already holds.
        </p>
        <Button asChild className="mt-6">
          <Link to="/verify" search={{ example: "pof_edu_t2_ok" }}>
            See a verified receipt
          </Link>
        </Button>
      </div>
    );
  }

  async function copyDigest() {
    if (!receipt) return;
    await navigator.clipboard.writeText(receipt.receipt_digest);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-col gap-3" data-print-hide>
        <p className="text-sm text-fg-muted">
          Print or save as PDF. Copy the digest, or open Verify with it. This
          sheet is not a person.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <PaperPrint receipt={receipt} />
          <Button type="button" variant="outline" onClick={() => void copyDigest()}>
            {copied ? "Digest copied" : "Copy digest"}
          </Button>
          <Button asChild variant="outline">
            <Link to="/verify" search={{ digest: receipt.receipt_digest }}>
              Check this digest
            </Link>
          </Button>
        </div>
      </div>
      <FulfillmentReceipt receipt={receipt} />
    </div>
  );
}

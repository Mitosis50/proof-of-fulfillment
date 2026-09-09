import { createFileRoute, Link } from "@tanstack/react-router";
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

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-print-hide>
        <p className="text-sm text-fg-muted">
          Print or save as PDF. Paste the digest on Verify. This sheet is not
          a person.
        </p>
        <PaperPrint receipt={receipt} />
      </div>
      <FulfillmentReceipt receipt={receipt} />
    </div>
  );
}

import { Button } from "@/components/ui/button";
import type { SignedReceipt } from "@/lib/fulfillment";

export function printPaperReceipt() {
  window.print();
}

export function PaperPrint({
  receipt,
}: {
  receipt: SignedReceipt;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => printPaperReceipt()}
      aria-label={`Print paper receipt ${receipt.receipt_id}`}
    >
      Print paper receipt
    </Button>
  );
}

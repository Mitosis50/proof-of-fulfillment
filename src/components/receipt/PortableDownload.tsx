import { Button } from "@/components/ui/button";
import {
  packPortable,
  portableFilename,
  serializePortable,
  type SignedReceipt,
} from "@/lib/fulfillment";

export function downloadPortable(receipt: SignedReceipt, library: SignedReceipt[] = []) {
  const text = serializePortable(packPortable(receipt, library));
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = portableFilename(receipt);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function PortableDownload({
  receipt,
  library = [],
  variant = "outline",
}: {
  receipt: SignedReceipt;
  library?: SignedReceipt[];
  variant?: "outline" | "default";
}) {
  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => downloadPortable(receipt, library)}
    >
      Download portable receipt
    </Button>
  );
}

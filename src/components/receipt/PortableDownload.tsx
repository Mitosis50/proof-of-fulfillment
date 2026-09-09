import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  packPortable,
  portableFilename,
  portableSharePath,
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

export async function copyShareLink(receipt: SignedReceipt, library: SignedReceipt[] = []) {
  const path = portableSharePath(receipt, library);
  const url = `${window.location.origin}${path}`;
  await navigator.clipboard.writeText(url);
  return url;
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
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        type="button"
        variant={variant}
        onClick={() => downloadPortable(receipt, library)}
      >
        Download portable receipt
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void copyShareLink(receipt, library).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          });
        }}
      >
        {copied ? "Link copied" : "Copy share link"}
      </Button>
    </div>
  );
}

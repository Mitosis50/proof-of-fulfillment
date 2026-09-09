import type { ReactNode } from "react";
import { useReceipts } from "@/store/receipts";

export function SeedGate({ children }: { children: ReactNode }) {
  const ready = useReceipts((s) => s.ready);
  const error = useReceipts((s) => s.error);

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-2xl">Could not build demo receipts</h1>
        <p className="mt-3 text-sm text-fg-muted">{error}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-2xs uppercase tracking-caps text-fg-subtle">
          Signing synthetic receipts
        </p>
        <p className="mt-3 text-fg-muted">
          Computing policy hashes and fulfillment digests.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

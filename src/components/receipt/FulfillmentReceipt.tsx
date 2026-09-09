import { Link } from "@tanstack/react-router";
import { formatMoney, verdictLabel, type SignedReceipt } from "@/lib/fulfillment";
import { Badge, verdictTone } from "@/components/ui/badge";
import { DigestQr } from "@/components/receipt/DigestQr";
import { cn } from "@/lib/utils";

function statusTone(status: string) {
  if (status === "VERIFIED") return "text-verified";
  if (status === "CONFLICTING" || status === "REVOKED") return "text-exception";
  if (status === "INSUFFICIENT" || status === "NOT_ASSERTED") return "text-pending";
  return "text-failed";
}

export function FulfillmentReceipt({
  receipt,
  compact = false,
}: {
  receipt: SignedReceipt;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "paper-receipt relative bg-bg-elevated text-fg shadow-paper",
        compact ? "rounded-lg p-5" : "rounded-xl p-6 sm:p-8",
      )}
    >
      <div className="pointer-events-none absolute inset-2 rounded-md border border-border" />
      <header className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-2xs uppercase tracking-caps text-fg-subtle">
            Fulfilled · fulfillment receipt
          </p>
          <h3 className="mt-2 font-display text-xl leading-tight sm:text-2xl">
            {receipt.subject.purpose}
          </h3>
          <p className="mt-1 text-sm text-fg-muted">{receipt.subject.period}</p>
        </div>
        <Badge tone={verdictTone(receipt.verdict)}>{verdictLabel(receipt.verdict)}</Badge>
      </header>

      <dl className="relative mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-2xs uppercase tracking-wider text-fg-subtle">Amount</dt>
          <dd className="tabular-nums">
            {formatMoney(receipt.subject.amount.minor_units, receipt.subject.amount.currency)}
          </dd>
        </div>
        <div>
          <dt className="text-2xs uppercase tracking-wider text-fg-subtle">Destination</dt>
          <dd className="capitalize">
            {receipt.subject.destination_class.replaceAll("_", " ").toLowerCase()}
          </dd>
        </div>
      </dl>

      <ul className="relative mt-6 space-y-2 border-t border-border pt-5">
        {receipt.assertions.map((a) => (
          <li key={a.code} className="flex items-baseline justify-between gap-3 text-sm">
            <span>{a.label}</span>
            <span className={cn("text-2xs uppercase tracking-wider", statusTone(a.status))}>
              {a.status === "VERIFIED" ? "verified" : a.status.toLowerCase().replaceAll("_", " ")}
            </span>
          </li>
        ))}
      </ul>

      <section className="relative mt-6 border-t border-dashed border-border pt-5">
        <p className="text-2xs uppercase tracking-label text-fg-subtle">Not asserted</p>
        <ul className="mt-2 space-y-1">
          {receipt.not_asserted.map((n) => (
            <li key={n.code} className="text-sm text-fg-muted">
              {n.label}
            </li>
          ))}
        </ul>
      </section>

      {!compact ? (
        <footer className="relative mt-6 space-y-1 border-t border-border pt-5 font-mono text-2xs text-fg-subtle">
          <p>ID {receipt.receipt_id}</p>
          <p>
            Policy {receipt.policy.id} v{receipt.policy.version}
          </p>
          <p>Digest {receipt.receipt_digest}</p>
          <p>We verify the obligation. We do not publish the person.</p>
          {receipt.signature ? (
            <p>
              Signed {receipt.signature.alg} · {receipt.signature.key_id}
            </p>
          ) : (
            <p>Unsigned</p>
          )}
          <p>
            Challenge {receipt.challenge_status.toLowerCase()}
            {receipt.previous_receipt_id ? (
              <>
                {" · "}
                <Link
                  to="/receipts/$id"
                  params={{ id: receipt.previous_receipt_id }}
                  className="underline underline-offset-2"
                >
                  prior receipt
                </Link>
              </>
            ) : null}
          </p>
          <DigestQr digest={receipt.receipt_digest} />
        </footer>
      ) : (
        <p className="relative mt-5 font-mono text-2xs text-fg-subtle">
          {receipt.receipt_id}
        </p>
      )}
    </article>
  );
}

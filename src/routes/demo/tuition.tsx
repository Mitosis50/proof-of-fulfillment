import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SeedGate } from "@/components/layout/SeedGate";
import { Button } from "@/components/ui/button";
import { FulfillmentReceipt } from "@/components/receipt/FulfillmentReceipt";
import { useReceipts } from "@/store/receipts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demo/tuition")({
  component: TuitionDemo,
});

const STEPS = [
  {
    title: "Intent",
    body: "A contributor authorizes up to $450 for one term of tuition, payable only to an approved institution. If the term cannot be covered, the intent says refund — not reallocate.",
  },
  {
    title: "Obligation",
    body: "The bounded thing that is supposed to happen: Term 2 tuition for an opaque case reference. No student name is required for verification.",
  },
  {
    title: "Evidence",
    body: "The school, a licensing registry, and a licensed payment rail each issue their own assertion. The engine never sees the invoice body.",
  },
  {
    title: "Policy",
    body: "EDU-TUITION v1.0.0 is hashed and frozen. Changing a single rule would be a new version, and could not rewrite this receipt.",
  },
  {
    title: "Receipt",
    body: "The family sees term coverage and payment status. Academic performance is listed as not asserted. Private records are not published.",
  },
];

function TuitionDemo() {
  return (
    <SeedGate>
      <TuitionInner />
    </SeedGate>
  );
}

function TuitionInner() {
  const receipt = useReceipts((s) => s.byId("pof_edu_t2_ok"));
  const [step, setStep] = useState(0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-2xs uppercase tracking-caps text-fg-subtle">
        Synthetic education flow
      </p>
      <h1 className="mt-2 font-display text-4xl">One term, covered.</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">
        A grandmother should be able to see that Term 2 was paid without anyone
        publishing a child. This walkthrough uses synthetic identifiers only.
      </p>

      <ol className="mt-10 grid gap-2 sm:grid-cols-5">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                "flex min-h-11 w-full flex-col items-start rounded-md border px-3 py-3 text-left",
                i === step
                  ? "border-primary bg-bg-elevated"
                  : "border-border text-fg-muted",
              )}
            >
              <span className="font-mono text-2xs text-fg-subtle">0{i + 1}</span>
              <span className="text-sm text-fg">{s.title}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="font-display text-2xl">{STEPS[step].title}</h2>
          <p className="mt-3 text-fg-muted">{STEPS[step].body}</p>
          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={step === STEPS.length - 1}
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            >
              Next
            </Button>
          </div>
          {step === STEPS.length - 1 && receipt ? (
            <Button asChild variant="link" className="mt-4">
              <Link to="/receipts/$id" params={{ id: receipt.receipt_id }}>
                Open the issued receipt
              </Link>
            </Button>
          ) : null}
        </div>
        {receipt ? <FulfillmentReceipt receipt={receipt} compact={step < 4} /> : null}
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, EyeOff, Scale, Stamp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FulfillmentReceipt } from "@/components/receipt/FulfillmentReceipt";
import { PUBLIC_EXAMPLE_RECEIPT_ID } from "@/lib/fulfillment";
import { useReceipts } from "@/store/receipts";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const ready = useReceipts((s) => s.ready);
  const cases = useReceipts((s) => s.cases);
  const tuition = cases.find((c) => c.id === "pof_edu_t2_ok")?.receipt;
  const consult = cases.find((c) => c.id === "pof_care_c1_ok")?.receipt;
  const rent = cases.find((c) => c.id === "pof_rent_m9_ok")?.receipt;

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20">
        <p className="text-2xs uppercase tracking-caps text-fg-subtle">
          Protocol · Proof of Fulfillment
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.1] tracking-tight sm:text-6xl">
          We verify the obligation.
          <span className="block text-fg-muted">We do not publish the person.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-fg-muted">
          Open infrastructure for proving that money meant to help someone actually
          fulfilled the obligation it was intended for — without turning a private
          life into the evidence.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link to="/verify" search={{ example: PUBLIC_EXAMPLE_RECEIPT_ID }}>
              See a verified receipt
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/workshop">Issue your own</Link>
          </Button>
        </div>
        <p className="mt-4 max-w-xl text-sm text-fg-muted">
          A synthetic tuition receipt. Independent check. No person.
        </p>
      </section>

      <section className="border-y border-border bg-bg-elevated/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
          <div>
            <Stamp className="size-5 text-primary" />
            <h2 className="mt-3 font-display text-xl">What we verify</h2>
            <p className="mt-2 text-sm text-fg-muted">
              Identity of the institution or provider, that the authorized event
              occurred, that payment settled to an approved destination, and that
              the same invoice was not funded twice.
            </p>
          </div>
          <div>
            <Scale className="size-5 text-primary" />
            <h2 className="mt-3 font-display text-xl">What we never assert</h2>
            <p className="mt-2 text-sm text-fg-muted">
              Academic performance, clinical correctness, diagnosis, grades,
              tenant creditworthiness, or whether a person is worthy. A receipt
              is a policy verdict, not a truth oracle.
            </p>
          </div>
          <div>
            <EyeOff className="size-5 text-primary" />
            <h2 className="mt-3 font-display text-xl">What never goes public</h2>
            <p className="mt-2 text-sm text-fg-muted">
              Names, invoices, diagnoses, transcripts, addresses, or bank
              details. Public receipts hold commitments, statuses, and the
              explicit not-asserted list.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Three policies. One engine.</h2>
            <p className="mt-2 max-w-xl text-fg-muted">
              The same receipt engine evaluates tuition, a licensed consult, and
              one month of rent. Only the evidence policy changes.
            </p>
          </div>
          <Link
            to="/policies"
            className="hidden text-sm text-primary underline-offset-4 hover:underline sm:inline"
          >
            Read the policies
          </Link>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {ready && tuition ? (
            <Link to="/receipts/$id" params={{ id: tuition.receipt_id }} className="block">
              <FulfillmentReceipt receipt={tuition} compact />
            </Link>
          ) : (
            <div className="min-h-64 rounded-lg border border-border bg-bg-elevated" />
          )}
          {ready && consult ? (
            <Link to="/receipts/$id" params={{ id: consult.receipt_id }} className="block">
              <FulfillmentReceipt receipt={consult} compact />
            </Link>
          ) : (
            <div className="min-h-64 rounded-lg border border-border bg-bg-elevated" />
          )}
          {ready && rent ? (
            <Link to="/receipts/$id" params={{ id: rent.receipt_id }} className="block">
              <FulfillmentReceipt receipt={rent} compact />
            </Link>
          ) : (
            <div className="min-h-64 rounded-lg border border-border bg-bg-elevated" />
          )}
        </div>
      </section>
    </div>
  );
}

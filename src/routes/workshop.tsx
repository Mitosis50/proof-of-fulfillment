import { useMemo, useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FulfillmentReceipt } from "@/components/receipt/FulfillmentReceipt";
import { PortableDownload } from "@/components/receipt/PortableDownload";
import { Badge, verdictTone } from "@/components/ui/badge";
import { useReceipts } from "@/store/receipts";
import {
  CHALLENGE_REASONS,
  type ChallengeReason,
  type IndependentReport,
  type SignedReceipt,
  verdictLabel,
  verifyIndependently,
} from "@/lib/fulfillment";
import {
  CHALLENGE_REASON_LABELS,
  DEFAULT_FLAGS,
  challengeReceipt,
  correctLive,
  issueLive,
  type PolicyKind,
  type SettlementKind,
  type WorkshopFlags,
} from "@/lib/fulfillment/workshop";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workshop")({ component: WorkshopInner });

function WorkshopInner() {
  const putLive = useReceipts((s) => s.putLive);
  const receipts = useReceipts((s) => s.receipts);
  const liveIds = useReceipts((s) => s.liveIds);
  const runFor = useReceipts((s) => s.runFor);
  const [flags, setFlags] = useState<WorkshopFlags>(DEFAULT_FLAGS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<SignedReceipt | null>(null);
  const [report, setReport] = useState<IndependentReport | null>(null);
  const [reason, setReason] = useState<ChallengeReason>("PAYMENT_REVERSED");

  const live = useMemo(
    () => liveIds.map((id) => receipts.find((r) => r.receipt_id === id)).filter(Boolean) as SignedReceipt[],
    [liveIds, receipts],
  );

  function set<K extends keyof WorkshopFlags>(key: K, value: WorkshopFlags[K]) {
    setFlags((f) => ({ ...f, [key]: value }));
  }

  async function afterIssue(receipt: SignedReceipt, ctx: NonNullable<ReturnType<typeof runFor>>) {
    putLive(receipt, ctx);
    const independent = await verifyIndependently(receipt, [receipt, ...receipts]);
    setActive(receipt);
    setReport(independent);
    requestAnimationFrame(() => {
      document.getElementById("workshop-result")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }

  async function onIssue() {
    setBusy(true);
    setError(null);
    try {
      const { receipt, context } = await issueLive({ flags });
      await afterIssue(receipt, context);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Issuance failed");
    } finally {
      setBusy(false);
    }
  }

  async function onChallenge() {
    if (!active) return;
    const ctx = runFor(active.receipt_id);
    if (!ctx) {
      setError("This receipt has no stored evidence run. Issue one in the workshop first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { receipt, context } = await challengeReceipt(active, reason, ctx);
      await afterIssue(receipt, context);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Challenge failed");
    } finally {
      setBusy(false);
    }
  }

  async function onCorrect() {
    if (!active) return;
    const ctx = runFor(active.receipt_id);
    if (!ctx) {
      setError("This receipt has no stored evidence run. Issue one in the workshop first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { receipt, context } = await correctLive(active, flags, ctx);
      await afterIssue(receipt, context);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Correction failed");
    } finally {
      setBusy(false);
    }
  }

  const tuition = flags.policy === "tuition";
  const consult = flags.policy === "consult";
  const identityLabel = tuition
    ? "Institution identity"
    : consult
      ? "Provider identity"
      : "Payee identity";
  const eventLabel = tuition
    ? "Enrollment"
    : consult
      ? "Consult occurrence"
      : "Occupancy period";
  const matchedLabel = tuition
    ? "Invoice matched"
    : consult
      ? "Case authorization"
      : "Rent ledger matched";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-2xs uppercase tracking-caps text-fg-subtle">
        Live issuance · synthetic evidence
      </p>
      <h1 className="mt-2 font-display text-4xl">Workshop</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">
        Toggle evidence, then evaluate. The engine issues a fulfillment receipt
        with a real digest. You cannot add grades, a diagnosis, or a tenant
        credit score — those claims are not on the policy, so they cannot
        appear on the receipt.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="space-y-6">
          <fieldset>
            <legend className="text-2xs uppercase tracking-label text-fg-subtle">
              Policy
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <Choice
                selected={flags.policy === "tuition"}
                onClick={() => set("policy", "tuition" as PolicyKind)}
              >
                EDU-TUITION v1.0.0
              </Choice>
              <Choice
                selected={flags.policy === "consult"}
                onClick={() => set("policy", "consult" as PolicyKind)}
              >
                CARE-CONSULT v1.0.0
              </Choice>
              <Choice
                selected={flags.policy === "rent"}
                onClick={() => set("policy", "rent" as PolicyKind)}
              >
                HOUSING-RENT v1.0.0
              </Choice>
            </div>
          </fieldset>

          <FlagRow
            label={identityLabel}
            options={[
              { value: true, label: "Holds" },
              { value: false, label: "Fails" },
            ]}
            value={flags.identity}
            onChange={(v) => set("identity", v)}
          />
          <FlagRow
            label={eventLabel}
            options={[
              { value: true, label: "Present" },
              { value: false, label: "Missing" },
            ]}
            value={flags.event}
            onChange={(v) => set("event", v)}
          />
          <FlagRow
            label={matchedLabel}
            options={[
              { value: true, label: "Matched" },
              { value: false, label: "Unmatched" },
            ]}
            value={flags.matched}
            onChange={(v) => set("matched", v)}
          />
          <FlagRow
            label="Settlement"
            options={[
              { value: "full" as SettlementKind, label: "Full" },
              { value: "partial" as SettlementKind, label: "Partial" },
              { value: "reversed" as SettlementKind, label: "Reversed" },
            ]}
            value={flags.settlement}
            onChange={(v) => set("settlement", v)}
          />
          <FlagRow
            label="Duplicate registry"
            options={[
              { value: false, label: "Clear" },
              { value: true, label: "Match" },
            ]}
            value={flags.duplicate}
            onChange={(v) => set("duplicate", v)}
          />
          <FlagRow
            label="Independence"
            options={[
              { value: true, label: "Held" },
              { value: false, label: "Conflicted" },
            ]}
            value={flags.independence}
            onChange={(v) => set("independence", v)}
          />
          {consult ? (
            <FlagRow
              label="Provider credential"
              options={[
                { value: false, label: "Active" },
                { value: true, label: "Expired" },
              ]}
              value={flags.credentialExpired}
              onChange={(v) => set("credentialExpired", v)}
            />
          ) : null}

          <p className="rounded-md border border-dashed border-border px-3 py-3 text-sm text-fg-muted">
            Not asserted, and not toggleable: academic performance, diagnosis,
            clinical correctness, tenant creditworthiness, household roster,
            private records.
          </p>

          <Button type="button" onClick={() => void onIssue()} disabled={busy}>
            {busy ? "Evaluating…" : "Evaluate and issue"}
          </Button>
          {error ? <p className="text-sm text-failed">{error}</p> : null}
        </div>

        <div id="workshop-result" className="space-y-6 md:sticky md:top-20 md:self-start">
          {active ? (
            <>
              <FulfillmentReceipt receipt={active} />
              {report ? (
                <div className="rounded-lg border border-border bg-bg-elevated p-5">
                  <p className="text-2xs uppercase tracking-label text-fg-subtle">
                    Independent verifier
                  </p>
                  <p className="mt-2 font-display text-2xl">
                    {report.ok ? "Holds" : "Does not hold"}
                  </p>
                  <p className="mt-1 text-sm text-fg-muted">
                    {report.notes[report.notes.length - 1]}
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                      to="/receipts/$id"
                      params={{ id: active.receipt_id }}
                      className="text-sm text-primary underline-offset-4 hover:underline"
                    >
                      Open the human receipt
                    </Link>
                    <PortableDownload receipt={active} library={receipts} />
                  </div>
                </div>
              ) : null}

              <div className="rounded-lg border border-border p-5">
                <p className="text-2xs uppercase tracking-label text-fg-subtle">
                  History stays
                </p>
                <p className="mt-2 text-sm text-fg-muted">
                  Challenge freezes a review onto a new receipt. Correct
                  re-evaluates the same obligation with the flags on the left.
                  The prior digest still verifies.
                </p>
                <label className="mt-4 block text-sm text-fg-muted" htmlFor="reason">
                  Challenge reason
                </label>
                <select
                  id="reason"
                  className="mt-1 h-11 w-full rounded-md border border-border bg-bg-elevated px-3 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ChallengeReason)}
                >
                  {CHALLENGE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {CHALLENGE_REASON_LABELS[r]}
                    </option>
                  ))}
                </select>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void onChallenge()}
                  >
                    Challenge
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void onCorrect()}
                  >
                    Correct with these flags
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
              <p className="font-display text-2xl">No receipt yet</p>
              <p className="mt-2 text-sm text-fg-muted">
                Evaluate under a published policy. The person never enters the
                payload.
              </p>
            </div>
          )}

          {live.length > 0 ? (
            <div>
              <p className="text-2xs uppercase tracking-label text-fg-subtle">
                This session
              </p>
              <ul className="mt-3 space-y-2">
                {live.map((r) => (
                  <li key={r.receipt_id}>
                    <button
                      type="button"
                      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-left text-sm"
                      onClick={() => {
                        setActive(r);
                        setReport(null);
                        void verifyIndependently(r, receipts).then(setReport);
                      }}
                    >
                      <span className="font-mono text-2xs">{r.receipt_id}</span>
                      <Badge tone={verdictTone(r.challenge_status === "CHALLENGED" ? "CHALLENGED" : r.verdict)}>
                        {r.challenge_status === "NONE"
                          ? verdictLabel(r.verdict)
                          : r.challenge_status.toLowerCase()}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Choice({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-md border px-3 text-sm",
        selected
          ? "border-primary bg-primary text-primary-fg"
          : "border-border bg-bg-elevated text-fg",
      )}
    >
      {children}
    </button>
  );
}

function FlagRow<T extends string | boolean>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Choice
            key={String(opt.value)}
            selected={value === opt.value}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </Choice>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SeedGate } from "@/components/layout/SeedGate";
import { PortableDownload } from "@/components/receipt/PortableDownload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FulfillmentReceipt } from "@/components/receipt/FulfillmentReceipt";
import {
  decodePortableFragment,
  packPortable,
  parsePortable,
  serializePortable,
  verifyIndependently,
  type SignedReceipt,
} from "@/lib/fulfillment";
import { useReceipts } from "@/store/receipts";

export const Route = createFileRoute("/verify")({ component: VerifyPage });

function VerifyPage() {
  return (
    <SeedGate>
      <VerifyInner />
    </SeedGate>
  );
}

function VerifyInner() {
  const receipts = useReceipts((s) => s.receipts);
  const byId = useReceipts((s) => s.byId);
  const [query, setQuery] = useState("pof_edu_t2_ok");
  const [json, setJson] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [importedChain, setImportedChain] = useState<SignedReceipt[]>([]);
  const [report, setReport] = useState<Awaited<
    ReturnType<typeof verifyIndependently>
  > | null>(null);
  const [active, setActive] = useState<SignedReceipt | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const examples = useMemo(
    () => receipts.slice(0, 5).map((r) => r.receipt_id),
    [receipts],
  );

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("pof=")) return;
    const parsed = decodePortableFragment(hash);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    setImportedChain(parsed.chain);
    setJson(serializePortable(packPortable(parsed.receipt, parsed.chain)));
    void (async () => {
      setBusy(true);
      try {
        const result = await verifyIndependently(parsed.receipt, [
          parsed.receipt,
          ...parsed.chain,
        ]);
        setActive(parsed.receipt);
        setReport(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
      } finally {
        setBusy(false);
      }
    })();
  }, []);


  async function run(receipt: SignedReceipt, extra: SignedReceipt[] = [], tamper = false) {
    setBusy(true);
    setError(null);
    try {
      const subject = tamper
        ? {
            ...receipt,
            verdict: (receipt.verdict === "VERIFIED" ? "FAILED" : receipt.verdict) as SignedReceipt["verdict"],
          }
        : receipt;
      const result = await verifyIndependently(subject, [
        subject,
        ...extra,
        ...receipts,
      ]);
      setActive(subject);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  }

  async function verifyText(text: string) {
    const parsed = parsePortable(text);
    if (!parsed.ok) {
      setError(parsed.error);
      setReport(null);
      setActive(null);
      return;
    }
    setImportedChain(parsed.chain);
    await run(parsed.receipt, parsed.chain);
  }

  async function onLookup(e: FormEvent) {
    e.preventDefault();
    if (json.trim()) {
      await verifyText(json);
      return;
    }
    const found = byId(query.trim());
    if (!found) {
      setError("No receipt with that identifier in this explorer.");
      return;
    }
    setImportedChain([]);
    await run(found);
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileName(file.name);
    setBusy(true);
    try {
      const text = await file.text();
      setJson(text);
      await verifyText(text);
    } catch {
      setError("That file could not be read.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-2xs uppercase tracking-caps text-fg-subtle">
        Independent verifier
      </p>
      <h1 className="mt-2 font-display text-4xl">Verify a fulfillment receipt</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">
        A portable receipt can leave this machine. Paste the JSON or open the
        file. This verifier does not reuse the engine that issued it. It
        recomputes the digest, checks the Ed25519 signature, and checks the
        policy. The explorer key is public. It is not a production authority.
        Machines: read the{" "}
        <Link to="/agents" className="text-primary underline-offset-4 hover:underline">
          agent contract
        </Link>
        . You may check. You may not mint VERIFIED.

      </p>

      <form onSubmit={onLookup} className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="text-sm text-fg-muted" htmlFor="rid">
            Receipt ID in this explorer
          </label>
          <Input
            id="rid"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="pof_edu_t2_ok"
          />
          <div className="flex flex-wrap gap-2">
            {examples.map((id) => (
              <button
                key={id}
                type="button"
                className="rounded-sm border border-border px-2 py-1 font-mono text-2xs text-fg-muted hover:text-fg"
                onClick={() => setQuery(id)}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-sm text-fg-muted" htmlFor="json">
            Or a portable receipt (paste or file)
          </label>
          <Textarea
            id="json"
            value={json}
            onChange={(e) => setJson(e.target.value)}
            placeholder="{}"
          />
          <label className="block text-sm text-fg-muted" htmlFor="portable-file">
            Open a .pof.json file
          </label>
          <Input
            id="portable-file"
            type="file"
            accept="application/json,.json"
            onChange={(e) => void onFile(e)}
          />
          {fileName ? (
            <p className="font-mono text-2xs text-fg-subtle">{fileName}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Verifying…" : "Verify independently"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!active || busy}
            onClick={() =>
              active &&
              void run(byId(active.receipt_id) ?? active, importedChain, true)
            }
          >
            Tamper with the verdict
          </Button>
        </div>
      </form>

      {error ? <p className="mt-6 text-sm text-failed">{error}</p> : null}

      {report && active ? (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="rounded-lg border border-border bg-bg-elevated p-5">
            <p className="text-2xs uppercase tracking-label text-fg-subtle">
              Independent report
            </p>
            <p className="mt-2 font-display text-3xl">
              {report.ok ? "Holds" : "Does not hold"}
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              <Check ok={report.digest_matches} label="Digest matches canonical bytes" />
              <Check ok={report.signature_valid} label="Explorer signature holds" />
              <Check ok={report.policy_known} label="Policy hash is in the registry" />
              <Check ok={report.required_complete} label="Required assertions present" />
              <Check ok={report.not_asserted_complete} label="Not-asserted list complete" />
              <Check ok={report.verdict_consistent} label="Verdict matches assertions" />
              <Check ok={report.chain_ok} label="Correction chain retrievable" />
            </ul>
            <ul className="mt-5 space-y-1 text-sm text-fg-muted">
              {report.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/receipts/$id"
                params={{ id: active.receipt_id }}
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                Open the human receipt
              </Link>
              <PortableDownload receipt={active} library={[...importedChain, ...receipts]} />
            </div>
          </div>
          <FulfillmentReceipt receipt={active} />
        </div>
      ) : null}
    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-border/70 py-2">
      <span>{label}</span>
      <span className={ok ? "text-verified" : "text-failed"}>
        {ok ? "pass" : "fail"}
      </span>
    </li>
  );
}

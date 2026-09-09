import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDemoLibrary } from "./fixtures.ts";
import { verifyIndependently } from "./verifier.ts";
import {
  decodePortableFragment,
  encodePortableFragment,
  packPortable,
  parsePortable,
  portableFilename,
  portableSharePath,
  privacyScan,
  serializePortable,
} from "./portable.ts";
import type { SignedReceipt } from "./types.ts";

describe("portable fulfillment receipts", () => {
  it("a downloaded golden receipt still holds after parse", async () => {
    const { receipts } = await buildDemoLibrary();
    const original = receipts.find((r) => r.receipt_id === "pof_edu_t2_ok");
    assert.ok(original);
    const text = serializePortable(packPortable(original, receipts));
    const parsed = parsePortable(text);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.receipt.receipt_digest, original.receipt_digest);
    assert.equal(portableFilename(parsed.receipt), "pof_edu_t2_ok.pof.json");
    const report = await verifyIndependently(parsed.receipt, [
      parsed.receipt,
      ...parsed.chain,
    ]);
    assert.equal(report.ok, true);
    assert.equal(report.digest_matches, true);
    assert.equal(report.signature_valid, true);
  });

  it("a correction travels with its ancestors so the chain holds", async () => {
    const { receipts } = await buildDemoLibrary();
    const corrected = receipts.find((r) => r.receipt_id === "pof_edu_t2_cr");
    assert.ok(corrected);
    assert.ok(corrected.previous_receipt_id);
    const packed = packPortable(corrected, receipts);
    assert.ok(packed.chain.some((r) => r.receipt_id === corrected.previous_receipt_id));
    const parsed = parsePortable(serializePortable(packed));
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const report = await verifyIndependently(parsed.receipt, parsed.chain);
    assert.equal(report.ok, true);
    assert.equal(report.chain_ok, true);
  });

  it("a correction without ancestors does not claim the chain holds", async () => {
    const { receipts } = await buildDemoLibrary();
    const corrected = receipts.find((r) => r.receipt_id === "pof_edu_t2_cr");
    assert.ok(corrected);
    const lonely = parsePortable(JSON.stringify(corrected));
    assert.equal(lonely.ok, true);
    if (!lonely.ok) return;
    const report = await verifyIndependently(lonely.receipt, lonely.chain);
    assert.equal(report.chain_ok, false);
    assert.equal(report.ok, false);
    assert.equal(report.digest_matches, true);
    assert.equal(report.signature_valid, true);
  });

  it("raw museum JSON still parses (copy without the envelope)", async () => {
    const { receipts } = await buildDemoLibrary();
    const original = receipts.find((r) => r.receipt_id === "pof_care_c1_ok");
    assert.ok(original);
    const parsed = parsePortable(JSON.stringify(original));
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const report = await verifyIndependently(parsed.receipt, receipts);
    assert.equal(report.ok, true);
  });

  it("refuses a file that publishes a person", () => {
    const leak = {
      record_type: "pof.portable_receipt",
      schema_version: "1.0.0",
      receipt: { student_name: "Jane Doe" },
    };
    const parsed = parsePortable(JSON.stringify(leak));
    assert.equal(parsed.ok, false);
    if (parsed.ok) return;
    assert.match(parsed.error, /student_name|private-life/i);
  });

  it("refuses an email in any field", () => {
    assert.ok(privacyScan({ notes: "person@example.com" }));
    const parsed = parsePortable(
      JSON.stringify({ record_type: "pof.receipt", notes: "a@b.co" }),
    );
    assert.equal(parsed.ok, false);
  });

  it("tampered portable bytes do not hold", async () => {
    const { receipts } = await buildDemoLibrary();
    const original = receipts.find((r) => r.receipt_id === "pof_rent_m9_ok");
    assert.ok(original);
    const packed = packPortable(original, receipts);
    const tampered: SignedReceipt = { ...packed.receipt, verdict: "FAILED" };
    const parsed = parsePortable(
      JSON.stringify({ ...packed, receipt: tampered }),
    );
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const report = await verifyIndependently(parsed.receipt, parsed.chain);
    assert.equal(report.ok, false);
    assert.equal(report.digest_matches, false);
  });

  it("a share fragment round-trips and still holds", async () => {
    const { receipts } = await buildDemoLibrary();
    const original = receipts.find((r) => r.receipt_id === "pof_edu_t2_ok");
    assert.ok(original);
    const fragment = encodePortableFragment(packPortable(original, receipts));
    assert.match(fragment, /^pof=/);
    const parsed = decodePortableFragment(`#${fragment}`);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const report = await verifyIndependently(parsed.receipt, parsed.chain);
    assert.equal(report.ok, true);
    assert.equal(portableSharePath(original, receipts).startsWith("/verify#pof="), true);
  });

  it("a share fragment with a person is refused", () => {
    const packed = {
      record_type: "pof.portable_receipt",
      schema_version: "1.0.0",
      notice: "x",
      receipt: { student_name: "Jane Doe" },
      chain: [],
    };
    const fragment = encodePortableFragment(packed as never);
    const parsed = decodePortableFragment(fragment);
    assert.equal(parsed.ok, false);
  });

  it("a garbage fragment does not hold", () => {
    const parsed = decodePortableFragment("#pof=%%%");
    assert.equal(parsed.ok, false);
  });
});

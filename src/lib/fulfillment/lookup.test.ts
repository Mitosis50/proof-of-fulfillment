import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDemoLibrary } from "./fixtures.ts";
import { PUBLIC_EXAMPLE_RECEIPT_ID } from "./golden.ts";
import { lookupReceipt, normalizeDigest } from "./lookup.ts";
import { verifyIndependently } from "./verifier.ts";

describe("lookup by digest", () => {
  it("finds the public example from the paper digest and it Holds", async () => {
    const { receipts } = await buildDemoLibrary();
    const example = receipts.find((r) => r.receipt_id === PUBLIC_EXAMPLE_RECEIPT_ID);
    assert.ok(example);
    const bare = example.receipt_digest.replace(/^sha256:/, "");
    const found = lookupReceipt(bare, receipts);
    assert.equal(found.ok, true);
    if (!found.ok) return;
    assert.equal(found.via, "digest");
    assert.equal(found.receipt.receipt_id, PUBLIC_EXAMPLE_RECEIPT_ID);
    const report = await verifyIndependently(found.receipt, receipts);
    assert.equal(report.ok, true);
  });

  it("accepts the sha256: prefix", async () => {
    const { receipts } = await buildDemoLibrary();
    const example = receipts.find((r) => r.receipt_id === PUBLIC_EXAMPLE_RECEIPT_ID);
    assert.ok(example);
    const found = lookupReceipt(example.receipt_digest.toUpperCase(), receipts);
    assert.equal(found.ok, true);
  });

  it("a digest this explorer does not hold is not here", async () => {
    const { receipts } = await buildDemoLibrary();
    const miss = lookupReceipt(
      "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      receipts,
    );
    assert.equal(miss.ok, false);
    assert.equal(miss.via, "digest");
  });

  it("a short prefix is not a digest", () => {
    assert.equal(normalizeDigest("sha256:abcd"), null);
    assert.equal(normalizeDigest("pof_edu_t2_ok"), null);
  });

  it("still finds by receipt id", async () => {
    const { receipts } = await buildDemoLibrary();
    const found = lookupReceipt(PUBLIC_EXAMPLE_RECEIPT_ID, receipts);
    assert.equal(found.ok, true);
    if (!found.ok) return;
    assert.equal(found.via, "id");
  });

  it("a digest query value is the canonical sha256 string", async () => {
    const { receipts } = await buildDemoLibrary();
    const example = receipts.find((r) => r.receipt_id === PUBLIC_EXAMPLE_RECEIPT_ID);
    assert.ok(example);
    const canonical = normalizeDigest(example.receipt_digest);
    assert.equal(canonical, example.receipt_digest);
    assert.match(canonical ?? "", /^sha256:[0-9a-f]{64}$/);
  });
});

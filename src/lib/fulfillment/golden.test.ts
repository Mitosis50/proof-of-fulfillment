import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { domainHash } from "./hash.ts";
import { EDU_TUITION_V1, CARE_CONSULT_V1, HOUSING_RENT_V1, signPolicy } from "./policies.ts";
import { buildDemoLibrary } from "./fixtures.ts";
import { verifyIndependently } from "./verifier.ts";
import {
  GOLDEN_CASES,
  LOCKED_POLICY_HASHES,
  LOCKED_RECEIPT_DIGESTS,
  PUBLIC_EXAMPLE_RECEIPT_ID,
} from "./golden.ts";
import { detachSeal, signReceiptDigest } from "./sign.ts";
import type { SignedReceipt } from "./types.ts";

describe("Proof of Fulfillment golden cases", () => {
  it("locks verdict, not-asserted list, and independent verification", async () => {
    const { receipts } = await buildDemoLibrary();
    const byId = new Map(receipts.map((r) => [r.receipt_id, r]));

    for (const golden of GOLDEN_CASES) {
      const receipt = byId.get(golden.id);
      assert.ok(receipt, `missing golden receipt ${golden.id}`);
      assert.equal(receipt.verdict, golden.verdict, `${golden.id} verdict drifted`);
      assert.equal(
        receipt.challenge_status,
        golden.challenge_status,
        `${golden.id} challenge status drifted`,
      );
      assert.deepEqual(
        receipt.not_asserted.map((n) => n.code),
        [...golden.not_asserted],
        `${golden.id} not-asserted list drifted`,
      );
      const report = await verifyIndependently(receipt, receipts);
      assert.equal(
        report.ok,
        true,
        `${golden.id} independent verify failed: ${report.notes.join("; ")}`,
      );
      assert.equal(report.digest_matches, true, `${golden.id} digest mismatch`);
      assert.equal(report.signature_valid, true, `${golden.id} signature invalid`);
    }
  });

  it("tampered verdict fails independent verification", async () => {
    const { receipts } = await buildDemoLibrary();
    const original = receipts.find((r) => r.receipt_id === "pof_edu_t2_ok");
    assert.ok(original);
    const tampered: SignedReceipt = { ...original, verdict: "FAILED" };
    const report = await verifyIndependently(tampered, receipts);
    assert.equal(report.ok, false);
    assert.equal(report.digest_matches, false);
  });

  it("omitting not-asserted fails even if the digest is recomputed", async () => {
    const { receipts } = await buildDemoLibrary();
    const original = receipts.find((r) => r.receipt_id === "pof_edu_t2_ok");
    assert.ok(original);
    const payload = detachSeal(original);
    const stripped = { ...payload, not_asserted: [] };
    const digest = await domainHash("pof.receipt.v1", stripped);
    const recomputed: SignedReceipt = {
      ...stripped,
      not_asserted: [],
      receipt_digest: digest,
      signature: await signReceiptDigest(digest),
    };
    const report = await verifyIndependently(recomputed, receipts);
    assert.equal(report.ok, false);
    assert.equal(report.digest_matches, true);
    assert.equal(report.signature_valid, true);
    assert.equal(report.not_asserted_complete, false);
  });

  it("VERIFIED receipts never assert academic or clinical outcomes", async () => {
    const { receipts } = await buildDemoLibrary();
    const forbidden = [
      "ACADEMIC_PERFORMANCE",
      "GRADES_OR_TRANSCRIPT",
      "ATTENDANCE",
      "CLINICAL_CORRECTNESS",
      "DIAGNOSIS",
      "TREATMENT_EFFECTIVENESS",
      "MEDICAL_NECESSITY",
      "TENANT_CREDITWORTHINESS",
      "HOUSEHOLD_ROSTER",
      "HOUSING_QUALITY",
      "EVICTION_HISTORY",
    ];
    for (const receipt of receipts) {
      if (receipt.verdict !== "VERIFIED") continue;
      const asserted = new Set(receipt.assertions.map((a) => a.code));
      for (const code of forbidden) {
        assert.equal(asserted.has(code), false, `${receipt.receipt_id} asserted ${code}`);
      }
      assert.ok(
        receipt.not_asserted.length > 0,
        `${receipt.receipt_id} is VERIFIED with an empty not-asserted list`,
      );
    }
  });

  it("policy hashes are frozen for v1.0.0", async () => {
    const edu = await signPolicy(EDU_TUITION_V1);
    const care = await signPolicy(CARE_CONSULT_V1);
    const rent = await signPolicy(HOUSING_RENT_V1);
    assert.equal(edu.policy_hash, LOCKED_POLICY_HASHES["EDU-TUITION@1.0.0"]);
    assert.equal(care.policy_hash, LOCKED_POLICY_HASHES["CARE-CONSULT@1.0.0"]);
    assert.equal(rent.policy_hash, LOCKED_POLICY_HASHES["HOUSING-RENT@1.0.0"]);
  });

  it("receipt digests are frozen and signatures stay off the digest", async () => {
    const { receipts } = await buildDemoLibrary();
    for (const [id, digest] of Object.entries(LOCKED_RECEIPT_DIGESTS)) {
      const receipt = receipts.find((r) => r.receipt_id === id);
      assert.ok(receipt, `missing ${id}`);
      assert.equal(receipt.receipt_digest, digest, `${id} digest drifted`);
      assert.ok(receipt.signature, `${id} is unsigned`);
      const recomputed = await domainHash("pof.receipt.v1", detachSeal(receipt));
      assert.equal(recomputed, digest, `${id} signature leaked into the digest`);
    }
  });

  it("a flipped signature byte does not hold", async () => {
    const { receipts } = await buildDemoLibrary();
    const original = receipts.find((r) => r.receipt_id === "pof_edu_t2_ok");
    assert.ok(original);
    const flipped = original.signature.signature.replace(/[0-9a-f]$/, (c) =>
      c === "0" ? "1" : "0",
    );
    const tampered: SignedReceipt = {
      ...original,
      signature: { ...original.signature, signature: flipped },
    };
    const report = await verifyIndependently(tampered, receipts);
    assert.equal(report.ok, false);
    assert.equal(report.digest_matches, true);
    assert.equal(report.signature_valid, false);
  });

  it("the public example is the frozen tuition receipt that Holds", async () => {
    assert.equal(PUBLIC_EXAMPLE_RECEIPT_ID, "pof_edu_t2_ok");
    const golden = GOLDEN_CASES.find((c) => c.id === PUBLIC_EXAMPLE_RECEIPT_ID);
    assert.ok(golden);
    assert.equal(golden.verdict, "VERIFIED");
    const { receipts } = await buildDemoLibrary();
    const receipt = receipts.find((r) => r.receipt_id === PUBLIC_EXAMPLE_RECEIPT_ID);
    assert.ok(receipt);
    const report = await verifyIndependently(receipt, receipts);
    assert.equal(report.ok, true);
  });
});

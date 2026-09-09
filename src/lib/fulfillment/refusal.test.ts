import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDemoLibrary } from "./fixtures.ts";
import { GOLDEN_CASES, PUBLIC_EXAMPLE_RECEIPT_ID } from "./golden.ts";
import { privacyScan } from "./portable.ts";
import { refusalCard } from "./refusal.ts";
import { verifyIndependently } from "./verifier.ts";

describe("refusal card", () => {
  it("the public example refuses grades, attendance, and a student", async () => {
    const { receipts } = await buildDemoLibrary();
    const receipt = receipts.find((r) => r.receipt_id === PUBLIC_EXAMPLE_RECEIPT_ID);
    assert.ok(receipt);
    const card = refusalCard(receipt);
    assert.equal(card.record_type, "pof.refusal_card");
    assert.equal(
      card.tagline,
      "We verify the obligation. We do not publish the person.",
    );
    const codes = card.not_asserted.map((n) => n.code);
    for (const code of [
      "ACADEMIC_PERFORMANCE",
      "GRADES_OR_TRANSCRIPT",
      "ATTENDANCE",
      "PRIVATE_STUDENT_RECORDS",
    ]) {
      assert.ok(codes.includes(code), `missing refusal ${code}`);
    }
    const golden = GOLDEN_CASES.find((c) => c.id === PUBLIC_EXAMPLE_RECEIPT_ID);
    assert.deepEqual(codes, [...(golden?.not_asserted ?? [])]);
    assert.equal(privacyScan(card), null);
    assert.equal("name" in card, false);
    const report = await verifyIndependently(receipt, receipts);
    assert.equal(report.ok, true);
  });

  it("a failed receipt still refuses diagnosis", async () => {
    const { receipts } = await buildDemoLibrary();
    const receipt = receipts.find((r) => r.receipt_id === "pof_care_c1_exp");
    assert.ok(receipt);
    const card = refusalCard(receipt);
    assert.equal(card.verdict, "FAILED");
    assert.ok(card.not_asserted.some((n) => n.code === "DIAGNOSIS"));
  });
});

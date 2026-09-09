import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDemoLibrary } from "./fixtures.ts";
import { PUBLIC_EXAMPLE_RECEIPT_ID } from "./golden.ts";
import { paperSheet } from "./paper.ts";
import { privacyScan } from "./portable.ts";

describe("paper receipt", () => {
  it("carries digest, not-asserted, and the tagline — never a person", async () => {
    const { receipts } = await buildDemoLibrary();
    const receipt = receipts.find((r) => r.receipt_id === PUBLIC_EXAMPLE_RECEIPT_ID);
    assert.ok(receipt);
    const sheet = paperSheet(receipt);
    assert.equal(sheet.tagline, "We verify the obligation. We do not publish the person.");
    assert.equal(sheet.digest, receipt.receipt_digest);
    assert.ok(sheet.digest.startsWith("sha256:"));
    assert.ok(sheet.not_asserted.includes("ACADEMIC_PERFORMANCE"));
    assert.equal(sheet.verdict, "VERIFIED");
    assert.equal(privacyScan(sheet), null);
    assert.equal("name" in sheet, false);
    assert.equal("email" in sheet, false);
  });
});

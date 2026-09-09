import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALLOWED_WORDS, BANNED_WORDS, PRODUCT_NAMES } from "./naming.ts";

describe("Fulfilled naming doctrine", () => {
  it("locks the product names", () => {
    assert.equal(PRODUCT_NAMES.protocol, "Proof of Fulfillment");
    assert.equal(PRODUCT_NAMES.product, "Fulfilled");
    assert.equal(PRODUCT_NAMES.object, "fulfillment receipt");
    assert.equal(
      PRODUCT_NAMES.tagline,
      "We verify the obligation. We do not publish the person.",
    );
  });

  it("keeps abandoned and overclaiming names banned", () => {
    const banned = BANNED_WORDS.map((row) => row.term as string);
    for (const term of [
      "CareLedger",
      "Proof of Care",
      "trust score, social credit",
      "healed, cured, learned, passed",
      "AI decided / the agent verified",
      "ledger of people",
    ]) {
      assert.ok(banned.includes(term), `missing banned term: ${term}`);
    }
  });

  it("keeps not asserted and receipt language allowed", () => {
    const allowed = ALLOWED_WORDS.map((row) => row.term as string);
    for (const term of [
      "obligation",
      "fulfillment receipt",
      "not asserted",
      "challenge / correction / supersede",
    ]) {
      assert.ok(allowed.includes(term), `missing allowed term: ${term}`);
    }
  });
});

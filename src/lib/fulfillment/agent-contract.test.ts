import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AGENT_CONTRACT, RECEIPT_DIGEST_TAG } from "./agent-contract.ts";
import { PORTABLE_RECORD } from "./portable.ts";
import { PRODUCT_NAMES } from "./naming.ts";

describe("agent contract", () => {
  it("locks the machine interface", () => {
    assert.equal(AGENT_CONTRACT.protocol, PRODUCT_NAMES.protocol);
    assert.equal(AGENT_CONTRACT.tagline, PRODUCT_NAMES.tagline);
    assert.equal(AGENT_CONTRACT.digest_tag, RECEIPT_DIGEST_TAG);
    assert.equal(AGENT_CONTRACT.digest_tag, "pof.receipt.v1");
    assert.equal(AGENT_CONTRACT.portable_record, PORTABLE_RECORD);
    assert.equal(AGENT_CONTRACT.signature_alg, "Ed25519");
    assert.equal(AGENT_CONTRACT.verify_path, "/verify");
    assert.equal(AGENT_CONTRACT.fragment_prefix, "pof=");
  });

  it("forbids minting VERIFIED and publishing a person", () => {
    const banned = AGENT_CONTRACT.must_not.join(" ");
    assert.match(banned, /Mint VERIFIED/);
    assert.match(banned, /Publish a person/);
    assert.match(banned, /Authorize payment/);
    assert.match(banned, /Conversation is not authority/);
    assert.equal(
      AGENT_CONTRACT.must_not.some((line) => /the agent verified/i.test(line)),
      false,
    );
  });

  it("Holds requires every independent check", () => {
    for (const check of [
      "digest_matches",
      "signature_valid",
      "not_asserted_complete",
      "chain_ok",
    ]) {
      assert.ok(
        (AGENT_CONTRACT.holds_when as readonly string[]).includes(check),
        `missing hold check ${check}`,
      );
    }
  });
});

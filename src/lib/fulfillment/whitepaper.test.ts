import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { LOCKED_POLICY_HASHES } from "./golden.ts";
import { BANNED_WORDS, PRODUCT_NAMES } from "./naming.ts";
import { whitepaperMarkdown, WHITEPAPER } from "./whitepaper.ts";

describe("protocol whitepaper", () => {
  it("pins hashes, tagline, and honest limits", () => {
    const md = whitepaperMarkdown();
    assert.equal(WHITEPAPER.tagline, PRODUCT_NAMES.tagline);
    assert.match(md, /not a production authority/i);
    assert.match(md, /We do not publish the person/);
    assert.match(md, /Conversation is not authority/);
    assert.ok(md.includes(LOCKED_POLICY_HASHES["EDU-TUITION@1.0.0"]));
    assert.ok(md.includes(LOCKED_POLICY_HASHES["CARE-CONSULT@1.0.0"]));
    assert.ok(md.includes(LOCKED_POLICY_HASHES["HOUSING-RENT@1.0.0"]));
    assert.equal(/trust score|social credit|healed|cured/i.test(md), false);
    const banned = BANNED_WORDS.map((w) => w.term);
    assert.ok(banned.includes("trust score, social credit"));
  });

  it("the repo WHITEPAPER.md matches the frozen markdown", () => {
    const disk = readFileSync(new URL("../../../WHITEPAPER.md", import.meta.url), "utf8");
    assert.equal(disk, whitepaperMarkdown());
  });
});

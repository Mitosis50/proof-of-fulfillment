import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { PUBLIC_EXAMPLE_RECEIPT_ID } from "./golden.ts";
import { HUMAN_CHECK, humanCheckMarkdown } from "./human-check.ts";

describe("independent human check", () => {
  it("uses the frozen public example and forbids a real person", () => {
    assert.equal(HUMAN_CHECK.people, 5);
    assert.equal(HUMAN_CHECK.example_id, PUBLIC_EXAMPLE_RECEIPT_ID);
    assert.equal(HUMAN_CHECK.tasks.length, 5);
    const md = humanCheckMarkdown();
    assert.match(md, /Do not put a real name/);
    assert.match(md, /not a production authority/i);
    assert.ok(md.includes(`/verify?example=${PUBLIC_EXAMPLE_RECEIPT_ID}`));
    assert.ok(md.includes(`/refusal/${PUBLIC_EXAMPLE_RECEIPT_ID}`));
    assert.equal(/trust score|healed|the agent verified/i.test(md), false);
  });

  it("HUMAN-CHECK.md matches the frozen brief", () => {
    const disk = readFileSync(new URL("../../../HUMAN-CHECK.md", import.meta.url), "utf8");
    assert.equal(disk, humanCheckMarkdown());
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PUBLIC_EXAMPLE_RECEIPT_ID } from "./golden.ts";
import { SHARE_CARD } from "./share.ts";

describe("honest social preview", () => {
  it("says Holds and refuses a person", () => {
    assert.equal(SHARE_CARD.example_id, PUBLIC_EXAMPLE_RECEIPT_ID);
    assert.match(SHARE_CARD.title, /Holds/);
    assert.match(SHARE_CARD.title, /tuition/i);
    assert.match(SHARE_CARD.description, /Not a person/);
    assert.match(SHARE_CARD.description, /Not grades/);
    assert.equal(SHARE_CARD.description.includes("@"), false);
    assert.equal(/Jordan|student_name|Hale/i.test(SHARE_CARD.title + SHARE_CARD.description), false);
    assert.equal(SHARE_CARD.image, "/og-share.png");
  });
});

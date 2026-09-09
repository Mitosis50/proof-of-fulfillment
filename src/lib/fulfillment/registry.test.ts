import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { LOCKED_POLICY_HASHES } from "./golden.ts";
import {
  CARE_CONSULT_V1,
  EDU_TUITION_V1,
  HOUSING_RENT_V1,
  signPolicy,
} from "./policies.ts";
import { privacyScan } from "./portable.ts";
import { POLICY_REGISTRY } from "./registry.ts";

describe("policy registry", () => {
  it("pins the three frozen hashes", async () => {
    const edu = await signPolicy(EDU_TUITION_V1);
    const care = await signPolicy(CARE_CONSULT_V1);
    const rent = await signPolicy(HOUSING_RENT_V1);
    const byId = Object.fromEntries(
      POLICY_REGISTRY.policies.map((p) => [`${p.policy_id}@${p.version}`, p]),
    );
    assert.equal(byId["EDU-TUITION@1.0.0"]?.hash, edu.policy_hash);
    assert.equal(byId["CARE-CONSULT@1.0.0"]?.hash, care.policy_hash);
    assert.equal(byId["HOUSING-RENT@1.0.0"]?.hash, rent.policy_hash);
    assert.equal(byId["EDU-TUITION@1.0.0"]?.hash, LOCKED_POLICY_HASHES["EDU-TUITION@1.0.0"]);
    assert.ok(byId["EDU-TUITION@1.0.0"]?.not_asserted.includes("ACADEMIC_PERFORMANCE"));
    assert.ok(byId["CARE-CONSULT@1.0.0"]?.not_asserted.includes("DIAGNOSIS"));
    assert.ok(byId["HOUSING-RENT@1.0.0"]?.not_asserted.includes("TENANT_CREDITWORTHINESS"));
    assert.equal(privacyScan(POLICY_REGISTRY), null);
  });

  it("the public JSON file matches the frozen object", () => {
    const disk = JSON.parse(
      readFileSync(new URL("../../../public/registry.json", import.meta.url), "utf8"),
    );
    assert.deepEqual(disk, JSON.parse(JSON.stringify(POLICY_REGISTRY)));
  });
});

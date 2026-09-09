import { LOCKED_POLICY_HASHES } from "./golden.ts";
import { PRODUCT_NAMES } from "./naming.ts";
import { CARE_CONSULT_V1, EDU_TUITION_V1, HOUSING_RENT_V1 } from "./policies.ts";

function entry(
  policy: typeof EDU_TUITION_V1 | typeof CARE_CONSULT_V1 | typeof HOUSING_RENT_V1,
  hash: string,
) {
  return {
    policy_id: policy.policy_id,
    version: policy.version,
    title: policy.title,
    domain: policy.domain,
    scope: policy.scope,
    hash,
    required: policy.required.map((r) => r.code),
    not_asserted: policy.not_asserted.map((n) => n.code),
  };
}

/** Frozen public registry. A one-byte policy change is a new version. */
export const POLICY_REGISTRY = {
  record_type: "pof.policy_registry" as const,
  schema_version: "1.0.0" as const,
  protocol: PRODUCT_NAMES.protocol,
  product: PRODUCT_NAMES.product,
  tagline: PRODUCT_NAMES.tagline,
  notice:
    "A policy version never mutates after it has issued receipts. Conversation is not authority.",
  policies: [
    entry(EDU_TUITION_V1, LOCKED_POLICY_HASHES["EDU-TUITION@1.0.0"]),
    entry(CARE_CONSULT_V1, LOCKED_POLICY_HASHES["CARE-CONSULT@1.0.0"]),
    entry(HOUSING_RENT_V1, LOCKED_POLICY_HASHES["HOUSING-RENT@1.0.0"]),
  ],
} as const;

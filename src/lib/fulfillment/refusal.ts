import type { SignedReceipt } from "./types.ts";
import { PRODUCT_NAMES } from "./naming.ts";

/** The unique public object: what this receipt will not say. No person. */
export function refusalCard(receipt: SignedReceipt) {
  return {
    record_type: "pof.refusal_card" as const,
    schema_version: "1.0.0" as const,
    product: PRODUCT_NAMES.product,
    tagline: PRODUCT_NAMES.tagline,
    receipt_id: receipt.receipt_id,
    purpose: receipt.subject.purpose,
    period: receipt.subject.period,
    verdict: receipt.verdict,
    digest: receipt.receipt_digest,
    policy: `${receipt.policy.id} v${receipt.policy.version}`,
    not_asserted: receipt.not_asserted.map((n) => ({
      code: n.code,
      label: n.label,
    })),
  };
}

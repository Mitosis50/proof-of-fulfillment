import type { SignedReceipt } from "./types.ts";
import { PRODUCT_NAMES } from "./naming.ts";

/** What a paper receipt must carry. No person. */
export function paperSheet(receipt: SignedReceipt) {
  return {
    product: PRODUCT_NAMES.product,
    object: PRODUCT_NAMES.object,
    tagline: PRODUCT_NAMES.tagline,
    receipt_id: receipt.receipt_id,
    purpose: receipt.subject.purpose,
    period: receipt.subject.period,
    verdict: receipt.verdict,
    digest: receipt.receipt_digest,
    policy: `${receipt.policy.id} v${receipt.policy.version}`,
    assertions: receipt.assertions.map((a) => ({
      code: a.code,
      status: a.status,
    })),
    not_asserted: receipt.not_asserted.map((n) => n.code),
  };
}

/**
 * Public contract for machines. Changing a forbidden action to allowed
 * is a doctrine change. Conversation is not authority.
 */
import { PORTABLE_HASH_PREFIX, PORTABLE_RECORD } from "./portable.ts";
import { PRODUCT_NAMES } from "./naming.ts";

export const RECEIPT_DIGEST_TAG = "pof.receipt.v1" as const;
export const RECEIPT_RECORD = "pof.receipt" as const;

export const AGENT_CONTRACT = {
  protocol: PRODUCT_NAMES.protocol,
  product: PRODUCT_NAMES.product,
  object: PRODUCT_NAMES.object,
  tagline: PRODUCT_NAMES.tagline,
  digest_tag: RECEIPT_DIGEST_TAG,
  receipt_record: RECEIPT_RECORD,
  portable_record: PORTABLE_RECORD,
  fragment_prefix: PORTABLE_HASH_PREFIX,
  hash: "SHA-256",
  canonical: "RFC 8785-style JCS (sorted keys, no undefined, integers for money)",
  signature_alg: "Ed25519",
  signature_on: "receipt_digest only — never on the signature bytes",
  verify_path: "/verify",
  holds_when: [
    "digest_matches",
    "signature_valid",
    "policy_known",
    "policy_hash_matches",
    "required_complete",
    "not_asserted_complete",
    "verdict_consistent",
    "chain_ok",
  ],
  may: [
    "Parse a pof.portable_receipt or a raw pof.receipt.",
    "Recompute the digest over the detached public payload with tag pof.receipt.v1.",
    "Check the detached Ed25519 signature against the published explorer key.",
    "Report Holds or Does not hold, with the independent checks named.",
    "Carry ancestor receipts in the portable chain so a correction still verifies.",
  ],
  must_not: [
    "Mint VERIFIED. Conversation is not authority.",
    "Publish a person. No names, emails, diagnoses, grades, invoices, or bank identifiers.",
    "Authorize payment or move funds.",
    "Rewrite a frozen policy version.",
    "Put the signature or receipt_digest inside the hashed payload.",
    "Put a portable receipt in a query string. Use the URL fragment (#pof=) or a file.",
    "Treat a chat answer as a verification run.",
  ],
} as const;

export type AgentContract = typeof AGENT_CONTRACT;

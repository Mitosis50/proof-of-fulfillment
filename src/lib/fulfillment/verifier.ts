/**
 * Independent verifier.
 * Does not import the production evaluator. It only re-canonicalizes a public
 * receipt, recomputes the digest, checks the detached signature, and checks
 * policy-registry consistency.
 */
import type { IndependentReport, SignedReceipt } from "./types.ts";
import { domainHash } from "./hash.ts";
import { findPolicyByHash } from "./policies.ts";
import { detachSeal, verifyReceiptSignature } from "./sign.ts";

export async function verifyIndependently(
  receipt: SignedReceipt,
  chain: SignedReceipt[] = [],
): Promise<IndependentReport> {
  const notes: string[] = [];
  const payload = detachSeal(receipt);
  const computed = await domainHash("pof.receipt.v1", payload);
  const digest_matches = computed === receipt.receipt_digest;
  if (!digest_matches) {
    notes.push("Receipt digest does not match canonical payload.");
  }

  const sig = await verifyReceiptSignature(
    receipt.receipt_digest,
    receipt.signature,
  );
  const signature_valid = sig.ok;
  notes.push(sig.note);

  const policy = await findPolicyByHash(receipt.policy.hash);
  const policy_known = Boolean(policy);
  const policy_hash_matches = policy
    ? policy.policy_hash === receipt.policy.hash &&
      policy.policy_id === receipt.policy.id &&
      policy.version === receipt.policy.version
    : false;
  if (!policy_known) notes.push("Policy hash is not in the local registry.");
  if (policy && !policy_hash_matches) {
    notes.push("Policy identifier does not match the hashed artifact.");
  }

  let required_complete = true;
  if (policy) {
    for (const rule of policy.required) {
      const hit = receipt.assertions.find((a) => a.code === rule.code);
      if (!hit) {
        required_complete = false;
        notes.push(`Missing required assertion ${rule.code}.`);
      }
    }
  }

  const statuses = receipt.assertions.map((a) => a.status);
  let expected: SignedReceipt["verdict"] | null = null;
  if (statuses.includes("CONFLICTING") || statuses.includes("REVOKED")) {
    expected = "EXCEPTION";
  } else if (statuses.includes("FAILED")) {
    expected = receipt.verdict === "PARTIALLY_FULFILLED" ? "PARTIALLY_FULFILLED" : "FAILED";
  } else if (statuses.includes("INSUFFICIENT")) {
    expected = "INSUFFICIENT_EVIDENCE";
  } else {
    expected = receipt.verdict === "PARTIALLY_FULFILLED" ? "PARTIALLY_FULFILLED" : "VERIFIED";
  }
  const verdict_consistent =
    receipt.verdict === expected ||
    (receipt.verdict === "PARTIALLY_FULFILLED" && expected === "FAILED");
  if (!verdict_consistent) {
    notes.push(`Verdict ${receipt.verdict} is inconsistent with assertion statuses.`);
  }

  let not_asserted_complete = true;
  if (policy) {
    for (const item of policy.not_asserted) {
      if (!receipt.not_asserted.some((n) => n.code === item.code)) {
        not_asserted_complete = false;
        notes.push(`Receipt omits required NOT ASSERTED claim ${item.code}.`);
      }
    }
  }

  let chain_ok = true;
  if (receipt.previous_receipt_id) {
    const prior = chain.find((r) => r.receipt_id === receipt.previous_receipt_id);
    if (!prior) {
      chain_ok = false;
      notes.push("Previous receipt is not available to this verifier.");
    }
  }
  if (receipt.supersedes_receipt_id) {
    const older = chain.find((r) => r.receipt_id === receipt.supersedes_receipt_id);
    if (!older) {
      chain_ok = false;
      notes.push("Superseded receipt is not available to this verifier.");
    }
  }

  if (
    receipt.verdict === "VERIFIED" &&
    receipt.not_asserted.length === 0
  ) {
    notes.push("A VERIFIED receipt must still name what was not asserted.");
    not_asserted_complete = false;
  }

  const ok =
    digest_matches &&
    signature_valid &&
    policy_known &&
    policy_hash_matches &&
    required_complete &&
    verdict_consistent &&
    not_asserted_complete &&
    chain_ok;

  if (ok) notes.push("Independent verification passed. History is intact.");

  return {
    ok,
    digest_matches,
    computed_digest: computed,
    stated_digest: receipt.receipt_digest,
    signature_valid,
    signer_key_id: receipt.signature?.key_id ?? null,
    policy_known,
    policy_hash_matches,
    required_complete,
    verdict_consistent,
    not_asserted_complete,
    chain_ok,
    notes,
  };
}

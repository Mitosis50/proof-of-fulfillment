import type { SignedReceipt } from "./types.ts";

const DIGEST = /^(?:sha256:)?([0-9a-f]{64})$/i;

/** Full SHA-256 only. A short prefix is not a lookup key. */
export function normalizeDigest(input: string): string | null {
  const match = input.trim().match(DIGEST);
  if (!match) return null;
  return `sha256:${match[1].toLowerCase()}`;
}

export type ReceiptLookup =
  | { ok: true; via: "id" | "digest"; receipt: SignedReceipt }
  | { ok: false; via: "id" | "digest" };

/**
 * Find a receipt this explorer already holds.
 * A digest names a receipt. It is not the receipt.
 * Unknown digest → not here. Bring the file or the share link.
 */
export function lookupReceipt(
  query: string,
  receipts: SignedReceipt[],
): ReceiptLookup {
  const digest = normalizeDigest(query);
  if (digest) {
    const receipt = receipts.find((r) => r.receipt_digest === digest);
    return receipt
      ? { ok: true, via: "digest", receipt }
      : { ok: false, via: "digest" };
  }
  const id = query.trim();
  if (!id) return { ok: false, via: "id" };
  const receipt = receipts.find((r) => r.receipt_id === id);
  return receipt ? { ok: true, via: "id", receipt } : { ok: false, via: "id" };
}

/**
 * Camera target for the paper QR. Digest only — never the portable JSON,
 * never a person.
 */
export function digestVerifyUrl(origin: string, digest: string): string | null {
  const normalized = normalizeDigest(digest);
  if (!normalized) return null;
  try {
    const url = new URL("/verify", origin);
    url.searchParams.set("digest", normalized);
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * A portable fulfillment receipt can leave this machine.
 * It is the public receipt plus ancestor receipts. It is not a person.
 */
import { PRODUCT_NAMES } from "./naming.ts";
import type { SignedReceipt } from "./types.ts";

export const PORTABLE_RECORD = "pof.portable_receipt" as const;

export type PortableReceipt = {
  record_type: typeof PORTABLE_RECORD;
  schema_version: "1.0.0";
  notice: typeof PRODUCT_NAMES.tagline;
  receipt: SignedReceipt;
  chain: SignedReceipt[];
};

export type PortableParse =
  | { ok: true; receipt: SignedReceipt; chain: SignedReceipt[] }
  | { ok: false; error: string };

const BANNED_KEYS = [
  "email",
  "phone",
  "ssn",
  "name",
  "given_name",
  "family_name",
  "full_name",
  "student_name",
  "patient_name",
  "tenant_name",
  "date_of_birth",
  "dob",
  "diagnosis",
  "address",
  "iban",
  "account_number",
  "card_number",
  "national_id",
  "passport",
  "private_key",
  "password",
  "secret",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function portableFilename(receipt: SignedReceipt): string {
  return `${receipt.receipt_id}.pof.json`;
}

export function collectAncestors(
  receipt: SignedReceipt,
  library: SignedReceipt[],
): SignedReceipt[] {
  const byId = new Map(library.map((r) => [r.receipt_id, r]));
  const out: SignedReceipt[] = [];
  const seen = new Set<string>([receipt.receipt_id]);
  const walk = (id: string | null) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    const node = byId.get(id);
    if (!node) return;
    out.push(node);
    walk(node.previous_receipt_id);
    walk(node.supersedes_receipt_id);
  };
  walk(receipt.previous_receipt_id);
  walk(receipt.supersedes_receipt_id);
  return out;
}

export function packPortable(
  receipt: SignedReceipt,
  library: SignedReceipt[] = [],
): PortableReceipt {
  return {
    record_type: PORTABLE_RECORD,
    schema_version: "1.0.0",
    notice: PRODUCT_NAMES.tagline,
    receipt,
    chain: collectAncestors(receipt, library),
  };
}

export function serializePortable(portable: PortableReceipt): string {
  return `${JSON.stringify(portable, null, 2)}\n`;
}

export const PORTABLE_HASH_PREFIX = "pof=";

function bytesToB64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  const b64 = btoa(bin);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function encodePortableFragment(portable: PortableReceipt): string {
  const compact = JSON.stringify(portable);
  return `${PORTABLE_HASH_PREFIX}${bytesToB64Url(new TextEncoder().encode(compact))}`;
}

export function decodePortableFragment(hash: string): PortableParse {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw.startsWith(PORTABLE_HASH_PREFIX)) {
    return { ok: false, error: "That link is not a portable fulfillment receipt." };
  }
  try {
    const json = new TextDecoder().decode(b64UrlToBytes(raw.slice(PORTABLE_HASH_PREFIX.length)));
    return parsePortable(json);
  } catch {
    return { ok: false, error: "That link could not be read." };
  }
}

export function portableSharePath(
  receipt: SignedReceipt,
  library: SignedReceipt[] = [],
): string {
  return `/verify#${encodePortableFragment(packPortable(receipt, library))}`;
}


export function privacyScan(value: unknown, path = "$"): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    if (EMAIL_RE.test(value.trim())) {
      return `${path} looks like an email. A portable receipt is not a person.`;
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const hit = privacyScan(value[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      const lower = key.toLowerCase();
      if ((BANNED_KEYS as readonly string[]).includes(lower)) {
        return `${path}.${key} is a private-life field. Refused.`;
      }
      const hit = privacyScan(child, `${path}.${key}`);
      if (hit) return hit;
    }
  }
  return null;
}

function isSignedReceipt(value: unknown): value is SignedReceipt {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  if (r.record_type !== "pof.receipt") return false;
  if (typeof r.receipt_id !== "string" || !r.receipt_id) return false;
  if (typeof r.receipt_digest !== "string" || !r.receipt_digest) return false;
  if (!r.signature || typeof r.signature !== "object") return false;
  if (!r.subject || typeof r.subject !== "object") return false;
  if (!Array.isArray(r.assertions) || !Array.isArray(r.not_asserted)) return false;
  return true;
}

export function parsePortable(text: string): PortableParse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file is not JSON." };
  }

  const leak = privacyScan(parsed);
  if (leak) return { ok: false, error: leak };

  if (isSignedReceipt(parsed)) {
    return { ok: true, receipt: parsed, chain: [] };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "That JSON is not a fulfillment receipt." };
  }

  const envelope = parsed as Record<string, unknown>;
  if (envelope.record_type !== PORTABLE_RECORD) {
    return {
      ok: false,
      error: "That JSON is not a portable fulfillment receipt.",
    };
  }
  if (!isSignedReceipt(envelope.receipt)) {
    return { ok: false, error: "The envelope does not contain a fulfillment receipt." };
  }
  const chain = Array.isArray(envelope.chain)
    ? envelope.chain.filter(isSignedReceipt)
    : [];
  return { ok: true, receipt: envelope.receipt, chain };
}

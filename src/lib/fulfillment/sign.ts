import type { ReceiptSignature } from "./types.ts";
import { utf8 } from "./canonical.ts";

/**
 * Demo verifier key for this explorer.
 * The private key is published on purpose. It proves the explorer issued a
 * receipt. It is not a production certificate authority.
 */
export const EXPLORER_VERIFIER = {
  key_id: "fulfilled-explorer-ed25519-v1",
  alg: "Ed25519" as const,
  label: "Fulfilled explorer verifier v1",
  pkcs8_hex:
    "302e020100300506032b65700422042017af564edd96762099e00a642271c7af88de8c1e58caadde882cfca763e75a82",
  spki_hex:
    "302a300506032b657003210029c5f37eea414db60e1db4de1369d5a88cd3ddb402e49d759302383237e49f4a",
  public_key_hex:
    "29c5f37eea414db60e1db4de1369d5a88cd3ddb402e49d759302383237e49f4a",
};

const HEX = "0123456789abcdef";

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let out = "";
  for (const b of bytes) {
    out += HEX[b >> 4] + HEX[b & 15];
  }
  return out;
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function signatureMessage(digest: string): Uint8Array {
  return utf8(`pof.receipt.sig.v1\n${digest}`);
}

let privateKey: Promise<CryptoKey> | null = null;
let publicKey: Promise<CryptoKey> | null = null;

function importPrivate(): Promise<CryptoKey> {
  if (!privateKey) {
    privateKey = crypto.subtle.importKey(
      "pkcs8",
      hexToBytes(EXPLORER_VERIFIER.pkcs8_hex) as BufferSource,
      { name: "Ed25519" },
      false,
      ["sign"],
    );
  }
  return privateKey;
}

function importPublic(): Promise<CryptoKey> {
  if (!publicKey) {
    publicKey = crypto.subtle.importKey(
      "spki",
      hexToBytes(EXPLORER_VERIFIER.spki_hex) as BufferSource,
      { name: "Ed25519" },
      true,
      ["verify"],
    );
  }
  return publicKey;
}

export async function signReceiptDigest(digest: string): Promise<ReceiptSignature> {
  const key = await importPrivate();
  const sig = await crypto.subtle.sign(
    "Ed25519",
    key,
    signatureMessage(digest) as BufferSource,
  );
  return {
    alg: EXPLORER_VERIFIER.alg,
    key_id: EXPLORER_VERIFIER.key_id,
    public_key: EXPLORER_VERIFIER.public_key_hex,
    signature: toHex(sig),
  };
}

export async function verifyReceiptSignature(
  digest: string,
  seal: ReceiptSignature | undefined,
): Promise<{ ok: boolean; note: string }> {
  if (!seal) {
    return { ok: false, note: "Receipt is unsigned." };
  }
  if (seal.alg !== "Ed25519") {
    return { ok: false, note: `Unsupported signature algorithm ${seal.alg}.` };
  }
  if (
    seal.key_id !== EXPLORER_VERIFIER.key_id ||
    seal.public_key !== EXPLORER_VERIFIER.public_key_hex
  ) {
    return {
      ok: false,
      note: "Signer is not the published Fulfilled explorer verifier.",
    };
  }
  try {
    const key = await importPublic();
    const ok = await crypto.subtle.verify(
      "Ed25519",
      key,
      hexToBytes(seal.signature) as BufferSource,
      signatureMessage(digest) as BufferSource,
    );
    return ok
      ? { ok: true, note: `Signed by ${EXPLORER_VERIFIER.label}.` }
      : { ok: false, note: "Signature does not match the receipt digest." };
  } catch {
    return { ok: false, note: "Signature could not be verified." };
  }
}

export function detachSeal<T extends { receipt_digest?: string; signature?: ReceiptSignature }>(
  receipt: T,
): Omit<T, "receipt_digest" | "signature"> {
  const { receipt_digest: _digest, signature: _seal, ...payload } = receipt;
  return payload;
}

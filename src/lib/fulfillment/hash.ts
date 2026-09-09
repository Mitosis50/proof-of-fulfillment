import { canonicalize, utf8 } from "./canonical.ts";

const HEX = "0123456789abcdef";

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let out = "";
  for (const b of bytes) {
    out += HEX[b >> 4] + HEX[b & 15];
  }
  return out;
}

export async function sha256Hex(data: Uint8Array | string): Promise<string> {
  const bytes = typeof data === "string" ? utf8(data) : data;
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    bytes as BufferSource,
  );
  return toHex(digest);
}

export async function domainHash(tag: string, payload: unknown): Promise<string> {
  const body = `${tag}\n${canonicalize(payload)}`;
  return `sha256:${await sha256Hex(body)}`;
}

export async function hashCanonical(payload: unknown): Promise<string> {
  return `sha256:${await sha256Hex(canonicalize(payload))}`;
}

export function shortDigest(digest: string, n = 12): string {
  const hex = digest.replace(/^sha256:/, "");
  return `${hex.slice(0, n)}…${hex.slice(-4)}`;
}

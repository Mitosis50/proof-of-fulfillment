import { LOCKED_POLICY_HASHES } from "./golden.ts";
import { AGENT_CONTRACT } from "./agent-contract.ts";
import { PRODUCT_NAMES } from "./naming.ts";

const EDU = LOCKED_POLICY_HASHES["EDU-TUITION@1.0.0"];
const CARE = LOCKED_POLICY_HASHES["CARE-CONSULT@1.0.0"];
const RENT = LOCKED_POLICY_HASHES["HOUSING-RENT@1.0.0"];

export const WHITEPAPER = {
  title: "Proof of Fulfillment",
  edition: "v1.0.0",
  tagline: PRODUCT_NAMES.tagline,
  digest_tag: AGENT_CONTRACT.digest_tag,
  hashes: { edu: EDU, care: CARE, rent: RENT },
} as const;

export function whitepaperMarkdown(): string {
  return `# Proof of Fulfillment

**${PRODUCT_NAMES.tagline}**

Edition ${WHITEPAPER.edition}. Protocol: ${PRODUCT_NAMES.protocol}. Product: ${PRODUCT_NAMES.product}. Object: a ${PRODUCT_NAMES.object}.

This is a protocol paper. It is not a sales deck. It does not onboard a school, a clinic, or a landlord. The public explorer is synthetic. Its signing key is not a production authority.

## 1. The problem we refuse to solve the usual way

Money is often sent for a bounded obligation: one term of tuition, one licensed consult, one month of rent. The sender wants to know whether that obligation was fulfilled. The usual proof is a person — a name, a grade, a diagnosis, a household roster.

We do not publish the person. We verify the obligation.

## 2. What a fulfillment receipt is

A fulfillment receipt is the durable output of one evaluation against one immutable policy version. It is not reality. It is not a score. It is not a student, a patient, or a tenant.

The public record holds:

- the class of destination (institution, licensed provider, landlord)
- required assertions and their statuses
- a not-asserted list
- a policy hash
- a receipt digest
- an optional detached signature

It does not hold names, emails, diagnoses, grades, invoices, or bank identifiers.

## 3. What we will not say

Every policy ships a not-asserted list. A VERIFIED receipt must still carry it. Removing a not-asserted claim is a failed verification, even if the digest is recomputed.

- Tuition does not assert academic performance, grades, attendance, or private student records.
- Consult does not assert clinical correctness, diagnosis, treatment effectiveness, medical necessity, or private medical records.
- Rent does not assert tenant creditworthiness, household roster, housing quality, neighborhood safety, eviction history, or private tenant records.

If copy, a demo, or an agent says the opposite, it is not this protocol.

## 4. How a check works

Bytes are canonicalized (RFC 8785-style JCS). The digest is SHA-256 over the tag \`${AGENT_CONTRACT.digest_tag}\` and those bytes. The signature is Ed25519 on the digest only. The signature is never inside the hashed payload.

Independent verify does not reuse the issuer. It reports **Holds** only if every check is true:

${AGENT_CONTRACT.holds_when.map((c) => `- \`${c}\``).join("\n")}

One false is **Does not hold**. Conversation is not authority. A chat may not mint VERIFIED, authorize payment, or rewrite a policy.

## 5. Three frozen policies

A policy version never mutates after it has issued a receipt. A one-byte change is a new version, with a new hash.

| Policy | Version | Hash |
| --- | --- | --- |
| EDU-TUITION | 1.0.0 | \`${EDU}\` |
| CARE-CONSULT | 1.0.0 | \`${CARE}\` |
| HOUSING-RENT | 1.0.0 | \`${RENT}\` |

The pin is \`/registry\` and \`/registry.json\`. Tests fail if those hashes drift.

## 6. How a receipt leaves this machine

- A portable file: \`pof.portable_receipt\`. Privacy scan refuses a person.
- A share fragment: \`#pof=\`. The fragment is not sent to a server.
- A paper sheet, with the full digest, printable or saved as PDF.
- A QR on that sheet: \`/verify?digest=sha256:…\`. A digest names a receipt; it is not the receipt. Unknown digest does not hold here.

## 7. Agents

Machines may parse, recompute, and report Holds or Does not hold. They may not mint VERIFIED. They may not publish a person. The contract is \`/agents\`.

## 8. What this explorer is not

It is not a credit bureau, a healing claim, a gradebook, or a ledger of people. It does not move funds. Families are not charged for a verdict. No one is paid more for PASS than FAIL.

Golden cases are synthetic. Live workshop issuances are synthetic. Do not put a real student, patient, or tenant on this explorer.

## 9. How to pin this paper

Source: Apache 2.0, [Mitosis50/proof-of-fulfillment](https://github.com/Mitosis50/proof-of-fulfillment).

Public explorer: the Vercel project you own. Send \`/share\` if you need a card. Send this page if you need the protocol.

If a future edit changes a frozen verdict, drops a not-asserted code, or lets an agent mint VERIFIED, the suite fails. That is the authority. We are not.
`;
}

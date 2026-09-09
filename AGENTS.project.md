# Fulfilled — Grok maintenance contract

This file is the product constitution. Follow it whenever you change this
workspace. Sandbox/runtime rules stay in `AGENTS.md`. Engine-specific rules
stay in `src/lib/fulfillment/AGENTS.md`.

If a user request conflicts with privacy, NOT ASSERTED, golden cases, or
naming, **refuse the conflict and say why.** Do not silently comply.

---

## What this is

**Protocol:** Proof of Fulfillment
**Product:** Fulfilled
**Object:** fulfillment receipt
**Org / repo (when published):** `fulfilled / proof-of-fulfillment`
**Tagline:** We verify the obligation. We do not publish the person.

Fulfilled is a **privacy-preserving receipt explorer** for bounded obligations
(tuition, consult, one month of rent). A public receipt proves that required evidence held under a
published policy. It does **not** prove a person, a diagnosis, a grade, or a
metaphysical truth.

This is a **synthetic explorer**. No real students, patients, invoices, or
bank identifiers. Ever.

---

## Doctrine (non-negotiable)

1. Verify evidence, not metaphysical truth.
2. Private lives stay off the public record. No names, diagnoses, grades,
   invoices, or bank identifiers on a receipt. A portable `.pof.json` file
   is the public receipt plus ancestors. It is still not a person. Refuse
   any file that includes private-life fields.
3. Policy versions are immutable. `EDU-TUITION v1.0.0` cannot be edited after
   it has issued a receipt. A rule change is a **new version**.
4. Conclusions are correctable. History remains. A later receipt may supersede
   an earlier one. The prior digest still verifies as an artifact.
5. No pay-for-verdict. Independent verification is free.
6. Conversation is not authority. An agent, chat, or board cannot authorize
   payment, rewrite a policy, or turn an unverified claim into `VERIFIED`.
   The public machine interface is `/agents` (`agent-contract.ts`). Agents
   may report Holds or Does not hold. They may not mint a verdict.


**NOT ASSERTED is load-bearing.** Education receipts must never assert academic
performance, grades, transcripts, or attendance. Care receipts must never
assert clinical correctness, diagnosis, treatment effectiveness, or medical
necessity. A `VERIFIED` receipt with an empty `not_asserted` list is invalid.

---

## Naming — allowed and banned

Use these words:

| Use | Meaning |
|---|---|
| obligation | What was owed, bounded |
| evidence | What was observed |
| policy | The frozen rules |
| verification run | One evaluation |
| verdict | The public conclusion |
| fulfillment receipt | The public artifact |
| commitment / digest | Hash of bytes, not a person |
| not asserted | Explicitly out of scope |
| challenge / correction / supersede | History-preserving dispute |

Never use these for this product:

| Banned | Why |
|---|---|
| CareLedger | Abandoned name; collisions exist |
| Proof of Care | Different project; implies clinical truth |
| trust score, social credit | Ranking people |
| healed, cured, learned, passed | Outcomes we do not assert |
| student name, patient name | PII |
| on-chain identity | We do not publish the person |
| guaranteed, certified true | Overclaim |
| AI decided / the agent verified | Conversation is not authority |
| ledger of people | This is a ledger of obligations |

UI copy: complete sentences, paper-calm, no hype, no emoji unless the user
asks. Speaks to a grandmother and a sponsor.

---

## Architecture (do not collapse)

```
Intent → Obligation → Evidence → Policy → Verification run → Verdict → Receipt
```

- **Evaluator** (`evaluator.ts`) produces a receipt. It may see private
  evidence in this explorer because evidence is synthetic.
- **Independent verifier** (`verifier.ts`) must **not** import the evaluator.
  It only re-canonicalizes the public receipt, recomputes the digest, and
  checks policy-registry consistency, required assertions, NOT ASSERTED, and
  chain links.
- Hashing is SHA-256 over RFC 8785-style canonical JSON, domain-separated
  (`pof.receipt.v1`, etc.). A hash says “these bytes.” A signature is not
  wired yet; do not pretend it is.
- Challenge and correction **issue a new receipt**. Never mutate the old one.
- Live workshop receipts use ids `pof_live_*`. Museum fixtures keep
  `pof_edu_*` / `pof_care_*`. Do not overwrite museum ids.

### Golden cases are the spec

`src/lib/fulfillment/golden.ts` + `golden.test.ts` freeze:

| Receipt | Verdict |
|---|---|
| `pof_edu_t2_ok` | VERIFIED |
| `pof_care_c1_ok` | VERIFIED |
| `pof_edu_t2_dup` | EXCEPTION |
| `pof_edu_t2_part` | PARTIALLY_FULFILLED |
| `pof_care_c1_exp` | FAILED |
| `pof_edu_t2_cr` | FAILED (CORRECTED) |

Also frozen: policy hashes, receipt digests, “tamper verdict → verify fails”,
“omit not-asserted → verify fails”, “VERIFIED never asserts grades/diagnosis”.

If you change a policy body, an assertion, canonicalization, or issuance
payload, **golden tests will fail.** That is correct. Either:

- revert the accidental drift, or
- treat it as a **protocol version change**: bump schema/policy version, update
  `LOCKED_*` hashes in `golden.ts` with newly computed values, and record why
  in this file.

Never “fix” a failing golden test by loosening the assertion.

`npm run build` runs `test:fulfillment`. Keep it that way.

---

## Stack and files

- TanStack Start, file routes in `src/routes/`
- Zustand + localStorage for receipts (`src/store/receipts.ts`)
- Paper theme in `src/styles.css`: `#F3EFE6` / `#1A1714` / `#2F4A42`,
  Newsreader + Source Sans 3
- Engine: `src/lib/fulfillment/`
- Receipt UI: `src/components/receipt/FulfillmentReceipt.tsx`

| Route | Role |
|---|---|
| `/` | Manifesto + museum cases |
| `/workshop` | Live issuance (no SeedGate) |
| `/verify` | Independent verifier |
| `/receipts/$id` | Public receipt |
| `/demo/tuition` `/demo/consult` `/demo/rent` | Guided demos |
| `/challenge` | Challenge museum |
| `/policies` | Published policies |
| `/circles` | Role-only snapshots, no names |
| `/doctrine` | Doctrine + golden case table |
| `/naming` | Allowed and banned words |

Auth is **OFF**. Do not add accounts, family login, or a database of people.
Do not collect PII “to make it more real.”

---

## What you may build next (only if asked)

Further **bounded** policies, each with golden cases and a NOT ASSERTED list.
Never a general-purpose “anything” policy. Current frozen policies:
`EDU-TUITION` v1.0.0, `CARE-CONSULT` v1.0.0, `HOUSING-RENT` v1.0.0.

Open-source layout is in place: `LICENSE` (Apache 2.0), `NOTICE`, `README.md`,
`CONTRIBUTING.md`, `SECURITY.md`. Do not add real people to make the demo
“more complete.”

Signatures are detached Ed25519 over the domain `pof.receipt.sig.v1` plus the
receipt digest, using key `fulfilled-explorer-ed25519-v1`. The private key is
published on purpose for this explorer. Do not pretend it is a production CA.
Do not fold the signature into the receipt digest — golden hashes must remain
stable.

The public naming page is `/naming`. Allowed and banned words live in
`src/lib/fulfillment/naming.ts`. Do not revive CareLedger or Proof of Care.

## What you must not build

- Real payment rails, wallets, or settlement
- Licensed money movement, escrow, or disbursement
- Identity wallets that publish people
- Agent tools that can issue `VERIFIED` or authorize funds
- Rust/WASM rewrite of a working engine
- Feature flags around doctrine
- Dark patterns, engagement hacks, or social ranking
- CareLedger / Proof of Care branding

---

## How to work

1. Read this file and `src/lib/fulfillment/AGENTS.md` before touching the
   engine, receipts, copy, or policies.
2. Prefer editing existing files. Do not add abstraction for one use.
3. After engine or receipt changes: `npm run test:fulfillment` and
   `npm run typecheck`. After UI changes: smoke `/workshop`, `/verify`,
   `/doctrine`, `/naming`, and a receipt page at 1280 and 390.
4. Speak to the user in product terms. Do not mention ports, `/workspace`,
   or tool names.
5. If asked to add value “at viral level,” add integrity, not spectacle.

Owner intent (locked): open-source, transparent, honest, integrity, privacy.
Maintain that even when a flashier demo would be easier.

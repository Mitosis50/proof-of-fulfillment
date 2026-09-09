# Contributing to Fulfilled

Patches are welcome when they add integrity, not spectacle.

This explorer is synthetic. **Do not contribute real student, patient,
invoice, or bank data.** If a patch would publish a person, assert a clinical
or academic outcome, mutate an issued receipt, or loosen a golden test, it
will be refused.

## Before you write code

1. Read [`AGENTS.project.md`](AGENTS.project.md) (product constitution).
2. Read [`src/lib/fulfillment/AGENTS.md`](src/lib/fulfillment/AGENTS.md)
   if you touch the engine.
3. Read the **Naming** page, or [`src/lib/fulfillment/naming.ts`](src/lib/fulfillment/naming.ts).
   Do not revive CareLedger or Proof of Care. Do not rank people.

## The spec is the golden suite

```bash
npm run test:fulfillment
npm run typecheck
```

`src/lib/fulfillment/golden.ts` freezes verdicts, not-asserted lists, policy
hashes, and receipt digests. If your change moves a digest:

- Accidental: revert.
- Intentional protocol change: bump the policy or schema version, replace
  only the hashes that must change, and explain why in `AGENTS.project.md`.
  Never silently edit `EDU-TUITION` v1.0.0 or `CARE-CONSULT` v1.0.0.

Never “fix” a failing golden test by weakening the assertion.

## Engine rules that do not move

- Canonicalize before hash (sorted keys, integers only for money and counts).
- Domain-separate hashes. Receipts use `pof.receipt.v1`.
- The independent verifier must not import the evaluator.
- Signatures are **detached**. Hash the public payload, then sign the digest.
  Do not fold `signature` or `receipt_digest` into the hashed bytes.
- Challenge, correct, and supersede issue a **new** receipt. Do not mutate
  the old one.
- Every receipt copies the policy’s NOT ASSERTED list. Omitting it is a
  verifier failure even if you recompute the digest.
- Relative imports inside `src/lib/fulfillment/` use `.ts` extensions so the
  golden tests can run under Node.

## Adding a policy

A new policy is a bounded obligation, not a general-purpose “anything.”

It needs:

- A frozen body in `policies.ts` (required assertions + `not_asserted`)
- At least one VERIFIED and one FAILED or EXCEPTION golden case
- Entries in `GOLDEN_CASES` and `LOCKED_*`
- No academic or clinical outcome codes on the asserted side

## Copy

Complete sentences. Paper-calm. No hype. Speaks to a grandmother and a
sponsor. Allowed words describe obligations. Banned words rank people.

## What not to send

- Payment rails, wallets, or licensed settlement
- Accounts, family login, or a database of people
- Agent tools that can issue `VERIFIED` or authorize funds
- Feature flags around doctrine
- A Rust rewrite of a working engine

## License of contributions

Unless you state otherwise, contributions are accepted under the Apache
License 2.0, without additional terms. See [`LICENSE`](LICENSE).

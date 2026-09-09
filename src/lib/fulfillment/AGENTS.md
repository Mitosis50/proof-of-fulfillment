# Proof of Fulfillment engine

Nested product rules for `src/lib/fulfillment/`. These override
`AGENTS.project.md` only where they are more specific.

## Invariants

1. **Canonicalize before hash.** `canonical.ts` is RFC 8785-style: sorted
   keys, no `undefined`, integers only for money and counts. Pretty JSON is
   not a digest input.
2. **Domain-separate hashes.** `domainHash(tag, payload)` prefixes
   `tag` plus a newline plus `canonicalize(payload)`. Receipts use `pof.receipt.v1`.
   Do not reuse tags across record types.
3. **The verifier does not import the evaluator.** `verifier.ts` may import
   `hash`, `policies`, `types`, and `sign` (verify only). If you need to “just
   call evaluate again,” you are collapsing the split. Stop.
4. **Receipt digest is over the public payload without `receipt_digest` or
   `signature`.** `issueReceipt` hashes, then signs the digest, then attaches
   both. `verifyIndependently` uses `detachSeal`, then rehashes. Keep signatures
   off the digest so golden hashes stay frozen.
5. **Do not mutate issued receipts.** Challenge, correct, and supersede call
   `issueReceipt` with a new id and `previous_receipt_id` /
   `supersedes_receipt_id`. Museum fixture ids are frozen in `golden.ts`.
6. **NOT ASSERTED is copied from the signed policy onto every receipt.**
   Omitting it is a verifier failure, even if the digest is recomputed.
7. **Relative imports inside this folder use `.ts` extensions** so
   `node --experimental-strip-types` can run `golden.test.ts`.
8. **The explorer Ed25519 key is a published demo key** in `sign.ts`. Hash =
   these bytes. Signature = this explorer stood behind them. Not a CA.

## Changing a golden digest

`LOCKED_POLICY_HASHES` and `LOCKED_RECEIPT_DIGESTS` in `golden.ts` are the
protocol freeze.

If a test fails after an intentional, versioned change:

1. Bump `schema_version` and/or policy `version`. Never silently edit v1.0.0.
2. Recompute hashes with the same engine (see `golden.test.ts` / `signPolicy`
   / `buildDemoLibrary`).
3. Replace only the hashes that must change. Explain the version bump in
   `AGENTS.project.md`.
4. Confirm tamper, unsigned, and not-asserted tests still fail closed.

If a test fails after an accidental edit: revert. Do not update the lock.

## Adding a policy

A new policy needs:

- Frozen body in `policies.ts` (required assertions + `not_asserted`)
- At least one VERIFIED and one FAILED/EXCEPTION golden case
- Entries in `GOLDEN_CASES` and `LOCKED_*`
- No academic or clinical outcome codes on the asserted side

## Workshop vs museum

- `fixtures.ts` — deterministic museum library. Digests locked.
- `workshop.ts` — live issuance from evidence flags. Ids `pof_live_*`.
  Live receipts are not golden; their *evaluation rules* still are.
- `portable.ts` — a receipt that can leave this machine. Envelope
  `pof.portable_receipt` wraps the signed public receipt plus ancestors.
  Privacy scan refuses names, emails, diagnoses. Share links use the URL
  fragment (`#pof=`), never a query string, so a server log does not keep
  the receipt. Do not put private lives in the file. Do not put the
  envelope inside the digest.
- `paper.ts` — the sheet a human can print or save as PDF. Digest,
  not-asserted, tagline. No person. Print CSS hides chrome.
- `lookup.ts` — find a receipt this explorer already holds, by id or by
  full SHA-256. A digest names a receipt; it is not the receipt. Short
  prefixes are not keys. An unknown digest does not hold here.
  `/verify?digest=` opens the independent check when the bytes are here.








## Tests

```
npm run test:fulfillment
```

Must stay on the `build` script. A green UI with a red golden suite is a
failed change.

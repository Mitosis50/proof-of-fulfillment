# Fulfilled

**Protocol:** Proof of Fulfillment
**Object:** fulfillment receipt
**License:** Apache License 2.0

> We verify the obligation. We do not publish the person.

Fulfilled is a privacy-preserving receipt explorer for bounded obligations
(one term of tuition, one licensed consult, one month of rent). A public receipt proves that
required evidence held under a published policy. It does not prove a person,
a diagnosis, a grade, or a metaphysical truth.

This repository is a **synthetic explorer**. There are no real students,
patients, invoices, or bank identifiers. Do not add them.

## What this is

```
Intent → Obligation → Evidence → Policy → Verification run → Verdict → Receipt
```

| Artifact | What it binds | What it does not contain |
|---|---|---|
| Policy hash | Frozen rules (`EDU-TUITION`, `CARE-CONSULT`, `HOUSING-RENT` v1.0.0) | Tomorrow’s edited rules |
| Obligation commitment | Type, period, destination, amount, opaque case ref | A student’s name |
| Evidence root | Assertion codes, statuses, levels | The invoice PDF, the chart note |
| Receipt digest | Canonical public payload | Private lives |
| Detached Ed25519 signature | That this explorer stood behind that digest | A production certificate authority |

Hash = these bytes. Signature = this explorer stood behind them. The demo
key id is `fulfilled-explorer-ed25519-v1`. The private key is published on
purpose. It is not a CA.

Independent verification does **not** reuse the issuance engine. It
re-canonicalizes, recomputes the digest, checks the signature, and checks
the policy registry, required assertions, NOT ASSERTED list, and chain.

## What this is not

- Not CareLedger. Not Proof of Care.
- Not a trust score, social credit, or ledger of people.
- Not a claim that a child learned or a patient was healed.
- Not a payment rail, wallet, or licensed settlement system.
- Not an agent that can authorize funds or mint `VERIFIED`.

Education receipts never assert academic performance, grades, transcripts,
or attendance. Care receipts never assert clinical correctness, diagnosis,
treatment effectiveness, or medical necessity. Housing receipts never assert
creditworthiness, household roster, housing quality, or eviction history. A
`VERIFIED` receipt with an empty not-asserted list is invalid.

Language is load-bearing. See the in-app **Naming** page and
[`src/lib/fulfillment/naming.ts`](src/lib/fulfillment/naming.ts).

## Golden cases (the spec)

If a future edit changes any of these conclusions, the build fails.

| Receipt | Frozen verdict |
|---|---|
| `pof_edu_t2_ok` | Verified |
| `pof_care_c1_ok` | Verified |
| `pof_rent_m9_ok` | Verified |
| `pof_edu_t2_dup` | Exception |
| `pof_edu_t2_part` | Partially fulfilled |
| `pof_care_c1_exp` | Failed |
| `pof_rent_m9_dup` | Exception |
| `pof_rent_m9_vac` | Failed |
| `pof_edu_t2_cr` | Failed (corrected) |

Also frozen: policy hashes, receipt digests, “tamper the verdict → does not
hold”, “omit not-asserted → does not hold”, “flip a signature byte → does
not hold”. Digests are computed **without** the signature attached.

```bash
npm run test:fulfillment
npm run typecheck
```

`npm run build` runs the fulfillment tests. Do not remove that gate.

## Run the explorer

```bash
npm install
npm run dev
```

Then open **Workshop** (live issuance), **Verify** (independent check),
**Agents** (machine contract), **Doctrine**, and **Naming**. Museum receipts keep `pof_edu_*` / `pof_care_*` /
`pof_rent_*` ids. Live issuances use `pof_live_*`. Challenge and correction
issue a **new** receipt. History is not rewritten.

Print or save as PDF from **Print paper receipt**, or open `/paper/{id}`.
The sheet is the public receipt: assertions, not-asserted, full digest.
It is not a person. Use the browser’s Save as PDF. There is no name on it.
The paper sheet prints a QR to `/verify?digest=sha256:…`. Camera opens
the independent check. It does not encode a person or the portable file.






A receipt can leave this machine. Download `{receipt_id}.pof.json` from
Workshop, the receipt page, or Verify. The file is the public receipt plus
any ancestor receipts. It is not a person. Paste or open that file on Verify.
**Copy share link** puts the same bytes in the URL fragment (`/verify#pof=…`).
The fragment is not sent to a server. Same digest, same signature. Holds or
does not hold. A file or link with a name, email, or diagnosis is refused.


## Host it yourself (GitHub → Vercel)

This is the intended public home: a repository you own, a Vercel project you
own, a domain you own. grok.me is not the product name.

1. This tree is at [Mitosis50/proof-of-fulfillment](https://github.com/Mitosis50/proof-of-fulfillment).
2. In Vercel: **Add New Project** → import that repo.
3. Framework: leave unset (Nitro already emits Vercel’s build output).
4. Build command: `npm run build` (already in `vercel.json`).
5. Set `VITE_AUTH_ENABLED=false`. This explorer has no accounts and must not
   grow a database of people.
6. Deploy. Then in Vercel → **Domains**, attach the name you own.

Node 22. The build runs the golden fulfillment tests. If a verdict drifts, the
deploy fails. That is correct.

Squarespace cannot host this engine. A Squarespace page may **link** to the
Vercel domain. It cannot run the verifier.

## Doctrine

1. Verify evidence, not metaphysical truth.
2. Private lives stay off the public record.
3. Policy versions are immutable.
4. Conclusions are correctable. The prior digest still verifies.
5. No pay-for-verdict. Independent verification is free.
6. Conversation is not authority.

Maintenance rules for this product: [`AGENTS.project.md`](AGENTS.project.md).
Engine invariants: [`src/lib/fulfillment/AGENTS.md`](src/lib/fulfillment/AGENTS.md).
How to contribute: [`CONTRIBUTING.md`](CONTRIBUTING.md).
How to report harm: [`SECURITY.md`](SECURITY.md).

## License

Apache License 2.0. See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).
The patent grant is intentional: nobody should be able to patent-trap a
fulfillment receipt.

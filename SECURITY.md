# Security and privacy

Fulfilled verifies obligations. It does not publish people.

## Do not send private lives

Do not file issues, patches, or examples that contain real names, diagnoses,
grades, invoices, bank identifiers, addresses, or medical records. If you
pasted any of that, assume it is compromised on your side, redact it, and
do not send it here.

Synthetic fixtures and `pof_live_*` workshop receipts are the only evidence
this project will accept.

## What is not a vulnerability

- The published explorer Ed25519 key (`fulfilled-explorer-ed25519-v1`).
  It is a demo key. It proves this explorer issued a receipt. It is not a
  production CA.
- A receipt that says `VERIFIED` while listing academic or clinical outcomes
  as **not asserted**. That is the protocol working.
- Local, in-browser storage of synthetic receipts.

## What is a vulnerability

- A change that lets a `VERIFIED` receipt omit the not-asserted list
- A change that puts a name, diagnosis, or invoice on a public receipt
- A digest that stays stable after the payload is edited
- A signature that still holds after the digest is edited
- The independent verifier importing the issuance evaluator
- Any path that lets a chat, agent, or UI mint `VERIFIED` without evidence

Report those as protocol defects. A failing `npm run test:fulfillment` is
the preferred proof. Do not include production secrets or personal data in
the report.

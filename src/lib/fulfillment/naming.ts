/** Public language of Fulfilled. Changing a banned word to allowed is a doctrine change. */

export const PRODUCT_NAMES = {
  protocol: "Proof of Fulfillment",
  product: "Fulfilled",
  object: "fulfillment receipt",
  org: "fulfilled",
  repo: "proof-of-fulfillment",
  tagline: "We verify the obligation. We do not publish the person.",
} as const;

export const ALLOWED_WORDS = [
  {
    term: "obligation",
    meaning: "What was owed, bounded in time, amount, and destination.",
  },
  {
    term: "evidence",
    meaning: "What was observed under a policy, not a private life.",
  },
  {
    term: "policy",
    meaning: "The frozen rules. A one-byte change is a new version.",
  },
  {
    term: "verification run",
    meaning: "One evaluation of one obligation against one policy version.",
  },
  {
    term: "verdict",
    meaning: "The public conclusion: verified, failed, partial, exception, or insufficient.",
  },
  {
    term: "fulfillment receipt",
    meaning: "The public artifact. Commitments, statuses, and what was not asserted.",
  },
  {
    term: "commitment / digest",
    meaning: "A hash of bytes. It is not a person and it is not a name.",
  },
  {
    term: "not asserted",
    meaning: "Explicitly out of scope. Grades, diagnosis, and clinical correctness live here.",
  },
  {
    term: "challenge / correction / supersede",
    meaning: "History-preserving dispute. A later receipt. The prior digest still verifies.",
  },
] as const;

export const BANNED_WORDS = [
  {
    term: "CareLedger",
    why: "Abandoned name. Collisions exist. Do not revive it.",
  },
  {
    term: "Proof of Care",
    why: "A different project. It implies clinical truth we do not assert.",
  },
  {
    term: "trust score, social credit",
    why: "We do not rank people.",
  },
  {
    term: "healed, cured, learned, passed",
    why: "Outcomes this protocol does not and must not assert.",
  },
  {
    term: "student name, patient name",
    why: "Private lives stay off the public record.",
  },
  {
    term: "on-chain identity",
    why: "We verify the obligation. We do not publish the person.",
  },
  {
    term: "guaranteed, certified true",
    why: "A receipt is a policy verdict, not metaphysical truth.",
  },
  {
    term: "AI decided / the agent verified",
    why: "Conversation is not authority.",
  },
  {
    term: "ledger of people",
    why: "This is a ledger of obligations.",
  },
] as const;

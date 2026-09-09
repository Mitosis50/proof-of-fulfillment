export const EVIDENCE_LEVELS = ["A", "B", "C", "D", "E", "F"] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

export const ASSERTION_STATUSES = [
  "VERIFIED",
  "FAILED",
  "INSUFFICIENT",
  "CONFLICTING",
  "NOT_ASSERTED",
  "NOT_APPLICABLE",
  "REVOKED",
] as const;
export type AssertionStatus = (typeof ASSERTION_STATUSES)[number];

export const VERDICTS = [
  "VERIFIED",
  "FAILED",
  "INSUFFICIENT_EVIDENCE",
  "PARTIALLY_FULFILLED",
  "EXCEPTION",
] as const;
export type Verdict = (typeof VERDICTS)[number];

export const CHALLENGE_STATUSES = [
  "NONE",
  "CHALLENGED",
  "UPHELD",
  "CORRECTED",
  "SUPERSEDED",
  "REVOKED",
] as const;
export type ChallengeStatus = (typeof CHALLENGE_STATUSES)[number];

export const CHALLENGE_REASONS = [
  "WRONG_INSTITUTION",
  "WRONG_PROVIDER",
  "WRONG_TERM_OR_SERVICE_DATE",
  "DUPLICATE_OBLIGATION",
  "PAYMENT_NOT_SETTLED",
  "PAYMENT_REVERSED",
  "FORGED_OR_REVOKED_EVIDENCE",
  "UNAUTHORIZED_DISCLOSURE",
  "CONFLICTED_VERIFIER",
  "POLICY_MISAPPLIED",
  "IDENTITY_COMPROMISED",
] as const;
export type ChallengeReason = (typeof CHALLENGE_REASONS)[number];

export type PrivacyClass =
  | "PUBLIC_SAFE"
  | "OPERATIONAL"
  | "RESTRICTED"
  | "SENSITIVE"
  | "HIGHLY_SENSITIVE";

export type Money = {
  minor_units: number;
  currency: string;
};

export type EvidenceAssertion = {
  assertion_code: string;
  status: AssertionStatus;
  evidence_level: EvidenceLevel;
  issuer_ref: string;
  source_adapter: string;
  observed_at: string;
  valid_until?: string;
  value_commitment?: string;
  evidence_commitment?: string;
  privacy_class: PrivacyClass;
  notes?: string;
};

export type Obligation = {
  record_type: "pof.obligation";
  schema_version: "1.0.0";
  obligation_id: string;
  obligation_type: string;
  case_ref: string;
  institution_ref: string;
  purpose: string;
  period: string;
  authorized: Money;
  policy_id: string;
  policy_version: string;
  destination_class: string;
  duplicate_namespace: string;
};

export type EvidenceSet = {
  record_type: "pof.evidence_set";
  schema_version: "1.0.0";
  evidence_set_id: string;
  obligation_id: string;
  collected_at: string;
  assertions: EvidenceAssertion[];
  independence: {
    verifier_ref: string;
    funder_ref: string;
    beneficiary_ref: string;
    payee_ref: string;
    evidence_issuer_refs: string[];
  };
  duplicate_token_present: boolean;
  duplicate_match: boolean;
  settled_minor_units?: number;
};

export type PolicyRule = {
  code: string;
  min_level: EvidenceLevel;
  label: string;
  required: boolean;
  partial_ok?: boolean;
};

export type Policy = {
  record_type: "pof.policy";
  schema_version: "1.0.0";
  policy_id: string;
  version: string;
  title: string;
  domain: "education" | "care" | "housing";
  scope: string;
  required: PolicyRule[];
  not_asserted: { code: string; label: string }[];
  human_pass: string[];
  independence_required: boolean;
  duplicate_blocks: boolean;
};

export type SignedPolicy = Policy & {
  policy_hash: string;
};

export type PublicAssertion = {
  code: string;
  label: string;
  status: AssertionStatus;
  evidence_level: EvidenceLevel;
};

export type PublicReceipt = {
  record_type: "pof.receipt";
  schema_version: "1.0.0";
  receipt_id: string;
  obligation_commitment: string;
  policy: {
    id: string;
    version: string;
    hash: string;
    title: string;
  };
  verification: {
    run_id: string;
    evidence_root: string;
    verifier_ref: string;
    verifier_build_hash: string;
    verified_at: string;
  };
  subject: {
    obligation_type: string;
    period: string;
    purpose: string;
    destination_class: string;
    amount: Money;
  };
  assertions: PublicAssertion[];
  not_asserted: { code: string; label: string }[];
  verdict: Verdict;
  challenge_status: ChallengeStatus;
  previous_receipt_id: string | null;
  supersedes_receipt_id: string | null;
  challenge?: {
    reason: ChallengeReason;
    opened_at: string;
  };
  correction?: {
    reason: string;
    issued_at: string;
  };
};

export type ReceiptSignature = {
  alg: "Ed25519";
  key_id: string;
  public_key: string;
  signature: string;
};

export type SignedReceipt = PublicReceipt & {
  receipt_digest: string;
  signature: ReceiptSignature;
};

export type RuleResult = {
  code: string;
  label: string;
  status: AssertionStatus;
  evidence_level: EvidenceLevel | null;
  explanation: string;
};

export type EvaluationResult = {
  verdict: Verdict;
  rules: RuleResult[];
  obligation_commitment: string;
  evidence_root: string;
  policy_hash: string;
  explanations: string[];
};

export type IndependentReport = {
  ok: boolean;
  digest_matches: boolean;
  computed_digest: string;
  stated_digest: string;
  signature_valid: boolean;
  signer_key_id: string | null;
  policy_known: boolean;
  policy_hash_matches: boolean;
  required_complete: boolean;
  verdict_consistent: boolean;
  not_asserted_complete: boolean;
  chain_ok: boolean;
  notes: string[];
};

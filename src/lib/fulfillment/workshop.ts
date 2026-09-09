import type {
  ChallengeReason,
  EvidenceAssertion,
  EvidenceSet,
  Obligation,
  PublicReceipt,
  SignedReceipt,
} from "./types.ts";
import { domainHash } from "./hash.ts";
import { evaluate, issueReceipt } from "./evaluator.ts";
import { detachSeal, signReceiptDigest } from "./sign.ts";
import {
  CARE_CONSULT_V1,
  EDU_TUITION_V1,
  HOUSING_RENT_V1,
  signPolicy,
} from "./policies.ts";

export type PolicyKind = "tuition" | "consult" | "rent";
export type SettlementKind = "full" | "partial" | "reversed";

export type WorkshopFlags = {
  policy: PolicyKind;
  identity: boolean;
  event: boolean;
  matched: boolean;
  settlement: SettlementKind;
  duplicate: boolean;
  independence: boolean;
  credentialExpired: boolean;
};

export type RunContext = {
  flags: WorkshopFlags;
  obligation: Obligation;
  evidence: EvidenceSet;
  root_receipt_id: string;
};

export const DEFAULT_FLAGS: WorkshopFlags = {
  policy: "tuition",
  identity: true,
  event: true,
  matched: true,
  settlement: "full",
  duplicate: false,
  independence: true,
  credentialExpired: false,
};

export const CHALLENGE_REASON_LABELS: Record<ChallengeReason, string> = {
  WRONG_INSTITUTION: "Wrong institution",
  WRONG_PROVIDER: "Wrong provider",
  WRONG_TERM_OR_SERVICE_DATE: "Wrong term or service date",
  DUPLICATE_OBLIGATION: "Duplicate obligation",
  PAYMENT_NOT_SETTLED: "Payment not settled",
  PAYMENT_REVERSED: "Payment reversed",
  FORGED_OR_REVOKED_EVIDENCE: "Forged or revoked evidence",
  UNAUTHORIZED_DISCLOSURE: "Unauthorized disclosure",
  CONFLICTED_VERIFIER: "Conflicted verifier",
  POLICY_MISAPPLIED: "Policy misapplied",
  IDENTITY_COMPROMISED: "Identity compromised",
};

export function newOpaqueId(prefix: string): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}${hex}`;
}

function assertion(
  code: string,
  status: EvidenceAssertion["status"],
  level: EvidenceAssertion["evidence_level"],
  extra: Partial<EvidenceAssertion> = {},
): EvidenceAssertion {
  return {
    assertion_code: code,
    status,
    evidence_level: level,
    issuer_ref: extra.issuer_ref ?? "opaque:issuer-01",
    source_adapter: extra.source_adapter ?? "workshop.mock.v1",
    observed_at: extra.observed_at ?? "2026-08-28T09:00:00Z",
    valid_until: extra.valid_until,
    value_commitment: extra.value_commitment ?? "sha256:workshop-value",
    evidence_commitment: extra.evidence_commitment ?? "sha256:workshop-evidence",
    privacy_class: extra.privacy_class ?? "SENSITIVE",
  };
}

export function buildLiveObligation(
  flags: WorkshopFlags,
  nonce: string,
): Obligation {
  if (flags.policy === "consult") {
    return {
      record_type: "pof.obligation",
      schema_version: "1.0.0",
      obligation_id: `ob_live_care_${nonce}`,
      obligation_type: "CARE_CONSULT_SESSION",
      case_ref: `case:live-care-${nonce}`,
      institution_ref: "opaque:provider-licensed-04",
      purpose: "One licensed consultation session",
      period: "Workshop service window",
      authorized: { minor_units: 18000, currency: "USD" },
      policy_id: "CARE-CONSULT",
      policy_version: "1.0.0",
      destination_class: "APPROVED_PROVIDER",
      duplicate_namespace: `care-consult:live-${nonce}`,
    };
  }
  if (flags.policy === "rent") {
    return {
      record_type: "pof.obligation",
      schema_version: "1.0.0",
      obligation_id: `ob_live_rent_${nonce}`,
      obligation_type: "HOUSING_RENT_MONTH",
      case_ref: `case:live-rent-${nonce}`,
      institution_ref: "opaque:payee-property-18",
      purpose: "One calendar month of rent",
      period: "Workshop month",
      authorized: { minor_units: 140000, currency: "USD" },
      policy_id: "HOUSING-RENT",
      policy_version: "1.0.0",
      destination_class: "APPROVED_PAYEE",
      duplicate_namespace: `housing-rent:live-${nonce}`,
    };
  }
  return {
    record_type: "pof.obligation",
    schema_version: "1.0.0",
    obligation_id: `ob_live_edu_${nonce}`,
    obligation_type: "EDU_TUITION_TERM",
    case_ref: `case:live-edu-${nonce}`,
    institution_ref: "opaque:institution-north-ridge",
    purpose: "One academic term tuition",
    period: "Workshop term",
    authorized: { minor_units: 45000, currency: "USD" },
    policy_id: "EDU-TUITION",
    policy_version: "1.0.0",
    destination_class: "APPROVED_INSTITUTION",
    duplicate_namespace: `edu-tuition:live-${nonce}`,
  };
}

export function buildLiveEvidence(
  flags: WorkshopFlags,
  obligation: Obligation,
  nonce: string,
): EvidenceSet {
  const authorized = obligation.authorized.minor_units;
  const settled =
    flags.settlement === "full"
      ? authorized
      : flags.settlement === "partial"
        ? Math.round(authorized * 0.44)
        : 0;
  const settlementStatus: EvidenceAssertion["status"] =
    flags.settlement === "full" ? "VERIFIED" : "FAILED";
  const identityStatus: EvidenceAssertion["status"] = flags.identity
    ? "VERIFIED"
    : "FAILED";
  const matchStatus: EvidenceAssertion["status"] = flags.matched
    ? "VERIFIED"
    : "FAILED";
  const funder = "opaque:funder-workshop";
  const verifier = flags.independence ? "opaque:verifier-01" : funder;

  const assertions: EvidenceAssertion[] = [];

  if (flags.policy === "consult") {
    assertions.push(
      assertion("PROVIDER_IDENTITY_VERIFIED", identityStatus, "B", {
        issuer_ref: "opaque:licensing-board",
        source_adapter: "registry.mock.v1",
        valid_until: flags.credentialExpired
          ? "2020-01-01T00:00:00Z"
          : "2027-01-01T00:00:00Z",
      }),
    );
    if (flags.event) {
      assertions.push(
        assertion("CONSULT_OCCURRENCE_CONFIRMED", "VERIFIED", "D", {
          issuer_ref: "opaque:provider-licensed-04",
        }),
      );
    }
    assertions.push(
      assertion("CASE_AUTHORIZATION_MATCHED", matchStatus, "D", {
        issuer_ref: "opaque:sponsor-circle-workshop",
        source_adapter: "intent.signed.v1",
      }),
    );
    assertions.push(
      assertion("PAYMENT_OR_FUNDING_CONFIRMED", settlementStatus, "C", {
        issuer_ref: "opaque:licensed-rail-01",
        source_adapter: "settlement.sandbox.v1",
      }),
    );
  } else if (flags.policy === "rent") {
    assertions.push(
      assertion("PAYEE_IDENTITY_VERIFIED", identityStatus, "B", {
        issuer_ref: "opaque:registry-housing",
        source_adapter: "registry.mock.v1",
      }),
    );
    if (flags.event) {
      assertions.push(
        assertion("OCCUPANCY_PERIOD_CONFIRMED", "VERIFIED", "D", {
          issuer_ref: "opaque:payee-property-18",
          source_adapter: "payee.ledger.v1",
        }),
      );
    }
    assertions.push(
      assertion("RENT_LEDGER_MATCHED", matchStatus, "D", {
        source_adapter: "signed-document.v1",
      }),
    );
    assertions.push(
      assertion("SETTLEMENT_CONFIRMED", settlementStatus, "C", {
        issuer_ref: "opaque:licensed-rail-01",
        source_adapter: "settlement.sandbox.v1",
      }),
    );
    assertions.push(
      assertion("AUTHORIZATION_MATCHED", "VERIFIED", "D", {
        issuer_ref: "opaque:intent-authority",
        source_adapter: "intent.signed.v1",
      }),
    );
  } else {
    assertions.push(
      assertion("INSTITUTION_IDENTITY_VERIFIED", identityStatus, "B", {
        issuer_ref: "opaque:registry-edu",
        source_adapter: "registry.mock.v1",
      }),
    );
    if (flags.event) {
      assertions.push(
        assertion("ENROLLMENT_CONFIRMED", "VERIFIED", "A", {
          source_adapter: "institution.api.v1",
        }),
      );
    }
    assertions.push(
      assertion("INVOICE_MATCHED", matchStatus, "D", {
        source_adapter: "signed-document.v1",
      }),
    );
    assertions.push(
      assertion("SETTLEMENT_CONFIRMED", settlementStatus, "C", {
        issuer_ref: "opaque:licensed-rail-01",
        source_adapter: "settlement.sandbox.v1",
      }),
    );
    assertions.push(
      assertion("AUTHORIZATION_MATCHED", "VERIFIED", "D", {
        issuer_ref: "opaque:intent-authority",
        source_adapter: "intent.signed.v1",
      }),
    );
  }

  return {
    record_type: "pof.evidence_set",
    schema_version: "1.0.0",
    evidence_set_id: `ev_live_${nonce}`,
    obligation_id: obligation.obligation_id,
    collected_at: new Date().toISOString(),
    assertions,
    independence: {
      verifier_ref: verifier,
      funder_ref: funder,
      beneficiary_ref: obligation.case_ref,
      payee_ref: obligation.institution_ref,
      evidence_issuer_refs: [
        "opaque:registry-edu",
        "opaque:licensing-board",
        "opaque:licensed-rail-01",
        "opaque:intent-authority",
      ],
    },
    duplicate_token_present: true,
    duplicate_match: flags.duplicate,
    settled_minor_units: settled,
  };
}

export async function issueLive(input: {
  flags: WorkshopFlags;
  obligation?: Obligation;
  previous_receipt_id?: string | null;
  supersedes_receipt_id?: string | null;
  challenge_status?: SignedReceipt["challenge_status"];
  challenge?: SignedReceipt["challenge"];
  correction?: SignedReceipt["correction"];
  root_receipt_id?: string;
}): Promise<{ receipt: SignedReceipt; context: RunContext }> {
  const nonce = newOpaqueId("");
  const obligation = input.obligation ?? buildLiveObligation(input.flags, nonce);
  const evidence = buildLiveEvidence(input.flags, obligation, nonce);
  const policy = await signPolicy(
    input.flags.policy === "consult"
      ? CARE_CONSULT_V1
      : input.flags.policy === "rent"
        ? HOUSING_RENT_V1
        : EDU_TUITION_V1,
  );
  const verified_at = new Date().toISOString();
  const receipt_id = `pof_live_${nonce}`;
  const evaluation = await evaluate({
    obligation,
    evidence,
    policy,
    verified_at,
  });
  const receipt = await issueReceipt({
    receipt_id,
    run_id: `run_${receipt_id}`,
    obligation,
    evaluation,
    policy,
    verifier_ref: evidence.independence.verifier_ref,
    verified_at,
    challenge_status: input.challenge_status,
    previous_receipt_id: input.previous_receipt_id,
    supersedes_receipt_id: input.supersedes_receipt_id,
    challenge: input.challenge,
    correction: input.correction,
  });
  return {
    receipt,
    context: {
      flags: input.flags,
      obligation,
      evidence,
      root_receipt_id: input.root_receipt_id ?? receipt.receipt_id,
    },
  };
}

export async function challengeReceipt(
  prior: SignedReceipt,
  reason: ChallengeReason,
  context: RunContext,
): Promise<{ receipt: SignedReceipt; context: RunContext }> {
  const now = new Date().toISOString();
  const payload = detachSeal(prior);
  const next: PublicReceipt = {
    ...payload,
    receipt_id: newOpaqueId("pof_live_"),
    verification: {
      ...payload.verification,
      run_id: `run_ch_${Date.now()}`,
      verified_at: now,
    },
    challenge_status: "CHALLENGED",
    previous_receipt_id: prior.receipt_id,
    challenge: { reason, opened_at: now },
  };
  const receipt_digest = await domainHash("pof.receipt.v1", next);
  const receipt: SignedReceipt = {
    ...next,
    receipt_digest,
    signature: await signReceiptDigest(receipt_digest),
  };
  return {
    receipt,
    context: { ...context, root_receipt_id: context.root_receipt_id },
  };
}

export async function correctLive(
  prior: SignedReceipt,
  flags: WorkshopFlags,
  context: RunContext,
): Promise<{ receipt: SignedReceipt; context: RunContext }> {
  return issueLive({
    flags: { ...flags, policy: context.flags.policy },
    obligation: context.obligation,
    previous_receipt_id: prior.receipt_id,
    supersedes_receipt_id: context.root_receipt_id,
    challenge_status: "CORRECTED",
    correction: {
      reason:
        "Re-evaluated under the same policy version with updated evidence. The prior receipt remains.",
      issued_at: new Date().toISOString(),
    },
    root_receipt_id: context.root_receipt_id,
  });
}

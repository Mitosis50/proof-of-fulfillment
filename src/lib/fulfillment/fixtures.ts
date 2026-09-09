import type {
  EvidenceAssertion,
  EvidenceSet,
  Obligation,
  SignedReceipt,
} from "./types.ts";
import { evaluate, issueReceipt } from "./evaluator.ts";
import { signPolicy, EDU_TUITION_V1, CARE_CONSULT_V1, HOUSING_RENT_V1 } from "./policies.ts";
import type { Policy } from "./types.ts";

const T = "2026-09-01T12:00:00Z";

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
    issuer_ref: extra.issuer_ref ?? "opaque:issuer-school-01",
    source_adapter: extra.source_adapter ?? "institution.mock.v1",
    observed_at: extra.observed_at ?? "2026-08-28T09:00:00Z",
    valid_until: extra.valid_until,
    value_commitment: extra.value_commitment ?? "sha256:value-commitment-demo",
    evidence_commitment: extra.evidence_commitment ?? "sha256:evidence-commitment-demo",
    privacy_class: extra.privacy_class ?? "SENSITIVE",
  };
}

export const tuitionObligation: Obligation = {
  record_type: "pof.obligation",
  schema_version: "1.0.0",
  obligation_id: "ob_edu_7f2a",
  obligation_type: "EDU_TUITION_TERM",
  case_ref: "case:ns-edu-7f2a",
  institution_ref: "opaque:institution-north-ridge",
  purpose: "One academic term tuition",
  period: "Term 2, 2026",
  authorized: { minor_units: 45000, currency: "USD" },
  policy_id: "EDU-TUITION",
  policy_version: "1.0.0",
  destination_class: "APPROVED_INSTITUTION",
  duplicate_namespace: "edu-tuition:ns-edu-7f2a",
};

export const consultObligation: Obligation = {
  record_type: "pof.obligation",
  schema_version: "1.0.0",
  obligation_id: "ob_care_9c11",
  obligation_type: "CARE_CONSULT_SESSION",
  case_ref: "case:ns-care-9c11",
  institution_ref: "opaque:provider-licensed-04",
  purpose: "One licensed consultation session",
  period: "2026-08-20 appointment window",
  authorized: { minor_units: 18000, currency: "USD" },
  policy_id: "CARE-CONSULT",
  policy_version: "1.0.0",
  destination_class: "APPROVED_PROVIDER",
  duplicate_namespace: "care-consult:ns-care-9c11",
};

export const rentObligation: Obligation = {
  record_type: "pof.obligation",
  schema_version: "1.0.0",
  obligation_id: "ob_rent_m9a2",
  obligation_type: "HOUSING_RENT_MONTH",
  case_ref: "case:ns-rent-m9a2",
  institution_ref: "opaque:payee-property-18",
  purpose: "One calendar month of rent",
  period: "September 2026",
  authorized: { minor_units: 140000, currency: "USD" },
  policy_id: "HOUSING-RENT",
  policy_version: "1.0.0",
  destination_class: "APPROVED_PAYEE",
  duplicate_namespace: "housing-rent:ns-rent-m9a2",
};

function tuitionEvidence(opts: {
  id: string;
  duplicate_match?: boolean;
  settlement?: EvidenceAssertion["status"];
  settled?: number;
  institution?: EvidenceAssertion["status"];
}): EvidenceSet {
  return {
    record_type: "pof.evidence_set",
    schema_version: "1.0.0",
    evidence_set_id: opts.id,
    obligation_id: tuitionObligation.obligation_id,
    collected_at: "2026-08-30T16:00:00Z",
    assertions: [
      assertion("INSTITUTION_IDENTITY_VERIFIED", opts.institution ?? "VERIFIED", "B", {
        issuer_ref: "opaque:registry-edu",
        source_adapter: "registry.mock.v1",
      }),
      assertion("ENROLLMENT_CONFIRMED", "VERIFIED", "A", {
        source_adapter: "institution.api.v1",
      }),
      assertion("INVOICE_MATCHED", "VERIFIED", "D", {
        source_adapter: "signed-document.v1",
      }),
      assertion("SETTLEMENT_CONFIRMED", opts.settlement ?? "VERIFIED", "C", {
        issuer_ref: "opaque:licensed-rail-01",
        source_adapter: "settlement.sandbox.v1",
      }),
      assertion("AUTHORIZATION_MATCHED", "VERIFIED", "D", {
        issuer_ref: "opaque:intent-authority",
        source_adapter: "intent.signed.v1",
      }),
    ],
    independence: {
      verifier_ref: "opaque:verifier-01",
      funder_ref: "opaque:funder-circle-7f2a",
      beneficiary_ref: "case:ns-edu-7f2a",
      payee_ref: "opaque:institution-north-ridge",
      evidence_issuer_refs: [
        "opaque:registry-edu",
        "opaque:licensed-rail-01",
        "opaque:intent-authority",
      ],
    },
    duplicate_token_present: true,
    duplicate_match: Boolean(opts.duplicate_match),
    settled_minor_units: opts.settled ?? 45000,
  };
}

function consultEvidence(opts: {
  id: string;
  credential?: EvidenceAssertion["status"];
  valid_until?: string;
  duplicate_match?: boolean;
}): EvidenceSet {
  return {
    record_type: "pof.evidence_set",
    schema_version: "1.0.0",
    evidence_set_id: opts.id,
    obligation_id: consultObligation.obligation_id,
    collected_at: "2026-08-21T18:00:00Z",
    assertions: [
      assertion("PROVIDER_IDENTITY_VERIFIED", opts.credential ?? "VERIFIED", "B", {
        issuer_ref: "opaque:licensing-board",
        source_adapter: "registry.mock.v1",
        valid_until: opts.valid_until ?? "2027-01-01T00:00:00Z",
      }),
      assertion("CONSULT_OCCURRENCE_CONFIRMED", "VERIFIED", "D", {
        issuer_ref: "opaque:provider-licensed-04",
        source_adapter: "provider.api.v1",
      }),
      assertion("CASE_AUTHORIZATION_MATCHED", "VERIFIED", "D", {
        issuer_ref: "opaque:sponsor-circle-9c11",
        source_adapter: "intent.signed.v1",
      }),
      assertion("PAYMENT_OR_FUNDING_CONFIRMED", "VERIFIED", "C", {
        issuer_ref: "opaque:licensed-rail-01",
        source_adapter: "settlement.sandbox.v1",
      }),
    ],
    independence: {
      verifier_ref: "opaque:verifier-01",
      funder_ref: "opaque:sponsor-circle-9c11",
      beneficiary_ref: "case:ns-care-9c11",
      payee_ref: "opaque:provider-licensed-04",
      evidence_issuer_refs: [
        "opaque:licensing-board",
        "opaque:provider-licensed-04",
        "opaque:licensed-rail-01",
      ],
    },
    duplicate_token_present: true,
    duplicate_match: Boolean(opts.duplicate_match),
    settled_minor_units: 18000,
  };
}

function rentEvidence(opts: {
  id: string;
  occupancy?: EvidenceAssertion["status"];
  duplicate_match?: boolean;
}): EvidenceSet {
  return {
    record_type: "pof.evidence_set",
    schema_version: "1.0.0",
    evidence_set_id: opts.id,
    obligation_id: rentObligation.obligation_id,
    collected_at: "2026-09-02T11:00:00Z",
    assertions: [
      assertion("PAYEE_IDENTITY_VERIFIED", "VERIFIED", "B", {
        issuer_ref: "opaque:registry-housing",
        source_adapter: "registry.mock.v1",
      }),
      assertion("OCCUPANCY_PERIOD_CONFIRMED", opts.occupancy ?? "VERIFIED", "D", {
        issuer_ref: "opaque:payee-property-18",
        source_adapter: "payee.ledger.v1",
      }),
      assertion("RENT_LEDGER_MATCHED", "VERIFIED", "D", {
        source_adapter: "signed-document.v1",
      }),
      assertion("SETTLEMENT_CONFIRMED", "VERIFIED", "C", {
        issuer_ref: "opaque:licensed-rail-01",
        source_adapter: "settlement.sandbox.v1",
      }),
      assertion("AUTHORIZATION_MATCHED", "VERIFIED", "D", {
        issuer_ref: "opaque:intent-authority",
        source_adapter: "intent.signed.v1",
      }),
    ],
    independence: {
      verifier_ref: "opaque:verifier-01",
      funder_ref: "opaque:funder-circle-m9a2",
      beneficiary_ref: "case:ns-rent-m9a2",
      payee_ref: "opaque:payee-property-18",
      evidence_issuer_refs: [
        "opaque:registry-housing",
        "opaque:payee-property-18",
        "opaque:licensed-rail-01",
        "opaque:intent-authority",
      ],
    },
    duplicate_token_present: true,
    duplicate_match: Boolean(opts.duplicate_match),
    settled_minor_units: 140000,
  };
}

type IssueExtra = {
  verified_at?: string;
  verifier_ref?: string;
  challenge_status?: SignedReceipt["challenge_status"];
  previous_receipt_id?: string | null;
  supersedes_receipt_id?: string | null;
  challenge?: SignedReceipt["challenge"];
  correction?: SignedReceipt["correction"];
};

async function run(
  receipt_id: string,
  obligation: Obligation,
  evidence: EvidenceSet,
  policySrc: Policy,
  extra: IssueExtra = {},
): Promise<SignedReceipt> {
  const policy = await signPolicy(policySrc);
  const evaluation = await evaluate({
    obligation,
    evidence,
    policy,
    verified_at: extra.verified_at ?? T,
  });
  return issueReceipt({
    receipt_id,
    run_id: `run_${receipt_id}`,
    obligation,
    evaluation,
    policy,
    verifier_ref: extra.verifier_ref ?? "opaque:verifier-01",
    verified_at: extra.verified_at ?? T,
    challenge_status: extra.challenge_status,
    previous_receipt_id: extra.previous_receipt_id,
    supersedes_receipt_id: extra.supersedes_receipt_id,
    challenge: extra.challenge,
    correction: extra.correction,
  });
}

export type DemoCase = {
  id: string;
  title: string;
  blurb: string;
  kind: "pass" | "fail" | "exception" | "chain";
  receipt: SignedReceipt;
};

export async function buildDemoLibrary(): Promise<{
  receipts: SignedReceipt[];
  cases: DemoCase[];
}> {
  const tuitionOk = await run(
    "pof_edu_t2_ok",
    tuitionObligation,
    tuitionEvidence({ id: "ev_edu_ok" }),
    EDU_TUITION_V1,
  );
  const tuitionDup = await run(
    "pof_edu_t2_dup",
    tuitionObligation,
    tuitionEvidence({ id: "ev_edu_dup", duplicate_match: true }),
    EDU_TUITION_V1,
  );
  const tuitionPartial = await run(
    "pof_edu_t2_part",
    tuitionObligation,
    tuitionEvidence({
      id: "ev_edu_part",
      settlement: "FAILED",
      settled: 20000,
    }),
    EDU_TUITION_V1,
  );
  const consultOk = await run(
    "pof_care_c1_ok",
    consultObligation,
    consultEvidence({ id: "ev_care_ok" }),
    CARE_CONSULT_V1,
  );
  const consultExpired = await run(
    "pof_care_c1_exp",
    consultObligation,
    consultEvidence({
      id: "ev_care_exp",
      valid_until: "2026-06-01T00:00:00Z",
    }),
    CARE_CONSULT_V1,
  );
  const rentOk = await run(
    "pof_rent_m9_ok",
    rentObligation,
    rentEvidence({ id: "ev_rent_ok" }),
    HOUSING_RENT_V1,
  );
  const rentDup = await run(
    "pof_rent_m9_dup",
    rentObligation,
    rentEvidence({ id: "ev_rent_dup", duplicate_match: true }),
    HOUSING_RENT_V1,
  );
  const rentVacant = await run(
    "pof_rent_m9_vac",
    rentObligation,
    rentEvidence({ id: "ev_rent_vac", occupancy: "FAILED" }),
    HOUSING_RENT_V1,
  );

  const challenged = await run(
    "pof_edu_t2_ch",
    tuitionObligation,
    tuitionEvidence({ id: "ev_edu_ch" }),
    EDU_TUITION_V1,
    {
      challenge_status: "CHALLENGED",
      previous_receipt_id: tuitionOk.receipt_id,
      challenge: {
        reason: "PAYMENT_REVERSED",
        opened_at: "2026-09-04T10:00:00Z",
      },
    },
  );

  const corrected = await run(
    "pof_edu_t2_cr",
    tuitionObligation,
    tuitionEvidence({
      id: "ev_edu_cr",
      settlement: "FAILED",
      settled: 0,
    }),
    EDU_TUITION_V1,
    {
      challenge_status: "CORRECTED",
      previous_receipt_id: challenged.receipt_id,
      supersedes_receipt_id: tuitionOk.receipt_id,
      correction: {
        reason: "Settlement reversed after original issuance. History preserved.",
        issued_at: "2026-09-05T15:00:00Z",
      },
      verified_at: "2026-09-05T15:00:00Z",
    },
  );

  const cases: DemoCase[] = [
    {
      id: tuitionOk.receipt_id,
      title: "Term 2 tuition",
      blurb: "Institution, enrollment, invoice, and settlement all pass. Grades are not asserted.",
      kind: "pass",
      receipt: tuitionOk,
    },
    {
      id: consultOk.receipt_id,
      title: "Licensed consult",
      blurb: "Occurrence and payment verified. Clinical correctness is not asserted.",
      kind: "pass",
      receipt: consultOk,
    },
    {
      id: rentOk.receipt_id,
      title: "September rent",
      blurb: "Payee, occupancy, ledger, and settlement pass. Household names are not published.",
      kind: "pass",
      receipt: rentOk,
    },
    {
      id: tuitionDup.receipt_id,
      title: "Duplicate invoice",
      blurb: "The same scoped tuition tuple was submitted twice. Frozen as an exception.",
      kind: "exception",
      receipt: tuitionDup,
    },
    {
      id: consultExpired.receipt_id,
      title: "Expired credential",
      blurb: "Provider identity was not active on the service date.",
      kind: "fail",
      receipt: consultExpired,
    },
    {
      id: rentDup.receipt_id,
      title: "Duplicate rent month",
      blurb: "The same month, unit, and payee were submitted twice. Frozen as an exception.",
      kind: "exception",
      receipt: rentDup,
    },
    {
      id: rentVacant.receipt_id,
      title: "Occupancy not confirmed",
      blurb: "Settlement does not fulfill rent when occupancy for that month does not hold.",
      kind: "fail",
      receipt: rentVacant,
    },
    {
      id: tuitionPartial.receipt_id,
      title: "Partial settlement",
      blurb: "Less than the authorized amount reached the institution.",
      kind: "fail",
      receipt: tuitionPartial,
    },
    {
      id: challenged.receipt_id,
      title: "Challenged receipt",
      blurb: "A payment reversal opened review. The original receipt remains retrievable.",
      kind: "chain",
      receipt: challenged,
    },
    {
      id: corrected.receipt_id,
      title: "Corrected receipt",
      blurb: "A new conclusion was issued. History was not rewritten.",
      kind: "chain",
      receipt: corrected,
    },
  ];

  return {
    receipts: cases.map((c) => c.receipt),
    cases,
  };
}

export const CIRCLE_DEMO = {
  id: "circle_7f2a",
  title: "Term support bundle",
  case_ref: "case:ns-edu-7f2a",
  synthetic: true,
  target: { minor_units: 45000, currency: "USD" },
  policy: "EDU-TUITION v1.0.0",
  contributors: [
    { role: "Grandparent", minor_units: 15000 },
    { role: "Uncle", minor_units: 10000 },
    { role: "Parent", minor_units: 20000 },
  ],
  bundle: [
    { label: "Tuition", status: "VERIFIED" as const, receipt_id: "pof_edu_t2_ok" },
    { label: "Books", status: "VERIFIED" as const, receipt_id: null },
    { label: "Transport", status: "PENDING" as const, receipt_id: null },
  ],
};

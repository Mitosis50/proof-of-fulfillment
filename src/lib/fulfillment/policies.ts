import type { Policy, SignedPolicy } from "./types.ts";
import { hashCanonical } from "./hash.ts";

export const VERIFIER_BUILD = "fulfilled-explorer-0.1.0";

export const EDU_TUITION_V1: Policy = {
  record_type: "pof.policy",
  schema_version: "1.0.0",
  policy_id: "EDU-TUITION",
  version: "1.0.0",
  title: "Education tuition, one term",
  domain: "education",
  scope:
    "One bounded tuition obligation for one opaque student case reference, one institution, one invoice or term, and one authorized destination.",
  required: [
    {
      code: "INSTITUTION_IDENTITY_VERIFIED",
      min_level: "B",
      label: "Institution identity",
      required: true,
    },
    {
      code: "ENROLLMENT_CONFIRMED",
      min_level: "D",
      label: "Enrollment",
      required: true,
    },
    {
      code: "INVOICE_MATCHED",
      min_level: "D",
      label: "Invoice matched",
      required: true,
    },
    {
      code: "SETTLEMENT_CONFIRMED",
      min_level: "C",
      label: "Settlement",
      required: true,
      partial_ok: true,
    },
    {
      code: "DUPLICATE_NOT_FOUND",
      min_level: "C",
      label: "Duplicate check",
      required: true,
    },
    {
      code: "AUTHORIZATION_MATCHED",
      min_level: "D",
      label: "Authorization",
      required: true,
    },
    {
      code: "INDEPENDENCE_PASSED",
      min_level: "A",
      label: "Independence",
      required: true,
    },
  ],
  not_asserted: [
    { code: "ACADEMIC_PERFORMANCE", label: "Academic performance" },
    { code: "GRADES_OR_TRANSCRIPT", label: "Grades or transcript" },
    { code: "ATTENDANCE", label: "Attendance" },
    { code: "PRIVATE_STUDENT_RECORDS", label: "Private student records" },
  ],
  human_pass: [
    "TUITION PAYMENT STATUS: VERIFIED",
    "ENROLLMENT STATUS: VERIFIED",
    "TERM COVERAGE: VERIFIED",
    "INSTITUTION DESTINATION: VERIFIED",
    "DUPLICATE CHECK: PASSED",
    "ACADEMIC PERFORMANCE: NOT ASSERTED",
    "PRIVATE STUDENT RECORDS: NOT PUBLISHED",
  ],
  independence_required: true,
  duplicate_blocks: true,
};

export const CARE_CONSULT_V1: Policy = {
  record_type: "pof.policy",
  schema_version: "1.0.0",
  policy_id: "CARE-CONSULT",
  version: "1.0.0",
  title: "Licensed consultation, one session",
  domain: "care",
  scope:
    "One bounded consultation for one opaque authorized case reference, one provider, one service window, and one funding or settlement event.",
  required: [
    {
      code: "PROVIDER_IDENTITY_VERIFIED",
      min_level: "B",
      label: "Provider identity",
      required: true,
    },
    {
      code: "CONSULT_OCCURRENCE_CONFIRMED",
      min_level: "D",
      label: "Consult occurrence",
      required: true,
    },
    {
      code: "CASE_AUTHORIZATION_MATCHED",
      min_level: "D",
      label: "Case authorization",
      required: true,
    },
    {
      code: "PAYMENT_OR_FUNDING_CONFIRMED",
      min_level: "C",
      label: "Payment status",
      required: true,
      partial_ok: true,
    },
    {
      code: "DUPLICATE_NOT_FOUND",
      min_level: "C",
      label: "Duplicate check",
      required: true,
    },
    {
      code: "INDEPENDENCE_PASSED",
      min_level: "A",
      label: "Independence",
      required: true,
    },
  ],
  not_asserted: [
    { code: "CLINICAL_CORRECTNESS", label: "Clinical correctness" },
    { code: "DIAGNOSIS", label: "Diagnosis" },
    { code: "TREATMENT_EFFECTIVENESS", label: "Treatment effectiveness" },
    { code: "MEDICAL_NECESSITY", label: "Medical necessity" },
    { code: "PRIVATE_MEDICAL_RECORDS", label: "Private medical records" },
  ],
  human_pass: [
    "CONSULT OCCURRENCE: VERIFIED",
    "PROVIDER IDENTITY: VERIFIED",
    "PAYMENT STATUS: VERIFIED",
    "EVIDENCE PROCESS: VERIFIED",
    "CLINICAL CORRECTNESS: NOT ASSERTED",
    "PRIVATE MEDICAL RECORDS: NOT PUBLISHED",
  ],
  independence_required: true,
  duplicate_blocks: true,
};

export const HOUSING_RENT_V1: Policy = {
  record_type: "pof.policy",
  schema_version: "1.0.0",
  policy_id: "HOUSING-RENT",
  version: "1.0.0",
  title: "Housing rent, one month",
  domain: "housing",
  scope:
    "One bounded rent obligation for one opaque household case reference, one approved payee, one calendar month, and one authorized destination.",
  required: [
    {
      code: "PAYEE_IDENTITY_VERIFIED",
      min_level: "B",
      label: "Payee identity",
      required: true,
    },
    {
      code: "OCCUPANCY_PERIOD_CONFIRMED",
      min_level: "D",
      label: "Occupancy period",
      required: true,
    },
    {
      code: "RENT_LEDGER_MATCHED",
      min_level: "D",
      label: "Rent ledger matched",
      required: true,
    },
    {
      code: "SETTLEMENT_CONFIRMED",
      min_level: "C",
      label: "Settlement",
      required: true,
      partial_ok: true,
    },
    {
      code: "AUTHORIZATION_MATCHED",
      min_level: "D",
      label: "Authorization",
      required: true,
    },
    {
      code: "DUPLICATE_NOT_FOUND",
      min_level: "C",
      label: "Duplicate check",
      required: true,
    },
    {
      code: "INDEPENDENCE_PASSED",
      min_level: "A",
      label: "Independence",
      required: true,
    },
  ],
  not_asserted: [
    { code: "TENANT_CREDITWORTHINESS", label: "Tenant creditworthiness" },
    { code: "HOUSEHOLD_ROSTER", label: "Household roster" },
    { code: "HOUSING_QUALITY", label: "Housing quality" },
    { code: "NEIGHBORHOOD_SAFETY", label: "Neighborhood safety" },
    { code: "EVICTION_HISTORY", label: "Eviction history" },
    { code: "PRIVATE_TENANT_RECORDS", label: "Private tenant records" },
  ],
  human_pass: [
    "RENT PAYMENT STATUS: VERIFIED",
    "OCCUPANCY PERIOD: VERIFIED",
    "PAYEE DESTINATION: VERIFIED",
    "DUPLICATE CHECK: PASSED",
    "TENANT CREDITWORTHINESS: NOT ASSERTED",
    "HOUSEHOLD ROSTER: NOT PUBLISHED",
  ],
  independence_required: true,
  duplicate_blocks: true,
};

export const POLICY_SOURCE = [EDU_TUITION_V1, CARE_CONSULT_V1, HOUSING_RENT_V1];

const cache = new Map<string, SignedPolicy>();

export async function signPolicy(policy: Policy): Promise<SignedPolicy> {
  const key = `${policy.policy_id}@${policy.version}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const policy_hash = await hashCanonical(policy);
  const signed = { ...policy, policy_hash };
  cache.set(key, signed);
  return signed;
}

export async function policyRegistry(): Promise<SignedPolicy[]> {
  return Promise.all(POLICY_SOURCE.map(signPolicy));
}

export async function findPolicy(
  id: string,
  version: string,
): Promise<SignedPolicy | null> {
  const all = await policyRegistry();
  return all.find((p) => p.policy_id === id && p.version === version) ?? null;
}

export async function findPolicyByHash(hash: string): Promise<SignedPolicy | null> {
  const all = await policyRegistry();
  return all.find((p) => p.policy_hash === hash) ?? null;
}

export async function verifierBuildHash(): Promise<string> {
  return hashCanonical({ build: VERIFIER_BUILD, engine: "pof-ts-0.1.0" });
}

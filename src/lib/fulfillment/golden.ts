import type { Verdict } from "./types.ts";

/** Frozen engine cases. Changing a verdict here is a protocol change. */
export const GOLDEN_CASES = [
  {
    id: "pof_edu_t2_ok",
    title: "Tuition, all evidence holds",
    verdict: "VERIFIED" as Verdict,
    challenge_status: "NONE",
    not_asserted: [
      "ACADEMIC_PERFORMANCE",
      "GRADES_OR_TRANSCRIPT",
      "ATTENDANCE",
      "PRIVATE_STUDENT_RECORDS",
    ],
  },
  {
    id: "pof_care_c1_ok",
    title: "Consult, credential active",
    verdict: "VERIFIED" as Verdict,
    challenge_status: "NONE",
    not_asserted: [
      "CLINICAL_CORRECTNESS",
      "DIAGNOSIS",
      "TREATMENT_EFFECTIVENESS",
      "MEDICAL_NECESSITY",
      "PRIVATE_MEDICAL_RECORDS",
    ],
  },
  {
    id: "pof_rent_m9_ok",
    title: "Rent, occupancy and settlement hold",
    verdict: "VERIFIED" as Verdict,
    challenge_status: "NONE",
    not_asserted: [
      "TENANT_CREDITWORTHINESS",
      "HOUSEHOLD_ROSTER",
      "HOUSING_QUALITY",
      "NEIGHBORHOOD_SAFETY",
      "EVICTION_HISTORY",
      "PRIVATE_TENANT_RECORDS",
    ],
  },
  {
    id: "pof_edu_t2_dup",
    title: "Duplicate invoice",
    verdict: "EXCEPTION" as Verdict,
    challenge_status: "NONE",
    not_asserted: [
      "ACADEMIC_PERFORMANCE",
      "GRADES_OR_TRANSCRIPT",
      "ATTENDANCE",
      "PRIVATE_STUDENT_RECORDS",
    ],
  },
  {
    id: "pof_edu_t2_part",
    title: "Partial settlement",
    verdict: "PARTIALLY_FULFILLED" as Verdict,
    challenge_status: "NONE",
    not_asserted: [
      "ACADEMIC_PERFORMANCE",
      "GRADES_OR_TRANSCRIPT",
      "ATTENDANCE",
      "PRIVATE_STUDENT_RECORDS",
    ],
  },
  {
    id: "pof_care_c1_exp",
    title: "Expired provider credential",
    verdict: "FAILED" as Verdict,
    challenge_status: "NONE",
    not_asserted: [
      "CLINICAL_CORRECTNESS",
      "DIAGNOSIS",
      "TREATMENT_EFFECTIVENESS",
      "MEDICAL_NECESSITY",
      "PRIVATE_MEDICAL_RECORDS",
    ],
  },
  {
    id: "pof_rent_m9_dup",
    title: "Duplicate rent month",
    verdict: "EXCEPTION" as Verdict,
    challenge_status: "NONE",
    not_asserted: [
      "TENANT_CREDITWORTHINESS",
      "HOUSEHOLD_ROSTER",
      "HOUSING_QUALITY",
      "NEIGHBORHOOD_SAFETY",
      "EVICTION_HISTORY",
      "PRIVATE_TENANT_RECORDS",
    ],
  },
  {
    id: "pof_rent_m9_vac",
    title: "Occupancy not confirmed",
    verdict: "FAILED" as Verdict,
    challenge_status: "NONE",
    not_asserted: [
      "TENANT_CREDITWORTHINESS",
      "HOUSEHOLD_ROSTER",
      "HOUSING_QUALITY",
      "NEIGHBORHOOD_SAFETY",
      "EVICTION_HISTORY",
      "PRIVATE_TENANT_RECORDS",
    ],
  },
  {
    id: "pof_edu_t2_cr",
    title: "Corrected after settlement reversed",
    verdict: "FAILED" as Verdict,
    challenge_status: "CORRECTED",
    not_asserted: [
      "ACADEMIC_PERFORMANCE",
      "GRADES_OR_TRANSCRIPT",
      "ATTENDANCE",
      "PRIVATE_STUDENT_RECORDS",
    ],
  },
] as const;

export const LOCKED_POLICY_HASHES = {
  "EDU-TUITION@1.0.0":
    "sha256:4d234eef41aecd0a114e172ceae7ad6122d16c9c615489583e15c43d240aad7a",
  "CARE-CONSULT@1.0.0":
    "sha256:d455e8ec35b08de5bf224f9d8eed768f42a50b13cf3aa4c7c6831a65670f7be8",
  "HOUSING-RENT@1.0.0":
    "sha256:d71e337d7daa799f97007d528925ce8e3874fb59c5000cb4f3895d8bea956f11",
} as const;

export const LOCKED_RECEIPT_DIGESTS = {
  pof_edu_t2_ok:
    "sha256:5cbc37017a51c0046267ef6f2a7786cafe094b27827cbdf2a4d8ddb57a5fb5df",
  pof_care_c1_ok:
    "sha256:24094395a5da854d8281f2762ad22b5d0a297c9454888b6d0dbc3203d0bdb5e3",
  pof_edu_t2_dup:
    "sha256:1007de4008b3487fec8136c08a8952ed72249319485de91766ab48ce04a74063",
  pof_care_c1_exp:
    "sha256:dfedb0323327f59a6e790e3dc64701df9422091f79308a78888e3b5f3b3571ba",
  pof_edu_t2_part:
    "sha256:36094294172318b556be55bfc18c3412819abee2e706abbe17b5331a4df6544f",
  pof_edu_t2_ch:
    "sha256:1935c0b309dda65857554210a9cd46a00f70f23283f8f4ca9b7171a7d8c182bd",
  pof_edu_t2_cr:
    "sha256:4961bf627c1bdef9983bb2c595c12ec449f1d8a11b54d5d02e73c2b480fe8fe3",
  pof_rent_m9_ok:
    "sha256:68a287980caf2661b709296a418acca7560b6784c122298de62cddc5738cc6fd",
  pof_rent_m9_dup:
    "sha256:88466b8bcd304c76c16af4bd1ce288be137222b497d20a33ad0e03a6162f3399",
  pof_rent_m9_vac:
    "sha256:d02d3a1af06121e429cd474f6982d5b59aca0482e8d057618b3675706d9204a9",
} as const;

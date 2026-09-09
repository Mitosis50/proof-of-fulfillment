import type {
  EvidenceAssertion,
  EvidenceLevel,
  EvidenceSet,
  EvaluationResult,
  Obligation,
  PublicReceipt,
  RuleResult,
  SignedPolicy,
  SignedReceipt,
  Verdict,
} from "./types.ts";
import { EVIDENCE_LEVELS } from "./types.ts";
import { domainHash, hashCanonical } from "./hash.ts";
import { verifierBuildHash } from "./policies.ts";
import { signReceiptDigest } from "./sign.ts";

function levelOk(actual: EvidenceLevel, min: EvidenceLevel): boolean {
  return EVIDENCE_LEVELS.indexOf(actual) <= EVIDENCE_LEVELS.indexOf(min);
}

function independencePassed(set: EvidenceSet): boolean {
  const v = set.independence.verifier_ref;
  if (!v) return false;
  if (v === set.independence.funder_ref) return false;
  if (v === set.independence.beneficiary_ref) return false;
  if (v === set.independence.payee_ref) return false;
  if (set.independence.evidence_issuer_refs.includes(v)) return false;
  return true;
}

function pick(set: EvidenceSet, code: string): EvidenceAssertion | undefined {
  const matches = set.assertions.filter((a) => a.assertion_code === code);
  if (matches.length === 0) return undefined;
  if (matches.some((a) => a.status === "CONFLICTING") || matches.length > 1) {
    const statuses = new Set(matches.map((a) => a.status));
    if (statuses.size > 1 || matches.some((a) => a.status === "CONFLICTING")) {
      return { ...matches[0], status: "CONFLICTING" };
    }
  }
  return matches[0];
}

export async function evaluate(input: {
  obligation: Obligation;
  evidence: EvidenceSet;
  policy: SignedPolicy;
  verified_at: string;
}): Promise<EvaluationResult> {
  const { obligation, evidence, policy, verified_at } = input;
  if (evidence.obligation_id !== obligation.obligation_id) {
    throw new Error("evidence set does not bind this obligation");
  }
  if (
    obligation.policy_id !== policy.policy_id ||
    obligation.policy_version !== policy.version
  ) {
    throw new Error("obligation policy does not match signed policy");
  }

  const rules: RuleResult[] = [];

  for (const rule of policy.required) {
    if (rule.code === "INDEPENDENCE_PASSED") {
      const ok = independencePassed(evidence);
      rules.push({
        code: rule.code,
        label: rule.label,
        status: ok ? "VERIFIED" : "FAILED",
        evidence_level: "A",
        explanation: ok
          ? "Verifier is distinct from funder, beneficiary, payee, and evidence issuers."
          : "Independence failed: verifier collides with an interested party.",
      });
      continue;
    }
    if (rule.code === "DUPLICATE_NOT_FOUND") {
      if (evidence.duplicate_match) {
        rules.push({
          code: rule.code,
          label: rule.label,
          status: "CONFLICTING",
          evidence_level: "C",
          explanation:
            "A scoped duplicate token already exists for this obligation tuple.",
        });
      } else if (!evidence.duplicate_token_present) {
        rules.push({
          code: rule.code,
          label: rule.label,
          status: "INSUFFICIENT",
          evidence_level: null,
          explanation: "No duplicate-registry assertion was supplied.",
        });
      } else {
        rules.push({
          code: rule.code,
          label: rule.label,
          status: "VERIFIED",
          evidence_level: "C",
          explanation: "Scoped duplicate registry returned no prior match.",
        });
      }
      continue;
    }

    const assertion = pick(evidence, rule.code);
    if (!assertion) {
      rules.push({
        code: rule.code,
        label: rule.label,
        status: "INSUFFICIENT",
        evidence_level: null,
        explanation: "Required assertion is missing.",
      });
      continue;
    }
    if (assertion.status === "REVOKED") {
      rules.push({
        code: rule.code,
        label: rule.label,
        status: "REVOKED",
        evidence_level: assertion.evidence_level,
        explanation: "Issuer or credential was revoked at verification time.",
      });
      continue;
    }
    if (assertion.valid_until && assertion.valid_until < verified_at) {
      rules.push({
        code: rule.code,
        label: rule.label,
        status: "FAILED",
        evidence_level: assertion.evidence_level,
        explanation: "Evidence expired before the verification timestamp.",
      });
      continue;
    }
    if (assertion.status === "CONFLICTING") {
      rules.push({
        code: rule.code,
        label: rule.label,
        status: "CONFLICTING",
        evidence_level: assertion.evidence_level,
        explanation: "Authoritative sources disagree.",
      });
      continue;
    }
    if (assertion.status !== "VERIFIED") {
      rules.push({
        code: rule.code,
        label: rule.label,
        status: assertion.status,
        evidence_level: assertion.evidence_level,
        explanation: `Assertion status is ${assertion.status}.`,
      });
      continue;
    }
    if (!levelOk(assertion.evidence_level, rule.min_level)) {
      rules.push({
        code: rule.code,
        label: rule.label,
        status: "FAILED",
        evidence_level: assertion.evidence_level,
        explanation: `Evidence level ${assertion.evidence_level} is weaker than required ${rule.min_level}.`,
      });
      continue;
    }
    rules.push({
      code: rule.code,
      label: rule.label,
      status: "VERIFIED",
      evidence_level: assertion.evidence_level,
      explanation: `Accepted at evidence level ${assertion.evidence_level}.`,
    });
  }

  const statuses = rules.map((r) => r.status);
  let verdict: Verdict;
  if (statuses.includes("CONFLICTING") || statuses.includes("REVOKED")) {
    verdict = "EXCEPTION";
  } else if (statuses.includes("FAILED")) {
    const settlement = rules.find(
      (r) =>
        r.code === "SETTLEMENT_CONFIRMED" ||
        r.code === "PAYMENT_OR_FUNDING_CONFIRMED",
    );
    const othersFailed = rules.some(
      (r) =>
        r.code !== "SETTLEMENT_CONFIRMED" &&
        r.code !== "PAYMENT_OR_FUNDING_CONFIRMED" &&
        r.status !== "VERIFIED",
    );
    const settled = evidence.settled_minor_units ?? 0;
    if (
      !othersFailed &&
      settlement &&
      settled > 0 &&
      settled < obligation.authorized.minor_units
    ) {
      verdict = "PARTIALLY_FULFILLED";
    } else {
      verdict = "FAILED";
    }
  } else if (statuses.includes("INSUFFICIENT")) {
    verdict = "INSUFFICIENT_EVIDENCE";
  } else {
    const settled = evidence.settled_minor_units;
    if (
      typeof settled === "number" &&
      settled > 0 &&
      settled < obligation.authorized.minor_units
    ) {
      verdict = "PARTIALLY_FULFILLED";
    } else {
      verdict = "VERIFIED";
    }
  }

  const explanations = rules
    .filter((r) => r.status !== "VERIFIED")
    .map((r) => `${r.label}: ${r.explanation}`);

  return {
    verdict,
    rules,
    obligation_commitment: await domainHash("pof.obligation.v1", {
      obligation_id: obligation.obligation_id,
      obligation_type: obligation.obligation_type,
      case_ref_commitment: await domainHash("pof.case.v1", obligation.case_ref),
      institution_ref: obligation.institution_ref,
      purpose: obligation.purpose,
      period: obligation.period,
      authorized: obligation.authorized,
      policy_id: obligation.policy_id,
      policy_version: obligation.policy_version,
    }),
    evidence_root: await hashCanonical(
      evidence.assertions
        .map((a) => ({
          code: a.assertion_code,
          status: a.status,
          level: a.evidence_level,
          commitment: a.evidence_commitment ?? a.value_commitment ?? null,
        }))
        .sort((a, b) => a.code.localeCompare(b.code)),
    ),
    policy_hash: policy.policy_hash,
    explanations,
  };
}

export async function issueReceipt(input: {
  receipt_id: string;
  run_id: string;
  obligation: Obligation;
  evaluation: EvaluationResult;
  policy: SignedPolicy;
  verifier_ref: string;
  verified_at: string;
  challenge_status?: PublicReceipt["challenge_status"];
  previous_receipt_id?: string | null;
  supersedes_receipt_id?: string | null;
  challenge?: PublicReceipt["challenge"];
  correction?: PublicReceipt["correction"];
}): Promise<SignedReceipt> {
  const receipt: PublicReceipt = {
    record_type: "pof.receipt",
    schema_version: "1.0.0",
    receipt_id: input.receipt_id,
    obligation_commitment: input.evaluation.obligation_commitment,
    policy: {
      id: input.policy.policy_id,
      version: input.policy.version,
      hash: input.policy.policy_hash,
      title: input.policy.title,
    },
    verification: {
      run_id: input.run_id,
      evidence_root: input.evaluation.evidence_root,
      verifier_ref: input.verifier_ref,
      verifier_build_hash: await verifierBuildHash(),
      verified_at: input.verified_at,
    },
    subject: {
      obligation_type: input.obligation.obligation_type,
      period: input.obligation.period,
      purpose: input.obligation.purpose,
      destination_class: input.obligation.destination_class,
      amount: input.obligation.authorized,
    },
    assertions: input.evaluation.rules.map((r) => ({
      code: r.code,
      label: r.label,
      status: r.status,
      evidence_level: r.evidence_level ?? "F",
    })),
    not_asserted: input.policy.not_asserted,
    verdict: input.evaluation.verdict,
    challenge_status: input.challenge_status ?? "NONE",
    previous_receipt_id: input.previous_receipt_id ?? null,
    supersedes_receipt_id: input.supersedes_receipt_id ?? null,
    ...(input.challenge ? { challenge: input.challenge } : {}),
    ...(input.correction ? { correction: input.correction } : {}),
  };

  const receipt_digest = await domainHash("pof.receipt.v1", receipt);
  const signature = await signReceiptDigest(receipt_digest);
  return { ...receipt, receipt_digest, signature };
}

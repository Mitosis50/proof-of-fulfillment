export * from "./types.ts";
export * from "./canonical.ts";
export * from "./hash.ts";
export * from "./sign.ts";
export * from "./policies.ts";
export * from "./evaluator.ts";
export * from "./verifier.ts";
export * from "./fixtures.ts";
export * from "./workshop.ts";
export * from "./golden.ts";
export * from "./naming.ts";
export * from "./portable.ts";
export * from "./agent-contract.ts";

export function formatMoney(minor: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

export function verdictLabel(v: string): string {
  switch (v) {
    case "VERIFIED":
      return "Verified";
    case "FAILED":
      return "Failed";
    case "INSUFFICIENT_EVIDENCE":
      return "Insufficient evidence";
    case "PARTIALLY_FULFILLED":
      return "Partially fulfilled";
    case "EXCEPTION":
      return "Exception";
    default:
      return v;
  }
}

import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-2xs font-medium tracking-wide uppercase",
  {
    variants: {
      tone: {
        verified: "bg-verified/10 text-verified",
        failed: "bg-failed/10 text-failed",
        exception: "bg-exception/10 text-exception",
        pending: "bg-pending/10 text-pending",
        muted: "bg-border/60 text-fg-muted",
      },
    },
    defaultVariants: { tone: "muted" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function verdictTone(verdict: string) {
  if (verdict === "VERIFIED") return "verified" as const;
  if (verdict === "EXCEPTION" || verdict === "CHALLENGED") return "exception" as const;
  if (
    verdict === "PENDING" ||
    verdict === "NONE" ||
    verdict === "INSUFFICIENT_EVIDENCE"
  ) {
    return "pending" as const;
  }
  return "failed" as const;
}

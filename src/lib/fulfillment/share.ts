import { PRODUCT_NAMES } from "./naming.ts";
import { PUBLIC_EXAMPLE_RECEIPT_ID } from "./golden.ts";

/** Frozen social card. Crawlers do not run Verify. This copy is the pin. */
export const SHARE_CARD = {
  path: "/share",
  example_id: PUBLIC_EXAMPLE_RECEIPT_ID,
  title: "Holds · tuition obligation",
  description:
    "A synthetic fulfillment receipt. Not a person. Not grades. Not attendance.",
  image: "/og-share.png",
  tagline: PRODUCT_NAMES.tagline,
} as const;

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PUBLIC_EXAMPLE_RECEIPT_ID,
  SHARE_CARD,
} from "@/lib/fulfillment";

export const Route = createFileRoute("/share")({
  head: () => ({
    meta: [
      { title: SHARE_CARD.title },
      { name: "description", content: SHARE_CARD.description },
      { property: "og:type", content: "website" },
      { property: "og:title", content: SHARE_CARD.title },
      { property: "og:description", content: SHARE_CARD.description },
      { property: "og:image", content: SHARE_CARD.image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SHARE_CARD.title },
      { name: "twitter:description", content: SHARE_CARD.description },
      { name: "twitter:image", content: SHARE_CARD.image },
    ],
  }),
  component: SharePage,
});

function SharePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-2xs uppercase tracking-caps text-fg-subtle">
        Public example · synthetic
      </p>
      <h1 className="mt-3 font-display text-5xl text-verified">Holds</h1>
      <p className="mt-4 font-display text-3xl">Tuition obligation.</p>
      <p className="mt-2 font-display text-3xl text-fg-muted">Not a person.</p>
      <p className="mt-6 text-lg text-fg-muted">{SHARE_CARD.description}</p>
      <p className="mt-3 text-sm text-fg-muted">{SHARE_CARD.tagline}</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link to="/verify" search={{ example: PUBLIC_EXAMPLE_RECEIPT_ID }}>
            Independent check
            <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link
            to="/refusal/$id"
            params={{ id: PUBLIC_EXAMPLE_RECEIPT_ID }}
          >
            What it will not say
          </Link>
        </Button>
      </div>
    </div>
  );
}

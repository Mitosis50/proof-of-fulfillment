import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { POLICY_REGISTRY, shortDigest } from "@/lib/fulfillment";

export const Route = createFileRoute("/registry")({ component: RegistryPage });

function RegistryPage() {
  const json = `${JSON.stringify(POLICY_REGISTRY, null, 2)}\n`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-print-hide>
        <div>
          <p className="text-2xs uppercase tracking-caps text-fg-subtle">
            Machine registry
          </p>
          <h1 className="mt-2 font-display text-4xl">Policy registry</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => window.print()}>
            Print registry
          </Button>
          <Button asChild variant="outline">
            <a href="/registry.json" download>
              Download JSON
            </a>
          </Button>
        </div>
      </div>

      <p className="text-lg text-fg-muted">{POLICY_REGISTRY.tagline}</p>
      <p className="mt-3 text-fg-muted">{POLICY_REGISTRY.notice}</p>

      <ol className="mt-10 space-y-10">
        {POLICY_REGISTRY.policies.map((p) => (
          <li key={`${p.policy_id}@${p.version}`} className="paper-receipt bg-bg-elevated p-6 shadow-paper sm:p-8">
            <p className="font-mono text-2xs text-fg-subtle">
              {p.policy_id} v{p.version}
            </p>
            <h2 className="mt-2 font-display text-2xl">{p.title}</h2>
            <p className="mt-2 text-sm text-fg-muted">{p.scope}</p>
            <p className="mt-4 break-all font-mono text-2xs text-fg-subtle">
              Hash {p.hash}
            </p>
            <p className="mt-1 font-mono text-2xs text-fg-subtle">
              Short {shortDigest(p.hash, 16)}
            </p>
            <h3 className="mt-6 text-2xs uppercase tracking-label text-fg-subtle">
              Required
            </h3>
            <ul className="mt-2 space-y-1 font-mono text-sm">
              {p.required.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
            <h3 className="mt-6 text-2xs uppercase tracking-label text-fg-subtle">
              Not asserted
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-fg-muted">
              {p.not_asserted.map((code) => (
                <li key={code}>{code}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <section className="mt-12" data-print-hide>
        <h2 className="font-display text-2xl">As JSON</h2>
        <p className="mt-2 text-sm text-fg-muted">
          Same bytes as{" "}
          <a href="/registry.json" className="text-primary underline-offset-4 hover:underline">
            /registry.json
          </a>
          . Tests fail if this file drifts from the frozen hashes. Humans can
          also read{" "}
          <Link to="/policies" className="text-primary underline-offset-4 hover:underline">
            policies
          </Link>
          .
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-bg-elevated p-4 font-mono text-2xs leading-relaxed text-fg-muted">
          {json}
        </pre>
      </section>
    </div>
  );
}

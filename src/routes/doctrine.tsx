import { createFileRoute, Link } from "@tanstack/react-router";
import { GOLDEN_CASES, verdictLabel } from "@/lib/fulfillment";
import { Badge, verdictTone } from "@/components/ui/badge";
import { useReceipts } from "@/store/receipts";

export const Route = createFileRoute("/doctrine")({ component: DoctrinePage });

const PRINCIPLES = [
  {
    title: "Verify evidence, not metaphysical truth",
    body: "A receipt is the result of evaluating available evidence under a published policy. It is not reality, and it is not a person.",
  },
  {
    title: "Private lives stay off the public record",
    body: "No names, diagnoses, grades, invoices, or bank identifiers. Public receipts hold commitments, statuses, and what was not asserted.",
  },
  {
    title: "Policy versions are immutable",
    body: "EDU-TUITION v1.0.0 cannot be edited after it issues a receipt. A correction to the rules is a new version.",
  },
  {
    title: "Conclusions are correctable",
    body: "History remains. A later receipt may supersede an earlier one. The prior digest still verifies as an artifact.",
  },
  {
    title: "No pay-for-verdict",
    body: "Families are free for core use. Independent verification is free. No one is paid more for PASS than FAIL.",
  },
  {
    title: "Conversation is not authority",
    body: "An agent, a chat, or a message board cannot authorize payment, rewrite a policy, or turn an unverified claim into VERIFIED.",
  },
];

function DoctrinePage() {
  const ready = useReceipts((s) => s.ready);
  const byId = useReceipts((s) => s.byId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-2xs uppercase tracking-caps text-fg-subtle">
        Product · Fulfilled
      </p>
      <h1 className="mt-2 font-display text-4xl">Doctrine</h1>
      <p className="mt-4 text-lg text-fg-muted">
        We verify the obligation. We do not publish the person.
      </p>
      <p className="mt-3 text-sm text-fg-muted">
        How we speak is on the{" "}
        <Link to="/naming" className="text-primary underline-offset-4 hover:underline">
          naming
        </Link>{" "}
        page. How a machine may check a receipt is on{" "}
        <Link to="/agents" className="text-primary underline-offset-4 hover:underline">
          agents
        </Link>
        . Allowed words describe obligations. Banned words rank people.

      </p>
      <ol className="mt-10 space-y-8">
        {PRINCIPLES.map((p, i) => (
          <li key={p.title}>
            <p className="font-mono text-2xs text-fg-subtle">0{i + 1}</p>
            <h2 className="mt-1 font-display text-2xl">{p.title}</h2>
            <p className="mt-2 text-fg-muted">{p.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-16 border-t border-border pt-10">
        <p className="text-2xs uppercase tracking-caps text-fg-subtle">
          Golden cases
        </p>
        <h2 className="mt-2 font-display text-3xl">These verdicts cannot drift.</h2>
        <p className="mt-3 text-fg-muted">
          If a future edit changes any of these conclusions, the engine is no
          longer this protocol. The hashes are frozen. The tests fail.
        </p>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {GOLDEN_CASES.map((c) => {
            const live = ready ? byId(c.id) : undefined;
            const matches = live ? live.verdict === c.verdict : null;
            return (
              <li key={c.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="text-sm">{c.title}</p>
                  <p className="font-mono text-2xs text-fg-subtle">{c.id}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge tone={verdictTone(c.verdict)}>{verdictLabel(c.verdict)}</Badge>
                  {matches === true ? (
                    <span className="text-2xs uppercase tracking-label text-verified">
                      locked
                    </span>
                  ) : matches === false ? (
                    <span className="text-2xs uppercase tracking-label text-failed">
                      drifted
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm text-fg-muted">
          Open a locked receipt in the{" "}
          <Link to="/workshop" className="text-primary underline-offset-4 hover:underline">
            workshop
          </Link>{" "}
          only as a new issuance. These identifiers stay the museum copies.
        </p>
        <p className="mt-8 text-sm text-fg-muted">
          This explorer is open source under Apache License 2.0. The patent
          grant is intentional. Contributions that publish a person, or loosen
          these cases, will be refused.
        </p>
      </section>
    </div>
  );
}

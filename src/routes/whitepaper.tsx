import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { whitepaperMarkdown, WHITEPAPER } from "@/lib/fulfillment";

export const Route = createFileRoute("/whitepaper")({
  head: () => ({
    meta: [
      { title: `${WHITEPAPER.title} · whitepaper` },
      {
        name: "description",
        content: WHITEPAPER.tagline,
      },
    ],
  }),
  component: WhitepaperPage,
});

function WhitepaperPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" data-print-hide>
        <p className="text-sm text-fg-muted">
          Protocol paper. Not a sales deck. Print or save as PDF.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="button" variant="outline" onClick={() => window.print()}>
            Print whitepaper
          </Button>
          <Button asChild variant="outline">
            <a href="https://github.com/Mitosis50/proof-of-fulfillment/blob/main/WHITEPAPER.md">
              WHITEPAPER.md
            </a>
          </Button>
        </div>
      </div>
      <article className="paper-receipt bg-bg-elevated px-6 py-10 shadow-paper sm:px-12 sm:py-14">
        <Markdown md={whitepaperMarkdown()} />
      </article>
      <p className="mt-8 text-sm text-fg-muted" data-print-hide>
        Doctrine is shorter. Naming is the word list. The registry is the pin.{" "}
        <Link to="/registry" className="text-primary underline-offset-4 hover:underline">
          Registry
        </Link>
        .
      </p>
    </div>
  );
}

function Markdown({ md }: { md: string }) {
  const blocks = md.trim().split(/\n\n+/);
  return (
    <div className="space-y-5 text-[17px] leading-relaxed text-fg">
      {blocks.map((block, i) => {
        const line = block.trim();
        if (line.startsWith("# ")) {
          return (
            <h1 key={i} className="font-display text-4xl sm:text-5xl">
              {inline(line.slice(2))}
            </h1>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="mt-10 font-display text-2xl">
              {inline(line.slice(3))}
            </h2>
          );
        }
        if (line.startsWith("| ")) {
          return <Table key={i} block={line} />;
        }
        if (line.startsWith("- ")) {
          return (
            <ul key={i} className="list-disc space-y-2 pl-5 text-fg-muted">
              {line.split("\n").map((row) => (
                <li key={row}>{inline(row.replace(/^- /, ""))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-fg-muted">
            {inline(line)}
          </p>
        );
      })}
    </div>
  );
}

function Table({ block }: { block: string }) {
  const rows = block
    .split("\n")
    .filter((r) => r.startsWith("|"))
    .filter((r) => !/^\|[\s-|]+\|$/.test(r))
    .map((r) =>
      r
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim()),
    );
  const [head, ...body] = rows;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {head.map((c) => (
              <th key={c} className="py-2 pr-4 font-medium">
                {inline(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row) => (
            <tr key={row.join()} className="border-b border-border align-top">
              {row.map((c) => (
                <td key={c} className="py-2 pr-4 font-mono text-2xs text-fg-muted">
                  {inline(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-medium text-fg">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="font-mono text-[0.85em] text-fg">
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a
          key={i}
          href={link[2]}
          className="text-primary underline-offset-4 hover:underline"
        >
          {link[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

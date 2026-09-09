import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useReceipts } from "@/store/receipts";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/workshop", label: "Workshop" },
  { to: "/verify", label: "Verify" },
  { to: "/agents", label: "Agents" },
  { to: "/demo/tuition", label: "Tuition" },
  { to: "/demo/consult", label: "Consult" },
  { to: "/circles", label: "Circle" },
  { to: "/policies", label: "Policies" },
  { to: "/registry", label: "Registry" },
  { to: "/doctrine", label: "Doctrine" },
  { to: "/naming", label: "Naming" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const seed = useReceipts((s) => s.seed);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void seed();
  }, [seed]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-sm" data-app-chrome>
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-baseline gap-2 min-h-11">
            <span className="font-display text-lg tracking-tight text-fg">Fulfilled</span>
            <span className="hidden text-2xs uppercase tracking-caps text-fg-subtle 2xl:inline">
              Proof of Fulfillment
            </span>
          </Link>
          <nav className="hidden items-center gap-0 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-md px-2.5 py-2 text-sm text-fg-muted transition-colors hover:text-fg min-h-11 inline-flex items-center",
                  pathname === item.to && "text-fg bg-bg-elevated",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-md lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open ? (
          <nav className="border-t border-border px-4 py-3 lg:hidden">
            <div className="flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "rounded-md px-3 py-3 text-base text-fg-muted",
                    pathname === item.to && "text-fg bg-bg-elevated",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border" data-app-chrome>
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-fg-muted">
            We verify the obligation. We do not publish the person.
          </p>
          <p className="text-xs text-fg-subtle">
            Synthetic demo. Apache 2.0.{" "}
            <Link to="/naming" className="underline-offset-2 hover:underline">
              Naming
            </Link>
            {" · "}
            <Link to="/doctrine" className="underline-offset-2 hover:underline">
              Doctrine
            </Link>
            . No real student, patient, or bank data.
          </p>
        </div>
      </footer>
    </div>
  );
}

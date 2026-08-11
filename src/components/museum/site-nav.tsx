import { Link, useRouterState } from "@tanstack/react-router";
import { Orbit } from "lucide-react";
import { AuthSlot } from "@/components/museum/auth-slot";
import { ShareButton } from "@/components/museum/share-button";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "展示", match: (p: string) => p === "/" },
  { to: "/sim", label: "崩壊シミュ", match: (p: string) => p.startsWith("/sim") },
  { to: "/board", label: "掲示板", match: (p: string) => p.startsWith("/board") },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="border-b border-[var(--color-border)] pt-[var(--grok-banner-h,0px)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <Orbit className="h-5 w-5 shrink-0 text-[var(--color-danger)]" aria-hidden />
            <span className="truncate text-sm font-medium tracking-wide">
              Java 宇宙敵博物館
            </span>
            <span className="hidden rounded-full border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-2 py-0.5 text-[10px] font-medium tracking-wide text-[var(--color-danger)] sm:inline">
              ENEMY OF THE UNIVERSE
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ShareButton size="sm" variant="outline" />
            <AuthSlot />
          </div>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto pb-0.5"
          aria-label="本館タブ"
        >
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "min-h-10 shrink-0 rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--color-danger-dim)] text-[var(--color-fg)] ring-1 ring-[var(--color-danger)]/50"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-elevated)] hover:text-[var(--color-fg)]",
                )}
                aria-current={active ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

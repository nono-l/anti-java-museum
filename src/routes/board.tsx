import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BoardPanel } from "@/components/museum/board-panel";
import { SiteNav } from "@/components/museum/site-nav";

export const Route = createFileRoute("/board")({
  component: BoardPage,
  head: () => ({
    meta: [{ title: "来館者掲示板 — Java 宇宙敵博物館" }],
  }),
});

function BoardPage() {
  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-fg)]">
      <SiteNav />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          展示に戻る
        </Link>
        <BoardPanel />
      </main>
    </div>
  );
}

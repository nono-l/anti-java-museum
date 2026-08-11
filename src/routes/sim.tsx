import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/museum/site-nav";
import { CollapseSim } from "@/components/sim/collapse-sim";

export const Route = createFileRoute("/sim")({
  component: SimPage,
  head: () => ({
    meta: [
      {
        title: "崩壊シミュ — Java 宇宙敵博物館",
      },
      {
        name: "description",
        content:
          "Javaだけを学んだエンジニアが案件で精神崩壊していくターン制シミュレーション。",
      },
    ],
  }),
});

function SimPage() {
  return (
    <div className="museum-cosmos min-h-dvh bg-[var(--color-bg)] text-[var(--color-fg)]">
      <SiteNav />
      <main className="px-4 py-8 sm:px-6 sm:py-10">
        <CollapseSim />
      </main>
    </div>
  );
}

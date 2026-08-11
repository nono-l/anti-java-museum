import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/museum/site-nav";
import { GameResultView } from "@/components/sim/game-result-view";
import {
  decodeGameResult,
  ogDescriptionFor,
  ogTitleFor,
} from "@/lib/game-result";

export const Route = createFileRoute("/Game/$code")({
  component: GameResultPage,
  head: ({ params }) => {
    const code = (params.code ?? "").replace(/\/$/, "");
    const result = decodeGameResult(code);
    const host = import.meta.env.VITE_PUBLIC_HOSTNAME as string | undefined;
    const pageUrl = host ? `https://${host}/Game/${code}/` : undefined;
    const ogImage = host
      ? `https://${host}/api/og/game?c=${encodeURIComponent(code)}`
      : `/api/og/game?c=${encodeURIComponent(code)}`;

    if (!result) {
      return {
        meta: [
          { title: "結果が見つかりません — ジャバだけ社畜物語" },
          { name: "description", content: "シェアリンクの結果コードが無効です。" },
          { name: "robots", content: "noindex" },
        ],
      };
    }

    const title = ogTitleFor(result);
    const description = ogDescriptionFor(result);

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:type", content: "image/svg+xml" },
        ...(pageUrl ? [{ property: "og:url", content: pageUrl }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
    };
  },
});

function GameResultPage() {
  const { code: raw } = Route.useParams();
  const code = raw.replace(/\/$/, "");
  const result = decodeGameResult(code);

  return (
    <div className="museum-cosmos min-h-dvh bg-[var(--color-bg)] text-[var(--color-fg)]">
      <SiteNav />
      <main className="px-4 py-8 sm:px-6 sm:py-10">
        {result ? (
          <GameResultView result={result} code={code} />
        ) : (
          <div className="mx-auto max-w-lg rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h1 className="font-display text-xl font-semibold">結果を復号できませんでした</h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              リンクが切れているか、改変されています。崩壊シミュでもう一度エンディングを出してシェアしてください。
            </p>
            <Link
              to="/sim"
              className="mt-4 inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-elevated)] px-4 text-sm font-medium"
            >
              崩壊シミュへ
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

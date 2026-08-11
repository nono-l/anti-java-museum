import { createFileRoute } from "@tanstack/react-router";
import { buildOgSvg, decodeGameResult } from "@/lib/game-result";

export const Route = createFileRoute("/api/og/game")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        const code = (url.searchParams.get("c") || "").replace(/\/$/, "");
        const result = decodeGameResult(code);

        if (!result) {
          const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#1a1520"/>
  <text x="80" y="300" fill="#f3eef7" font-family="system-ui,sans-serif" font-size="42" font-weight="700">結果カードを表示できません</text>
  <text x="80" y="360" fill="#b5a8c0" font-family="system-ui,sans-serif" font-size="24">Java 宇宙敵博物館</text>
</svg>`;
          return new Response(fallback, {
            status: 404,
            headers: {
              "Content-Type": "image/svg+xml; charset=utf-8",
              "Cache-Control": "public, max-age=300",
            },
          });
        }

        const svg = buildOgSvg(result);
        return new Response(svg, {
          status: 200,
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=86400, immutable",
          },
        });
      },
    },
  },
});

import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { CreatedWithGrokBanner } from "@/components/created-with-grok-banner";
import appCss from "../styles.css?url";

const APP_NAME = "Java 宇宙敵博物館";
const APP_DESCRIPTION =
  "Javaは宇宙の敵である——非生産的で、人間を苦しめ、AIを無駄にする。NPE・throws・クラスパス・Spring塵を告発するインタラクティブ博物館。";
const host = import.meta.env.VITE_PUBLIC_HOSTNAME as string | undefined;
const ogImage = host ? `https://${host}/og.jpg` : undefined;
const pageUrl = host ? `https://${host}/` : undefined;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "description", content: APP_DESCRIPTION },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "theme-color", content: "#07070c" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: APP_NAME },
      { property: "og:title", content: APP_NAME },
      { property: "og:description", content: APP_DESCRIPTION },
      ...(pageUrl ? [{ property: "og:url", content: pageUrl }] : []),
      ...(ogImage
        ? [
            { property: "og:image", content: ogImage },
            { property: "og:image:width", content: "1200" },
            { property: "og:image:height", content: "630" },
            { property: "og:image:type", content: "image/jpeg" },
            { property: "og:image:alt", content: `${APP_NAME} — 宇宙の敵` },
          ]
        : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: APP_NAME },
      { name: "twitter:description", content: APP_DESCRIPTION },
      ...(ogImage
        ? [
            { name: "twitter:image", content: ogImage },
            { name: "twitter:image:alt", content: `${APP_NAME} — 宇宙の敵` },
          ]
        : []),
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <CreatedWithGrokBanner />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});

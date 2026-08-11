import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  const callbackURL =
    redirect && redirect.startsWith("/") ? redirect : "/board";

  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--color-bg)] px-4 pt-[var(--grok-banner-h,0px)] text-[var(--color-fg)]">
      <div className="w-full max-w-sm space-y-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            ACCOUNT
          </p>
          <h1 className="font-display mt-1 text-xl font-semibold">アカウント連携</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Google または X でログインすると、来館者掲示板に書き込めます。展示の閲覧はログイン不要です。
          </p>
        </div>
        {authEnabled ? (
          <div className="space-y-2">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL })}
              >
                {p.label} で続ける
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">サインインは無効です。</p>
        )}
        <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-4 text-center text-sm">
          <Link to="/board" className="text-[var(--color-muted)] hover:text-[var(--color-fg)]">
            掲示板を見る
          </Link>
          <Link to="/" className="text-[var(--color-subtle)] hover:text-[var(--color-fg)]">
            博物館に戻る
          </Link>
        </div>
      </div>
    </main>
  );
}

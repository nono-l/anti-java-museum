import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, MessageSquareText, Trash2 } from "lucide-react";
import {
  createBoardPost,
  deleteBoardPost,
  listBoardPosts,
  type BoardPost,
} from "@/lib/board";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { recordMuseumEvent } from "@/lib/museum-stats";
import { Button } from "@/components/ui/button";

function formatWhen(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

export function BoardPanel() {
  const { user, isPending } = useCurrentUserState();
  const [mounted, setMounted] = useState(false);
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listBoardPosts();
      setPosts(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      const post = await createBoardPost({
        data: {
          body,
          authorName: user.displayName ?? user.primaryEmail ?? "来館者",
        },
      });
      setPosts((prev) => [post, ...prev]);
      setBody("");
      void recordMuseumEvent("post");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "投稿に失敗しました";
      if (msg.toLowerCase().includes("unauthorized")) {
        setError("投稿にはログインが必要です");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: number) {
    setError(null);
    try {
      await deleteBoardPost({ data: { id } });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    }
  }

  const authBusy = !mounted || isPending;

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            GUEST BOOK · COSMIC WITNESS
          </p>
          <h2 className="font-display mt-1 flex items-center gap-2 text-xl font-semibold sm:text-2xl">
            <MessageSquareText className="h-5 w-5 text-[var(--color-subtle)]" />
            来館者掲示板
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            アカウント連携後に書き込めます。Java＝宇宙の敵、単一武器教育への告発・共感・反論を残してください。
          </p>
        </div>
        <Link
          to="/board"
          className="text-xs font-medium text-[var(--color-muted)] underline-offset-4 hover:text-[var(--color-fg)] hover:underline"
        >
          掲示板ページへ
        </Link>
      </div>

      <div className="mb-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
        {authBusy ? (
          <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            セッション確認中…
          </div>
        ) : user ? (
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-[var(--color-subtle)]">
                {user.displayName ?? "来館者"} として投稿
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="例: いちばん悪いのは学び直さない奴、刺さった…"
                className="mt-2 w-full resize-y rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-3 text-sm text-[var(--color-fg)] outline-none focus:border-[var(--color-border-strong)]"
              />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs tabular text-[var(--color-subtle)]">
                {body.trim().length} / 1000
              </span>
              <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    送信中
                  </>
                ) : (
                  "書き込む"
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--color-muted)]">
              書き込みにはログインが必要です。
            </p>
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] px-3 text-xs font-medium hover:bg-[var(--color-surface)]"
            >
              ログインして書き込む
            </Link>
          </div>
        )}
        {error && (
          <p className="mt-3 text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-[var(--color-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          掲示を読み込み中…
        </div>
      ) : posts.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--color-muted)]">
          まだ投稿がありません。最初の告発者になってください。
        </p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li
              key={p.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-fg)]">
                    {p.authorName}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-subtle)]">
                    {formatWhen(p.createdAt)}
                  </p>
                </div>
                {user?.id === p.userId && (
                  <button
                    type="button"
                    onClick={() => void onDelete(p.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-subtle)] transition-colors hover:bg-[var(--color-elevated)] hover:text-[var(--color-danger)]"
                    aria-label="投稿を削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-muted)]">
                {p.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy, Share2 } from "lucide-react";
import {
  getGameShareAbsoluteUrl,
  getGameSharePath,
  getGameXIntent,
  resultScoreRows,
  type SharedGameResult,
} from "@/lib/game-result";
import { recordMuseumEvent } from "@/lib/museum-stats";

type Props = {
  result: SharedGameResult;
  code: string;
  /** エンディング直後など、シミュ内埋め込み */
  embedded?: boolean;
  onReplay?: () => void;
};

export function GameResultView({ result, code, embedded, onReplay }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "x">("idle");
  const path = getGameSharePath(code);
  const [shareUrl, setShareUrl] = useState(path);
  const scores = resultScoreRows(result);

  useEffect(() => {
    setShareUrl(getGameShareAbsoluteUrl(code));
  }, [code]);

  async function shareX() {
    void recordMuseumEvent("share");
    const intent = getGameXIntent(result, code);
    const opened = window.open(intent, "_blank", "noopener,noreferrer");
    if (opened) {
      setStatus("x");
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setStatus("copied");
      } catch {
        window.location.href = intent;
      }
    }
    window.setTimeout(() => setStatus("idle"), 2200);
  }

  async function copyLink() {
    void recordMuseumEvent("share");
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2200);
    } catch {
      // ignore
    }
  }

  return (
    <div className={`mx-auto max-w-lg ${embedded ? "" : ""}`}>
      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-5 sm:p-6">
        <p className="text-xs font-medium tracking-[0.18em] text-[var(--color-warn)]">
          ENDING CARD · SHAREABLE
        </p>
        <p className="font-display mt-2 text-4xl font-semibold text-[var(--color-warn)]">
          RANK {result.rank}
        </p>
        <h1 className="font-display mt-1 text-2xl font-semibold">{result.title}</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{result.body}</p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--color-muted)] sm:grid-cols-3">
          <Chip label="案件" value={result.project} />
          <Chip label="日数" value={`${result.day}日目`} />
          <Chip label="報酬感" value={`¥${result.money}`} />
          <Chip label="精神" value={String(result.mind)} />
          <Chip label="単一武器" value={String(result.mono)} />
          <Chip label="進捗" value={String(result.progress)} />
        </div>

        <div className="mt-5 space-y-2">
          {scores.map((sc) => (
            <div key={sc.label} className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-2 text-xs">
              <span className="text-[var(--color-subtle)]">{sc.label}</span>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full bg-[var(--color-warn)]"
                  style={{ width: `${sc.value}%` }}
                />
              </div>
              <span className="tabular text-right">{sc.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-3">
          <p className="text-[10px] font-medium text-[var(--color-subtle)]">シェアリンク（結果コード）</p>
          <p className="mt-1 break-all font-mono text-xs text-[var(--color-muted)]">{shareUrl}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={shareX}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-danger)] px-4 text-sm font-medium text-[var(--color-bg)] min-w-[140px]"
          >
            {status === "x" ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {status === "x" ? "Xを開きました" : "Xでシェア"}
          </button>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-elevated)] px-4 text-sm font-medium"
          >
            {status === "copied" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {status === "copied" ? "コピー済" : "リンクコピー"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          {!embedded && (
            <Link to="/sim" className="text-[var(--color-muted)] underline-offset-2 hover:text-[var(--color-fg)] hover:underline">
              自分も崩壊シミュで遊ぶ
            </Link>
          )}
          {onReplay && (
            <button
              type="button"
              onClick={onReplay}
              className="text-[var(--color-muted)] underline-offset-2 hover:text-[var(--color-fg)] hover:underline"
            >
              もういちど
            </button>
          )}
          <Link to="/" className="text-[var(--color-muted)] underline-offset-2 hover:text-[var(--color-fg)] hover:underline">
            展示へ
          </Link>
        </div>

        <p className="mt-4 text-[10px] leading-relaxed text-[var(--color-subtle)]">
          結果はURLに符号化されています（サーバ保存なし）。X のカードはタイトル・説明・画像（OG）で個別表示されます。
          一部クライアントは SVG 画像をサムネに使えない場合があります。
        </p>
      </div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-2 py-1.5">
      <p className="text-[10px] text-[var(--color-subtle)]">{label}</p>
      <p className="font-medium text-[var(--color-fg)]">{value}</p>
    </div>
  );
}

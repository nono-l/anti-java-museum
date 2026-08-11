import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const CUFFS = [
  {
    id: "null",
    title: "null を型から外せない",
    body: "修正は『6つの博士論文を結び合わせる』級。後方互換が十億ドルの過ちを固定する。",
  },
  {
    id: "erasure",
    title: "ジェネリクスを reify できない",
    body: "2004 の消去は、実行時型を永遠に半端にする。新言語は最初から reified を選ぶ。",
  },
  {
    id: "api",
    title: "古い API が死ねない",
    body: "非推奨は墓地ではなく展示室。Date / Vector / 古い SecurityManager が教科書に残り続ける。",
  },
  {
    id: "ee",
    title: "EE 名とパッケージの政治",
    body: "javax を綺麗に進化させられず、断裂改名という別の手錠を生んだ。",
  },
];

export function Handcuff() {
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CUFFS.map((c) => [c.id, true])),
  );
  const locked = Object.values(on).filter(Boolean).length;
  const debt = Math.min(100, 40 + locked * 15);

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT · SEV 85 · COMPAT HANDCUFFS
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            後方互換の手錠 — 壊せない過去が未来を縛る
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
            「安定」の名の長期債務。null・型消去・死なない API・改名政治。
            それぞれ単独でも重い。重なると設計の自由度が手錠になる。深刻度 85。
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-3 py-2 text-right">
          <p className="text-xs text-[var(--color-muted)]">長期債務</p>
          <p className="font-display text-2xl font-semibold tabular text-[var(--color-danger)]">
            {debt}%
          </p>
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {CUFFS.map((c) => {
          const lockedC = on[c.id];
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  setOn((prev) => ({ ...prev, [c.id]: !prev[c.id] }));
                  void recordMuseumEvent("interaction");
                }}
                className={`w-full rounded-[var(--radius-md)] border px-3 py-3 text-left transition-colors ${
                  lockedC
                    ? "border-[var(--color-danger)]/50 bg-[var(--color-danger-dim)]/40"
                    : "border-[var(--color-border)] bg-[var(--color-elevated)]"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-fg)]">
                  {lockedC ? (
                    <Lock className="h-4 w-4 text-[var(--color-danger)]" />
                  ) : (
                    <Unlock className="h-4 w-4 text-[var(--color-ok)]" />
                  )}
                  {c.title}
                </span>
                <span className="mt-1 block text-xs text-[var(--color-muted)]">{c.body}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="danger"
          onClick={() => {
            setOn(Object.fromEntries(CUFFS.map((c) => [c.id, true])));
            void recordMuseumEvent("joy");
          }}
        >
          全手錠を嵌める（現実）
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setOn(Object.fromEntries(CUFFS.map((c) => [c.id, false])))}
        >
          幻想の解放
        </Button>
      </div>
    </section>
  );
}

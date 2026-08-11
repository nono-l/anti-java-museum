import { useState } from "react";
import { Landmark, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const ACTS = [
  {
    id: "brand",
    title: "商標と名前の制約",
    body: "Java / javax を巡る権利が、技術的リネームを政治問題に変える。",
  },
  {
    id: "ee",
    title: "Java EE → Jakarta EE",
    body: "移管そのものは合理でも、パッケージ断裂コストは利用側が払う。",
  },
  {
    id: "lts",
    title: "版とサポートの迷宮",
    body: "どの LTS が『社内標準』かで、機能とセキュリティ修正の速度が決まる。",
  },
  {
    id: "vendor",
    title: "配布ベンダの割拠",
    body: "同じ言語でもビルド・サポート契約が企業調達の儀式になる。",
  },
];

export function Governance() {
  const [score, setScore] = useState(40);

  function push(delta: number) {
    setScore((s) => Math.min(100, Math.max(0, s + delta)));
    void recordMuseumEvent("dep");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT · SEV 76 · GOVERNANCE
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            ガバナンス／商標／改名政治
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
            技術的必然より政治と商標が生態系コストを決める局面が続く。
            開発者のキーボードの外で、文明税が確定する。深刻度 76。
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-3 py-2 text-right">
          <p className="text-xs text-[var(--color-muted)]">政治コスト</p>
          <p className="font-display text-2xl font-semibold tabular text-[var(--color-danger)]">
            {score}%
          </p>
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {ACTS.map((a) => (
          <li
            key={a.id}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-3"
          >
            <p className="flex items-center gap-2 text-sm font-medium text-[var(--color-fg)]">
              <Landmark className="h-4 w-4 text-[var(--color-subtle)]" />
              {a.title}
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{a.body}</p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={() => push(12)}
            >
              この政治を適用する
            </Button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="danger" onClick={() => push(20)}>
          <Scale className="h-4 w-4" />
          改名を強制する
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setScore(40)}>
          リセット
        </Button>
        <p className="text-xs text-[var(--color-muted)]">
          政治コストが上がっても、業務ロジックの1行は増えない——増えるのは移行と会議だけ。
        </p>
      </div>
    </section>
  );
}

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  PackageOpen,
  PlaneTakeoff,
  Skull,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const PIPELINE = [
  {
    id: "compile",
    title: "コンパイルが通る",
    surface: "型は揃った。緑のチェック。",
    buried: "NPE も設定ミスもまだ沈黙。実行時まで嘘はバレない。",
  },
  {
    id: "boot",
    title: "Spring が起動する",
    surface: "Started Application in 12.4 seconds",
    buried: "オートコンフィグの半分は未検証。Bean は『いる』だけ。",
  },
  {
    id: "http",
    title: "200 が返る",
    surface: "ヘルスチェック OK。デモ画面も動く。",
    buried: "特定ユーザー・特定時刻・特定順序でだけ死ぬ道が残る。",
  },
  {
    id: "ship",
    title: "納品・リリース",
    surface: "表向き異常なし。検収サイン。",
    buried: "ログは握りつぶし教義。観測は閉じた。逃げ道が開く。",
  },
  {
    id: "flee",
    title: "作りっぱなしで売り逃げ",
    surface: "次案件へ。担当変更。ベンダー撤退。",
    buried: "障害は運用と後続の認知税。宇宙が請求書を受け取る。",
  },
];

type Phase = (typeof PIPELINE)[number]["id"];

export function ShipAndFlee() {
  const [phase, setPhase] = useState<Phase>("compile");
  const [ships, setShips] = useState(0);

  const idx = PIPELINE.findIndex((p) => p.id === phase);
  const step = PIPELINE[idx] ?? PIPELINE[0]!;

  const surfaceOk = 100;
  const buriedRisk = useMemo(() => Math.min(100, 18 + idx * 18 + ships * 6), [idx, ships]);
  const fleeScore = useMemo(() => Math.min(100, idx * 22 + ships * 8), [idx, ships]);

  function go(id: Phase) {
    setPhase(id);
    void recordMuseumEvent("interaction");
  }

  function next() {
    const n = Math.min(PIPELINE.length - 1, idx + 1);
    setPhase(PIPELINE[n]!.id);
    if (PIPELINE[n]!.id === "flee") {
      setShips((s) => s + 1);
      void recordMuseumEvent("share");
    } else {
      void recordMuseumEvent("interaction");
    }
  }

  function shipFlee() {
    setPhase("flee");
    setShips((s) => s + 1);
    void recordMuseumEvent("share");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT 09 · SHIP & FLEE
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            表向き異常なし＝作りっぱなしで売り逃げできる思想
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
            コンパイルが通り、起動し、200 が返れば「異常なし」。
            実行時まで沈黙する失敗、層に埋もれた因果、握りつぶされたログ——
            これらが揃うと、
            <strong className="font-medium text-[var(--color-fg)]">
              表向きさえ綺麗なら納品して逃げられる
            </strong>
            という企業儀式が成立する。それが Java 圏で再生産される思想である。
          </p>
        </div>
        <div className="flex gap-2">
          <Metric label="表向き健全" value={surfaceOk} tone="ok" />
          <Metric label="埋没リスク" value={buriedRisk} tone="danger" />
          <Metric label="売り逃げ度" value={fleeScore} tone="warn" />
        </div>
      </div>

      <ol className="mb-4 grid gap-2 sm:grid-cols-5">
        {PIPELINE.map((p, i) => {
          const on = p.id === phase;
          const done = i < idx;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => go(p.id)}
                className={`w-full rounded-[var(--radius-md)] border px-2 py-3 text-left transition-colors sm:px-3 ${
                  on
                    ? "border-[var(--color-danger)] bg-[var(--color-danger-dim)]"
                    : done
                      ? "border-[var(--color-border-strong)] bg-[var(--color-elevated)]"
                      : "border-[var(--color-border)] bg-[var(--color-elevated)]/60 hover:border-[var(--color-border-strong)]"
                }`}
              >
                <span className="text-[10px] font-medium text-[var(--color-subtle)]">
                  STEP {i + 1}
                </span>
                <span className="mt-1 block text-xs font-medium text-[var(--color-fg)] sm:text-sm">
                  {p.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-ok)]/30 bg-[var(--color-elevated)] p-4">
          <p className="flex items-center gap-2 text-xs font-medium text-[var(--color-ok)]">
            <BadgeCheck className="h-4 w-4" />
            表向き（検収・デモ・監視の浅い面）
          </p>
          <p className="mt-3 font-mono text-sm text-[var(--color-fg)]">{step.surface}</p>
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            ここだけ見ると「異常なし」。売り逃げの合法面はいつもここにある。
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[var(--color-danger-dim)]/40 p-4">
          <p className="flex items-center gap-2 text-xs font-medium text-[var(--color-danger)]">
            <Skull className="h-4 w-4" />
            埋没側（実行時・層・握りつぶしログ）
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
            {step.buried}
          </p>
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            思想は言う: 表が静かなら出荷してよい。後で壊れるのは運用と宇宙の問題。
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={next} disabled={idx >= PIPELINE.length - 1 && ships > 0}>
          <Timer className="h-4 w-4" />
          次の儀式へ
        </Button>
        <Button type="button" size="sm" variant="danger" onClick={shipFlee}>
          <PlaneTakeoff className="h-4 w-4" />
          表向きOKなので売り逃げる
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => { setPhase("compile"); setShips(0); }}>
          <PackageOpen className="h-4 w-4" />
          最初から
        </Button>
        <span className="text-xs text-[var(--color-muted)]">
          売り逃げ回数{" "}
          <strong className="tabular text-[var(--color-danger)]">{ships}</strong>
          {ships > 0 && " — 表向きは毎回 100% 健全のまま"}
        </span>
      </div>

      <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3 text-sm text-[var(--color-muted)]">
        <p>
          <strong className="font-medium text-[var(--color-fg)]">接続:</strong>{" "}
          実行時まで沈黙する失敗 × フレームワーク塵のスタック × ログ握りつぶしの悪いクセ
          ＝
          <span className="text-[var(--color-danger)]">
            表向き異常がなければ作りっぱなしで売り逃げできる
          </span>
          。Java の思想は「正しさの証明」より「検収面の静かさ」を最適化しやすい。
        </p>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "danger" | "warn" | "ok";
}) {
  const color =
    tone === "danger"
      ? "text-[var(--color-danger)]"
      : tone === "ok"
        ? "text-[var(--color-ok)]"
        : "text-[var(--color-warn)]";
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-right">
      <p className="text-[10px] text-[var(--color-muted)] sm:text-xs">{label}</p>
      <p className={`font-display text-xl font-semibold tabular sm:text-2xl ${color}`}>
        {value}%
      </p>
    </div>
  );
}

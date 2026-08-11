import { useMemo, useState } from "react";
import { Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const LAYERS = [
  { id: "dto", label: "DTO / Record", lines: 28 },
  { id: "entity", label: "JPA Entity", lines: 64 },
  { id: "mapper", label: "MapStruct Mapper", lines: 41 },
  { id: "repo", label: "Repository インタフェース", lines: 18 },
  { id: "service", label: "Service + Impl", lines: 120 },
  { id: "controller", label: "RestController", lines: 55 },
  { id: "config", label: "@Configuration", lines: 72 },
  { id: "aspect", label: "AOP Aspect", lines: 48 },
  { id: "exception", label: "Exception 階層", lines: 36 },
  { id: "test", label: "@SpringBootTest", lines: 95 },
];

export function BoilerplateTrap() {
  const [depth, setDepth] = useState(3);
  const visible = LAYERS.slice(0, depth);
  const totalLines = useMemo(
    () => visible.reduce((s, l) => s + l.lines, 0),
    [visible],
  );
  const featureLines = 12;
  const tax = Math.max(1, Math.round(totalLines / featureLines));

  function deepen() {
    setDepth((d) => Math.min(LAYERS.length, d + 1));
    void recordMuseumEvent("joy");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
        EXHIBIT 03
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
        ボイラープレート銀河 — Write Once, Suffer Everywhere
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        1機能に必要な意味は数行。しかし宇宙法（層・アノテーション・生成器）が
        その周囲に惑星系を強制する。「正しい企業構造」の快感が、認知の重力井戸になる。
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_220px]">
        <ul className="grid gap-2 sm:grid-cols-2">
          {visible.map((layer, i) => (
            <li
              key={layer.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] font-mono text-[10px] text-[var(--color-subtle)]">
                  {i + 1}
                </span>
                <span className="truncate text-sm font-medium">{layer.label}</span>
              </div>
              <span className="shrink-0 font-mono text-xs tabular text-[var(--color-warn)]">
                ~{layer.lines}行
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
            <p className="text-xs text-[var(--color-subtle)]">意味のあるコード</p>
            <p className="font-display text-3xl font-semibold tabular">{featureLines}</p>
            <p className="mt-3 text-xs text-[var(--color-subtle)]">儀式の総行数</p>
            <p className="font-display text-3xl font-semibold tabular text-[var(--color-danger)]">
              {totalLines}
            </p>
            <p className="mt-3 text-xs text-[var(--color-subtle)]">苦痛倍率</p>
            <p className="font-display text-3xl font-semibold tabular text-[var(--color-warn)]">
              ×{tax}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={deepen}
              disabled={depth >= LAYERS.length}
            >
              <Layers className="h-4 w-4" />
              層を足す
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setDepth(3);
                void recordMuseumEvent("joy");
              }}
            >
              最小構成へ
            </Button>
          </div>
          {depth >= LAYERS.length && (
            <p className="flex gap-2 text-xs text-[var(--color-warn)]">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              全層展開完了。機能は12行のまま、宇宙は577行の儀式で満ちた。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

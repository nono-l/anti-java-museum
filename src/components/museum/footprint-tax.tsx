import { useState } from "react";
import { Cloud, Cpu, Server, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

export function FootprintTax() {
  const [services, setServices] = useState(12);
  const [withSpring, setWithSpring] = useState(true);
  const [gcPause, setGcPause] = useState(12);

  const perServiceMb = withSpring ? 650 : 180;
  const totalGb = ((services * perServiceMb) / 1024).toFixed(1);
  const cloudTax = Math.round(services * (withSpring ? 38 : 11));
  const coldStart = withSpring ? 4.2 + services * 0.05 : 0.9 + services * 0.02;

  function bumpServices(d: number) {
    setServices((s) => Math.min(40, Math.max(1, s + d)));
    void recordMuseumEvent("tool");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT · SEV 80 · JVM / FOOTPRINT TAX
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            JVM 税 — 起動・メモリ・GC 停止が雲を焼く
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
            長いコールドスタート、高い常駐、予測しづらい GC ポーズ。
            サーバレスや短命プロセスでは構造的不利。「一度温まれば速い」は逃げ台詞になりやすい。深刻度 80。
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
          <p className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <Server className="h-4 w-4" />
            サービス数
          </p>
          <p className="font-display mt-2 text-3xl font-semibold tabular">{services}</p>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => bumpServices(-1)}>
              −
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => bumpServices(1)}>
              ＋
            </Button>
          </div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
          <p className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <Cpu className="h-4 w-4" />
            推定メモリ
          </p>
          <p className="font-display mt-2 text-3xl font-semibold tabular text-[var(--color-warn)]">
            {totalGb}
            <span className="text-base font-medium"> GB</span>
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">≈ {perServiceMb} MB/サービス</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
          <p className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <Timer className="h-4 w-4" />
            コールドスタート
          </p>
          <p className="font-display mt-2 text-3xl font-semibold tabular text-[var(--color-warn)]">
            {coldStart.toFixed(1)}
            <span className="text-base font-medium"> s</span>
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">風刺モデル</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[var(--color-danger-dim)]/40 p-4">
          <p className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <Cloud className="h-4 w-4" />
            雲への月次税（相対）
          </p>
          <p className="font-display mt-2 text-3xl font-semibold tabular text-[var(--color-danger)]">
            {cloudTax}
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">GC ポーズ感度 +{gcPause}ms 級</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={withSpring ? "danger" : "secondary"}
          onClick={() => {
            setWithSpring(true);
            setGcPause(18);
            void recordMuseumEvent("dep");
          }}
        >
          Spring Boot 既定のまま
        </Button>
        <Button
          type="button"
          size="sm"
          variant={!withSpring ? "default" : "secondary"}
          onClick={() => {
            setWithSpring(false);
            setGcPause(6);
            void recordMuseumEvent("interaction");
          }}
        >
          薄いランタイムに削る
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            setGcPause((g) => Math.min(80, g + 8));
            void recordMuseumEvent("tool");
          }}
        >
          GC ポーズを再現
        </Button>
      </div>

      <p className="mt-4 text-sm text-[var(--color-muted)]">
        {withSpring
          ? "「本番準備完了」の既定値が RAM と起動時間を先に確保する。売り逃げ後の請求書はクラウドにある。"
          : "削ると数字は下がる。だが教材と社内標準が Spring 既定に戻そうとする——単一武器と JVM 税は共犯。"}
      </p>
    </section>
  );
}

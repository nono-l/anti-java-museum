import { useState } from "react";
import { Database, FileWarning, MemoryStick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

export function ResourceLeak() {
  const [closed, setClosed] = useState(false);
  const [requests, setRequests] = useState(0);
  const poolLeft = Math.max(0, 20 - (closed ? 0 : requests));
  const surfaceOk = poolLeft > 0;
  const leakRisk = Math.min(100, closed ? 8 : 25 + requests * 4);

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT · SEV 74 · RESOURCE ASYMMETRY
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            リソース管理の非対称 — メモリは GC、接続は沈黙リーク
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
            ヒープは回収される。JDBC・ファイル・ソケットは手動。閉じ忘れは実行時まで静かで、
            表向き 200 のままプールが枯渇する。売り逃げ思想と相性が悪い。深刻度 74。
          </p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-right">
            <p className="text-xs text-[var(--color-muted)]">接続プール残</p>
            <p className="font-display text-2xl font-semibold tabular">{poolLeft}</p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-3 py-2 text-right">
            <p className="text-xs text-[var(--color-muted)]">リークレート</p>
            <p className="font-display text-2xl font-semibold tabular text-[var(--color-danger)]">
              {leakRisk}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3">
          <p className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <MemoryStick className="h-4 w-4" />
            ヒープ
          </p>
          <p className="mt-2 text-sm text-[var(--color-fg)]">GC がいつか回収</p>
          <p className="mt-1 text-xs text-[var(--color-subtle)]">タイミングは保証されない</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3">
          <p className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <Database className="h-4 w-4" />
            JDBC / ファイル
          </p>
          <p className="mt-2 text-sm text-[var(--color-fg)]">
            {closed ? "try-with-resources で閉じた" : "close() を忘れている"}
          </p>
          <p className="mt-1 text-xs text-[var(--color-subtle)]">手動解放が正史</p>
        </div>
        <div
          className={`rounded-[var(--radius-md)] border p-3 ${
            surfaceOk
              ? "border-[var(--color-ok)]/30 bg-[var(--color-elevated)]"
              : "border-[var(--color-danger)] bg-[var(--color-danger-dim)]"
          }`}
        >
          <p className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
            <FileWarning className="h-4 w-4" />
            表向き
          </p>
          <p className="mt-2 text-sm font-medium text-[var(--color-fg)]">
            {surfaceOk ? "HTTP 200 · 検収OK" : "プール枯渇 · 本番炎上"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="danger"
          onClick={() => {
            setRequests((r) => r + 1);
            void recordMuseumEvent("interaction");
          }}
          disabled={closed || poolLeft <= 0}
        >
          close せずにリクエスト
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setClosed(true);
            void recordMuseumEvent("indent");
          }}
        >
          try-with-resources を思い出す
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setClosed(false);
            setRequests(0);
          }}
        >
          リセット
        </Button>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Braces, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

export function TypeErasure() {
  const [runtime, setRuntime] = useState(false);
  const lie = Math.max(0, 100 - (runtime ? 70 : 10));
  const truth = runtime ? 88 : 25;

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT · SEV 78 · TYPE ERASURE
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            型消去 — コンパイル時だけの「型安全」
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
            後方互換のための 2004 年の妥協が今も残る。ジェネリクスはコンパイルで消え、実行時は raw と
            自動挿入キャスト。リフレクションでは型パラメータが取れない。深刻度 78。
          </p>
        </div>
        <div className="flex gap-2">
          <Metric label="型安全の看板" value={lie} ok={!runtime} />
          <Metric label="実行時の嘘" value={truth} ok={false} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-4 font-mono text-xs text-[var(--color-muted)]">
{`// ソース（コンパイル時）
List<String> names = new ArrayList<>();
names.add("cosmos");
String s = names.get(0);`}
        </pre>
        <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[var(--color-danger-dim)]/30 p-4 font-mono text-xs text-[var(--color-muted)]">
{runtime
  ? `// 実行時に近い現実
List names = new ArrayList();
names.add("cosmos");
String s = (String) names.get(0);
// T は消えた。残るのは Object とキャスト`
  : `// まだ「型がある」フリの時間帯
// javac が守ってくれる……今だけ`}
        </pre>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={!runtime ? "secondary" : "outline"}
          onClick={() => {
            setRuntime(false);
            void recordMuseumEvent("interaction");
          }}
        >
          <Braces className="h-4 w-4" />
          コンパイル時の顔
        </Button>
        <Button
          type="button"
          size="sm"
          variant={runtime ? "danger" : "secondary"}
          onClick={() => {
            setRuntime(true);
            void recordMuseumEvent("indent");
          }}
        >
          <Ghost className="h-4 w-4" />
          型を消す（実行時）
        </Button>
      </div>

      <p className="mt-4 text-sm text-[var(--color-muted)]">
        {runtime
          ? "『型安全な言語』の宣伝と、実行時に型がいない事実が同居する。これが互換手錠の一形態。"
          : "看板は綺麗。消去ボタンを押すと、ジェネリクスが半分だけの約束だと分かる。"}
      </p>
    </section>
  );
}

function Metric({ label, value, ok }: { label: string; value: number; ok: boolean }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-right">
      <p className="text-[10px] text-[var(--color-muted)]">{label}</p>
      <p
        className={`font-display text-2xl font-semibold tabular ${
          ok ? "text-[var(--color-ok)]" : "text-[var(--color-danger)]"
        }`}
      >
        {value}%
      </p>
    </div>
  );
}

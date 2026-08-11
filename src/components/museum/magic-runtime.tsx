import { useState } from "react";
import { Sparkles, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const SPELLS = [
  {
    ann: "@Transactional",
    lie: "付けたメソッドは常にトランザクション",
    truth: "self-invocation では効かない。proxy 境界の外から呼ばないと嘘になる。",
  },
  {
    ann: "@Async",
    lie: "非同期で動く",
    truth: "同じく proxy。同じクラスから呼ぶと同期のまま。コンパイルは成功する。",
  },
  {
    ann: "@Cacheable",
    lie: "結果がキャッシュされる",
    truth: "キー設計と proxy 条件を外すと静かにミスヒット。実行時までわからない。",
  },
  {
    ann: "@Autowired",
    lie: "依存が注入される",
    truth: "フィールド注入はテストと循環で復讐する。失敗は起動時か、もっと遅く。",
  },
];

export function MagicRuntime() {
  const [i, setI] = useState(0);
  const s = SPELLS[i]!;

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
        EXHIBIT 15 · ANNOTATION MAGIC
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
        アノテーション魔法 — コンパイルを欺き、実行時に爆発
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
        「Spring is a flow-of-control obfuscation framework」系の議論が示す通り、
        制御の流れがアノテーションと proxy に消え、コンパイル成功が安全性の錯覚になる。
        売り逃げと AI 浪費の共通燃料。
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {SPELLS.map((sp, idx) => (
          <Button
            key={sp.ann}
            type="button"
            size="sm"
            variant={idx === i ? "danger" : "secondary"}
            onClick={() => {
              setI(idx);
              void recordMuseumEvent("ai");
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {sp.ann}
          </Button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
          <p className="text-xs text-[var(--color-subtle)]">表向きの約束</p>
          <p className="mt-2 font-mono text-sm text-[var(--color-fg)]">{s.ann}</p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{s.lie}</p>
          <p className="mt-3 text-xs text-[var(--color-ok)]">javac: SUCCESS</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[var(--color-danger-dim)]/40 p-4">
          <p className="flex items-center gap-2 text-xs text-[var(--color-danger)]">
            <Bug className="h-4 w-4" />
            実行時の真実
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">{s.truth}</p>
        </div>
      </div>
    </section>
  );
}

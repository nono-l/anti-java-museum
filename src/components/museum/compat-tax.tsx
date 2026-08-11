import { useState } from "react";
import { ArrowRightLeft, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const PHASES = [
  {
    id: "javax",
    title: "javax.* の永遠",
    body: "何十年も「標準」だった名前空間。後方互換が聖域になる。",
  },
  {
    id: "break",
    title: "jakarta.* への断裂",
    body: "Oracle→Eclipse 移行でパッケージ名が割れる。find/replace では終わらない。",
  },
  {
    id: "mix",
    title: "混在地獄",
    body: "同一 JVM に javax と jakarta を載せると衝突。依存が片方に残るだけで NoSuchMethodError。",
  },
  {
    id: "coords",
    title: "座標も版もリセット",
    body: "Maven 座標・版番号が何度も作り直される。Mail ひとつでも系譜が三転する。",
  },
  {
    id: "tax",
    title: "文明税の確定",
    body: "「互換を守る言語」が、企業コードベース全体に強制リネーム税を課す皮肉。",
  },
];

export function CompatTax() {
  const [step, setStep] = useState(0);
  const phase = PHASES[step]!;
  const tax = Math.min(100, 15 + step * 20);

  function next() {
    setStep((s) => Math.min(PHASES.length - 1, s + 1));
    void recordMuseumEvent("dep");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
        EXHIBIT 12 · COMPATIBILITY TAX
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
        javax → jakarta — 互換を信仰した結果の断裂税
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
        検索で繰り返し出る罪状。後方互換を聖域にしながら、エコシステム規模の
        パッケージ断裂を一度に強いる。Spring Boot 3 移行が企業の半年を溶かす。
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {PHASES.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setStep(i);
                void recordMuseumEvent("interaction");
              }}
              className={`rounded-full border px-3 py-1 text-xs ${
                i === step
                  ? "border-[var(--color-danger)] bg-[var(--color-danger-dim)] text-[var(--color-fg)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)]"
              }`}
            >
              {i + 1}. {p.title}
            </button>
          ))}
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--color-muted)]">文明税</p>
          <p className="font-display text-2xl font-semibold tabular text-[var(--color-danger)]">
            {tax}%
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-4 font-mono text-xs text-[var(--color-muted)]">
          import javax.servlet.*;
          <br />
          import javax.persistence.*;
          <br />
          import javax.validation.*;
        </div>
        <ArrowRightLeft className="mx-auto h-5 w-5 text-[var(--color-danger)]" />
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[var(--color-danger-dim)]/30 p-4 font-mono text-xs text-[var(--color-muted)]">
          import jakarta.servlet.*;
          <br />
          import jakarta.persistence.*;
          <br />
          import jakarta.validation.*;
        </div>
      </div>

      <div className="mt-4 flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3 text-sm text-[var(--color-muted)]">
        <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warn)]" />
        <p>
          <strong className="text-[var(--color-fg)]">{phase.title}:</strong> {phase.body}
        </p>
      </div>

      <div className="mt-3">
        <Button type="button" size="sm" variant="secondary" onClick={next} disabled={step >= PHASES.length - 1}>
          税を一段上げる
        </Button>
      </div>
    </section>
  );
}

import { useState } from "react";
import { Globe2, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const PLATFORMS = [
  { id: "linux", label: "Linux JVM", quirk: "動いた。ログのパス区切りも / で安心。" },
  { id: "win", label: "Windows JVM", quirk: "classpath 区切りが ; 。ネイティブ DLL が別件で死ぬ。" },
  { id: "old", label: "古い LTS", quirk: "新しい API が無い。『前方互換』は神話。" },
  { id: "container", label: "コンテナ cgroup", quirk: "ヒープ既定がホストを見て暴れる。OOM の儀式。" },
];

export function WoraMyth() {
  const [hit, setHit] = useState<string[]>(["linux"]);
  const myth = Math.max(0, 100 - hit.length * 22);
  const debugTax = Math.min(100, hit.length * 24);

  function toggle(id: string) {
    setHit((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    void recordMuseumEvent("interaction");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT · SEV 72 · WORA MYTH
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            Write once, debug everywhere 神話
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
            「一度書けばどこでも動く」は標語として強い。現実は JVM 差・ネイティブ・版・コンテナ境界で
            デバッグが各地に複製される。深刻度 72。
          </p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-right">
            <p className="text-xs text-[var(--color-muted)]">WORA 信仰</p>
            <p className="font-display text-2xl font-semibold tabular text-[var(--color-warn)]">
              {myth}%
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-3 py-2 text-right">
            <p className="text-xs text-[var(--color-muted)]">デバッグ税</p>
            <p className="font-display text-2xl font-semibold tabular text-[var(--color-danger)]">
              {debugTax}%
            </p>
          </div>
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {PLATFORMS.map((p) => {
          const on = hit.includes(p.id);
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className={`w-full rounded-[var(--radius-md)] border px-3 py-3 text-left ${
                  on
                    ? "border-[var(--color-danger)]/50 bg-[var(--color-danger-dim)]/30"
                    : "border-[var(--color-border)] bg-[var(--color-elevated)]"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Globe2 className="h-4 w-4 text-[var(--color-subtle)]" />
                  {p.label}
                </span>
                {on && (
                  <span className="mt-2 flex gap-2 text-xs text-[var(--color-muted)]">
                    <Bug className="h-3.5 w-3.5 shrink-0 text-[var(--color-warn)]" />
                    {p.quirk}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-sm text-[var(--color-muted)]">
        プラットフォームを追加するほど信仰は削れ、デバッグ税が上がる。
        書き直しではなく、同じバグの地方巡業が始まる。
      </p>
    </section>
  );
}

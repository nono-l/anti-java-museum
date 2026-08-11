import { useState } from "react";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const TOOLS = [
  { name: "JDK", role: "本体の版戦争" },
  { name: "Maven", role: "XML で宇宙を解決" },
  { name: "Gradle", role: "別の正解（Groovy/Kotlin）" },
  { name: "IntelliJ", role: "なければ暗黒物質" },
  { name: "Eclipse", role: "かつて銀河を支配" },
  { name: "Lombok", role: "生成コードの影" },
  { name: "Spring Boot", role: "魔法の依存 BOM" },
  { name: "MapStruct", role: "マッパー生成器" },
  { name: "Hibernate", role: "ORM の第二宇宙" },
  { name: "JUnit 5", role: "テスト儀式" },
  { name: "Mockito", role: "モックの迷宮" },
  { name: "Checkstyle", role: "宇宙法" },
  { name: "SpotBugs", role: "静的告発" },
  { name: "SonarQube", role: "品質の大審問" },
  { name: "Docker", role: "結局コンテナへ逃避" },
  { name: "jlink", role: "実行時を削る儀式" },
];

export function ToolSprawl() {
  const [count, setCount] = useState(4);
  const visible = TOOLS.slice(0, count);
  const confusion = Math.min(100, Math.round((count / TOOLS.length) * 100 + count * 2));

  function addTools() {
    setCount((c) => Math.min(TOOLS.length, c + 2));
    void recordMuseumEvent("tool");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
        EXHIBIT 10
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
        専用ツール群 — IDE なき宇宙は暗黒
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        言語が自分の構造を人間に直接見せることをやめた結果、理解の窓口が IDE とビルドツールに外部化された。
        ツールは増え、置き換わり、互いに相容れない。敵性は「道具なしでは生存不能」という依存構造にある。
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={addTools}
          disabled={count >= TOOLS.length}
        >
          <Wrench className="h-4 w-4" />
          さらにツールを追加
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setCount(4)}>
          リセット
        </Button>
        <span className="text-sm text-[var(--color-muted)]">
          混乱度{" "}
          <strong className="tabular text-[var(--color-danger)]">{confusion}%</strong>
        </span>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((t) => (
          <li
            key={t.name}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-3"
          >
            <p className="font-mono text-sm font-medium">{t.name}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{t.role}</p>
          </li>
        ))}
      </ul>

      {count >= TOOLS.length && (
        <p className="mt-4 text-sm text-[var(--color-warn)]">
          すべて揃っても「どれが正解か」はプロジェクトごとに違う。新ツールは旧ツールの苦痛を広告にして生まれる。宇宙の敵は道具産業と共進化する。
        </p>
      )}
    </section>
  );
}

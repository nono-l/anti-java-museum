import { useState } from "react";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const LAYERS = [
  "Controller",
  "Service",
  "ServiceImpl",
  "Facade",
  "Manager",
  "DTO",
  "Entity",
  "Repository",
  "DAO",
  "DAOFactory",
  "Mapper",
  "Assembler",
  "Validator",
  "Interceptor",
  "Aspect",
  "Config",
];

export function CargoCult() {
  const [n, setN] = useState(6);
  const visible = LAYERS.slice(0, n);
  const ceremony = Math.min(100, Math.round((n / LAYERS.length) * 100 + n * 2));
  const feature = Math.max(0, 100 - ceremony);

  function add() {
    setN((x) => Math.min(LAYERS.length, x + 2));
    void recordMuseumEvent("joy");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
        EXHIBIT 14 · CARGO CULT LAYERS
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
        DTO / DAO / Factory のカーゴカルト
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
        検索でも「なぜコンストラクタで済むのに Factory か」「DTO 地獄」は定番。
        パターン名を並べることが設計だと錯覚し、ビジネスの一行が層の奥に消える。
        表向きはきれいなパッケージ図——中身は売り逃げ可能な儀式。
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" variant="secondary" onClick={add} disabled={n >= LAYERS.length}>
          <Layers className="h-4 w-4" />
          層を足す
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setN(4)}>
          リセット
        </Button>
        <span className="text-sm text-[var(--color-muted)]">
          儀式度 <strong className="text-[var(--color-danger)]">{ceremony}%</strong> · 機能の見通し{" "}
          <strong className="text-[var(--color-warn)]">{feature}%</strong>
        </span>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((name) => (
          <li
            key={name}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-3 font-mono text-sm"
          >
            {name}
          </li>
        ))}
      </ul>

      {n >= LAYERS.length && (
        <p className="mt-4 text-sm text-[var(--color-warn)]">
          層は揃った。ユーザーの欲求はまだ ServiceImpl のどこかで DTO に変換されている。
        </p>
      )}
    </section>
  );
}

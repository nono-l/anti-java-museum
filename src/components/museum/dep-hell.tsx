import { useMemo, useState } from "react";
import { GitBranch, Package, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

type Node = {
  id: string;
  install: string;
  importName: string;
  version: string;
  breaks: boolean;
  x: number;
  y: number;
};

const BASE: Omit<Node, "x" | "y">[] = [
  { id: "app", install: "your-app", importName: "app", version: "0.1.0", breaks: false },
  { id: "spring", install: "spring-boot-starter-web", importName: "org.springframework", version: "3.2", breaks: false },
  { id: "jackson", install: "jackson-databind", importName: "com.fasterxml.jackson", version: "2.17", breaks: false },
  { id: "hibernate", install: "hibernate-core", importName: "org.hibernate", version: "6.4", breaks: false },
  { id: "javax", install: "javax.servlet-api", importName: "javax.servlet", version: "4.0", breaks: true },
  { id: "jakarta", install: "jakarta.servlet-api", importName: "jakarta.servlet", version: "6.0", breaks: true },
  { id: "log4j", install: "log4j-core", importName: "org.apache.logging.log4j", version: "2.23", breaks: false },
  { id: "slf4j", install: "slf4j-api", importName: "org.slf4j", version: "2.0", breaks: false },
  { id: "guava", install: "guava", importName: "com.google.common", version: "33.0", breaks: false },
  { id: "lombok", install: "lombok", importName: "lombok", version: "1.18", breaks: false },
];

const EDGES: [string, string][] = [
  ["app", "spring"],
  ["app", "hibernate"],
  ["app", "jackson"],
  ["app", "lombok"],
  ["spring", "jackson"],
  ["spring", "jakarta"],
  ["hibernate", "jakarta"],
  ["app", "javax"],
  ["app", "log4j"],
  ["log4j", "slf4j"],
  ["app", "guava"],
  ["spring", "slf4j"],
];

function layout(nodes: Omit<Node, "x" | "y">[]): Node[] {
  const cx = 200;
  const cy = 140;
  return nodes.map((n, i) => {
    if (n.id === "app") return { ...n, x: cx, y: cy };
    const angle = ((i - 1) / (nodes.length - 1)) * Math.PI * 2 - Math.PI / 2;
    const r = 95 + (i % 3) * 12;
    return {
      ...n,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r * 0.85,
    };
  });
}

export function DepHell() {
  const [chaos, setChaos] = useState(0);
  const nodes = useMemo(() => {
    const raw = BASE.map((n) => ({
      ...n,
      breaks:
        n.breaks ||
        chaos >= 2 ||
        (chaos >= 1 && (n.id === "jackson" || n.id === "javax" || n.id === "jakarta")),
      version:
        chaos >= 1 && n.id === "jackson"
          ? "衝突 (nearest-wins)"
          : chaos >= 2 && n.id === "javax"
            ? "javax vs jakarta"
            : n.version,
    }));
    return layout(raw);
  }, [chaos]);

  const mismatches = nodes.filter(
    (n) => n.install !== n.importName && n.id !== "app" && !n.install.startsWith(n.importName.split(".")[0] ?? ""),
  );
  const broken = nodes.filter((n) => n.breaks);

  function pushChaos(level: number) {
    setChaos(level);
    if (level > 0) void recordMuseumEvent("dep");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
        EXHIBIT 05
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
        JAR / クラスパス地獄 — Maven が宇宙を選ぶ
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        依存はグラフなのに、解決はしばしば「最短経路・nearest-wins」の恣意。javax と jakarta が同居し、
        Jackson の版が黙ってすり替わり、ビルドは緑のまま本番で NoSuchMethodException が銀河を裂く。
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)]">
          <svg viewBox="0 0 400 280" className="h-auto w-full" role="img" aria-label="依存グラフ">
            {EDGES.map(([a, b]) => {
              const na = nodes.find((n) => n.id === a);
              const nb = nodes.find((n) => n.id === b);
              if (!na || !nb) return null;
              const hot = na.breaks || nb.breaks;
              return (
                <line
                  key={`${a}-${b}`}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke={hot ? "#e85d4c" : "#3f3c4c"}
                  strokeWidth={hot ? 1.5 : 1}
                  strokeOpacity={0.85}
                />
              );
            })}
            {nodes.map((n) => (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.id === "app" ? 22 : 16}
                  fill={n.breaks ? "#3a1412" : "#191922"}
                  stroke={n.breaks ? "#e85d4c" : "#3f3c4c"}
                  strokeWidth={1.5}
                />
                <text
                  x={n.x}
                  y={n.y + 32}
                  textAnchor="middle"
                  fill="#9b98a6"
                  fontSize="8"
                  fontFamily="ui-monospace, monospace"
                >
                  {n.id}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="space-y-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3">
            <div className="flex items-center gap-2 text-xs text-[var(--color-subtle)]">
              <PackageX className="h-4 w-4" />
              artifact ≠ 理解
            </div>
            <p className="mt-2 font-display text-3xl font-semibold tabular">
              {mismatches.length + (chaos > 0 ? 3 : 0)}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-[var(--color-muted)]">
              <li className="flex justify-between gap-2 font-mono">
                <span>javax.*</span>
                <span className="text-[var(--color-danger)]">→ jakarta.*</span>
              </li>
              <li className="flex justify-between gap-2 font-mono">
                <span>jackson-*</span>
                <span className="text-[var(--color-danger)]">→ nearest-wins</span>
              </li>
              <li className="flex justify-between gap-2 font-mono">
                <span>spring-boot</span>
                <span className="text-[var(--color-danger)]">→ BOM 依存</span>
              </li>
            </ul>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3">
            <div className="flex items-center gap-2 text-xs text-[var(--color-subtle)]">
              <GitBranch className="h-4 w-4" />
              衝突ノード
            </div>
            <p className="mt-2 font-display text-3xl font-semibold tabular text-[var(--color-danger)]">
              {broken.length}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setChaos(0)}>
              <Package className="h-4 w-4" />
              平穏
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => pushChaos(1)}>
              Jackson 衝突
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={() => pushChaos(2)}>
              javax/jakarta
            </Button>
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            {chaos === 0 && "表面的には動いている。JAR Hell の種は既に仕込まれている。"}
            {chaos === 1 && "Maven が黙って版を選んだ。下流が連鎖的に NoSuchMethod で裂ける。"}
            {chaos === 2 &&
              "名前空間が裂けた。専用ツールなしでは何もわからず、あっても狂っている。宇宙の敵の典型相。"}
          </p>
        </div>
      </div>
    </section>
  );
}

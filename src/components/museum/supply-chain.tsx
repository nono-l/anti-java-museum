import { useState } from "react";
import { Link2, Bomb, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const CHAIN = [
  "your-app",
  "spring-boot-starter",
  "spring-core",
  "… 40 transitive …",
  "log4j-core",
  "JNDI lookup",
  "planet-scale RCE",
];

export function SupplyChain() {
  const [depth, setDepth] = useState(3);
  const [blast, setBlast] = useState(false);
  const visible = CHAIN.slice(0, depth);
  const risk = Math.min(100, 20 + depth * 14 + (blast ? 25 : 0));

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT · SEV 91 · SUPPLY CHAIN
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            供給連鎖・Log4Shell 型 — ログ1本が惑星を焼く
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
            便利な共通層が推移的依存の奥に潜む。Log4Shell / Spring4Shell は「誰も直接書いていないコード」が
            文明の攻撃面になる構造を露呈した。深刻度 91。
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-3 py-2 text-right">
          <p className="text-xs text-[var(--color-muted)]">文明曝露</p>
          <p className="font-display text-2xl font-semibold tabular text-[var(--color-danger)]">
            {risk}%
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            setDepth((d) => Math.min(CHAIN.length, d + 1));
            void recordMuseumEvent("dep");
          }}
          disabled={depth >= CHAIN.length}
        >
          <Link2 className="h-4 w-4" />
          依存を一段深く
        </Button>
        <Button
          type="button"
          size="sm"
          variant="danger"
          onClick={() => {
            setDepth(CHAIN.length);
            setBlast(true);
            void recordMuseumEvent("ai");
          }}
        >
          <Bomb className="h-4 w-4" />
          Log4Shell を発火
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setDepth(3);
            setBlast(false);
          }}
        >
          リセット
        </Button>
      </div>

      <ol className="flex flex-col gap-2">
        {visible.map((name, i) => (
          <li
            key={name}
            className={`flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2 font-mono text-sm ${
              blast && i === visible.length - 1
                ? "border-[var(--color-danger)] bg-[var(--color-danger-dim)] text-[var(--color-danger)]"
                : "border-[var(--color-border)] bg-[var(--color-elevated)] text-[var(--color-muted)]"
            }`}
          >
            <Network className="h-4 w-4 shrink-0" />
            <span>
              {i + 1}. {name}
            </span>
          </li>
        ))}
      </ol>

      {blast && (
        <p className="mt-4 text-sm text-[var(--color-warn)]">
          アプリの業務コードは1行も悪くない。焼けるのは「共通ログ層を信じた文明」の側。
          握りつぶしログ文化と供給連鎖は、観測と攻撃面を同時に悪化させる。
        </p>
      )}
    </section>
  );
}

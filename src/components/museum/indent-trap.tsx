import { useMemo, useState } from "react";
import { AlertTriangle, Bomb, RotateCcw, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const SAMPLE = `public class OrderService {
    private UserRepository users;
    private Mailer mailer;

    public void ship(String orderId) {
        Order order = findOrder(orderId);
        User user = users.find(order.getUserId());
        Address addr = user.getProfile().getAddress();
        mailer.send(addr.getEmail(), "Shipped: " + order.getId());
    }

    private Order findOrder(String id) {
        return warehouse.lookup(id); // may return null
    }
}`;

type Attack = "null-chain" | "optional-lie" | "npe-bomb";

function corrupt(src: string, mode: Attack): string {
  if (mode === "null-chain") {
    return src
      .replace("users.find(order.getUserId())", "users.find(null)")
      .replace("user.getProfile().getAddress()", "/* user is null */ user.getProfile().getAddress()");
  }
  if (mode === "optional-lie") {
    return src.replace(
      "User user = users.find(order.getUserId());",
      "Optional<User> user = Optional.ofNullable(users.find(order.getUserId()));\n        // 「Optional で安全」と言いながら .get() で即死\n        Address addr = user.get().getProfile().getAddress();",
    );
  }
  return src
    .replace("private UserRepository users;", "private UserRepository users; // never injected")
    .replace("users.find", "users /* null */ .find")
    .replace("mailer.send", "mailer /* null */ .send");
}

export function IndentTrap() {
  const [code, setCode] = useState(SAMPLE);
  const [log, setLog] = useState<string | null>(null);

  const danger = useMemo(() => {
    let score = 0;
    if (code.includes("null") || code.includes("/* null */")) score += 28;
    if (code.includes(".get()")) score += 22;
    if (code.includes("may return null") || code.includes("never injected")) score += 18;
    if ((code.match(/\./g) ?? []).length > 12) score += 16;
    if (code.includes("Optional") && code.includes(".get()")) score += 20;
    return Math.min(100, score);
  }, [code]);

  function attack(mode: Attack) {
    setCode(corrupt(SAMPLE, mode));
    const messages: Record<Attack, string> = {
      "null-chain":
        "参照の連鎖に null を注入。実行時まで気づかない。NullPointerException は「どこが null か」を十分に語らない時代が長すぎた——宇宙の敵の第一の武器は沈黙。",
      "optional-lie":
        "Optional で包んだつもりが .get() で即死。型システムが安心を演出し、失敗モードを実行時に押し戻す。",
      "npe-bomb":
        "DI されないフィールド。企業フレームワークの魔法が切れた瞬間、宇宙は NPE で満ちる。",
    };
    setLog(messages[mode]);
    void recordMuseumEvent("indent");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT 01
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            Null の沈黙 — 宇宙を貫く NPE
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            参照型の既定が「存在しないかもしれない」。コンパイルは通る。テストは通ることがある。
            本番の深夜にだけ、銀河が NullPointerException で裂ける。沈黙こそ第一の敵性。
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-3 py-2 text-right">
          <p className="text-xs text-[var(--color-muted)]">宇宙崩壊度</p>
          <p className="font-display text-2xl font-semibold tabular text-[var(--color-danger)]">
            {danger}%
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Button type="button" variant="danger" size="sm" onClick={() => attack("null-chain")}>
          <Skull className="h-4 w-4" />
          null 連鎖を注入
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => attack("optional-lie")}>
          Optional の嘘
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => attack("npe-bomb")}>
          <Bomb className="h-4 w-4" />
          DI 未注入爆弾
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setCode(SAMPLE);
            setLog(null);
          }}
        >
          <RotateCcw className="h-4 w-4" />
          復元
        </Button>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        className="min-h-56 w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-4 font-mono text-xs leading-relaxed text-[var(--color-fg)] outline-none focus:border-[var(--color-border-strong)] sm:text-sm"
        aria-label="Java sample code"
      />

      {log && (
        <div className="mt-3 flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3 text-sm text-[var(--color-muted)]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warn)]" />
          <p>{log}</p>
        </div>
      )}
    </section>
  );
}

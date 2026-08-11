const COVERED = [
  { charge: "NPE / 実行時沈黙", status: "収録済", note: "EXHIBIT 01" },
  { charge: "checked 例外", status: "収録済", note: "EXHIBIT 02" },
  { charge: "ボイラープレート", status: "収録済", note: "EXHIBIT 03" },
  { charge: "依存 / JAR Hell", status: "収録済", note: "EXHIBIT 05" },
  { charge: "AI 浪費・スタック塵", status: "収録済", note: "EXHIBIT 06" },
  { charge: "ログ握りつぶしの悪いクセ", status: "収録済", note: "EXHIBIT 07" },
  { charge: "ありとあらゆる FW 嫌悪", status: "収録済", note: "EXHIBIT 08" },
  { charge: "作りっぱなし売り逃げ", status: "収録済", note: "EXHIBIT 09" },
  { charge: "ツール依存", status: "収録済", note: "EXHIBIT 10" },
  { charge: "単一武器教育", status: "収録済", note: "EXHIBIT 11" },
];

const ADDED = [
  { charge: "javax→jakarta 互換断裂税", status: "新規", note: "EXHIBIT 12 · 検索強" },
  { charge: "起動/メモリ・クラウド税", status: "新規", note: "EXHIBIT 13 · 検索強" },
  { charge: "DTO/DAO カーゴカルト", status: "新規", note: "EXHIBIT 14 · 検索中" },
  { charge: "アノテーション魔法→実行時", status: "新規", note: "EXHIBIT 15 · 検索強" },
];

const OPTIONAL = [
  {
    charge: "型消去（generics erasure）",
    status: "言語設計",
    note: "偽の型安全。今回は判決に短文のみ",
  },
  {
    charge: "採用市場の Spring ロックイン",
    status: "単一武器と重複",
    note: "面接が Spring 前提＝教育ゲート",
  },
  {
    charge: "Date/Calendar 遺産",
    status: "歴史的",
    note: "java.time 後もレガシーが残る",
  },
];

export function AuditBoard() {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-elevated)] p-5 sm:p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
        AUDIT · 検索照合
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
        全体検証 — 収録済み / 追加 / 残余
      </h2>
      <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
        公開議論（HN / Reddit / 技術ブログ / 移行ガイド）と本館の罪状を突き合わせた結果。
        既存の核（握りつぶし・売り逃げ・全 FW 嫌悪・単一武器）は検証で裏付けが強い。
        抜けていた高頻度罪状を下に追加した。
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Block title="既に収録（検証OK）" rows={COVERED} tone="ok" />
        <Block title="今回追加（検索で強い）" rows={ADDED} tone="danger" />
        <Block title="残余・重複扱い" rows={OPTIONAL} tone="muted" />
      </div>
    </section>
  );
}

function Block({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: { charge: string; status: string; note: string }[];
  tone: "ok" | "danger" | "muted";
}) {
  const border =
    tone === "danger"
      ? "border-[var(--color-danger)]/40"
      : tone === "ok"
        ? "border-[var(--color-border)]"
        : "border-[var(--color-border)] opacity-90";
  return (
    <div className={`rounded-[var(--radius-md)] border ${border} bg-[var(--color-surface)] p-3`}>
      <p className="text-xs font-medium text-[var(--color-subtle)]">{title}</p>
      <ul className="mt-2 space-y-2">
        {rows.map((r) => (
          <li key={r.charge} className="border-t border-[var(--color-border)] pt-2 first:border-0 first:pt-0">
            <p className="text-sm font-medium text-[var(--color-fg)]">{r.charge}</p>
            <p className="text-xs text-[var(--color-muted)]">
              {r.status} · {r.note}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

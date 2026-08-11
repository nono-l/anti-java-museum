import { useMemo, useState } from "react";
import { BookMarked, ExternalLink, Gavel, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

type Charge = {
  id: string;
  title: string;
  already: boolean;
  severity: number;
  body: string;
  sources: { label: string; href: string }[];
  tags: string[];
};

const CHARGES: Charge[] = [
  {
    id: "mono-weapon",
    title: "単一武器教育",
    already: true,
    severity: 96,
    body: "これだけ教え、Java だけ戦い、学び直さない人間を量産する。",
    sources: [],
    tags: ["教育", "文明"],
  },
  {
    id: "log-crush",
    title: "ログ握りつぶしの悪いクセ",
    already: true,
    severity: 95,
    body: "層がログを汚す → 表に出すな → 観測死。無差別攻撃下では隠蔽リスクの方が大きい。",
    sources: [],
    tags: ["観測", "文化"],
  },
  {
    id: "ship-flee",
    title: "作りっぱなし売り逃げ",
    already: true,
    severity: 94,
    body: "コンパイル・起動・200 の静かさを完成と偽る。埋没失敗は運用と宇宙へ。",
    sources: [],
    tags: ["企業儀式", "観測"],
  },
  {
    id: "fw-hate",
    title: "ありとあらゆる FW 嫌悪",
    already: true,
    severity: 93,
    body: "Spring 経験がカテゴリ全体へ一般化。Nest が Spring 臭だけで叩かれる。",
    sources: [
      { label: "HN frameworks", href: "https://news.ycombinator.com/item?id=38680230" },
    ],
    tags: ["文化", "輸出"],
  },
  {
    id: "cargo-cult",
    title: "過剰抽象・カーゴカルト企業儀式",
    already: true,
    severity: 92,
    body: "Interface 1:1、DTO/DAO/Factory の塔。問題より儀式が先。",
    sources: [
      { label: "HN Java culture", href: "https://news.ycombinator.com/item?id=32896228" },
    ],
    tags: ["文化", "過剰設計"],
  },
  {
    id: "log4shell",
    title: "供給連鎖・Log4Shell 文明リスク",
    already: true,
    severity: 91,
    body: "ログ1本の推移的依存が惑星規模 RCE。共通層が攻撃面を拡散。",
    sources: [
      { label: "Log4Shell", href: "https://www.freecodecamp.org/news/java-log4jshell-vulnerability/" },
    ],
    tags: ["セキュリティ", "依存"],
  },
  {
    id: "null-billion",
    title: "null 十億ドルの過ち",
    already: true,
    severity: 90,
    body: "参照型は常に null を許す。後方互換が修正を極度に難しくする。",
    sources: [],
    tags: ["言語設計", "NPE"],
  },
  {
    id: "ai-waste",
    title: "AI 浪費装置",
    already: true,
    severity: 90,
    body: "フレームワーク塵のスタックが知能を空転させる。",
    sources: [],
    tags: ["AI", "観測"],
  },
  {
    id: "annotation-magic",
    title: "アノテーション魔法・制御フロー隠蔽",
    already: true,
    severity: 89,
    body: "proxy / AOP が因果を奪う。コンパイル成功が安全性の錯覚。",
    sources: [],
    tags: ["魔法", "観測"],
  },
  {
    id: "javax-jakarta",
    title: "javax→jakarta 改名災厄",
    already: true,
    severity: 88,
    body: "政治的改名で生態系分断。共存不能な座標変更。",
    sources: [
      { label: "Javax mess", href: "https://blog.ltgt.net/javax-jakarta-mess-even-worse/" },
    ],
    tags: ["生態系", "政治"],
  },
  {
    id: "checked-ex",
    title: "検査例外の汚染と握りつぶし",
    already: true,
    severity: 86,
    body: "throws 汚染と空 catch が常態化。強制が形骸化。",
    sources: [],
    tags: ["言語設計", "観測"],
  },
  {
    id: "compat-handcuff",
    title: "後方互換の手錠",
    already: true,
    severity: 85,
    body: "壊せない過去が未来を縛る。null・型消去・死なない API。",
    sources: [],
    tags: ["言語設計", "生態系"],
  },
  {
    id: "ide-mandatory",
    title: "IDE なしでは暗黒",
    already: true,
    severity: 84,
    body: "理解が IDE に外部化。道具なしでは生存不能。",
    sources: [],
    tags: ["道具依存"],
  },
  {
    id: "jvm-tax",
    title: "JVM 税（起動・メモリ・GC）",
    already: true,
    severity: 80,
    body: "コールドスタート・常駐・GC ポーズが雲の請求書になる。",
    sources: [],
    tags: ["性能", "運用"],
  },
  {
    id: "type-erasure",
    title: "型消去ジェネリクス",
    already: true,
    severity: 78,
    body: "コンパイル時だけの型安全。実行時は raw とキャスト。",
    sources: [],
    tags: ["言語設計"],
  },
  {
    id: "oracle-gov",
    title: "ガバナンス／商標／改名政治",
    already: true,
    severity: 76,
    body: "技術より政治が生態系コストを決める局面。",
    sources: [],
    tags: ["政治", "生態系"],
  },
  {
    id: "resource-leak",
    title: "リソース管理の非対称",
    already: true,
    severity: 74,
    body: "メモリは GC、接続は手動。リークは表向き静か。",
    sources: [],
    tags: ["言語設計", "運用"],
  },
  {
    id: "write-once",
    title: "Write once, debug everywhere 神話",
    already: true,
    severity: 72,
    body: "WORA 標語と、各地で複製されるデバッグ税。",
    sources: [],
    tags: ["神話", "移植性"],
  },
];

const FILTERS = ["すべて", "SEV≥90", "SEV 70–89", "言語設計", "文化", "セキュリティ", "生態系"] as const;

export function ChargeCatalog() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("すべて");
  const [active, setActive] = useState(CHARGES[0]!.id);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    return CHARGES.filter((c) => {
      if (filter === "SEV≥90" && c.severity < 90) return false;
      if (filter === "SEV 70–89" && (c.severity < 70 || c.severity >= 90)) return false;
      if (
        filter !== "すべて" &&
        filter !== "SEV≥90" &&
        filter !== "SEV 70–89" &&
        !c.tags.includes(filter)
      )
        return false;
      if (query && !`${c.title}${c.body}${c.tags.join()}`.includes(query)) return false;
      return true;
    }).sort((a, b) => b.severity - a.severity);
  }, [filter, query]);

  const item = CHARGES.find((c) => c.id === active) ?? list[0] ?? CHARGES[0]!;
  const count70 = CHARGES.filter((c) => c.severity >= 70).length;

  function select(id: string) {
    setActive(id);
    void recordMuseumEvent("interaction");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            CHARGE CATALOG · SEV≥70 COMPLETE
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            罪状カタログ — 深刻度 70 以上は全件展示済
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
            {count70} 件すべてに対応するインタラクティブ展示がある。フィルタで深刻度帯を切れる。
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-ok)]/40 bg-[var(--color-elevated)] px-3 py-2 text-right">
          <p className="text-xs text-[var(--color-muted)]">SEV≥70 展示</p>
          <p className="font-display text-2xl font-semibold tabular text-[var(--color-ok)]">
            {count70}/{count70}
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f}
            type="button"
            size="sm"
            variant={filter === f ? "danger" : "secondary"}
            onClick={() => {
              setFilter(f);
              void recordMuseumEvent("interaction");
            }}
          >
            {f}
          </Button>
        ))}
        <label className="relative ml-auto flex min-w-[180px] flex-1 items-center sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-[var(--color-subtle)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="罪状を絞る…"
            className="h-9 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-elevated)] py-1 pl-8 pr-3 text-sm outline-none focus:border-[var(--color-border-strong)]"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <ul className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
          {list.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => select(c.id)}
                className={`flex w-full items-start gap-2 rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors ${
                  active === c.id
                    ? "border-[var(--color-danger)] bg-[var(--color-danger-dim)]"
                    : "border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-subtle)]" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-fg)]">{c.title}</span>
                    <span className="rounded-full bg-[var(--color-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--color-ok)]">
                      展示済
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[10px] tabular text-[var(--color-subtle)]">
                    深刻度 {c.severity} · {c.tags.join(" · ")}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-4">
          <p className="flex items-center gap-2 text-xs text-[var(--color-subtle)]">
            <BookMarked className="h-4 w-4" />
            本館展示済 · 深刻度 {item.severity}
          </p>
          <h3 className="font-display mt-2 text-lg font-semibold text-[var(--color-fg)]">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{item.body}</p>
          {item.sources.length > 0 && (
            <ul className="mt-4 space-y-1.5 border-t border-[var(--color-border)] pt-3">
              {item.sources.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)] underline-offset-2 hover:text-[var(--color-fg)] hover:underline"
                  >
                    {s.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

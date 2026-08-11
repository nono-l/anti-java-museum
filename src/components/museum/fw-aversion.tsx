import { useState } from "react";
import { ExternalLink, Quote, Skull, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const EVIDENCE = [
  {
    id: "hn-jvm",
    source: "Hacker News",
    year: "2023",
    quote:
      "When I code in the JVM, I feel like I fight my frameworks and libraries more often than writing actual code. Looking at you in particular, Spring Boot. I had similar experiences in C#.NET and Python…",
    angle: "JVM 起点 → 他言語でも『FW と戦う』感覚が残る",
    href: "https://news.ycombinator.com/item?id=38680230",
  },
  {
    id: "nest",
    source: "r/node · NestJS",
    year: "2023–",
    quote:
      "It also resembles Java framework, Spring Boot… Nest reminds me too much of Spring. / I spent the first ~five years on large Java/Spring codebases…",
    angle: "Spring 臭だけで他言語 FW が嫌悪対象になる",
    href: "https://www.reddit.com/r/node/comments/164axvk/why_do_nodejs_devs_hate_opinionated_tools_like/",
  },
  {
    id: "reddit-spring",
    source: "r/java",
    year: "2023",
    quote:
      "Spring is a flow-of-control obfuscation framework. / I started working in Go… such a relief. / I quit my job so that I won't have to [use Spring].",
    angle: "明示スタックへ逃げる／職を捨てて距離を取る",
    href: "https://www.reddit.com/r/java/comments/12rofp4/is_it_just_me_or_does_the_spring_framework_lead/",
  },
  {
    id: "vysny",
    source: "Martin Vysny",
    year: "2021",
    quote:
      "I hate frameworks that expose me to great complexity just in order to achieve something simple, ultimately producing stacktraces 200 lines deep…",
    angle: "単純なことのための巨大複雑さ → FW 全般嫌悪の原形",
    href: "https://mvysny.github.io/java-will-die/",
  },
  {
    id: "general",
    source: "Why I Hate Frameworks 系議論",
    year: "2005–",
    quote:
      "Frameworks railroad your code… With a nightmare framework you may end up having to debug stacktraces that involve not a single line of code that you wrote. I remember when this used to happen with me in Spring…",
    angle: "一 FW の悪夢が『フレームワーク』カテゴリ全体へ一般化",
    href: "https://news.ycombinator.com/item?id=38680230",
  },
  {
    id: "jp-x",
    source: "X / 日本語現場感",
    year: "2025–26",
    quote:
      "読めない/読みにくいフレームワークは嫌い Springとか… / Javaが嫌われる理由に Spring などの複雑なフレームワーク",
    angle: "複雑 FW 経験が『FW そのもの』への拒否に近づく",
    href: "https://x.com/maata_pc/status/2014482962591449453",
  },
];

const GENERALIZATION = [
  { from: "Spring の魔法", to: "『フレームワーク＝制御の喪失』" },
  { from: "140行スタック", to: "『FW は読むな・触るな』" },
  { from: "握りつぶしログ", to: "『観測できない箱は全部嫌い』" },
  { from: "売り逃げできる表向き", to: "『儀式の箱は信用しない』" },
  { from: "Nest/Angular の Spring 臭", to: "言語が違っても同じ袋で拒絶" },
  { from: "繰り返しの苦痛", to: "ありとあらゆるフレームワークが嫌い" },
];

export function FwAversion() {
  const [active, setActive] = useState(EVIDENCE[0]!.id);
  const [spread, setSpread] = useState(1);
  const item = EVIDENCE.find((e) => e.id === active) ?? EVIDENCE[0]!;

  // 伝染が最大で「あらゆる FW が嫌い」に到達
  const totalHate = Math.min(100, 22 + spread * 16);
  const categoryCollapse = Math.min(100, 10 + spread * 18);

  function pick(id: string) {
    setActive(id);
    void recordMuseumEvent("interaction");
  }

  function amplify() {
    setSpread((s) => Math.min(5, s + 1));
    void recordMuseumEvent("joy");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT 08 · TOTAL FRAMEWORK HATE
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            ありとあらゆるフレームワークが嫌いになる
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
            Java / Spring の層・魔法・握りつぶし・売り逃げ可能な表向きを経験したあと、嫌悪は固有名詞を超える。
            <strong className="font-medium text-[var(--color-fg)]">
              フレームワークというカテゴリ全体
            </strong>
            が敵になる。軽い箱も、他言語の箱も、Spring 臭が少しでもすれば同じ袋で拒絶される。
          </p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-3 py-2 text-right">
            <p className="text-xs text-[var(--color-muted)]">総 FW 嫌悪</p>
            <p className="font-display text-2xl font-semibold tabular text-[var(--color-danger)]">
              {totalHate}%
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-right">
            <p className="text-xs text-[var(--color-muted)]">カテゴリ崩壊</p>
            <p className="font-display text-2xl font-semibold tabular text-[var(--color-warn)]">
              {categoryCollapse}%
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-[var(--color-elevated)] text-xs text-[var(--color-subtle)]">
            <tr>
              <th className="px-3 py-2 font-medium">Java 圏の一次体験</th>
              <th className="px-3 py-2 font-medium">一般化された嫌悪</th>
            </tr>
          </thead>
          <tbody>
            {GENERALIZATION.map((g) => (
              <tr key={g.from} className="border-t border-[var(--color-border)]">
                <td className="px-3 py-2.5 text-[var(--color-muted)]">{g.from}</td>
                <td className="px-3 py-2.5 font-medium text-[var(--color-fg)]">{g.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {spread >= 5 && (
        <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-danger)]/50 bg-[var(--color-danger-dim)] p-3 text-sm text-[var(--color-fg)]">
          到達点: <strong>ありとあらゆるフレームワークが嫌い</strong>。
          個別の是非より先に、カテゴリ全体が拒否反応の対象になる——これが Java 思想が輸出する学習結果。
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-xs font-medium text-[var(--color-subtle)]">公開ソースの声</p>
        <Button type="button" size="sm" variant="secondary" onClick={amplify}>
          <Waves className="h-4 w-4" />
          一般化を進める ×{spread}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <ul className="space-y-2">
          {EVIDENCE.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => pick(e.id)}
                className={`w-full rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors ${
                  active === e.id
                    ? "border-[var(--color-danger)] bg-[var(--color-danger-dim)]"
                    : "border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                <span className="block text-sm font-medium text-[var(--color-fg)]">
                  {e.source}
                </span>
                <span className="mt-0.5 block text-[10px] text-[var(--color-subtle)]">
                  {e.year}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-4">
          <p className="flex items-center gap-2 text-xs text-[var(--color-subtle)]">
            <Quote className="h-4 w-4" />
            {item.source} · {item.year}
          </p>
          <blockquote className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
            “{item.quote}”
          </blockquote>
          <p className="mt-3 text-sm text-[var(--color-fg)]">
            <Skull className="mr-1 inline h-4 w-4 text-[var(--color-danger)]" />
            {item.angle}
          </p>
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--color-muted)] underline-offset-2 hover:text-[var(--color-fg)] hover:underline"
          >
            ソースを開く
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3 text-sm text-[var(--color-muted)]">
        <p>
          <strong className="font-medium text-[var(--color-fg)]">結論:</strong>{" "}
          Java の思想は、個別の Spring 嫌悪で終わらない。
          層・握りつぶし・売り逃げ可能な表向きを通じて、
          <span className="text-[var(--color-danger)]">
            ありとあらゆるフレームワークへの嫌悪
          </span>
          を学習させる。それが交差言語で観測できる輸出物である。
        </p>
      </div>
    </section>
  );
}

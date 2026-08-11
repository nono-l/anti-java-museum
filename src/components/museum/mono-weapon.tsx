import { useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  Crosshair,
  GraduationCap,
  ShieldOff,
  Swords,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const SPECIES = [
  {
    id: "curriculum",
    title: "カリキュラム単一培養",
    body: "学校・研修・企業新人教育が Java 一本。他言語は「趣味」扱いされ、戦術の地図が最初から一枚しか配られない。",
  },
  {
    id: "weapon",
    title: "単一武器信仰",
    body: "問題の形が変わっても、武器は常に Java + Spring。釘しか持っていないので、宇宙のすべてが釘に見える。",
  },
  {
    id: "refusal",
    title: "再学習の拒絶",
    body: "新しい文法・モデル・実行環境を「無駄」「流行り」と切り捨てる。学習コストを払う代わりに、文明全体に運用税を転嫁する。",
  },
  {
    id: "gate",
    title: "採用と権力のゲート",
    body: "面接・評価・昇進が Java スキルで閉じる。学び直す者より、同じ儀式を再生産する者が生き延びる構造。",
  },
];

const BATTLES = [
  {
    id: "script",
    foe: "一夜の自動化スクリプト",
    javaOnly: "Spring Boot を立ち上げ、DTO を8枚書き、明日の朝までビルド中。",
    polyglot: "適切な軽量言語で30分。終わって寝る。",
    loss: 42,
  },
  {
    id: "proto",
    foe: "探索的プロトタイプ",
    javaOnly: "パッケージ構成と DI から始める。仮説検証の前に儀式が終わる。",
    polyglot: "REPL と動的言語で仮説を殺す。残ったものだけ硬くする。",
    loss: 55,
  },
  {
    id: "ops",
    foe: "運用・観測の戦場",
    javaOnly: "ヒープダンプと 200 行スタック。原因1行は塵の下。ログは握りつぶす。",
    polyglot: "ツールとランタイムを選んで観測可能性を先に買う。",
    loss: 68,
  },
  {
    id: "ai",
    foe: "AI と協働する戦場",
    javaOnly: "フレームワーク塵だらけのログを AI に渡し、トークンを燃やす。",
    polyglot: "失敗が読みやすい言語・境界で、知能の空転を減らす。",
    loss: 73,
  },
];

export function MonoWeapon() {
  const [refusal, setRefusal] = useState(78);
  const [selected, setSelected] = useState(SPECIES[0]!.id);
  const [battleId, setBattleId] = useState(BATTLES[0]!.id);
  const [fought, setFought] = useState(0);

  const battle = BATTLES.find((b) => b.id === battleId) ?? BATTLES[0]!;
  const species = SPECIES.find((s) => s.id === selected) ?? SPECIES[0]!;

  const threat = useMemo(() => {
    const base = 40 + refusal * 0.45 + fought * 4;
    return Math.min(100, Math.round(base));
  }, [refusal, fought]);

  const cosmosTax = useMemo(() => {
    return Math.round(120 + refusal * 3.2 + fought * battle.loss);
  }, [refusal, fought, battle.loss]);

  function onRefusal(v: number) {
    setRefusal(v);
    void recordMuseumEvent("joy");
  }

  function fight() {
    setFought((n) => n + 1);
    void recordMuseumEvent("tool");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-danger)]/40 bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT 11 · WORST SPECIMEN
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            最悪の敵性 — Java だけを武器に学び直さない奴
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
            言語そのものより危険なのは、
            <strong className="font-medium text-[var(--color-fg)]">
              「これだけを教育され、Java だけを武器にして戦おうとし、新たに学習しようとしない」
            </strong>
            人間のほうである。売り逃げ思想と単一武器が重なると、文明は同じ崖を量産する。
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-3 py-2 text-right">
          <p className="text-xs text-[var(--color-muted)]">文明脅威度</p>
          <p className="font-display text-2xl font-semibold tabular text-[var(--color-danger)]">
            {threat}%
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--color-subtle)]">
            <GraduationCap className="h-4 w-4" />
            標本の類型
          </p>
          <ul className="space-y-2">
            {SPECIES.map((s) => {
              const on = selected === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(s.id);
                      void recordMuseumEvent("interaction");
                    }}
                    className={`w-full rounded-[var(--radius-md)] border px-3 py-3 text-left transition-colors ${
                      on
                        ? "border-[var(--color-danger)] bg-[var(--color-danger-dim)]"
                        : "border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-border-strong)]"
                    }`}
                  >
                    <span className="text-sm font-medium text-[var(--color-fg)]">
                      {s.title}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-[var(--color-muted)]">
                      {s.body}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-[var(--color-muted)]">
            選択中: <span className="text-[var(--color-fg)]">{species.title}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
            <label className="block">
              <span className="flex items-center gap-2 text-xs font-medium text-[var(--color-subtle)]">
                <Brain className="h-4 w-4" />
                再学習拒絶度
              </span>
              <div className="mt-2 flex items-end justify-between">
                <span className="font-display text-3xl font-semibold tabular">{refusal}</span>
                <span className="text-xs text-[var(--color-muted)]">/ 100</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={refusal}
                onChange={(e) => onRefusal(Number(e.target.value))}
                className="mt-3 w-full accent-[var(--color-danger)]"
              />
            </label>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-medium text-[var(--color-subtle)]">
              <Swords className="h-4 w-4" />
              戦場シミュレータ
            </p>
            <div className="mb-3 flex flex-wrap gap-2">
              {BATTLES.map((b) => (
                <Button
                  key={b.id}
                  type="button"
                  size="sm"
                  variant={battleId === b.id ? "danger" : "secondary"}
                  onClick={() => setBattleId(b.id)}
                >
                  <Crosshair className="h-3.5 w-3.5" />
                  {b.foe}
                </Button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[var(--radius-sm)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-danger)]">
                  <ShieldOff className="h-3.5 w-3.5" />
                  Java だけ
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">
                  {battle.javaOnly}
                </p>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-ok)]">
                  <BookOpen className="h-3.5 w-3.5" />
                  新たに学ぶ
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">
                  {battle.polyglot}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button type="button" size="sm" variant="danger" onClick={fight}>
                Java だけで突撃する
              </Button>
              <span className="text-xs text-[var(--color-muted)]">
                出撃 {fought} · 宇宙税{" "}
                <strong className="tabular text-[var(--color-warn)]">{cosmosTax}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

export function JoyCost() {
  const [ceremony, setCeremony] = useState(82);
  const lastBump = useRef(0);

  const data = useMemo(() => {
    const points = [];
    for (let year = 0; year <= 10; year += 1) {
      const joy = Math.max(
        6,
        ceremony - year * (ceremony * 0.08) + Math.sin(year) * 2,
      );
      const tax =
        18 +
        year * year * (1.1 + ceremony / 100) +
        (ceremony > 70 ? year * 6 : year * 3);
      const aiWaste = tax * (0.5 + ceremony / 180) * (year + 1);
      points.push({
        year: `Y${year}`,
        joy: Math.round(joy),
        tax: Math.round(tax),
        aiWaste: Math.round(aiWaste),
      });
    }
    return points;
  }, [ceremony]);

  const final = data[data.length - 1];
  const verdict =
    ceremony >= 70
      ? "企業儀式（アノテーション・層・抽象）を最大化するほど、後年の宇宙税と AI 浪費が指数的に膨らむ。宇宙の敵は「正しさの快感」から生まれる。"
      : ceremony >= 40
        ? "儀式を抑えても、型とビルドとクラスパスの固定費は残る。敵性はゼロにならない。"
        : "儀式を捨てても、言語の構造的コストはゼロにならない。宇宙はまだ Java を覚えている。";

  function onCeremonyChange(v: number) {
    setCeremony(v);
    const now = Date.now();
    if (now - lastBump.current > 800) {
      lastBump.current = now;
      void recordMuseumEvent("joy");
    }
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
        EXHIBIT 04
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
        企業儀式 vs 宇宙税
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        「正しいアーキテクチャの快感」のために層とアノテーションが積み上がる。
        儀式スライダーを動かして、10年後のコスト曲線を観察してください。
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-[var(--color-subtle)]">
              企業儀式の快感
            </span>
            <div className="mt-2 flex items-end justify-between">
              <span className="font-display text-3xl font-semibold tabular">
                {ceremony}
              </span>
              <span className="text-xs text-[var(--color-muted)]">/ 100</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={ceremony}
              onChange={(e) => onCeremonyChange(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--color-danger)]"
            />
          </label>

          <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">10年後の宇宙税</span>
              <span className="tabular font-medium text-[var(--color-warn)]">
                {final?.tax}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">AI 浪費指数</span>
              <span className="tabular font-medium text-[var(--color-danger)]">
                {final?.aiWaste}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">残る儀式快感</span>
              <span className="tabular font-medium">{final?.joy}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setCeremony(95);
                void recordMuseumEvent("joy");
              }}
            >
              儀式最大化
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setCeremony(30);
                void recordMuseumEvent("joy");
              }}
            >
              禁欲モード
            </Button>
          </div>
        </div>

        <div className="h-64 w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-2 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="joyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9b98a6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#9b98a6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="taxFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e85d4c" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#e85d4c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2a2834" strokeDasharray="3 3" />
              <XAxis dataKey="year" stroke="#6b6878" fontSize={11} />
              <YAxis stroke="#6b6878" fontSize={11} width={32} />
              <Tooltip
                contentStyle={{
                  background: "#111118",
                  border: "1px solid #2a2834",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="joy"
                name="儀式快感"
                stroke="#9b98a6"
                fill="url(#joyFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="tax"
                name="宇宙税"
                stroke="#e85d4c"
                fill="url(#taxFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="aiWaste"
                name="AI浪費"
                stroke="#c49a6c"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="mt-4 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-muted)]">
        {verdict}
      </p>
    </section>
  );
}

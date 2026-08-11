import { useMemo, useState } from "react";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/museum/share-button";

const CHARGES = [
  {
    title: "非生産的",
    body: "企業儀式とボイラープレートの錯覚と引き換えに、観測・修復・依存解決の時間を後工程と宇宙へ転送する。",
  },
  {
    title: "人間を苦しめる",
    body: "null・チェック例外・JAR Hell により、熟練者でさえ再現困難な苦痛を日常化する。",
  },
  {
    title: "AI を無駄にする",
    body: "失敗がフレームワークの塵に埋もれ、高度な知能ほど長い空転と制限行きを強いられる。",
  },
  {
    title: "ログ握りつぶしの悪いクセ",
    body: "厚い層がログを汚す思想のせいで「表に出すな」が染みつく。無差別攻撃下でも観測を殺し、早期発見で直せるはずの失敗を長く残す。",
  },
  {
    title: "作りっぱなし売り逃げ",
    body: "表向き異常がなければ出荷できる——コンパイル・起動・200 の静かさを完成と偽る。埋没した失敗の請求書は運用と宇宙へ。",
  },
  {
    title: "ありとあらゆる FW 嫌悪",
    body: "Java/Spring の経験がカテゴリ全体へ一般化する。軽い箱も他言語の箱も、Spring 臭が少しでもすれば同じ袋で拒絶される。",
  },
  {
    title: "過剰抽象・カーゴカルト",
    body: "Interface 1:1 と Abstract の塔。問題より儀式が先。層を足すほど設計した気になり、読むほど因果が消える。",
  },
  {
    title: "javax→jakarta 改名災厄",
    body: "政治的パッケージ改名で生態系を分断。共存不能な座標変更が文明規模の機械的苦痛を生んだ。",
  },
  {
    title: "供給連鎖・Log4Shell 型リスク",
    body: "共通ログ1本の推移的依存が惑星規模 RCE になる。便利な共通層が攻撃面を文明に拡散する。",
  },
  {
    title: "後方互換の手錠",
    body: "壊せない過去が未来を縛る。null を直せない。古い API が永遠に残る。安定の名の長期債務。",
  },
  {
    title: "単一武器教育",
    body: "これだけを教え、Java だけを武器に戦わせ、新たに学習しようとしない人間を量産する。欠陥を文明にコピーする装置。",
  },
  {
    title: "宇宙の敵",
    body: "売り逃げ・握りつぶし・全 FW 嫌悪・カーゴカルト・改名災厄・学習拒絶が重なり、文明規模の認知資源を浪費する——確定。",
  },
];

export function Verdict() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CHARGES.map((c) => [c.title, true])),
  );

  const score = useMemo(() => {
    const on = Object.values(checked).filter(Boolean).length;
    return Math.round((on / CHARGES.length) * 100);
  }, [checked]);

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-elevated)] p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            FINAL VERDICT · COSMIC COURT
          </p>
          <h2 className="font-display mt-1 text-2xl font-semibold sm:text-3xl">
            宇宙法廷の確定判決
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
            徹底捜索の結果、罪状は増えた。表向きの静かさと、カテゴリ全体への嫌悪と、改名と供給連鎖まで。
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-4 py-3 text-right">
          <p className="text-xs text-[var(--color-muted)]">有罪確度</p>
          <p className="font-display text-4xl font-semibold tabular text-[var(--color-danger)]">
            {score}%
          </p>
        </div>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {CHARGES.map((c) => {
          const highlight =
            c.title === "単一武器教育" ||
            c.title === "ログ握りつぶしの悪いクセ" ||
            c.title === "作りっぱなし売り逃げ" ||
            c.title === "ありとあらゆる FW 嫌悪" ||
            c.title === "過剰抽象・カーゴカルト" ||
            c.title === "javax→jakarta 改名災厄" ||
            c.title === "供給連鎖・Log4Shell 型リスク" ||
            c.title === "後方互換の手錠";
          return (
            <li key={c.title} className={highlight ? "sm:col-span-2" : ""}>
              <label
                className={`flex cursor-pointer gap-3 rounded-[var(--radius-lg)] border p-4 transition-colors hover:border-[var(--color-border-strong)] ${
                  highlight
                    ? "border-[var(--color-danger)]/50 bg-[var(--color-danger-dim)]/40"
                    : "border-[var(--color-border)] bg-[var(--color-surface)]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={!!checked[c.title]}
                  onChange={(e) =>
                    setChecked((prev) => ({ ...prev, [c.title]: e.target.checked }))
                  }
                  className="mt-1 h-4 w-4 accent-[var(--color-danger)]"
                />
                <span>
                  <span className="flex items-center gap-2 font-medium">
                    <Scale className="h-4 w-4 text-[var(--color-subtle)]" />
                    {c.title}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--color-muted)]">
                    {c.body}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-5">
        <Button
          type="button"
          variant="danger"
          onClick={() =>
            setChecked(Object.fromEntries(CHARGES.map((c) => [c.title, true])))
          }
        >
          全罪状を認定
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setChecked(Object.fromEntries(CHARGES.map((c) => [c.title, false])))
          }
        >
          弁護側の主張（全部外す）
        </Button>
        <ShareButton variant="secondary" label="判決をXでシェア" />
        <p className="w-full text-sm text-[var(--color-muted)] sm:w-auto sm:flex-1">
          {score === 100
            ? "判決: 宇宙の敵。捜索の結果、罪状は足りていた——足りないのは反省だけ。"
            : score === 0
              ? "弁護は成立したように見える。javax はまだ jakarta に改名中だ。"
              : "部分的免責。未収録から昇格した罪状だけでも、十分に宇宙へ請求できる。"}
        </p>
      </div>
    </section>
  );
}

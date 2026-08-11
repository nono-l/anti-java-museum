import { useMemo, useState } from "react";
import { FileWarning, RotateCcw, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const CLEAN = `public byte[] readConfig(Path path) throws IOException {
    return Files.readAllBytes(path);
}

public void boot(Path path) throws IOException {
    byte[] raw = readConfig(path);
    apply(raw);
}`;

const SWALLOWED = `public byte[] readConfig(Path path) {
    try {
        return Files.readAllBytes(path);
    } catch (IOException e) {
        return null; // 「処理した」ことにする宇宙の慣習
    }
}

public void boot(Path path) {
    byte[] raw = readConfig(path); // null が静かに戻る
    apply(raw); // NPE で別の銀河が裂ける
}`;

const PROPAGATED = `public byte[] readConfig(Path path)
        throws IOException, ConfigException, CheckedCosmicException {
    try {
        return Files.readAllBytes(path);
    } catch (IOException e) {
        throw new ConfigException("wrap", e);
    }
}

public void boot(Path path)
        throws IOException, ConfigException, CheckedCosmicException,
               ServiceException, EnterpriseRitualException {
    byte[] raw = readConfig(path);
    apply(raw);
}

// 呼び出し側のシグネチャは銀河の半径まで膨張する`;

type Mode = "clean" | "swallow" | "propagate";

export function CheckedHell() {
  const [mode, setMode] = useState<Mode>("clean");

  const code = useMemo(() => {
    if (mode === "swallow") return SWALLOWED;
    if (mode === "propagate") return PROPAGATED;
    return CLEAN;
  }, [mode]);

  const analysis = useMemo(() => {
    if (mode === "swallow") {
      return {
        title: "例外を飲み込む儀式",
        body: "チェック例外の圧力が、catch して null を返す文化を生む。型は「安全」を装い、失敗は沈黙したまま別の星で爆発する。",
        score: 88,
      };
    }
    if (mode === "propagate") {
      return {
        title: "throws 条項の宇宙膨張",
        body: "正しい伝播はシグネチャ汚染を連鎖させる。インターフェース契約が壊れ、ラムダもストリームも逃げ場を失う。",
        score: 76,
      };
    }
    return {
      title: "表面的な正しさ",
      body: "まだ booting 前。checked のコストは呼び出しグラフが広がった瞬間に露呈する。",
      score: 22,
    };
  }, [mode]);

  function pick(next: Mode) {
    setMode(next);
    if (next !== "clean") void recordMuseumEvent("indent");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT 02
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            チェック例外 — 銀河を汚染する throws
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            意図は「失敗を型で強制する」。結果はボイラープレート、空 catch、ラッパー地獄。
            多くの文明が unchecked へ逃げ、checked は儀式と嘘の両方を量産する。
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-3 py-2 text-right">
          <p className="text-xs text-[var(--color-muted)]">シグネチャ汚染度</p>
          <p className="font-display text-2xl font-semibold tabular text-[var(--color-danger)]">
            {analysis.score}%
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => pick("clean")}>
          <RotateCcw className="h-4 w-4" />
          理想形
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => pick("swallow")}>
          <Waves className="h-4 w-4" />
          例外を飲み込む
        </Button>
        <Button type="button" variant="danger" size="sm" onClick={() => pick("propagate")}>
          <FileWarning className="h-4 w-4" />
          throws を膨張させる
        </Button>
      </div>

      <pre className="min-h-48 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-4 font-mono text-xs leading-relaxed text-[var(--color-fg)] sm:text-sm">
        {code}
      </pre>

      <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3">
        <p className="text-sm font-medium text-[var(--color-fg)]">{analysis.title}</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{analysis.body}</p>
      </div>
    </section>
  );
}

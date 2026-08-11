import { useEffect, useState } from "react";
import { Activity, Bot, Clock3, Skull } from "lucide-react";
import {
  getMuseumDisplayStats,
  recordMuseumEvent,
  subscribeMuseumStats,
  type DisplayStats,
} from "@/lib/museum-stats";

function formatNum(n: number) {
  return new Intl.NumberFormat("ja-JP").format(Math.floor(n));
}

const FALLBACK: DisplayStats = {
  hoursLost: 92_847_331,
  aiTokens: 3_771_204_882,
  weirdDeps: 18_447,
  sanity: 28.6,
  raw: {
    visits: 0,
    interactions: 0,
    indentOps: 0,
    aiOps: 0,
    depOps: 0,
    toolOps: 0,
    shareOps: 0,
    joyOps: 0,
    posts: 0,
  },
};

export function CostTicker() {
  const [stats, setStats] = useState<DisplayStats>(FALLBACK);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const key = "museum-visit-v2-java-cosmic";
        let next: DisplayStats | null = null;
        if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          next = await recordMuseumEvent("visit");
        } else {
          next = await getMuseumDisplayStats();
        }
        if (!cancelled && next) {
          setStats(next);
          setReady(true);
        }
      } catch {
        if (!cancelled) setReady(true);
      }
    }

    void boot();

    const unsub = subscribeMuseumStats((s) => {
      if (!cancelled) {
        setStats(s);
        setReady(true);
      }
    });

    const poll = window.setInterval(() => {
      void getMuseumDisplayStats()
        .then((s) => {
          if (!cancelled) setStats(s);
        })
        .catch(() => {});
    }, 8000);

    return () => {
      cancelled = true;
      unsub();
      window.clearInterval(poll);
    };
  }, []);

  const cards = [
    {
      label: "銀河が失った時間（時間）",
      value: formatNum(stats.hoursLost),
      icon: Clock3,
      hint: "NullPointerException と throws 汚染の累計",
    },
    {
      label: "無駄にされた AI トークン",
      value: formatNum(stats.aiTokens),
      icon: Bot,
      hint: "Spring 200行スタックトレースで空転",
    },
    {
      label: "JAR / クラスパス衝突",
      value: formatNum(stats.weirdDeps),
      icon: Activity,
      hint: "Maven nearest-wins が生んだ衝突",
    },
    {
      label: "残存正気度",
      value: `${stats.sanity.toFixed(1)}%`,
      icon: Skull,
      hint: "IDE とアノテーションを開くたびに減少",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((s) => (
        <article
          key={s.label}
          className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-5 backdrop-blur-sm"
        >
          <div className="mb-3 flex items-center gap-2 text-[var(--color-subtle)]">
            <s.icon className="h-4 w-4" aria-hidden />
            <span className="text-xs font-medium tracking-wide">{s.label}</span>
          </div>
          <p
            className={`font-display text-2xl font-semibold tabular text-[var(--color-fg)] sm:text-3xl transition-opacity ${
              ready ? "opacity-100" : "opacity-70"
            }`}
          >
            {s.value}
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">{s.hint}</p>
          {s.label.startsWith("残存") && (
            <p className="mt-1 text-[10px] text-[var(--color-subtle)]">
              来館 {stats.raw.visits} · 操作 {stats.raw.interactions}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}

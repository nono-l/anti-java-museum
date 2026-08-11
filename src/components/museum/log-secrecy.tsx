import { useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Radar,
  ShieldAlert,
  Siren,
  TimerReset,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const RAW_LOG = `2026-08-11 02:14:07.882 ERROR [http-nio-8080-exec-7] o.a.c.c.C.[.[.[/].[dispatcherServlet]
  Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception

java.lang.NullPointerException: Cannot invoke "com.corp.billing.UserWallet.getSecretKey()" because "wallet" is null
	at com.corp.billing.PaymentService.charge(PaymentService.java:88)
	at com.corp.billing.PaymentService$$SpringCGLIB$$0.charge(<generated>)
	at org.springframework.aop.framework.CglibAopProxy$DynamicAdvisedInterceptor.intercept(CglibAopProxy.java:720)
	at org.springframework.security.web.FilterChainProxy.doFilterInternal(FilterChainProxy.java:233)
Caused by: org.postgresql.util.PSQLException: FATAL: password authentication failed for user "billing_app"
	... 140 common frames omitted

DEBUG o.h.SQL - select * from wallets where user_id=? /* conn: jdbc:postgresql://10.0.4.22:5432/prod_billing */`;

const HABIT_CHAIN = [
  {
    step: "1",
    title: "層がログを汚す",
    body: "AOP・Filter・CGLIB・JDBC がスタックに乗る。原因1行の横に内部地図と接続の影が並ぶ。",
  },
  {
    step: "2",
    title: "教義が生まれる",
    body: "『危険だから表に出すな』。秘密と座標を区別せず、ログごと握りつぶすのが正しい顔になる。",
  },
  {
    step: "3",
    title: "悪いクセが定着",
    body: "本番で握りつぶす → 開発でも握りつぶす → 他言語・他現場にも同じクセを持ち込む。観測不全が人格化する。",
  },
  {
    step: "4",
    title: "無差別時代に破綻",
    body: "攻撃は山ほど来る。隠蔽しても殴られる。消えたのは攻撃ではなく、早期発見と修復だけ。",
  },
];

const LEAKS = [
  {
    id: "stack",
    label: "内部パッケージ地図",
    detail: "層の罪。本当に隠すのは秘密であって、失敗の座標ではない。",
  },
  {
    id: "db",
    label: "DB 接続の影",
    detail: "秘密は隠せ。だが『全部握りつぶせ』は別物の悪いクセ。",
  },
  {
    id: "auth",
    label: "認証構成の露呈",
    detail: "指紋と診断を混同した結果、観測ごと消す教義が育つ。",
  },
  {
    id: "noise",
    label: "原因1行の埋葬",
    body: "NPE 1行が140フレームに埋まる。握りつぶしはさらに土を被せる。",
    detail: "NPE 1行が140フレームに埋まる。握りつぶしはさらに土を被せる。",
  },
];

type Mode = "raw" | "hidden" | "sanitized" | "observable";

const SCORES: Record<
  Mode,
  { leak: number; fix: number; attack: number; mttr: number; netRisk: number; habit: number }
> = {
  raw: { leak: 72, fix: 48, attack: 91, mttr: 38, netRisk: 62, habit: 55 },
  sanitized: { leak: 28, fix: 14, attack: 90, mttr: 72, netRisk: 78, habit: 82 },
  hidden: { leak: 8, fix: 4, attack: 93, mttr: 96, netRisk: 94, habit: 98 },
  observable: { leak: 18, fix: 86, attack: 88, mttr: 12, netRisk: 31, habit: 8 },
};

export function LogSecrecy() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [selectedLeak, setSelectedLeak] = useState(LEAKS[0]!.id);
  const [wave, setWave] = useState(0);

  const scores = SCORES[mode];

  const display = useMemo(() => {
    if (mode === "hidden") {
      return `// Java 思想が育てる悪いクセ
// 層がログを汚す → 「危険」→ ログを握りつぶす
// 握りつぶしが習慣になり、観測不全が「プロの作法」になる

HTTP 500 Internal Server Error
(Please contact the system administrator.)

scanner bots:
  /wp-admin 404
  /.env 404
  /actuator/env 401
  /api/v1/payment 500  ← 原因不明のまま連続ヒット
  /api/v1/payment 500

— 無差別スキャンは止まらない。握りつぶしても殴られる。
— クセだけが残り、早期発見は死ぬ。`;
    }
    if (mode === "sanitized") {
      return `ERROR dispatcherServlet — exception occurred
java.lang.NullPointerException
	at ***.***.***(Unknown Source)
	... 140 frames redacted for security ...

// 企業フィルタ: 「プロらしい」握りつぶし
// 指紋も座標も消える。攻撃波は同じ。
// これが悪いクセの完成形——安全に見えて盲目。`;
    }
    if (mode === "observable") {
      return `// クセを断つ境界
// ・秘密（鍵・パスワード・トークン・PII）→ 絶対に出さない
// ・失敗の座標（何が・どこで・なぜ）→ 運用と修復経路に出す
// ・公開面 → 安全な診断 ID のみ

ERROR payment.charge failed
  error_id: pay_9f3a2c
  cause: NPE at PaymentService.charge:88
  public: "決済を完了できません (ID: pay_9f3a2c)"
  internal: on-call linked, patch in 12min

— Java の層は汚れやすい。だからこそ握りつぶすな。
— 汚さを理由に観測を殺すクセこそ、思想の副作用である。`;
    }
    return RAW_LOG;
  }, [mode]);

  const leak = LEAKS.find((l) => l.id === selectedLeak) ?? LEAKS[0]!;

  function set(next: Mode) {
    setMode(next);
    void recordMuseumEvent("ai");
  }

  function fireWave() {
    setWave((w) => w + 1);
    void recordMuseumEvent("interaction");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT 07 · LOG DOCTRINE
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            Java の思想が、ログを握りつぶす悪いクセを育てる
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--color-muted)]">
            フレームワーク層がスタックを汚染する。汚染が怖いから文化はログを握りつぶす。
            その握りつぶしが
            <strong className="font-medium text-[var(--color-fg)]">悪いクセ</strong>
            として定着し、無差別攻撃の時代には隠蔽より大きなリスクになる。
            出ていれば早期発見で直せるのに、思想の副作用で観測が殺される。
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Metric label="漏洩度" value={scores.leak} tone="danger" />
          <Metric label="修復可能性" value={scores.fix} tone="ok" />
          <Metric label="攻撃到達" value={scores.attack} tone="warn" />
          <Metric label="MTTR悪化" value={scores.mttr} tone="warn" />
          <Metric label="握りつぶしクセ" value={scores.habit} tone="danger" />
          <Metric label="ネット実リスク" value={scores.netRisk} tone="danger" />
        </div>
      </div>

      <ol className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {HABIT_CHAIN.map((h) => (
          <li
            key={h.step}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-3"
          >
            <p className="text-[10px] font-medium tracking-wide text-[var(--color-danger)]">
              STEP {h.step}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--color-fg)]">{h.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">{h.body}</p>
          </li>
        ))}
      </ol>

      <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[var(--color-danger-dim)]/50 p-3 text-sm text-[var(--color-muted)]">
        <p className="flex items-start gap-2">
          <Siren className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />
          <span>
            <strong className="font-medium text-[var(--color-fg)]">因果:</strong>{" "}
            Java の層構造思想 → ログが脆弱性カタログ化 → 「表に出すな」教義 →
            <span className="text-[var(--color-fg)]">ログを握りつぶす悪いクセ</span>
            。クセは現場を超えて伝染する。攻撃は無差別に来るから、握りつぶしは負け戦略。
          </span>
        </p>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "hidden" ? "danger" : "secondary"}
          onClick={() => set("hidden")}
        >
          <EyeOff className="h-4 w-4" />
          握りつぶす（悪いクセ）
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "sanitized" ? "danger" : "secondary"}
          onClick={() => set("sanitized")}
        >
          <Lock className="h-4 w-4" />
          企業フィルタで消す
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "raw" ? "danger" : "secondary"}
          onClick={() => set("raw")}
        >
          <Eye className="h-4 w-4" />
          生ログ全出し（層の罪）
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "observable" ? "default" : "secondary"}
          onClick={() => set("observable")}
        >
          <Zap className="h-4 w-4" />
          クセを断つ・早期修復
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={fireWave}>
          <TimerReset className="h-4 w-4" />
          無差別攻撃波 +{wave > 0 ? wave : ""}
        </Button>
      </div>

      {wave > 0 && (
        <p className="mb-3 text-xs text-[var(--color-warn)]">
          攻撃波 ×{wave}: 握りつぶしてもヒット数は減らない。
          {mode === "hidden" || mode === "sanitized"
            ? " 悪いクセが残すのは盲目だけ。"
            : mode === "observable"
              ? " クセを断った側は同じ波でも先に直せる。"
              : " 層の罪は見える。秘密と座標の分離が次の課題。"}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <pre className="min-h-64 overflow-x-auto whitespace-pre-wrap rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-4 font-mono text-[11px] leading-relaxed text-[var(--color-muted)] sm:text-xs">
          {display}
        </pre>

        <div className="space-y-3">
          <p className="flex items-center gap-2 text-xs font-medium text-[var(--color-subtle)]">
            <Radar className="h-4 w-4" />
            層が混ぜるもの（分離せよ）
          </p>
          <ul className="space-y-2">
            {LEAKS.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLeak(l.id);
                    if (mode !== "raw") set("raw");
                    else void recordMuseumEvent("interaction");
                  }}
                  className={`w-full rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors ${
                    selectedLeak === l.id && mode === "raw"
                      ? "border-[var(--color-danger)] bg-[var(--color-danger-dim)]"
                      : "border-[var(--color-border)] bg-[var(--color-elevated)] hover:border-[var(--color-border-strong)]"
                  }`}
                >
                  <span className="text-sm font-medium text-[var(--color-fg)]">
                    {l.label}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--color-muted)]">
                    {l.detail}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3 text-sm text-[var(--color-muted)]">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warn)]" />
        <p>
          <strong className="font-medium text-[var(--color-fg)]">つまり:</strong>{" "}
          Java の思想（厚い層・企業運用・「表に出すな」）のせいで、
          <span className="text-[var(--color-danger)]">ログを握りつぶす悪いクセ</span>
          がつく。クセは安全ではない。無差別攻撃下では、出ていれば直せる失敗を長く残す装置になる。
          フォーカス: <span className="text-[var(--color-fg)]">{leak.label}</span>
          {mode === "hidden" && " — クセの本丸。握りつぶし度 98%。"}
          {mode === "sanitized" && " — プロ顔した握りつぶし。"}
          {mode === "raw" && " — 層の罪が露出。ここからクセが生まれる原風景。"}
          {mode === "observable" && " — クセを断った状態。ネット実リスク最小。"}
        </p>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "danger" | "warn" | "ok";
}) {
  const color =
    tone === "danger"
      ? "text-[var(--color-danger)]"
      : tone === "ok"
        ? "text-[var(--color-ok)]"
        : "text-[var(--color-warn)]";
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-2 text-right">
      <p className="text-[10px] text-[var(--color-muted)] sm:text-xs">{label}</p>
      <p className={`font-display text-xl font-semibold tabular sm:text-2xl ${color}`}>
        {value}%
      </p>
    </div>
  );
}

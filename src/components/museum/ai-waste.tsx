import { useState } from "react";
import { Bot, FileCode2, ShieldBan, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const SAMPLE_LOG = `Exception in thread "http-nio-8080-exec-3" java.lang.NullPointerException: Cannot invoke "com.corp.User.getProfile()" because "user" is null
	at com.corp.OrderService.ship(OrderService.java:42)
	at com.corp.OrderService$$SpringCGLIB$$0.ship(<generated>)
	at jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
	at org.springframework.aop.framework.CglibAopProxy$DynamicAdvisedInterceptor.intercept(CglibAopProxy.java:720)
	at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:119)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184)
	at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:118)
	... 87 more frames of framework internals ...
	at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149)`;

type Phase = "idle" | "log-only" | "with-source" | "restricted";

const RESPONSES: Record<Exclude<Phase, "idle">, string> = {
  "log-only":
    "AI: Tomcat のスレッドプールを増やし、Spring を再起動し、JDK を 21 に上げてください。おそらくネットワークか GC の問題です。\n\n（ログにネットワークも GC もない。典型的なトンチンカン。本当の原因は user == null。フレームワークの塵が因果を隠蔽した。）",
  "with-source":
    "AI: 全部 try/catch で包み、null チェックを 40 箇所に追加し、@Transactional(propagation = REQUIRES_NEW) を重ねましょう。ついでに Aspect で再試行…\n\n[patch applied]\nwhile (true) {\n  try { return ship(id); }\n  catch (Exception e) { /* swallow */ }\n}\n\n（修復行為が新たな破壊と無限ループを生んだ。宇宙の敵は「直せば直すほど壊れる」。）",
  restricted:
    "AI: このリクエストは安全上の制限に到達したため処理できません。別のモデルにフォールバックします…\n\n→ フォールバック先も 90 行の AOP スタックでは因果を掴めず、堂々巡りが確定。\n制限に行った時点で、無駄なループに入っていた証拠。知能の空転こそ敵性の証明。",
};

export function AiWaste() {
  const [log, setLog] = useState(SAMPLE_LOG);
  const [phase, setPhase] = useState<Phase>("idle");
  const [tokens, setTokens] = useState(0);

  function run(next: Exclude<Phase, "idle">) {
    setPhase(next);
    setTokens((t) => t + (next === "log-only" ? 2100 : next === "with-source" ? 8800 : 12400));
    void recordMuseumEvent("ai");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
        EXHIBIT 06
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
        AI 浪費シミュレータ — スタックトレースの宇宙
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        本物の原因は1行。残りは Spring CGLIB・AOP・Tomcat の宇宙塵。
        ログだけ渡しても、ソースを渡しても、最上位モデルでも——知能は空転する。
        これが「宇宙の敵」の核心：外部知能を構造的に浪費する装置であること。
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-[var(--color-subtle)]">
            <Terminal className="h-4 w-4" />
            エラーログ（観測窓）
          </div>
          <textarea
            value={log}
            onChange={(e) => setLog(e.target.value)}
            spellCheck={false}
            className="min-h-48 w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-3 font-mono text-[11px] leading-relaxed text-[var(--color-muted)] outline-none sm:text-xs"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => run("log-only")}>
              <Bot className="h-4 w-4" />
              ログだけ AI に渡す
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => run("with-source")}>
              <FileCode2 className="h-4 w-4" />
              ソースも渡して直させる
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={() => run("restricted")}>
              <ShieldBan className="h-4 w-4" />
              最上位モデルへ
            </Button>
          </div>
        </div>

        <div className="flex flex-col rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[var(--color-subtle)]">AI 出力</span>
            <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs tabular text-[var(--color-warn)]">
              浪費トークン {tokens.toLocaleString("ja-JP")}
            </span>
          </div>
          <pre className="flex-1 whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--color-fg)]">
            {phase === "idle"
              ? "ボタンを押すと、Java の失敗モードがいかに外部知能を空転させるかを再現します。"
              : RESPONSES[phase]}
          </pre>
          {phase !== "idle" && (
            <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-muted)]">
              原因は AI の性能不足だけではない。失敗状態がフレームワークの塵に埋もれ、
              解釈・修復可能な形で露出していない。生態系そのものが知能を浪費する装置——宇宙の敵——になっている。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

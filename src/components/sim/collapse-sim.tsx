import { useMemo, useState } from "react";
import { recordMuseumEvent } from "@/lib/museum-stats";
import {
  encodeGameResult,
  type SharedGameResult,
} from "@/lib/game-result";
import { GameResultView } from "@/components/sim/game-result-view";

/**
 * カイロソフト風: 1日の中で行動力を使い切るまでコマンド選択、
 * 「ねる」で日付進行。エンディングは暗号っぽい /Game/... でシェア可。
 */

type Stats = {
  body: number;
  mind: number;
  stress: number;
  tech: number;
  trust: number;
  mono: number;
  learn: number;
  progress: number;
  debt: number;
  ap: number;
};

type Action = {
  id: string;
  name: string;
  cat: "仕事" | "育成" | "処理" | "休息";
  ap: number;
  desc: string;
  effect: Partial<Stats>;
};

type Project = {
  id: string;
  name: string;
  days: number;
  goal: number;
  pay: number;
  flavor: string;
};

type Phase = "title" | "pick" | "play" | "end";

type Ending = {
  rank: string;
  title: string;
  body: string;
  scores: { label: string; value: number }[];
  shared: SharedGameResult;
  code: string;
};

const PROJECTS: Project[] = [
  {
    id: "bank",
    name: "メガバンク基幹",
    days: 14,
    goal: 100,
    pay: 800,
    flavor: "会議が本体。jakarta の影。",
  },
  {
    id: "ec",
    name: "ECリプレース",
    days: 10,
    goal: 100,
    pay: 500,
    flavor: "納期きつい。売り逃げの匂い。",
  },
  {
    id: "gov",
    name: "官公庁パッケージ",
    days: 16,
    goal: 100,
    pay: 650,
    flavor: "Java 以外禁止令。",
  },
];

const ACTIONS: Action[] = [
  {
    id: "impl",
    name: "実装",
    cat: "仕事",
    ap: 2,
    desc: "Service と DTO を増やす",
    effect: { progress: 8, debt: 3, stress: 4, body: -6, mind: -2 },
  },
  {
    id: "debug",
    name: "デバッグ",
    cat: "仕事",
    ap: 2,
    desc: "NPE と Spring 塵",
    effect: { progress: 5, tech: 3, stress: 8, mind: -8, body: -8 },
  },
  {
    id: "meet",
    name: "会議",
    cat: "仕事",
    ap: 1,
    desc: "うちは Java だけ",
    effect: { trust: 5, mono: 4, progress: 2, stress: 6, mind: -4, body: -3 },
  },
  {
    id: "demo",
    name: "デモ準備",
    cat: "仕事",
    ap: 2,
    desc: "表向きを磨く",
    effect: { progress: 10, trust: 6, debt: 5, stress: 5, mind: -5 },
  },
  {
    id: "crush",
    name: "握りつぶし",
    cat: "処理",
    ap: 1,
    desc: "ログを出さず再起動",
    effect: { stress: -10, debt: 10, trust: 3, mind: -10, progress: 2 },
  },
  {
    id: "debt",
    name: "負債返済",
    cat: "処理",
    ap: 3,
    desc: "層を削る・テスト",
    effect: { debt: -12, progress: 3, body: -10, stress: 4, trust: -2 },
  },
  {
    id: "java",
    name: "Java特訓",
    cat: "育成",
    ap: 2,
    desc: "単一武器を研ぐ",
    effect: { tech: 7, mono: 5, body: -5, progress: 2 },
  },
  {
    id: "learn",
    name: "学び直し",
    cat: "育成",
    ap: 2,
    desc: "他言語・観測・本質",
    effect: { learn: 10, mono: -8, tech: 2, trust: -3, body: -4 },
  },
  {
    id: "ai",
    name: "AIに貼る",
    cat: "処理",
    ap: 1,
    desc: "塵ログで空転",
    effect: { stress: 6, mind: -4, progress: 1, body: -2 },
  },
  {
    id: "break",
    name: "休憩",
    cat: "休息",
    ap: 1,
    desc: "コーヒーとぼんやり",
    effect: { stress: -8, body: 8, mind: 4 },
  },
  {
    id: "sleep",
    name: "ねる",
    cat: "休息",
    ap: 0,
    desc: "日付を進めて回復",
    effect: {},
  },
];

const MORNING: { w: number; text: string; effect: Partial<Stats> }[] = [
  { w: 3, text: "平和な朝。IDE が重い。", effect: {} },
  { w: 2, text: "本番 NPE の連絡。", effect: { stress: 8, mind: -4, trust: -3 } },
  { w: 1, text: "jakarta 混在エラー。", effect: { stress: 10, debt: 5 } },
  { w: 1, text: "『Java だけでいい』定例。", effect: { mono: 4, learn: -2 } },
  { w: 1, text: "検収を急かされた。", effect: { stress: 6, trust: 2 } },
  { w: 1, text: "CVE アラート。", effect: { stress: 5, body: -2 } },
];

const START: Stats = {
  body: 72,
  mind: 80,
  stress: 22,
  tech: 35,
  trust: 50,
  mono: 78,
  learn: 12,
  progress: 0,
  debt: 25,
  ap: 5,
};

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function apply(s: Stats, d: Partial<Stats>): Stats {
  const n = { ...s };
  (Object.keys(d) as (keyof Stats)[]).forEach((k) => {
    const v = d[k];
    if (v == null) return;
    if (k === "ap") n.ap = clamp(s.ap + v, 0, 8);
    else n[k] = clamp(s[k] + v);
  });
  return n;
}

function pickMorning() {
  const t = MORNING.reduce((a, b) => a + b.w, 0);
  let r = Math.random() * t;
  for (const m of MORNING) {
    r -= m.w;
    if (r <= 0) return m;
  }
  return MORNING[0]!;
}

function face(s: Stats): { key: string; label: string } {
  if (s.mind < 25 || s.stress > 85) return { key: "crush", label: "崩壊寸前" };
  if (s.body < 25) return { key: "tired", label: "過労顔" };
  if (s.stress > 65) return { key: "panic", label: "焦り顔" };
  if (s.learn > 40 && s.mono < 55) return { key: "hope", label: "学び顔" };
  if (s.progress > 70) return { key: "ship", label: "納品顔" };
  return { key: "normal", label: "社畜顔" };
}

function endingOf(s: Stats, p: Project, day: number, money: number): Ending | null {
  if (s.mind <= 0) {
    return grade(s, p, day, money, "F", "精神崩壊エンディング", "正気のゲージが空になった。");
  }
  if (s.stress >= 100) {
    return grade(s, p, day, money, "F", "過緊張エンディング", "ストレスが上限を突き破った。");
  }
  if (s.body <= 0) {
    return grade(s, p, day, money, "E", "過労ダウン", "体力が尽きた。案件は残る。");
  }
  if (s.progress >= p.goal) {
    if (s.learn >= 40 && s.mono <= 52) {
      return grade(s, p, day, money, "S", "学び直しの芽", "単一武器を少し手放せた。");
    }
    if (s.debt >= 60 || s.mind < 40) {
      return grade(s, p, day, money, "B", "売り逃げ成功", "表向き完了。請求は後世へ。");
    }
    return grade(s, p, day, money, "A", "完遂", "納品できた。信仰はまだ厚い。");
  }
  if (day > p.days) {
    return grade(s, p, day, money, "D", "納期切れ", "日数が尽きた。日誌だけ分厚い。");
  }
  return null;
}

function grade(
  s: Stats,
  p: Project,
  day: number,
  money: number,
  rank: string,
  title: string,
  body: string,
): Ending {
  const quality = clamp(s.progress * 0.4 + s.tech * 0.2 + (100 - s.debt) * 0.2 + s.trust * 0.2);
  const fun = clamp(s.learn * 0.5 + (100 - s.mono) * 0.3 + s.mind * 0.2);
  const creative = clamp((100 - s.mono) * 0.4 + s.learn * 0.4 + s.tech * 0.2);
  const fullBody = `${body} 報酬イメージ ¥${money}万相当（風刺）。`;
  const shared: SharedGameResult = {
    v: 1,
    rank,
    title,
    body: fullBody,
    project: p.name,
    day,
    money,
    scores: [quality, fun, creative, s.mono],
    mind: s.mind,
    stBody: s.body,
    mono: s.mono,
    learn: s.learn,
    debt: s.debt,
    progress: s.progress,
  };
  return {
    rank,
    title,
    body: fullBody,
    scores: [
      { label: "完成度", value: quality },
      { label: "楽しさ", value: fun },
      { label: "創意", value: creative },
      { label: "単一武器", value: s.mono },
    ],
    shared,
    code: encodeGameResult(shared),
  };
}

export function CollapseSim() {
  const [phase, setPhase] = useState<Phase>("title");
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<Stats>(START);
  const [day, setDay] = useState(1);
  const [money, setMoney] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [morning, setMorning] = useState("");
  const [ending, setEnding] = useState<Ending | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const f = face(stats);
  const threat = useMemo(
    () =>
      clamp(
        stats.mono * 0.35 +
          stats.debt * 0.25 +
          stats.stress * 0.2 +
          (100 - stats.mind) * 0.2,
      ),
    [stats],
  );

  function pushLog(line: string) {
    setLog((L) => [line, ...L].slice(0, 24));
  }

  function start(p: Project) {
    const m = pickMorning();
    const s = apply({ ...START }, m.effect);
    setProject(p);
    setStats(s);
    setDay(1);
    setMoney(0);
    setEnding(null);
    setMorning(m.text);
    setLog([`${p.name} 受注！`, `1日目朝: ${m.text}`]);
    setToast("案件スタート！");
    setPhase("play");
    void recordMuseumEvent("interaction");
  }

  function act(a: Action) {
    if (!project) return;

    if (a.id === "sleep") {
      sleep();
      return;
    }
    if (stats.ap < a.ap) {
      setToast("行動力が足りない！");
      return;
    }

    let next = apply(stats, { ...a.effect, ap: -a.ap });
    if (next.body < 30) next = apply(next, { mind: -3, stress: 3 });
    if (next.debt > 70 && (a.id === "impl" || a.id === "demo")) {
      next = apply(next, { progress: -2 });
    }

    const gain = a.id === "demo" || a.id === "impl" ? 3 + Math.floor(next.progress / 25) : 0;
    const nextMoney = money + gain;
    if (gain) setMoney(nextMoney);

    setStats(next);
    setFlash(a.name);
    setToast(`${a.name} を実行！`);
    pushLog(`${day}日 ${a.name}: ${a.desc}`);
    void recordMuseumEvent("joy");

    const end = endingOf(next, project, day, nextMoney);
    if (end) {
      setEnding(end);
      setPhase("end");
      void recordMuseumEvent("share");
    }
    window.setTimeout(() => setFlash(null), 400);
  }

  function sleep() {
    if (!project) return;
    const nextDay = day + 1;
    let s = apply(stats, {
      body: 18,
      mind: 8,
      stress: -12,
    });
    s = { ...s, ap: 5 };

    const m = pickMorning();
    s = apply(s, m.effect);
    if (s.debt > 55) s = apply(s, { progress: -1, stress: 2 });

    setStats(s);
    setDay(nextDay);
    setMorning(m.text);
    pushLog(`${nextDay}日目 — ねた。朝: ${m.text}`);
    setToast(`${nextDay}日目 はじまり！`);
    void recordMuseumEvent("interaction");

    const end = endingOf(s, project, nextDay, money);
    if (end) {
      setEnding(end);
      setPhase("end");
    }
  }

  function reset() {
    setPhase("title");
    setProject(null);
    setStats(START);
    setDay(1);
    setMoney(0);
    setLog([]);
    setToast("");
    setMorning("");
    setEnding(null);
  }

  const byCat = {
    仕事: ACTIONS.filter((a) => a.cat === "仕事"),
    育成: ACTIONS.filter((a) => a.cat === "育成"),
    処理: ACTIONS.filter((a) => a.cat === "処理"),
    休息: ACTIONS.filter((a) => a.cat === "休息"),
  };

  return (
    <div className="kairo mx-auto max-w-lg">
      <style>{kairoCss}</style>

      {phase === "title" && (
        <div className="kairo-panel">
          <div className="kairo-title">
            <p className="kairo-tag">KAIRO-LIKE SIM</p>
            <h1>ジャバだけ社畜物語</h1>
            <p className="kairo-sub">
              カイロソフト風の一日管理シミュ。エンディングは暗号っぽいリンクで
              X シェアでき、結果ページと個別カードが表示されます。
            </p>
          </div>
          <ul className="kairo-help">
            <li>昼: 行動力の限りコマンドを連打</li>
            <li>「ねる」で日付進行＆回復</li>
            <li>エンディング後に /Game/… で結果シェア</li>
          </ul>
          <button
            type="button"
            className="kairo-btn kairo-btn-main"
            onClick={() => {
              setPhase("pick");
              void recordMuseumEvent("interaction");
            }}
          >
            はじめる
          </button>
        </div>
      )}

      {phase === "pick" && (
        <div className="kairo-panel">
          <h2 className="kairo-h2">案件をえらぶ</h2>
          <div className="kairo-list">
            {PROJECTS.map((p) => (
              <button key={p.id} type="button" className="kairo-card" onClick={() => start(p)}>
                <span className="kairo-card-name">{p.name}</span>
                <span className="kairo-card-meta">
                  {p.days}日 · 目標{p.goal} · 予算感{p.pay}
                </span>
                <span className="kairo-card-flavor">{p.flavor}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "play" && project && (
        <div className="kairo-play">
          <div className="kairo-top">
            <span>{project.name}</span>
            <span className="tabular">
              {day}日目/{project.days}日
            </span>
            <span className="tabular">¥{money}</span>
          </div>

          <div className="kairo-stage">
            <div className={`kairo-chara face-${f.key}`}>
              <div className="kairo-pixel-head" />
              <div className="kairo-pixel-body" />
              <p className="kairo-face-label">{f.label}</p>
            </div>
            <div className="kairo-bubble">
              <p className="kairo-morning">{morning}</p>
              {toast && <p className="kairo-toast">{toast}</p>}
              {flash && <p className="kairo-flash">▶ {flash}</p>}
            </div>
          </div>

          <div className="kairo-stats">
            <Meter label="体力" value={stats.body} hot={stats.body < 30} />
            <Meter label="精神" value={stats.mind} hot={stats.mind < 30} />
            <Meter label="ストレス" value={stats.stress} hot={stats.stress > 70} invert />
            <Meter label="技術" value={stats.tech} />
            <Meter label="信用" value={stats.trust} />
            <Meter label="進捗" value={stats.progress} />
            <Meter label="負債" value={stats.debt} hot={stats.debt > 60} invert />
            <Meter label="Java信仰" value={stats.mono} hot={stats.mono > 75} invert />
            <Meter label="学び" value={stats.learn} />
          </div>

          <div className="kairo-ap">
            行動力{" "}
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < stats.ap ? "on" : ""} />
            ))}
            <span className="kairo-threat">脅威 {threat}%</span>
          </div>

          {(["仕事", "育成", "処理", "休息"] as const).map((cat) => (
            <div key={cat} className="kairo-cmd-block">
              <p className="kairo-cat">{cat}</p>
              <div className="kairo-cmds">
                {byCat[cat].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="kairo-cmd"
                    disabled={a.id !== "sleep" && stats.ap < a.ap}
                    onClick={() => act(a)}
                  >
                    <span className="kairo-cmd-ap">{a.ap ? `AP${a.ap}` : "日付+"}</span>
                    <span className="kairo-cmd-name">{a.name}</span>
                    <span className="kairo-cmd-desc">{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="kairo-log">
            {log.slice(0, 6).map((l, i) => (
              <p key={`${i}-${l.slice(0, 10)}`}>{l}</p>
            ))}
          </div>

          <button type="button" className="kairo-btn kairo-btn-ghost" onClick={reset}>
            タイトルへ
          </button>
        </div>
      )}

      {phase === "end" && ending && (
        <div className="space-y-4">
          <GameResultView
            result={ending.shared}
            code={ending.code}
            embedded
            onReplay={reset}
          />
          <div className="kairo-panel">
            <p className="kairo-cat">日誌（抜粋）</p>
            <div className="kairo-log">
              {log.slice(0, 10).map((l, i) => (
                <p key={`e${i}`}>{l}</p>
              ))}
            </div>
            <button type="button" className="kairo-btn kairo-btn-main" onClick={() => setPhase("pick")}>
              別の案件
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Meter({
  label,
  value,
  hot,
  invert,
}: {
  label: string;
  value: number;
  hot?: boolean;
  invert?: boolean;
}) {
  return (
    <div className={`kairo-meter ${hot ? "hot" : ""}`}>
      <div className="kairo-meter-lab">
        <span>{label}</span>
        <span className="tabular">{value}</span>
      </div>
      <div className="kairo-meter-track">
        <div
          className={`kairo-meter-fill ${invert ? "inv" : ""}`}
          style={{ width: `${clamp(value)}%` }}
        />
      </div>
    </div>
  );
}

const kairoCss = `
.kairo {
  --k-bg: #1a1520;
  --k-panel: #2a2233;
  --k-panel2: #352b40;
  --k-line: #5c4d6a;
  --k-text: #f3eef7;
  --k-muted: #b5a8c0;
  --k-accent: #e8a54b;
  --k-good: #7bc47f;
  --k-bad: #e85d4c;
  --k-chip: #4a3a58;
  font-family: "Segoe UI", "Hiragino Sans", "Noto Sans JP", system-ui, sans-serif;
  color: var(--k-text);
  image-rendering: pixelated;
}
.kairo-panel, .kairo-play {
  background: var(--k-panel);
  border: 3px solid var(--k-line);
  border-radius: 4px;
  box-shadow: 4px 4px 0 #0d0a12;
  padding: 14px;
}
.kairo-title h1, .kairo-end h2, .kairo-h2 {
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0.25rem 0;
  font-size: 1.35rem;
}
.kairo-tag {
  font-size: 10px;
  letter-spacing: 0.18em;
  color: var(--k-accent);
  margin: 0;
}
.kairo-sub, .kairo-help {
  color: var(--k-muted);
  font-size: 0.85rem;
  line-height: 1.55;
}
.kairo-help { padding-left: 1.1rem; margin: 1rem 0; }
.kairo-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  border: 3px solid var(--k-line);
  background: var(--k-chip);
  color: var(--k-text);
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 2px;
  box-shadow: 2px 2px 0 #0d0a12;
  cursor: pointer;
}
.kairo-btn:active { transform: translate(1px,1px); box-shadow: 1px 1px 0 #0d0a12; }
.kairo-btn-main {
  background: var(--k-accent);
  color: #1a1208;
  border-color: #a67a30;
  width: 100%;
  margin-top: 0.5rem;
}
.kairo-btn-ghost {
  width: 100%;
  margin-top: 8px;
  background: transparent;
  color: var(--k-muted);
}
.kairo-list { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
.kairo-card {
  text-align: left;
  background: var(--k-panel2);
  border: 3px solid var(--k-line);
  padding: 12px;
  border-radius: 2px;
  color: var(--k-text);
  cursor: pointer;
}
.kairo-card:hover { border-color: var(--k-accent); }
.kairo-card-name { display: block; font-weight: 800; }
.kairo-card-meta { display: block; font-size: 11px; color: var(--k-accent); margin-top: 4px; }
.kairo-card-flavor { display: block; font-size: 12px; color: var(--k-muted); margin-top: 4px; }
.kairo-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  background: #120e18;
  border: 3px solid var(--k-line);
  padding: 8px 10px;
  margin-bottom: 10px;
}
.kairo-stage {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 10px;
  margin-bottom: 10px;
}
.kairo-chara {
  background: var(--k-panel2);
  border: 3px solid var(--k-line);
  padding: 8px;
  text-align: center;
  min-height: 110px;
}
.kairo-pixel-head {
  width: 36px; height: 36px; margin: 0 auto;
  background: #e8d5b5;
  border: 3px solid #2a2030;
  box-shadow: inset -3px -3px 0 #c4a882;
}
.kairo-pixel-body {
  width: 44px; height: 40px; margin: 4px auto 0;
  background: #3d5a80;
  border: 3px solid #2a2030;
  box-shadow: inset -3px -3px 0 #2c4060;
}
.face-crush .kairo-pixel-head { background: #c97b7b; }
.face-tired .kairo-pixel-body { background: #5a5a6a; }
.face-panic .kairo-pixel-head { background: #e8c07a; }
.face-hope .kairo-pixel-head { background: #d4e8b5; }
.face-ship .kairo-pixel-body { background: #4a7c59; }
.kairo-face-label { font-size: 10px; margin: 6px 0 0; color: var(--k-muted); font-weight: 700; }
.kairo-bubble {
  background: #120e18;
  border: 3px solid var(--k-line);
  padding: 10px;
  font-size: 12px;
  min-height: 110px;
}
.kairo-morning { margin: 0; color: var(--k-text); font-weight: 600; }
.kairo-toast { margin: 8px 0 0; color: var(--k-accent); font-weight: 800; }
.kairo-flash { margin: 6px 0 0; color: var(--k-good); font-weight: 800; animation: kpop 0.35s ease; }
@keyframes kpop { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.kairo-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 10px;
  margin-bottom: 8px;
}
.kairo-meter-lab {
  display: flex; justify-content: space-between;
  font-size: 10px; font-weight: 700; color: var(--k-muted);
}
.kairo-meter.hot .kairo-meter-lab { color: var(--k-bad); }
.kairo-meter-track {
  height: 8px; background: #120e18; border: 2px solid var(--k-line); margin-top: 2px;
}
.kairo-meter-fill { height: 100%; background: var(--k-good); }
.kairo-meter-fill.inv { background: var(--k-bad); }
.kairo-ap {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 800; margin: 8px 0;
  color: var(--k-muted);
}
.kairo-ap > span:not(.kairo-threat) {
  width: 12px; height: 12px; display: inline-block;
  border: 2px solid var(--k-line); background: #120e18;
}
.kairo-ap > span.on { background: var(--k-accent); }
.kairo-threat { margin-left: auto; color: var(--k-bad); }
.kairo-cat {
  font-size: 11px; font-weight: 800; color: var(--k-accent);
  margin: 10px 0 4px; letter-spacing: 0.08em;
}
.kairo-cmds {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.kairo-cmd {
  text-align: left;
  background: var(--k-panel2);
  border: 3px solid var(--k-line);
  padding: 8px;
  color: var(--k-text);
  border-radius: 2px;
  min-height: 64px;
  cursor: pointer;
}
.kairo-cmd:hover:not(:disabled) { border-color: var(--k-accent); background: #40324c; }
.kairo-cmd:disabled { opacity: 0.35; cursor: not-allowed; }
.kairo-cmd-name { display: block; font-weight: 800; font-size: 13px; }
.kairo-cmd-ap { float: right; font-size: 10px; color: var(--k-accent); font-weight: 800; }
.kairo-cmd-desc { display: block; clear: both; font-size: 10px; color: var(--k-muted); margin-top: 4px; }
.kairo-log {
  margin-top: 10px;
  background: #120e18;
  border: 3px solid var(--k-line);
  padding: 8px;
  max-height: 120px;
  overflow: auto;
  font-size: 11px;
  color: var(--k-muted);
}
.kairo-log p { margin: 0 0 4px; }
@media (max-width: 420px) {
  .kairo-stage { grid-template-columns: 1fr; }
  .kairo-cmds { grid-template-columns: 1fr; }
}
`;

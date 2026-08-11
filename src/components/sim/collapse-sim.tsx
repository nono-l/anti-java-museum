import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { recordMuseumEvent } from "@/lib/museum-stats";
import {
  encodeGameResult,
  type SharedGameResult,
} from "@/lib/game-result";
import { GameResultView } from "@/components/sim/game-result-view";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  clearSimSave,
  getSimSave,
  saveSimSave,
  type SimSavePayload,
} from "@/lib/sim-save";

/**
 * カイロソフト風: 1日の中で行動力を使い切るまでコマンド選択。
 * ねる = AP4 で意図的な休息。AP0 で翌日へ = 気絶（悪化）。
 * 1日の行動力メモリは 10。
 */

const AP_MAX = 10;
const SLEEP_AP = 4;

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

type Gamble = {
  rate: number;
  win: Partial<Stats>;
  lose: Partial<Stats>;
  winText: string;
  loseText: string;
  moneyWin?: number;
  moneyLose?: number;
};

type Action = {
  id: string;
  name: string;
  cat: "仕事" | "育成" | "処理" | "休息" | "博打";
  ap: number;
  desc: string;
  effect: Partial<Stats>;
  /** ハイリスクハイリターン（成功/失敗で分岐） */
  gamble?: Gamble;
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
    id: "allnighter",
    name: "徹夜強行",
    cat: "博打",
    ap: 3,
    desc: "成功で進捗爆上げ / 失敗で心身崩壊",
    effect: { body: -8, mind: -4 },
    gamble: {
      rate: 0.45,
      win: { progress: 22, tech: 4, stress: 8, body: -6 },
      lose: { progress: 4, stress: 18, mind: -16, body: -14, debt: 6 },
      winText: "夜明け前に動いた。進捗が跳ねた。",
      loseText: "朝までにバグが増えた。自分がバグった。",
      moneyWin: 8,
    },
  },
  {
    id: "prod_patch",
    name: "本番直パッチ",
    cat: "博打",
    ap: 2,
    desc: "炎上を止めるか、炎上を生むか",
    effect: { stress: 6, mind: -3 },
    gamble: {
      rate: 0.4,
      win: { progress: 14, trust: 12, debt: 8 },
      lose: { progress: -6, trust: -14, stress: 16, mind: -10, debt: 12 },
      winText: "奇跡のホットフィックス。クライアントが拍手。",
      loseText: "パッチが別の NPE を生んだ。電話が鳴り止まない。",
      moneyWin: 12,
      moneyLose: -5,
    },
  },
  {
    id: "big_refactor",
    name: "全捨てリファクタ",
    cat: "博打",
    ap: 4,
    desc: "負債を溶かすか、納期を溶かすか",
    effect: { body: -6, stress: 4 },
    gamble: {
      rate: 0.35,
      win: { debt: -28, tech: 8, progress: 8, learn: 4 },
      lose: { debt: 14, progress: -12, stress: 14, mind: -8, trust: -6 },
      winText: "層が薄くなった。息ができる。",
      loseText: "コンパイルが通らない世界線に落ちた。",
    },
  },
  {
    id: "secret_lang",
    name: "こっそり他言語",
    cat: "博打",
    ap: 2,
    desc: "学びを得るか、発覚して詰むか",
    effect: { mono: -2 },
    gamble: {
      rate: 0.5,
      win: { learn: 16, mono: -10, tech: 3, mind: 4 },
      lose: { trust: -12, mono: 6, stress: 12, mind: -6, learn: 4 },
      winText: "誰にもバレず、世界が少し広がった。",
      loseText: "『うちは Java だけ』の会議室に召喚された。",
    },
  },
  {
    id: "log_nuke",
    name: "ログ全消し勝負",
    cat: "博打",
    ap: 1,
    desc: "握りつぶしの極致。運が良ければ平穏",
    effect: { mind: -4 },
    gamble: {
      rate: 0.42,
      win: { stress: -18, trust: 6, progress: 4, debt: 8 },
      lose: { stress: 20, mind: -14, trust: -10, debt: 14, progress: -4 },
      winText: "ログも証拠も消えた。しばらく静かだ。",
      loseText: "監査が来た。消した痕跡が残っていた。",
    },
  },
  {
    id: "dep_bump",
    name: "依存全部上げ",
    cat: "博打",
    ap: 2,
    desc: "最新の恩恵か、地獄のコンパイルか",
    effect: { stress: 4 },
    gamble: {
      rate: 0.38,
      win: { tech: 12, progress: 10, debt: -4 },
      lose: { debt: 18, progress: -8, stress: 14, mind: -8, body: -4 },
      winText: "ビルドが通った。新しい API が輝く。",
      loseText: "javax と jakarta が同時に現れた。",
    },
  },
  {
    id: "flame_demo",
    name: "炎上デモ",
    cat: "博打",
    ap: 3,
    desc: "一発逆転プレゼン / 一発退場",
    effect: { stress: 8, body: -4 },
    gamble: {
      rate: 0.33,
      win: { trust: 18, progress: 16 },
      lose: { trust: -16, progress: -4, stress: 18, mind: -12 },
      winText: "『これで行きましょう』— 予算が動いた。",
      loseText: "画面共有のまま NPE が流れた。",
      moneyWin: 20,
      moneyLose: -8,
    },
  },
  {
    id: "sleep",
    name: "ねる",
    cat: "休息",
    ap: SLEEP_AP,
    desc: "ちゃんと寝る。日付進行＆回復",
    effect: {},
  },
  {
    id: "faint",
    name: "気絶",
    cat: "休息",
    ap: 0,
    desc: "AP0 で倒れる。翌日はAPだけ満タン（体力は回復しない）",
    effect: {},
  },
];

const MORNING: { w: number; text: string; effect: Partial<Stats> }[] = [
  { w: 3, text: "平和な朝。IDE が重い。", effect: {} },
  { w: 2, text: "本番 NPE の連絡。", effect: { stress: 8, mind: -4, trust: -3 } },
  { w: 2, text: "jakarta 混在エラー。", effect: { stress: 10, debt: 5 } },
  { w: 2, text: "『Java だけでいい』定例。", effect: { mono: 4, learn: -2 } },
  { w: 2, text: "検収を急かされた。", effect: { stress: 6, trust: 2 } },
  { w: 2, text: "CVE アラート。", effect: { stress: 5, body: -2 } },
  { w: 1, text: "Slack が真っ赤。障害チャンネルが爆速。", effect: { stress: 12, mind: -5, progress: -2 } },
  { w: 1, text: "仕様書が消えていた。誰かが『最新は私の頭』。", effect: { debt: 6, stress: 6 } },
  { w: 1, text: "先輩が『フレームワーク信仰やめろ』と囁いた。", effect: { learn: 5, mono: -3, mind: 3 } },
  { w: 1, text: "コーヒーメーカー故障。社会が終わった。", effect: { stress: 8, body: -3, mind: -2 } },
  { w: 1, text: "意外とテストが全部緑。不気味。", effect: { progress: 4, mind: 4, stress: -4 } },
  { w: 1, text: "Oracle ライセンスの話が出た。空気が重い。", effect: { stress: 7, mono: 2 } },
];

/** 行動後にランダムで刺さる日中イベント */
const MIDDAY: { w: number; text: string; effect: Partial<Stats>; money?: number }[] = [
  { w: 3, text: "特に何も起きなかった…はず。", effect: {} },
  { w: 2, text: "突然の仕様変更メール。", effect: { progress: -5, stress: 8, debt: 4 } },
  { w: 2, text: "レビューコメントが 40 件飛んできた。", effect: { stress: 7, body: -3, debt: 3 } },
  { w: 2, text: "本番でタイムアウト増加。", effect: { stress: 9, trust: -4, mind: -3 } },
  { w: 1, text: "クライアントが『素晴らしい』と一言。", effect: { trust: 8, mind: 5, stress: -4 }, money: 5 },
  { w: 1, text: "CI が落ちた。原因はフラキーテスト。", effect: { progress: -3, stress: 5 } },
  { w: 1, text: "新人に『なぜ Java？』と聞かれて黙った。", effect: { mono: -2, learn: 3, mind: -2 } },
  { w: 1, text: "Log4j の話題がチームで再燃。", effect: { stress: 6, debt: 2 } },
  { w: 1, text: "気づいたら AbstractFactory が増えていた。", effect: { debt: 7, mono: 3, progress: 2 } },
  { w: 1, text: "監視が静か。今日だけは味方だ。", effect: { stress: -8, mind: 4 } },
  { w: 1, text: "会議室が取れず立ち話で決裁。カオス。", effect: { trust: 3, stress: 5, progress: 3 } },
  { w: 1, text: "依存の transitive が衝突。半日溶ける予感。", effect: { debt: 5, stress: 6, body: -2 } },
  { w: 1, text: "偶然 Stack Overflow の正解を引いた。", effect: { progress: 6, tech: 3, mind: 3 } },
  { w: 1, text: "『来週デモ』を今知った。", effect: { stress: 12, mind: -6, progress: 2 } },
  { w: 1, text: "電源が落ちた。保存してなくて泣いた。", effect: { progress: -4, mind: -8, stress: 8 } },
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
  ap: AP_MAX,
};

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function apply(s: Stats, d: Partial<Stats>): Stats {
  const n = { ...s };
  (Object.keys(d) as (keyof Stats)[]).forEach((k) => {
    const v = d[k];
    if (v == null) return;
    if (k === "ap") n.ap = clamp(s.ap + v, 0, AP_MAX);
    else n[k] = clamp(s[k] + v);
  });
  return n;
}

function pickWeighted<T extends { w: number }>(list: T[]): T {
  const total = list.reduce((a, b) => a + b.w, 0);
  let r = Math.random() * total;
  for (const item of list) {
    r -= item.w;
    if (r <= 0) return item;
  }
  return list[0]!;
}

function pickMorning() {
  return pickWeighted(MORNING);
}

function pickMidday() {
  return pickWeighted(MIDDAY);
}

function fmtDelta(d: Partial<Stats>): string {
  const labels: Record<string, string> = {
    body: "体力",
    mind: "精神",
    stress: "ストレス",
    tech: "技術",
    trust: "信用",
    mono: "信仰",
    learn: "学び",
    progress: "進捗",
    debt: "負債",
    ap: "AP",
  };
  return (Object.keys(d) as (keyof Stats)[])
    .filter((k) => d[k] != null && d[k] !== 0 && k !== "ap")
    .map((k) => {
      const v = d[k] as number;
      return `${labels[k] ?? k}${v > 0 ? "+" : ""}${v}`;
    })
    .join(" ");
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
  const { user, isPending } = useCurrentUserState();
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
  const [cloudStatus, setCloudStatus] = useState<
    "idle" | "loading" | "saved" | "saving" | "error" | "guest"
  >("idle");
  const [cloudHint, setCloudHint] = useState("");
  const hydratedRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(false);

  function buildPayload(): SimSavePayload {
    return {
      v: 1,
      phase,
      projectId: project?.id ?? null,
      stats: { ...stats },
      day,
      money,
      log: log.slice(0, 24),
      morning,
      toast,
      ending: ending
        ? {
            rank: ending.rank,
            title: ending.title,
            body: ending.body,
            scores: ending.scores,
            shared: ending.shared,
            code: ending.code,
          }
        : null,
      updatedAt: new Date().toISOString(),
    };
  }

  function applyPayload(payload: SimSavePayload, source: "cloud" | "local") {
    skipNextSave.current = true;
    const p = payload.projectId
      ? PROJECTS.find((x) => x.id === payload.projectId) ?? null
      : null;
    setProject(p);
    setStats({ ...START, ...payload.stats, ap: Math.min(AP_MAX, Math.max(0, payload.stats.ap)) });
    setDay(payload.day);
    setMoney(payload.money);
    setLog(payload.log);
    setMorning(payload.morning);
    setToast(payload.toast || (source === "cloud" ? "クラウドから復元" : "端末から復元"));
    if (payload.ending && payload.phase === "end") {
      setEnding({
        rank: payload.ending.rank,
        title: payload.ending.title,
        body: payload.ending.body,
        scores: payload.ending.scores,
        shared: payload.ending.shared as SharedGameResult,
        code: payload.ending.code,
      });
    } else {
      setEnding(null);
    }
    // 案件なしの play は title へ
    if (payload.phase === "play" && !p) {
      setPhase("pick");
    } else {
      setPhase(payload.phase);
    }
    setCloudHint(
      source === "cloud"
        ? `ID連携セーブを復元（${new Date(payload.updatedAt).toLocaleString("ja-JP")}）`
        : "この端末の一時セーブを復元",
    );
  }

  // 初回: ログイン済みなら DB、なければ localStorage
  useEffect(() => {
    if (isPending || hydratedRef.current) return;
    hydratedRef.current = true;

    let cancelled = false;
    (async () => {
      if (!user) {
        setCloudStatus("guest");
        try {
          const raw = localStorage.getItem("jaba-sim-save-v1");
          if (raw) {
            const parsed = JSON.parse(raw) as SimSavePayload;
            if (parsed?.v === 1 && (parsed.phase === "play" || parsed.phase === "end")) {
              applyPayload(parsed, "local");
            }
          }
        } catch {
          /* ignore */
        }
        return;
      }

      setCloudStatus("loading");
      try {
        const rec = await getSimSave();
        if (cancelled) return;
        if (rec?.payload && (rec.payload.phase === "play" || rec.payload.phase === "end" || rec.payload.phase === "pick")) {
          applyPayload(rec.payload, "cloud");
          setCloudStatus("saved");
        } else {
          // クラウド空 → 端末にあればアップロード候補として読む
          try {
            const raw = localStorage.getItem("jaba-sim-save-v1");
            if (raw) {
              const parsed = JSON.parse(raw) as SimSavePayload;
              if (parsed?.v === 1 && (parsed.phase === "play" || parsed.phase === "end")) {
                applyPayload(parsed, "local");
                setCloudHint("端末セーブを表示中。操作するとクラウドへ同期します");
              }
            }
          } catch {
            /* ignore */
          }
          setCloudStatus("saved");
          setCloudHint((h) => h || "クラウドセーブ枠を確保済み（進行が自動保存されます）");
        }
      } catch {
        if (!cancelled) {
          setCloudStatus("error");
          setCloudHint("クラウド読込に失敗。端末セーブのみ有効");
          try {
            const raw = localStorage.getItem("jaba-sim-save-v1");
            if (raw) {
              const parsed = JSON.parse(raw) as SimSavePayload;
              if (parsed?.v === 1) applyPayload(parsed, "local");
            }
          } catch {
            /* ignore */
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount / user resolve once
  }, [user, isPending]);

  // オートセーブ（操作のたび debounce）
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    // title のみは保存しない（新規待ち）
    if (phase === "title") return;

    const payload = buildPayload();
    try {
      localStorage.setItem("jaba-sim-save-v1", JSON.stringify(payload));
    } catch {
      /* ignore */
    }

    if (!user) {
      setCloudStatus("guest");
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setCloudStatus("saving");
      void saveSimSave({ data: { payload } })
        .then(() => {
          setCloudStatus("saved");
          setCloudHint(`クラウド同期 ${new Date().toLocaleTimeString("ja-JP")}`);
        })
        .catch(() => {
          setCloudStatus("error");
          setCloudHint("クラウド保存に失敗（端末には残っています）");
        });
    }, 650);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, project, stats, day, money, log, morning, ending, user]);

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
      if (stats.ap < SLEEP_AP) {
        setToast(`寝るには行動力 ${SLEEP_AP} が必要！`);
        return;
      }
      advanceDay("sleep");
      return;
    }
    if (a.id === "faint") {
      if (stats.ap !== 0) {
        setToast("まだ動ける。気絶は AP0 のときだけ。");
        return;
      }
      advanceDay("faint");
      return;
    }
    if (stats.ap < a.ap) {
      setToast("行動力が足りない！");
      return;
    }

    let next = apply(stats, { ...a.effect, ap: -a.ap });
    let toastMsg = `${a.name} を実行！`;
    let logLine = `${day}日 ${a.name}: ${a.desc}`;
    let nextMoney = money;

    // ハイリスクコマンド: 成功/失敗ロール
    if (a.gamble) {
      const ok = Math.random() < a.gamble.rate;
      const branch = ok ? a.gamble.win : a.gamble.lose;
      next = apply(next, branch);
      const delta = fmtDelta(branch);
      toastMsg = ok
        ? `成功！ ${a.gamble.winText}`
        : `失敗… ${a.gamble.loseText}`;
      logLine = `${day}日 【博打】${a.name} → ${ok ? "成功" : "失敗"} ${delta ? `(${delta})` : ""} — ${ok ? a.gamble.winText : a.gamble.loseText}`;
      const mDelta = ok ? (a.gamble.moneyWin ?? 0) : (a.gamble.moneyLose ?? 0);
      if (mDelta) nextMoney = Math.max(0, nextMoney + mDelta);
    } else {
      if (next.body < 30) next = apply(next, { mind: -3, stress: 3 });
      if (next.debt > 70 && (a.id === "impl" || a.id === "demo")) {
        next = apply(next, { progress: -2 });
      }
      const gain =
        a.id === "demo" || a.id === "impl" ? 3 + Math.floor(next.progress / 25) : 0;
      if (gain) nextMoney = nextMoney + gain;
    }

    // 日中ランダムイベント（高めの頻度）
    const eventChance = a.gamble ? 0.55 : 0.42;
    if (Math.random() < eventChance) {
      const ev = pickMidday();
      if (Object.keys(ev.effect).length > 0 || (ev.money && ev.money !== 0)) {
        next = apply(next, ev.effect);
        if (ev.money) nextMoney = Math.max(0, nextMoney + ev.money);
        const ed = fmtDelta(ev.effect);
        logLine += ` / 事件: ${ev.text}${ed ? ` (${ed})` : ""}`;
        toastMsg += ` ／ ${ev.text}`;
      } else if (Math.random() < 0.35) {
        // 平和イベントもたまにログ
        logLine += ` / ${ev.text}`;
      }
    }

    if (nextMoney !== money) setMoney(nextMoney);

    setStats(next);
    setFlash(a.gamble ? `博打:${a.name}` : a.name);
    if (next.ap === 0) {
      toastMsg += " AP0 — 気絶して翌日へ、か。";
    }
    setToast(toastMsg);
    pushLog(logLine);
    void recordMuseumEvent(a.gamble ? "interaction" : "joy");

    const end = endingOf(next, project, day, nextMoney);
    if (end) {
      setEnding(end);
      setPhase("end");
      void recordMuseumEvent("share");
    }
    window.setTimeout(() => setFlash(null), 500);
  }

  function advanceDay(mode: "sleep" | "faint") {
    if (!project) return;
    const nextDay = day + 1;

    let s =
      mode === "sleep"
        ? apply(stats, {
            ap: -SLEEP_AP,
            body: 18,
            mind: 10,
            stress: -14,
          })
        : apply(stats, {
            body: -6,
            stress: 18,
            mind: -14,
          });

    s = { ...s, ap: AP_MAX };

    const m = pickMorning();
    s = apply(s, m.effect);
    let morningText = m.text;
    // 朝にもう一件刺さることがある
    if (Math.random() < 0.4) {
      const extra = pickMidday();
      if (Object.keys(extra.effect).length > 0) {
        s = apply(s, extra.effect);
        morningText = `${m.text} ＋ ${extra.text}`;
      }
    }
    if (s.debt > 55) s = apply(s, { progress: -1, stress: 2 });
    if (mode === "faint") {
      s = apply(s, { stress: 4, mind: -3 });
    }

    setStats(s);
    setDay(nextDay);
    setMorning(morningText);
    if (mode === "sleep") {
      pushLog(`${nextDay}日目 — ちゃんと寝た。朝: ${m.text}`);
      setToast(`${nextDay}日目 はじまり！（回復）`);
      setFlash("ねる");
    } else {
      pushLog(
        `${nextDay}日目 — 気絶して翌朝。行動力だけ満タン。体力は削れ、精神↓・ストレス↑。朝: ${m.text}`,
      );
      setToast(`${nextDay}日目…気絶明け。キツい。`);
      setFlash("気絶");
    }
    void recordMuseumEvent("interaction");

    const end = endingOf(s, project, nextDay, money);
    if (end) {
      setEnding(end);
      setPhase("end");
    }
    window.setTimeout(() => setFlash(null), 500);
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
    setCloudHint("");
    try {
      localStorage.removeItem("jaba-sim-save-v1");
    } catch {
      /* ignore */
    }
    if (user) {
      void clearSimSave()
        .then(() => {
          setCloudStatus("saved");
          setCloudHint("クラウドセーブを削除しました");
        })
        .catch(() => {
          setCloudStatus("error");
        });
    }
  }

  function isDisabled(a: Action): boolean {
    if (a.id === "sleep") return stats.ap < SLEEP_AP;
    if (a.id === "faint") return stats.ap !== 0;
    return stats.ap < a.ap;
  }

  function apLabel(a: Action): string {
    if (a.id === "sleep") return `AP${SLEEP_AP}`;
    if (a.id === "faint") return "AP0限定";
    return a.ap ? `AP${a.ap}` : "—";
  }

  const byCat = {
    仕事: ACTIONS.filter((a) => a.cat === "仕事"),
    博打: ACTIONS.filter((a) => a.cat === "博打"),
    育成: ACTIONS.filter((a) => a.cat === "育成"),
    処理: ACTIONS.filter((a) => a.cat === "処理"),
    休息: ACTIONS.filter((a) => a.cat === "休息"),
  };

  return (
    <div className="kairo mx-auto max-w-lg">
      <style>{kairoCss}</style>

      <div className="kairo-cloud" role="status">
        {isPending ? (
          <span>セーブ枠を確認中…</span>
        ) : user ? (
          <span>
            ID連携中（{user.displayName || user.primaryEmail || "来館者"}）
            {" · "}
            {cloudStatus === "saving"
              ? "保存中…"
              : cloudStatus === "loading"
                ? "読込中…"
                : cloudStatus === "error"
                  ? "同期エラー"
                  : "クラウド自動保存 ON"}
          </span>
        ) : (
          <span>
            ゲストプレイ中（端末のみ） ·{" "}
            <Link to="/login" search={{ redirect: "/sim" }} className="kairo-cloud-link">
              ログインして引き継ぎ
            </Link>
          </span>
        )}
        {cloudHint ? <span className="kairo-cloud-hint">{cloudHint}</span> : null}
      </div>

      {phase === "title" && (
        <div className="kairo-panel">
          <div className="kairo-title">
            <p className="kairo-tag">KAIRO-LIKE SIM</p>
            <h1>ジャバだけ社畜物語</h1>
            <p className="kairo-sub">
              カイロソフト風の一日管理シミュ。1日の行動力は {AP_MAX}。
              ちゃんと寝るには行動力がいる。使い切って倒れるのは気絶——
              翌日は行動力だけ戻り、体力も心も削れる。
            </p>
          </div>
          <ul className="kairo-help">
            <li>
              昼: 行動力 <strong>{AP_MAX}</strong> のメモリを使い切るまで行動
            </li>
            <li>
              <strong>ねる = AP{SLEEP_AP}</strong>（意図的休息・回復）
            </li>
            <li>
              <strong>AP0 で翌日 = 気絶</strong>（APだけ回復・体力↓・ストレス↑・精神↓）
            </li>
            <li>
              <strong>博打コマンド</strong>は成功率つき。一発逆転も一発退場も
            </li>
            <li>行動後・朝にランダム事件がよく刺さる</li>
            <li>
              <strong>ログイン</strong>すると進行が DB に自動保存され、端末をまたいで再開できる
            </li>
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
              {stats.ap === 0 && (
                <p className="kairo-toast" style={{ marginTop: 8 }}>
                  AP が尽きた。気絶して翌日へ進むしかない。
                </p>
              )}
              {stats.ap > 0 && stats.ap < SLEEP_AP && (
                <p className="kairo-toast" style={{ marginTop: 8, color: "var(--k-muted)" }}>
                  ねるには AP{SLEEP_AP} 必要。残りを使うか、使い切って気絶。
                </p>
              )}
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
            <span className="kairo-ap-lab">
              行動力 {stats.ap}/{AP_MAX}
            </span>
            {Array.from({ length: AP_MAX }).map((_, i) => (
              <span
                key={i}
                className={i < stats.ap ? "kairo-ap-pip on" : "kairo-ap-pip"}
                aria-hidden
              />
            ))}
            <span className="kairo-threat">脅威 {threat}%</span>
          </div>

          {(["仕事", "博打", "育成", "処理", "休息"] as const).map((cat) => (
            <div key={cat} className="kairo-cmd-block">
              <p className={`kairo-cat${cat === "博打" ? " kairo-cat-risk" : ""}`}>
                {cat === "博打" ? "博打（ハイリスク）" : cat}
              </p>
              <div className="kairo-cmds">
                {byCat[cat].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`kairo-cmd${a.id === "faint" ? " kairo-cmd-faint" : ""}${a.id === "sleep" ? " kairo-cmd-sleep" : ""}${a.gamble ? " kairo-cmd-risk" : ""}`}
                    disabled={isDisabled(a)}
                    onClick={() => act(a)}
                  >
                    <span className="kairo-cmd-ap">
                      {apLabel(a)}
                      {a.gamble ? ` · ${Math.round(a.gamble.rate * 100)}%` : ""}
                    </span>
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
.kairo-cloud {
  font-size: 11px;
  font-weight: 700;
  color: var(--k-muted);
  background: #120e18;
  border: 2px solid var(--k-line);
  padding: 8px 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.kairo-cloud-link {
  color: var(--k-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.kairo-cloud-hint {
  color: var(--k-accent);
  font-weight: 600;
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
.kairo-help strong { color: var(--k-text); }
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
  display: flex; align-items: center; flex-wrap: wrap; gap: 3px;
  font-size: 11px; font-weight: 800; margin: 8px 0;
  color: var(--k-muted);
}
.kairo-ap-lab { margin-right: 4px; white-space: nowrap; }
.kairo-ap-pip {
  width: 12px;
  height: 12px;
  display: inline-block;
  flex: 0 0 auto;
  border: 2px solid var(--k-line);
  background: #120e18;
  box-sizing: border-box;
}
.kairo-ap-pip.on {
  background: var(--k-accent);
  border-color: #c48930;
  box-shadow: 0 0 0 1px #e8a54b55;
}
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
.kairo-cmd-sleep:not(:disabled) { border-color: #5a8a6a; }
.kairo-cmd-faint:not(:disabled) { border-color: var(--k-bad); background: #3a1a22; }
.kairo-cmd-risk:not(:disabled) {
  border-color: #c45c2a;
  background: linear-gradient(135deg, #3a2218 0%, #352b40 60%);
}
.kairo-cmd-risk .kairo-cmd-ap { color: #f0a060; }
.kairo-cat-risk { color: #f0a060 !important; }
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

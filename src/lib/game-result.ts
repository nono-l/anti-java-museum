/** エンディング結果のシェア用コーデック（暗号っぽいURL用） */

export type SharedGameResult = {
  v: 1;
  rank: string;
  title: string;
  body: string;
  project: string;
  day: number;
  money: number;
  /** 完成度・楽しさ・創意・単一武器 */
  scores: [number, number, number, number];
  mind: number;
  stBody: number;
  mono: number;
  learn: number;
  debt: number;
  progress: number;
};

const SCORE_LABELS = ["完成度", "楽しさ", "創意", "単一武器"] as const;

function scramble(s: string): string {
  const a = s.split("");
  for (let i = 0; i < a.length; i++) {
    const j = (i * 7 + 3) % a.length;
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a.join("");
}

function unscramble(s: string): string {
  const a = s.split("");
  for (let i = a.length - 1; i >= 0; i--) {
    const j = (i * 7 + 3) % a.length;
    const t = a[i]!;
    a[i] = a[j]!;
    a[j] = t;
  }
  return a.join("");
}

function toBase64Url(bytes: string): string {
  if (typeof btoa === "function") {
    return btoa(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }
  return Buffer.from(bytes, "binary").toString("base64url");
}

function fromBase64Url(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  if (typeof atob === "function") {
    return atob(b64);
  }
  return Buffer.from(b64, "base64").toString("binary");
}

function utf8ToBinary(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return bin;
}

function binaryToUtf8(bin: string): string {
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function checksum(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return alphabet[h % alphabet.length]!;
}

export function encodeGameResult(result: SharedGameResult): string {
  const compact = {
    v: 1 as const,
    r: result.rank,
    t: result.title,
    b: result.body.slice(0, 120),
    p: result.project,
    d: result.day,
    m: result.money,
    s: result.scores,
    i: [result.mind, result.stBody, result.mono, result.learn, result.debt, result.progress],
  };
  const raw = utf8ToBinary(JSON.stringify(compact));
  const b64 = toBase64Url(raw);
  const scrambled = scramble(b64);
  return `${scrambled}${checksum(scrambled)}`;
}

export function decodeGameResult(code: string): SharedGameResult | null {
  try {
    if (!code || code.length < 8) return null;
    const body = code.slice(0, -1);
    const cs = code.slice(-1);
    if (checksum(body) !== cs) return null;
    const b64 = unscramble(body);
    const json = binaryToUtf8(fromBase64Url(b64));
    const c = JSON.parse(json) as {
      v: number;
      r: string;
      t: string;
      b: string;
      p: string;
      d: number;
      m: number;
      s: number[];
      i: number[];
    };
    if (c.v !== 1 || !c.r || !c.t || !Array.isArray(c.s) || !Array.isArray(c.i)) return null;
    const scores = c.s.map((n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0))));
    while (scores.length < 4) scores.push(0);
    const i = c.i.map((n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0))));
    while (i.length < 6) i.push(0);
    return {
      v: 1,
      rank: String(c.r).slice(0, 2),
      title: String(c.t).slice(0, 40),
      body: String(c.b).slice(0, 160),
      project: String(c.p).slice(0, 40),
      day: Math.max(1, Math.min(99, Number(c.d) || 1)),
      money: Math.max(0, Math.min(9999, Number(c.m) || 0)),
      scores: [scores[0]!, scores[1]!, scores[2]!, scores[3]!],
      mind: i[0]!,
      stBody: i[1]!,
      mono: i[2]!,
      learn: i[3]!,
      debt: i[4]!,
      progress: i[5]!,
    };
  } catch {
    return null;
  }
}

export function resultScoreRows(result: SharedGameResult) {
  return SCORE_LABELS.map((label, idx) => ({
    label,
    value: result.scores[idx] ?? 0,
  }));
}

export function getGameSharePath(code: string): string {
  return `/Game/${code}/`;
}

export function getGameShareAbsoluteUrl(code: string): string {
  const path = getGameSharePath(code);
  if (typeof window !== "undefined") {
    const host = import.meta.env.VITE_PUBLIC_HOSTNAME as string | undefined;
    if (host) return `https://${host}${path}`;
    return `${window.location.origin}${path}`;
  }
  const host = process.env.VITE_PUBLIC_HOSTNAME || process.env.VERCEL_URL;
  if (host) {
    const h = host.startsWith("http") ? host : `https://${host}`;
    return `${h.replace(/\/$/, "")}${path}`;
  }
  return path;
}

export function getGameXIntent(result: SharedGameResult, code: string): string {
  const url = getGameShareAbsoluteUrl(code);
  const text = [
    "ジャバだけ社畜物語",
    `RANK ${result.rank}「${result.title}」`,
    `${result.project} / ${result.day}日目`,
    `完成度${result.scores[0]} 楽しさ${result.scores[1]} 創意${result.scores[2]}`,
    "#Java宇宙敵博物館",
  ].join("\n");
  const params = new URLSearchParams();
  params.set("text", text);
  params.set("url", url);
  return `https://x.com/intent/tweet?${params.toString()}`;
}

export function ogTitleFor(result: SharedGameResult): string {
  return `RANK ${result.rank} ${result.title} — ジャバだけ社畜物語`;
}

export function ogDescriptionFor(result: SharedGameResult): string {
  return `${result.project}・${result.day}日目 / 完成度${result.scores[0]} 楽しさ${result.scores[1]} 創意${result.scores[2]} / 精神${result.mind} 単一武器${result.mono} — Java宇宙敵博物館`;
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

export function buildOgSvg(result: SharedGameResult): string {
  const rank = escXml(result.rank);
  const title = escXml(result.title);
  const project = escXml(result.project);
  const q = result.scores[0];
  const fun = result.scores[1];
  const cre = result.scores[2];
  const mono = result.scores[3];
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">',
    "<defs>",
    '<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">',
    '<stop offset="0%" stop-color="#1a1520"/>',
    '<stop offset="100%" stop-color="#2a2233"/>',
    "</linearGradient>",
    "</defs>",
    '<rect width="1200" height="630" fill="url(#bg)"/>',
    '<rect x="40" y="40" width="1120" height="550" fill="none" stroke="#5c4d6a" stroke-width="6"/>',
    '<text x="80" y="120" fill="#e8a54b" font-family="system-ui,sans-serif" font-size="28" font-weight="700" letter-spacing="4">JABA DAKESHACHIKU MONOGATARI</text>',
    `<text x="80" y="230" fill="#e8a54b" font-family="system-ui,sans-serif" font-size="120" font-weight="900">RANK ${rank}</text>`,
    `<text x="80" y="320" fill="#f3eef7" font-family="system-ui,sans-serif" font-size="48" font-weight="800">${title}</text>`,
    `<text x="80" y="390" fill="#b5a8c0" font-family="system-ui,sans-serif" font-size="28">${project}  /  Day ${result.day}</text>`,
    `<text x="80" y="470" fill="#f3eef7" font-family="system-ui,sans-serif" font-size="26">完成度 ${q}   楽しさ ${fun}   創意 ${cre}   単一武器 ${mono}</text>`,
    '<text x="80" y="540" fill="#6b6878" font-family="system-ui,sans-serif" font-size="22">Java 宇宙敵博物館</text>',
    "</svg>",
  ];
  return lines.join("");
}

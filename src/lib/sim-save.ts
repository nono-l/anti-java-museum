import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import type { SharedGameResult } from "@/lib/game-result";

/** Serializable snapshot of ジャバだけ社畜物語 progress. */
export type SimSavePayload = {
  v: 1;
  phase: "title" | "pick" | "play" | "end";
  projectId: string | null;
  stats: {
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
  day: number;
  money: number;
  log: string[];
  morning: string;
  toast: string;
  ending: {
    rank: string;
    title: string;
    body: string;
    scores: { label: string; value: number }[];
    shared: SharedGameResult;
    code: string;
  } | null;
  updatedAt: string;
};

function isStats(x: unknown): x is SimSavePayload["stats"] {
  if (!x || typeof x !== "object") return false;
  const s = x as Record<string, unknown>;
  const keys = [
    "body",
    "mind",
    "stress",
    "tech",
    "trust",
    "mono",
    "learn",
    "progress",
    "debt",
    "ap",
  ] as const;
  return keys.every((k) => typeof s[k] === "number");
}


function normalizeEnding(raw: unknown): SimSavePayload["ending"] {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  if (typeof e.rank !== "string" || typeof e.title !== "string") return null;
  if (typeof e.body !== "string" || typeof e.code !== "string") return null;
  if (!Array.isArray(e.scores)) return null;
  const shared = e.shared as SharedGameResult | undefined;
  if (!shared || shared.v !== 1 || typeof shared.rank !== "string") return null;
  return {
    rank: e.rank.slice(0, 4),
    title: e.title.slice(0, 40),
    body: e.body.slice(0, 200),
    scores: e.scores
      .filter((s): s is { label: string; value: number } =>
        !!s && typeof s === "object" && typeof (s as { label?: unknown }).label === "string" && typeof (s as { value?: unknown }).value === "number",
      )
      .slice(0, 8),
    shared,
    code: e.code.slice(0, 512),
  };
}

export function normalizeSimPayload(raw: unknown): SimSavePayload | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;
  if (p.v !== 1) return null;
  if (
    p.phase !== "title" &&
    p.phase !== "pick" &&
    p.phase !== "play" &&
    p.phase !== "end"
  ) {
    return null;
  }
  if (!isStats(p.stats)) return null;
  if (typeof p.day !== "number" || typeof p.money !== "number") return null;
  if (!Array.isArray(p.log)) return null;
  return {
    v: 1,
    phase: p.phase,
    projectId: typeof p.projectId === "string" ? p.projectId : null,
    stats: p.stats,
    day: Math.max(1, Math.min(99, Math.round(p.day))),
    money: Math.max(0, Math.min(99999, Math.round(p.money))),
    log: p.log.filter((x): x is string => typeof x === "string").slice(0, 24),
    morning: typeof p.morning === "string" ? p.morning.slice(0, 200) : "",
    toast: typeof p.toast === "string" ? p.toast.slice(0, 200) : "",
    ending: normalizeEnding(p.ending),
    updatedAt:
      typeof p.updatedAt === "string" ? p.updatedAt : new Date().toISOString(),
  };
}

export type SimSaveRecord = {
  payload: SimSavePayload;
  updatedAt: string;
};

/** Load current user's sim progress. null if none. */
export const getSimSave = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<SimSaveRecord | null> => {
    const sql = await getSql();
    const rows = await sql<{ payload: unknown; updated_at: string | Date }>`
      select payload, updated_at
      from sim_saves
      where user_id = ${context.userId}
      limit 1
    `;
    const r = rows[0];
    if (!r) return null;
    let raw = r.payload;
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
        return null;
      }
    }
    const payload = normalizeSimPayload(raw);
    if (!payload) return null;
    const updatedAt =
      typeof r.updated_at === "string"
        ? r.updated_at
        : r.updated_at.toISOString();
    return { payload: { ...payload, updatedAt }, updatedAt };
  });

/** Upsert progress for the signed-in user. */
export const saveSimSave = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { payload: unknown }) => {
    const payload = normalizeSimPayload(input?.payload);
    if (!payload) throw new Error("セーブデータが不正です");
    return { payload: { ...payload, updatedAt: new Date().toISOString() } };
  })
  .handler(async ({ context, data }): Promise<SimSaveRecord> => {
    const sql = await getSql();
    const payloadJson = JSON.stringify(data.payload);
    const rows = await sql.query<{ updated_at: string | Date }>(
      `insert into sim_saves (user_id, payload, updated_at)
       values ($1, $2::jsonb, now())
       on conflict (user_id) do update
         set payload = excluded.payload,
             updated_at = now()
       returning updated_at`,
      [context.userId, payloadJson],
    );
    const updatedAt = rows[0]?.updated_at;
    const iso =
      typeof updatedAt === "string"
        ? updatedAt
        : updatedAt
          ? updatedAt.toISOString()
          : data.payload.updatedAt;
    return {
      payload: { ...data.payload, updatedAt: iso },
      updatedAt: iso,
    };
  });

/** Clear cloud save (e.g. after explicit new game). */
export const clearSimSave = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ ok: true }> => {
    const sql = await getSql();
    await sql`delete from sim_saves where user_id = ${context.userId}`;
    return { ok: true };
  });

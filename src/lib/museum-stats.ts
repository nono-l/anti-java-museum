import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";

export type MuseumStatsRow = {
  visits: number;
  interactions: number;
  indentOps: number;
  aiOps: number;
  depOps: number;
  toolOps: number;
  shareOps: number;
  joyOps: number;
  posts: number;
};

export type DisplayStats = {
  hoursLost: number;
  aiTokens: number;
  weirdDeps: number;
  sanity: number;
  raw: MuseumStatsRow;
};

export type BumpKind =
  | "visit"
  | "indent"
  | "ai"
  | "dep"
  | "tool"
  | "share"
  | "joy"
  | "post"
  | "interaction";

const EVENT = "museum-stats-updated";

export function toDisplay(r: MuseumStatsRow): DisplayStats {
  // Cosmic irreversible growth — opens and ops only push further
  const hoursLost =
    92_847_331 +
    r.visits * 29 +
    r.interactions * 5 +
    r.indentOps * 17 +
    r.joyOps * 9;
  const aiTokens =
    3_771_204_882 +
    r.visits * 680 +
    r.aiOps * 14_200 +
    r.interactions * 140 +
    r.joyOps * 320;
  const weirdDeps =
    18_447 +
    Math.floor(r.visits / 28) +
    r.depOps * 5 +
    r.toolOps * 2 +
    Math.floor(r.posts / 2);
  const sanity = Math.max(
    0,
    28.6 -
      r.visits * 0.003 -
      r.interactions * 0.005 -
      r.toolOps * 0.07 -
      r.aiOps * 0.04 -
      r.posts * 0.015,
  );
  return {
    hoursLost: Math.floor(hoursLost),
    aiTokens: Math.floor(aiTokens),
    weirdDeps: Math.floor(weirdDeps),
    sanity: Math.round(sanity * 10) / 10,
    raw: r,
  };
}

async function readRow(): Promise<MuseumStatsRow> {
  const sql = await getSql();
  const rows = await sql<{
    visits: number;
    interactions: number;
    indent_ops: number;
    ai_ops: number;
    dep_ops: number;
    tool_ops: number;
    share_ops: number;
    joy_ops: number;
    posts: number;
  }>`
    select visits, interactions, indent_ops, ai_ops, dep_ops,
           tool_ops, share_ops, joy_ops, posts
    from museum_stats
    where id = 1
  `;
  const r = rows[0];
  if (!r) {
    return {
      visits: 0,
      interactions: 0,
      indentOps: 0,
      aiOps: 0,
      depOps: 0,
      toolOps: 0,
      shareOps: 0,
      joyOps: 0,
      posts: 0,
    };
  }
  return {
    visits: Number(r.visits),
    interactions: Number(r.interactions),
    indentOps: Number(r.indent_ops),
    aiOps: Number(r.ai_ops),
    depOps: Number(r.dep_ops),
    toolOps: Number(r.tool_ops),
    shareOps: Number(r.share_ops),
    joyOps: Number(r.joy_ops),
    posts: Number(r.posts),
  };
}

export const getMuseumDisplayStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<DisplayStats> => toDisplay(await readRow()),
);

export const bumpMuseumStat = createServerFn({ method: "POST" })
  .validator((input: { kind: BumpKind }) => {
    const allowed: BumpKind[] = [
      "visit",
      "indent",
      "ai",
      "dep",
      "tool",
      "share",
      "joy",
      "post",
      "interaction",
    ];
    if (!input || !allowed.includes(input.kind)) {
      throw new Error("invalid kind");
    }
    return { kind: input.kind };
  })
  .handler(async ({ data }): Promise<DisplayStats> => {
    const sql = await getSql();
    const k = data.kind;

    if (k === "visit") {
      await sql`update museum_stats set visits = visits + 1, updated_at = now() where id = 1`;
    } else if (k === "indent") {
      await sql`update museum_stats set interactions = interactions + 1, indent_ops = indent_ops + 1, updated_at = now() where id = 1`;
    } else if (k === "ai") {
      await sql`update museum_stats set interactions = interactions + 1, ai_ops = ai_ops + 1, updated_at = now() where id = 1`;
    } else if (k === "dep") {
      await sql`update museum_stats set interactions = interactions + 1, dep_ops = dep_ops + 1, updated_at = now() where id = 1`;
    } else if (k === "tool") {
      await sql`update museum_stats set interactions = interactions + 1, tool_ops = tool_ops + 1, updated_at = now() where id = 1`;
    } else if (k === "share") {
      await sql`update museum_stats set interactions = interactions + 1, share_ops = share_ops + 1, updated_at = now() where id = 1`;
    } else if (k === "joy") {
      await sql`update museum_stats set interactions = interactions + 1, joy_ops = joy_ops + 1, updated_at = now() where id = 1`;
    } else if (k === "post") {
      await sql`update museum_stats set interactions = interactions + 1, posts = posts + 1, updated_at = now() where id = 1`;
    } else {
      await sql`update museum_stats set interactions = interactions + 1, updated_at = now() where id = 1`;
    }

    await sql`insert into museum_events (event_type) values (${k})`;
    return toDisplay(await readRow());
  });

/** Client: bump + notify CostTicker and any listeners. */
export async function recordMuseumEvent(kind: BumpKind): Promise<DisplayStats | null> {
  try {
    const stats = await bumpMuseumStat({ data: { kind } });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(EVENT, { detail: stats }));
    }
    return stats;
  } catch {
    return null;
  }
}

export function subscribeMuseumStats(
  handler: (stats: DisplayStats) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const fn = (e: Event) => {
    const detail = (e as CustomEvent<DisplayStats>).detail;
    if (detail) handler(detail);
  };
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

export { EVENT as MUSEUM_STATS_EVENT };

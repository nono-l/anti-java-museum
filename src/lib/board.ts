import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

export type BoardPost = {
  id: number;
  userId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

const MAX_BODY = 1000;
const MIN_BODY = 1;

function normalizeBody(raw: unknown): string {
  if (typeof raw !== "string") throw new Error("本文が不正です");
  const body = raw.trim().replace(/\r\n/g, "\n");
  if (body.length < MIN_BODY) throw new Error("本文を入力してください");
  if (body.length > MAX_BODY) throw new Error(`本文は${MAX_BODY}文字以内にしてください`);
  return body;
}

function normalizeName(raw: unknown, fallback: string): string {
  if (typeof raw === "string") {
    const name = raw.trim().slice(0, 40);
    if (name) return name;
  }
  return fallback.slice(0, 40) || "匿名";
}

/** Public feed — newest first. */
export const listBoardPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<BoardPost[]> => {
    const sql = await getSql();
    const rows = await sql<{
      id: number;
      user_id: string;
      author_name: string;
      body: string;
      created_at: string | Date;
    }>`
      select id, user_id, author_name, body, created_at
      from board_posts
      order by created_at desc, id desc
      limit 100
    `;
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      authorName: r.author_name,
      body: r.body,
      createdAt:
        typeof r.created_at === "string"
          ? r.created_at
          : r.created_at.toISOString(),
    }));
  },
);

/** Create a post — requires signed-in user. */
export const createBoardPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { body: string; authorName?: string }) => {
    return {
      body: normalizeBody(input?.body),
      authorName: input?.authorName,
    };
  })
  .handler(async ({ context, data }): Promise<BoardPost> => {
    const sql = await getSql();
    const authorName = normalizeName(data.authorName, "来館者");
    const rows = await sql<{
      id: number;
      user_id: string;
      author_name: string;
      body: string;
      created_at: string | Date;
    }>`
      insert into board_posts (user_id, author_name, body)
      values (${context.userId}, ${authorName}, ${data.body})
      returning id, user_id, author_name, body, created_at
    `;
    const r = rows[0];
    if (!r) throw new Error("投稿に失敗しました");
    return {
      id: r.id,
      userId: r.user_id,
      authorName: r.author_name,
      body: r.body,
      createdAt:
        typeof r.created_at === "string"
          ? r.created_at
          : r.created_at.toISOString(),
    };
  });

/** Delete own post only. */
export const deleteBoardPost = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: number }) => {
    const id = Number(input?.id);
    if (!Number.isFinite(id) || id <= 0) throw new Error("投稿IDが不正です");
    return { id };
  })
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    const rows = await sql<{ id: number }>`
      delete from board_posts
      where id = ${data.id} and user_id = ${context.userId}
      returning id
    `;
    if (!rows[0]) throw new Error("削除できないか、投稿がありません");
    return { ok: true };
  });

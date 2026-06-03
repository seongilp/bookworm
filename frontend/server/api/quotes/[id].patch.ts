import type { QuoteRow } from "~~/server/utils/serialize";

export default defineEventHandler(async (event) => {
  const db = await useDb(event);
  const id = Number(getRouterParam(event, "id"));
  const data = await validateBody(event, quoteUpdateSchema);

  const existing = await db.prepare("SELECT id FROM quote WHERE id = ?").bind(id).first();
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "문장을 찾을 수 없습니다." });
  }

  const sets: string[] = [];
  const binds: unknown[] = [];
  if (data.content !== undefined) {
    sets.push("content = ?");
    binds.push(data.content);
  }
  if (data.page !== undefined) {
    sets.push("page = ?");
    binds.push(data.page);
  }
  if (data.memo !== undefined) {
    sets.push("memo = ?");
    binds.push(data.memo);
  }
  if (data.tags !== undefined) {
    sets.push("tags = ?");
    binds.push(tagsToStr(data.tags));
  }
  if (data.is_favorite !== undefined) {
    sets.push("is_favorite = ?");
    binds.push(data.is_favorite ? 1 : 0);
  }

  if (sets.length) {
    binds.push(id);
    await db
      .prepare(`UPDATE quote SET ${sets.join(", ")} WHERE id = ?`)
      .bind(...binds)
      .run();
  }

  const row = await db
    .prepare(
      `SELECT q.*, b.title AS book_title, b.author AS book_author
       FROM quote q LEFT JOIN book b ON b.id = q.book_id WHERE q.id = ?`,
    )
    .bind(id)
    .first<QuoteRow & { book_title: string; book_author: string }>();
  return serializeQuote(row!, row!.book_title ?? "", row!.book_author ?? "");
});

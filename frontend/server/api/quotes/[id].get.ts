import type { QuoteRow } from "~~/server/utils/serialize";

export default defineEventHandler(async (event) => {
  const db = await useDb(event);
  const id = Number(getRouterParam(event, "id"));

  const row = await db
    .prepare(
      `SELECT q.*, b.title AS book_title, b.author AS book_author
       FROM quote q LEFT JOIN book b ON b.id = q.book_id WHERE q.id = ?`,
    )
    .bind(id)
    .first<QuoteRow & { book_title: string; book_author: string }>();

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: "문장을 찾을 수 없습니다." });
  }
  return serializeQuote(row, row.book_title ?? "", row.book_author ?? "");
});

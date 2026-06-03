import type { BookRow } from "~~/server/utils/serialize";

export default defineEventHandler(async (event) => {
  const db = await useDb(event);
  const id = Number(getRouterParam(event, "id"));

  const row = await db
    .prepare(
      `SELECT b.*, (SELECT COUNT(*) FROM quote q WHERE q.book_id = b.id) AS quote_count
       FROM book b WHERE b.id = ?`,
    )
    .bind(id)
    .first<BookRow & { quote_count: number }>();

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: "책을 찾을 수 없습니다." });
  }
  return serializeBook(row, row.quote_count);
});

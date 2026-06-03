import type { QuoteRow } from "~~/server/utils/serialize";

export default defineEventHandler(async (event) => {
  const db = await useDb(event);
  const data = await validateBody(event, quoteCreateSchema);

  const book = await db
    .prepare("SELECT title, author FROM book WHERE id = ?")
    .bind(data.book_id)
    .first<{ title: string; author: string }>();
  if (!book) {
    throw createError({ statusCode: 404, statusMessage: "책을 찾을 수 없습니다." });
  }

  const now = new Date().toISOString();
  const res = await db
    .prepare(
      `INSERT INTO quote (book_id, content, page, memo, tags, is_favorite, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
    )
    .bind(data.book_id, data.content, data.page, data.memo, tagsToStr(data.tags), now)
    .run();

  const row = await db
    .prepare("SELECT * FROM quote WHERE id = ?")
    .bind(res.meta.last_row_id)
    .first<QuoteRow>();

  setResponseStatus(event, 201);
  return serializeQuote(row!, book.title, book.author);
});

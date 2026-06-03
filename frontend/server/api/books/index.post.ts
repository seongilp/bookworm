import type { BookRow } from "~~/server/utils/serialize";

export default defineEventHandler(async (event) => {
  const db = await useDb(event);
  const data = await validateBody(event, bookCreateSchema);
  const now = new Date().toISOString();

  const res = await db
    .prepare(
      `INSERT INTO book (title, author, status, rating, note, total_pages, current_page, cover_url, isbn, publisher, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      data.title,
      data.author,
      data.status,
      data.rating,
      data.note,
      data.total_pages,
      data.current_page,
      data.cover_url,
      data.isbn,
      data.publisher,
      now,
    )
    .run();

  const row = await db
    .prepare("SELECT * FROM book WHERE id = ?")
    .bind(res.meta.last_row_id)
    .first<BookRow>();

  setResponseStatus(event, 201);
  return serializeBook(row!, 0);
});

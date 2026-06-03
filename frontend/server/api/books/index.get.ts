import type { BookRow } from "~~/server/utils/serialize";

export default defineEventHandler(async (event) => {
  const db = await useDb(event);
  const { status } = getQuery(event) as { status?: string };

  let sql =
    `SELECT b.*, (SELECT COUNT(*) FROM quote q WHERE q.book_id = b.id) AS quote_count
     FROM book b`;
  const binds: unknown[] = [];
  if (status) {
    sql += " WHERE b.status = ?";
    binds.push(status);
  }
  sql += " ORDER BY b.created_at DESC, b.id DESC";

  const { results } = await db
    .prepare(sql)
    .bind(...binds)
    .all<BookRow & { quote_count: number }>();

  return (results ?? []).map((row) => serializeBook(row, row.quote_count));
});

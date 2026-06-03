import type { BookRow } from "~~/server/utils/serialize";

const COLUMNS = [
  "title",
  "author",
  "status",
  "rating",
  "note",
  "total_pages",
  "current_page",
  "cover_url",
  "isbn",
  "publisher",
] as const;

export default defineEventHandler(async (event) => {
  const db = await useDb(event);
  const id = Number(getRouterParam(event, "id"));
  const data = await validateBody(event, bookUpdateSchema);

  const existing = await db.prepare("SELECT id FROM book WHERE id = ?").bind(id).first();
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "책을 찾을 수 없습니다." });
  }

  const sets: string[] = [];
  const binds: unknown[] = [];
  for (const col of COLUMNS) {
    const val = (data as Record<string, unknown>)[col];
    if (val !== undefined) {
      sets.push(`${col} = ?`);
      binds.push(val);
    }
  }

  if (sets.length) {
    binds.push(id);
    await db
      .prepare(`UPDATE book SET ${sets.join(", ")} WHERE id = ?`)
      .bind(...binds)
      .run();
  }

  const row = await db
    .prepare(
      `SELECT b.*, (SELECT COUNT(*) FROM quote q WHERE q.book_id = b.id) AS quote_count
       FROM book b WHERE b.id = ?`,
    )
    .bind(id)
    .first<BookRow & { quote_count: number }>();
  return serializeBook(row!, row!.quote_count);
});

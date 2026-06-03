import type { QuoteRow } from "~~/server/utils/serialize";

export default defineEventHandler(async (event) => {
  const db = await useDb(event);
  const query = getQuery(event) as {
    q?: string;
    book_id?: string;
    tag?: string;
    favorite?: string;
  };

  let sql =
    `SELECT q.*, b.title AS book_title, b.author AS book_author
     FROM quote q LEFT JOIN book b ON b.id = q.book_id WHERE 1=1`;
  const binds: unknown[] = [];

  if (query.book_id) {
    sql += " AND q.book_id = ?";
    binds.push(Number(query.book_id));
  }
  if (query.favorite !== undefined) {
    const fav = query.favorite === "true" || query.favorite === "1";
    sql += " AND q.is_favorite = ?";
    binds.push(fav ? 1 : 0);
  }
  if (query.q) {
    sql += " AND (q.content LIKE ? OR q.memo LIKE ?)";
    const like = `%${query.q}%`;
    binds.push(like, like);
  }
  if (query.tag) {
    sql += " AND q.tags LIKE ?";
    binds.push(`%${query.tag}%`);
  }
  sql += " ORDER BY q.created_at DESC, q.id DESC";

  const { results } = await db
    .prepare(sql)
    .bind(...binds)
    .all<QuoteRow & { book_title: string; book_author: string }>();

  let rows = results ?? [];
  // 태그는 부분 문자열 매칭이므로 정확 일치로 한 번 더 거른다.
  if (query.tag) {
    rows = rows.filter((r) => tagsToList(r.tags).includes(query.tag!));
  }
  return rows.map((r) => serializeQuote(r, r.book_title ?? "", r.book_author ?? ""));
});

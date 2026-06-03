export default defineEventHandler(async (event) => {
  const db = await useDb(event);

  const books = await db.prepare("SELECT COUNT(*) AS n FROM book").first<{ n: number }>();
  const quotes = await db.prepare("SELECT COUNT(*) AS n FROM quote").first<{ n: number }>();
  const favorites = await db
    .prepare("SELECT COUNT(*) AS n FROM quote WHERE is_favorite = 1")
    .first<{ n: number }>();

  const statusRows = await db
    .prepare("SELECT status, COUNT(*) AS n FROM book GROUP BY status")
    .all<{ status: string; n: number }>();
  const reading_status: Record<string, number> = { want: 0, reading: 0, done: 0 };
  for (const r of statusRows.results ?? []) {
    reading_status[r.status] = r.n;
  }

  const tagRows = await db.prepare("SELECT tags FROM quote").all<{ tags: string }>();
  const counter = new Map<string, number>();
  for (const r of tagRows.results ?? []) {
    for (const t of (r.tags || "").split(",")) {
      const tag = t.trim();
      if (tag) counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
  }
  const top_tags = [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));

  return {
    total_books: books?.n ?? 0,
    total_quotes: quotes?.n ?? 0,
    total_favorites: favorites?.n ?? 0,
    reading_status,
    top_tags,
  };
});

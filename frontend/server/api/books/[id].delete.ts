export default defineEventHandler(async (event) => {
  const db = await useDb(event);
  const id = Number(getRouterParam(event, "id"));

  const existing = await db.prepare("SELECT id FROM book WHERE id = ?").bind(id).first();
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "책을 찾을 수 없습니다." });
  }

  // 문장 먼저 삭제(연쇄), 그다음 책 삭제
  await db.prepare("DELETE FROM quote WHERE book_id = ?").bind(id).run();
  await db.prepare("DELETE FROM book WHERE id = ?").bind(id).run();

  setResponseStatus(event, 204);
  return null;
});

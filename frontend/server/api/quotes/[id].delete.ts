export default defineEventHandler(async (event) => {
  const db = await useDb(event);
  const id = Number(getRouterParam(event, "id"));

  const existing = await db.prepare("SELECT id FROM quote WHERE id = ?").bind(id).first();
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "문장을 찾을 수 없습니다." });
  }
  await db.prepare("DELETE FROM quote WHERE id = ?").bind(id).run();
  setResponseStatus(event, 204);
  return null;
});

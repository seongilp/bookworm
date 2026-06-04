export default defineEventHandler(async (event) => {
  const { isbn } = getQuery(event) as { isbn?: string };
  if (!isbn || !isbn.trim()) {
    throw createError({ statusCode: 422, statusMessage: "ISBN이 필요합니다." });
  }
  const config = useRuntimeConfig(event);
  const detail = await lookupByIsbn(isbn, config.aladinTtbKey as string);
  return detail ?? { total_pages: null, cover_url: "", description: "" };
});

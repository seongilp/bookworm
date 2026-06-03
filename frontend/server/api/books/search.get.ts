export default defineEventHandler(async (event) => {
  const { q } = getQuery(event) as { q?: string };
  if (!q || !q.trim()) {
    throw createError({ statusCode: 422, statusMessage: "검색어가 필요합니다." });
  }
  const config = useRuntimeConfig(event);
  return searchBooks(q, {
    aladin: config.aladinTtbKey as string,
    kakao: config.kakaoRestKey as string,
    google: config.googleBooksKey as string,
  });
});

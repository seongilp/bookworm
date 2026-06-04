import { BESTSELLER_CATEGORIES } from "~~/server/utils/booksearch";

export default defineEventHandler(async (event) => {
  const { category } = getQuery(event) as { category?: string };
  const cat =
    BESTSELLER_CATEGORIES.find((c) => c.key === category) ?? BESTSELLER_CATEGORIES[0];
  const config = useRuntimeConfig(event);
  const items = await fetchBestsellers(cat.cid, config.aladinTtbKey as string);
  // 베스트셀러는 모두에게 동일하고 하루 단위로 바뀌므로 캐시 허용
  setHeader(event, "Cache-Control", "public, max-age=600, s-maxage=3600");
  return { category: cat.key, source: "aladin", items };
});

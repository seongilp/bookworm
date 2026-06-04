import { BESTSELLER_CATEGORIES } from "~~/server/utils/booksearch";

export default defineEventHandler(async (event) => {
  const { category } = getQuery(event) as { category?: string };
  const cat =
    BESTSELLER_CATEGORIES.find((c) => c.key === category) ?? BESTSELLER_CATEGORIES[0];
  const config = useRuntimeConfig(event);
  const items = await fetchBestsellers(cat.cid, config.aladinTtbKey as string);
  return { category: cat.key, source: "aladin", items };
});

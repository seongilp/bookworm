import type { BookSearchResult } from "~~/server/utils/booksearch";

const EMPTY = {
  title: "",
  author: "",
  publisher: "",
  cover_url: "",
  isbn: "",
  total_pages: null,
  description: "",
  source: "",
};

export default defineEventHandler(async (event) => {
  const { isbn, q } = getQuery(event) as { isbn?: string; q?: string };
  const config = useRuntimeConfig(event);
  const aladin = config.aladinTtbKey as string;

  // 1) ISBN이 있으면 상세조회
  if (isbn && isbn.trim()) {
    const detail = await lookupByIsbn(isbn, aladin);
    if (detail) return detail;
  }

  // 2) 제목으로 검색 후 첫 결과(ISBN 있으면 페이지수 보강)
  if (q && q.trim()) {
    const results = await searchBooks(q, {
      aladin,
      kakao: config.kakaoRestKey as string,
      google: config.googleBooksKey as string,
    });
    const first: BookSearchResult | undefined = results[0];
    if (first) {
      if (!first.total_pages && first.isbn) {
        const enriched = await lookupByIsbn(first.isbn, aladin);
        if (enriched?.total_pages) first.total_pages = enriched.total_pages;
      }
      return first;
    }
  }

  return EMPTY;
});

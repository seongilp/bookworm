import type {
  Book,
  BestsellerResponse,
  BookSearchResult,
  BookStatus,
  Quote,
  Stats,
  QuoteQuery,
} from "~/types";

interface BookPayload {
  title: string;
  author?: string;
  status?: BookStatus;
  rating?: number;
  note?: string;
  total_pages?: number | null;
  current_page?: number | null;
  cover_url?: string;
  isbn?: string;
  publisher?: string;
}

/**
 * 같은 앱의 Nitro API 클라이언트.
 * 모든 호출은 새 객체를 반환하며 입력을 변형하지 않는다.
 */
export function useApi() {
  // SSR(특히 Cloudflare)에서는 내부 $fetch 합성 이벤트에 D1 바인딩이 없어
  // 빈 데이터가 된다. 서버에서는 실제 요청 컨텍스트를 타도록 절대 origin을,
  // 클라이언트에서는 상대경로를 사용한다.
  const configuredBase = useRuntimeConfig().public.apiBase || "";
  const base = import.meta.server ? useRequestURL().origin : configuredBase;

  const request = <T>(path: string, options: any = {}): Promise<T> =>
    $fetch<T>(`${base}${path}`, options);

  return {
    // ---- Books ----
    listBooks: (status?: BookStatus) =>
      request<Book[]>("/api/books", { query: status ? { status } : {} }),
    getBook: (id: number) => request<Book>(`/api/books/${id}`),
    createBook: (body: BookPayload) =>
      request<Book>("/api/books", { method: "POST", body }),
    updateBook: (id: number, body: Partial<BookPayload>) =>
      request<Book>(`/api/books/${id}`, { method: "PATCH", body }),
    deleteBook: (id: number) =>
      request<void>(`/api/books/${id}`, { method: "DELETE" }),
    searchBooks: (q: string) =>
      request<BookSearchResult[]>("/api/books/search", { query: { q } }),
    lookupBook: (isbn: string) =>
      request<{ total_pages: number | null; cover_url: string; description: string }>(
        "/api/books/lookup",
        { query: { isbn } },
      ),
    getBestsellers: (category: string) =>
      request<BestsellerResponse>("/api/bestsellers", { query: { category } }),

    // ---- Quotes ----
    listQuotes: (query: QuoteQuery = {}) =>
      request<Quote[]>("/api/quotes", { query }),
    getQuote: (id: number) => request<Quote>(`/api/quotes/${id}`),
    createQuote: (body: {
      book_id: number;
      content: string;
      page?: number | null;
      memo?: string;
      tags?: string[];
    }) => request<Quote>("/api/quotes", { method: "POST", body }),
    updateQuote: (
      id: number,
      body: Partial<{
        content: string;
        page: number | null;
        memo: string;
        tags: string[];
        is_favorite: boolean;
      }>,
    ) => request<Quote>(`/api/quotes/${id}`, { method: "PATCH", body }),
    deleteQuote: (id: number) =>
      request<void>(`/api/quotes/${id}`, { method: "DELETE" }),

    // ---- Stats ----
    getStats: () => request<Stats>("/api/stats"),
  };
}

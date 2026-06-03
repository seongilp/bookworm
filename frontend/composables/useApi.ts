import type {
  Book,
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
  const base = useRuntimeConfig().public.apiBase;

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

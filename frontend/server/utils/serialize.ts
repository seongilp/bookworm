export interface BookRow {
  id: number;
  title: string;
  author: string;
  status: string;
  rating: number;
  note: string;
  total_pages: number | null;
  current_page: number | null;
  cover_url: string;
  isbn: string;
  publisher: string;
  created_at: string;
}

export interface QuoteRow {
  id: number;
  book_id: number;
  content: string;
  page: number | null;
  memo: string;
  tags: string;
  is_favorite: number;
  created_at: string;
}

export function bookProgress(row: BookRow): number | null {
  if (row.total_pages && row.total_pages > 0 && row.current_page != null) {
    const pct = Math.round((row.current_page / row.total_pages) * 100);
    return Math.max(0, Math.min(100, pct));
  }
  return null;
}

export function serializeBook(row: BookRow, quoteCount = 0) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    status: row.status,
    rating: row.rating,
    note: row.note,
    total_pages: row.total_pages,
    current_page: row.current_page,
    cover_url: row.cover_url,
    isbn: row.isbn,
    publisher: row.publisher,
    created_at: row.created_at,
    quote_count: quoteCount,
    progress: bookProgress(row),
  };
}

export function tagsToList(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function tagsToStr(tags: string[]): string {
  return tags
    .map((t) => t.trim())
    .filter(Boolean)
    .join(",");
}

export function serializeQuote(row: QuoteRow, bookTitle = "", bookAuthor = "") {
  return {
    id: row.id,
    book_id: row.book_id,
    content: row.content,
    page: row.page,
    memo: row.memo,
    tags: tagsToList(row.tags),
    is_favorite: !!row.is_favorite,
    created_at: row.created_at,
    book_title: bookTitle,
    book_author: bookAuthor,
  };
}

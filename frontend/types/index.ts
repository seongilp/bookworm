export type BookStatus = "want" | "reading" | "done";

export interface Book {
  id: number;
  title: string;
  author: string;
  status: BookStatus;
  rating: number;
  note: string;
  total_pages: number | null;
  current_page: number | null;
  cover_url: string;
  isbn: string;
  publisher: string;
  created_at: string;
  quote_count: number;
  progress: number | null;
}

export interface Quote {
  id: number;
  book_id: number;
  content: string;
  page: number | null;
  memo: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  book_title: string;
  book_author: string;
}

export interface Stats {
  total_books: number;
  total_quotes: number;
  total_favorites: number;
  reading_status: Record<BookStatus, number>;
  top_tags: { tag: string; count: number }[];
}

export interface BookSearchResult {
  title: string;
  author: string;
  publisher: string;
  cover_url: string;
  isbn: string;
  total_pages: number | null;
  description: string;
  source: string;
}

export interface QuoteQuery {
  q?: string;
  book_id?: number;
  tag?: string;
  favorite?: boolean;
}

export const STATUS_META: Record<
  BookStatus,
  { label: string; short: string }
> = {
  want: { label: "읽고 싶은", short: "읽고 싶은" },
  reading: { label: "읽는 중", short: "읽는 중" },
  done: { label: "다 읽음", short: "다 읽음" },
};

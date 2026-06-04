/**
 * 외부 도서 메타데이터 검색.
 * 우선순위: 알라딘(공식 API, 페이지수 제공) → 카카오(다음 책) → 구글북스(키 불필요 폴백).
 */

export interface BookSearchResult {
  title: string;
  author: string;
  publisher: string;
  cover_url: string;
  isbn: string;
  total_pages: number | null;
  description: string;
  source: string;
  rank?: number;
}

// 알라딘 분야별 CategoryId (베스트셀러 탭)
export const BESTSELLER_CATEGORIES: { key: string; label: string; cid: number }[] = [
  { key: "all", label: "종합", cid: 0 },
  { key: "novel", label: "소설", cid: 1 },
  { key: "essay", label: "에세이", cid: 55889 },
  { key: "economy", label: "경제경영", cid: 170 },
  { key: "self", label: "자기계발", cid: 336 },
  { key: "humanities", label: "인문", cid: 656 },
  { key: "it", label: "IT", cid: 351 },
];

// 일부 공개 API(OpenLibrary 등)는 User-Agent 없는 요청을 차단/제한한다.
const UA = "bookworm/1.0 (문장수집 책장 앱)";

function clean(s: unknown): string {
  return typeof s === "string" ? s.trim() : "";
}

function toInt(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

async function searchAladin(query: string, key: string): Promise<BookSearchResult[]> {
  if (!key) return [];
  const data = await $fetch<any>("http://www.aladin.co.kr/ttb/api/ItemSearch.aspx", {
    query: {
      ttbkey: key,
      Query: query,
      QueryType: "Keyword",
      SearchTarget: "Book",
      MaxResults: 10,
      start: 1,
      Cover: "Big",
      OptResult: "subInfo",
      output: "js",
      Version: "20131101",
    },
  });
  const items = Array.isArray(data?.item) ? data.item : [];
  return items.map((it: any) => ({
    title: clean(it.title),
    author: clean(it.author),
    publisher: clean(it.publisher),
    cover_url: clean(it.cover),
    isbn: clean(it.isbn13 || it.isbn),
    total_pages: toInt(it?.subInfo?.itemPage),
    description: clean(it.description),
    source: "aladin",
  }));
}

async function searchKakao(query: string, key: string): Promise<BookSearchResult[]> {
  if (!key) return [];
  const data = await $fetch<any>("https://dapi.kakao.com/v3/search/book", {
    query: { query, size: 10 },
    headers: { Authorization: `KakaoAK ${key}` },
  });
  const docs = Array.isArray(data?.documents) ? data.documents : [];
  return docs.map((d: any) => ({
    title: clean(d.title),
    author: Array.isArray(d.authors) ? d.authors.join(", ") : "",
    publisher: clean(d.publisher),
    cover_url: clean(d.thumbnail),
    isbn: clean((d.isbn || "").split(" ").pop()),
    total_pages: null,
    description: clean(d.contents),
    source: "kakao",
  }));
}

async function searchGoogle(query: string, key: string): Promise<BookSearchResult[]> {
  const q: Record<string, unknown> = { q: query, maxResults: 10, country: "KR" };
  if (key) q.key = key;
  const data = await $fetch<any>("https://www.googleapis.com/books/v1/volumes", {
    query: q,
    headers: { "User-Agent": UA },
  });
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map((it: any) => {
    const info = it.volumeInfo || {};
    const images = info.imageLinks || {};
    const cover = (images.thumbnail || images.smallThumbnail || "").replace(
      "http://",
      "https://",
    );
    let isbn = "";
    for (const ident of info.industryIdentifiers || []) {
      if (ident.type === "ISBN_13") {
        isbn = ident.identifier;
        break;
      }
      isbn = ident.identifier || isbn;
    }
    return {
      title: clean(info.title),
      author: Array.isArray(info.authors) ? info.authors.join(", ") : "",
      publisher: clean(info.publisher),
      cover_url: cover,
      isbn,
      total_pages: toInt(info.pageCount),
      description: clean(info.description),
      source: "google",
    };
  });
}

async function searchOpenLibrary(query: string): Promise<BookSearchResult[]> {
  const data = await $fetch<any>("https://openlibrary.org/search.json", {
    query: {
      q: query,
      limit: 10,
      fields: "title,author_name,publisher,isbn,cover_i,number_of_pages_median",
    },
    headers: { "User-Agent": UA },
  });
  const docs = Array.isArray(data?.docs) ? data.docs : [];
  return docs.map((d: any) => ({
    title: clean(d.title),
    author: Array.isArray(d.author_name) ? d.author_name.join(", ") : "",
    publisher: Array.isArray(d.publisher) ? d.publisher[0] : "",
    cover_url: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : "",
    isbn: Array.isArray(d.isbn) ? d.isbn[0] : "",
    total_pages: toInt(d.number_of_pages_median),
    description: "",
    source: "openlibrary",
  }));
}

/**
 * ISBN으로 알라딘 상세조회 → 페이지수 등 검색결과에 없는 정보 보강.
 * 키/ISBN 없으면 null.
 */
export async function lookupByIsbn(
  isbn: string,
  aladinKey: string,
): Promise<BookSearchResult | null> {
  const id = isbn.trim();
  if (!aladinKey || !id) return null;
  try {
    const data = await $fetch<any>("http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx", {
      query: {
        ttbkey: aladinKey,
        itemIdType: id.length === 13 ? "ISBN13" : "ISBN",
        ItemId: id,
        Cover: "Big",
        OptResult: "subInfo",
        output: "js",
        Version: "20131101",
      },
    });
    const it = (data?.item || [])[0];
    if (!it) return null;
    return {
      title: clean(it.title),
      author: clean(it.author),
      publisher: clean(it.publisher),
      cover_url: clean(it.cover),
      isbn: clean(it.isbn13 || it.isbn),
      total_pages: toInt(it?.subInfo?.itemPage),
      description: clean(it.description),
      source: "aladin",
    };
  } catch {
    return null;
  }
}

/** 알라딘 분야별 베스트셀러. 키가 없으면 빈 배열(베스트셀러는 알라딘 전용). */
export async function fetchBestsellers(
  categoryId: number,
  aladinKey: string,
): Promise<BookSearchResult[]> {
  if (!aladinKey) return [];
  const data = await $fetch<any>("http://www.aladin.co.kr/ttb/api/ItemList.aspx", {
    query: {
      ttbkey: aladinKey,
      QueryType: "Bestseller",
      SearchTarget: "Book",
      CategoryId: categoryId,
      MaxResults: 30,
      start: 1,
      Cover: "Big",
      OptResult: "subInfo",
      output: "js",
      Version: "20131101",
    },
  });
  const items = Array.isArray(data?.item) ? data.item : [];
  return items.map((it: any, i: number) => ({
    title: clean(it.title),
    author: clean(it.author),
    publisher: clean(it.publisher),
    cover_url: clean(it.cover),
    isbn: clean(it.isbn13 || it.isbn),
    total_pages: toInt(it?.subInfo?.itemPage),
    description: clean(it.description),
    source: "aladin",
    rank: typeof it.bestRank === "number" ? it.bestRank : i + 1,
  }));
}

export async function searchBooks(
  query: string,
  keys: { aladin: string; kakao: string; google?: string },
): Promise<BookSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const providers: Array<() => Promise<BookSearchResult[]>> = [
    () => searchAladin(q, keys.aladin),
    () => searchKakao(q, keys.kakao),
    () => searchGoogle(q, keys.google ?? ""),
    () => searchOpenLibrary(q),
  ];

  for (const run of providers) {
    try {
      const results = await run();
      if (results.length) return results;
    } catch {
      // 한 제공자 실패 시 다음으로 폴백
    }
  }
  return [];
}

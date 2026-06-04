import type { H3Event } from "h3";

/**
 * D1 데이터베이스 핸들을 가져오고, 최초 1회 스키마 생성 + 시드를 보장한다.
 * 로컬(`nuxt dev`)은 nitro-cloudflare-dev(Miniflare)가, 배포 환경은
 * Cloudflare Pages가 `DB` 바인딩을 주입한다.
 */

let schemaReady = false;

function getBinding(event: H3Event): D1Database {
  const db = (event.context.cloudflare?.env as { DB?: D1Database } | undefined)?.DB;
  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: "D1 바인딩(DB)을 찾을 수 없습니다.",
    });
  }
  return db;
}

const SCHEMA: string[] = [
  `CREATE TABLE IF NOT EXISTS book (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'reading',
    rating INTEGER NOT NULL DEFAULT 0,
    note TEXT NOT NULL DEFAULT '',
    total_pages INTEGER,
    current_page INTEGER,
    cover_url TEXT NOT NULL DEFAULT '',
    isbn TEXT NOT NULL DEFAULT '',
    publisher TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS quote (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    page INTEGER,
    memo TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '',
    is_favorite INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_quote_book ON quote(book_id)`,
  `CREATE INDEX IF NOT EXISTS idx_book_status ON book(status)`,
];

export async function useDb(event: H3Event): Promise<D1Database> {
  const db = getBinding(event);
  if (!schemaReady) {
    // 스키마 생성(멱등) 후 단일-플라이트 시드(정확히 1회).
    for (const stmt of SCHEMA) {
      await db.prepare(stmt).run();
    }
    await seedOnce(db);
    schemaReady = true;
  }
  return db;
}

/**
 * 데모 시드. 단일-플라이트 마커(_meta.seeded)로 정확히 1회만 실행되어
 * 배포 전파 중 여러 isolate가 동시에 시드하는 경쟁을 막는다.
 * 외부에서 명시적으로 호출(예: 시드 엔드포인트)하거나 비워둘 수 있다.
 */
export async function seedOnce(db: D1Database): Promise<boolean> {
  await db
    .prepare("CREATE TABLE IF NOT EXISTS _meta (key TEXT PRIMARY KEY, value TEXT)")
    .run();
  const claim = await db
    .prepare("INSERT OR IGNORE INTO _meta (key, value) VALUES ('seeded', '1')")
    .run();
  // 이미 시드됨(혹은 다른 isolate가 선점) → 중복 시드 방지
  if (claim.meta.changes !== 1) return false;

  const now = new Date().toISOString();
  const books = [
    {
      title: "데미안",
      author: "헤르만 헤세",
      status: "done",
      rating: 5,
      note: "나를 찾는 여정에 대한 책",
      total_pages: 240,
      current_page: 240,
      publisher: "민음사",
      quotes: [
        {
          content:
            "새는 알에서 나오려고 투쟁한다. 알은 세계다. 태어나려는 자는 한 세계를 깨뜨려야 한다.",
          page: 123,
          memo: "성장의 본질에 대하여",
          tags: "성장,자아",
          is_favorite: 1,
        },
        {
          content: "내 안에서 솟아 나오려는 것, 바로 그것을 살아보려 했다. 왜 그것이 그토록 어려웠을까.",
          page: 9,
          memo: "",
          tags: "자아",
          is_favorite: 0,
        },
      ],
    },
    {
      title: "코스모스",
      author: "칼 세이건",
      status: "reading",
      rating: 5,
      note: "",
      total_pages: 719,
      current_page: 210,
      publisher: "사이언스북스",
      quotes: [
        {
          content: "우리는 별의 먼지로 만들어졌다. 우리는 코스모스가 스스로를 알아가는 한 방법이다.",
          page: 42,
          memo: "가장 좋아하는 과학적 시선",
          tags: "우주,과학,감동",
          is_favorite: 1,
        },
      ],
    },
    {
      title: "어린 왕자",
      author: "생텍쥐페리",
      status: "done",
      rating: 4,
      note: "어른을 위한 동화",
      total_pages: 136,
      current_page: 136,
      publisher: "열린책들",
      quotes: [
        {
          content: "가장 중요한 것은 눈에 보이지 않아. 마음으로 보아야 잘 보이는 거야.",
          page: 82,
          memo: "여우의 말",
          tags: "사랑,본질",
          is_favorite: 1,
        },
        {
          content: "네가 길들인 것에 대해서는 언제까지나 책임이 있는 거야.",
          page: 88,
          memo: "",
          tags: "사랑,책임",
          is_favorite: 0,
        },
      ],
    },
    {
      title: "1984",
      author: "조지 오웰",
      status: "want",
      rating: 0,
      note: "꼭 읽어볼 것",
      total_pages: null,
      current_page: null,
      publisher: "민음사",
      quotes: [],
    },
  ];

  for (const b of books) {
    const res = await db
      .prepare(
        `INSERT INTO book (title, author, status, rating, note, total_pages, current_page, cover_url, isbn, publisher, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, '', '', ?, ?)`,
      )
      .bind(
        b.title,
        b.author,
        b.status,
        b.rating,
        b.note,
        b.total_pages,
        b.current_page,
        b.publisher,
        now,
      )
      .run();
    const bookId = res.meta.last_row_id;
    for (const q of b.quotes) {
      await db
        .prepare(
          `INSERT INTO quote (book_id, content, page, memo, tags, is_favorite, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(bookId, q.content, q.page, q.memo, q.tags, q.is_favorite, now)
        .run();
    }
  }
  return true;
}

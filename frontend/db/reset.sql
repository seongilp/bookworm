-- prod D1 결정적 리셋: 드롭 → 스키마 → 데모 시드 → 시드 마커
-- 적용: wrangler d1 execute bookworm --remote --file db/reset.sql
DROP TABLE IF EXISTS quote;
DROP TABLE IF EXISTS book;
DROP TABLE IF EXISTS _meta;

CREATE TABLE book (
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
);
CREATE TABLE quote (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  page INTEGER,
  memo TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  is_favorite INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_quote_book ON quote(book_id);
CREATE INDEX idx_book_status ON book(status);
CREATE TABLE _meta (key TEXT PRIMARY KEY, value TEXT);

INSERT INTO book (id, title, author, status, rating, note, total_pages, current_page, cover_url, publisher, created_at) VALUES
 (1, '데미안', '헤르만 헤세', 'done', 5, '나를 찾는 여정에 대한 책', 240, 240, 'https://image.aladin.co.kr/product/26/0/cover200/s452139198_1.jpg', '민음사', '2026-06-04T00:00:00.000Z'),
 (2, '코스모스', '칼 세이건', 'reading', 5, '', 719, 210, 'https://image.aladin.co.kr/product/87/9/cover200/s412032094_1.jpg', '사이언스북스', '2026-06-04T00:00:01.000Z'),
 (3, '어린 왕자', '생텍쥐페리', 'done', 4, '어른을 위한 동화', 136, 136, 'https://image.aladin.co.kr/product/6853/49/cover200/8932917248_2.jpg', '열린책들', '2026-06-04T00:00:02.000Z'),
 (4, '1984', '조지 오웰', 'want', 0, '꼭 읽어볼 것', NULL, NULL, 'https://image.aladin.co.kr/product/39409/82/cover200/k782139090_1.jpg', '민음사', '2026-06-04T00:00:03.000Z');

INSERT INTO quote (book_id, content, page, memo, tags, is_favorite, created_at) VALUES
 (1, '새는 알에서 나오려고 투쟁한다. 알은 세계다. 태어나려는 자는 한 세계를 깨뜨려야 한다.', 123, '성장의 본질에 대하여', '성장,자아', 1, '2026-06-04T00:00:00.000Z'),
 (1, '내 안에서 솟아 나오려는 것, 바로 그것을 살아보려 했다. 왜 그것이 그토록 어려웠을까.', 9, '', '자아', 0, '2026-06-04T00:00:00.000Z'),
 (2, '우리는 별의 먼지로 만들어졌다. 우리는 코스모스가 스스로를 알아가는 한 방법이다.', 42, '가장 좋아하는 과학적 시선', '우주,과학,감동', 1, '2026-06-04T00:00:01.000Z'),
 (3, '가장 중요한 것은 눈에 보이지 않아. 마음으로 보아야 잘 보이는 거야.', 82, '여우의 말', '사랑,본질', 1, '2026-06-04T00:00:02.000Z'),
 (3, '네가 길들인 것에 대해서는 언제까지나 책임이 있는 거야.', 88, '', '사랑,책임', 0, '2026-06-04T00:00:02.000Z');

INSERT INTO _meta (key, value) VALUES ('seeded', '1');

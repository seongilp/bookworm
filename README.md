# 책벌레 · 문장수집 📖

책에서 만난 좋은 문장을 모으고, 나만의 책장을 관리하는 웹 앱.
토스(Toss)처럼 군더더기 없는 미니멀 UI — 흑백 기반 + 포인트 블루 하나, 단색 아이콘.

> **단일 앱 / 단일 배포.** Nuxt 한 앱이 화면과 API(Nitro 서버 라우트)를 모두 담고,
> Cloudflare Pages + D1로 통째로 배포됩니다. `git push` 하면 GitHub Actions가 자동 빌드·배포합니다.

## 기능

### 나만의 책장
- 책 직접 추가 + **제목 검색으로 표지·저자·출판사·페이지수 자동 채우기**
- 독서 상태: 읽고 싶은 / 읽는 중 / 다 읽음 (상태별 탭 필터)
- 별점(1~5), 한줄평
- 읽는 중 진행률 (현재/전체 페이지 → 진행 바)
- 책 정보 수정/삭제

### 문장 수집
- 책에서 문장 수집 (페이지·메모·태그)
- 검색 / 태그 필터 / 즐겨찾기
- 통계 (문장·책·즐겨찾기 수, 독서 상태, 자주 쓴 태그)
- 다크 모드

## 기술 스택

| 영역 | 스택 |
|------|------|
| 프레임워크 | Nuxt 3 (Vue 3) — 화면 + Nitro 서버 API 통합 |
| 스타일 | Tailwind CSS v4, shadcn-vue 스타일 컴포넌트(reka-ui), Pretendard |
| 데이터 | Cloudflare D1 (SQLite) |
| 검증 | Zod |
| 배포 | Cloudflare Pages (+ Pages Functions), GitHub Actions CI |

## 외부 도서 검색 소스

제목으로 메타데이터를 가져옵니다. 다음 순서로 시도(설정된 키만):

1. **알라딘** (TTBKey) — 추천. 한국 도서 메타데이터가 가장 풍부하고 **페이지수**까지 제공. 교보/예스24는 공식 API가 없어 제외.
2. **카카오(다음) 책** (REST 키)
3. **구글 북스** (키 선택)
4. **OpenLibrary** (키 불필요 폴백, 한국 도서 커버리지는 약함)

키가 하나도 없어도 OpenLibrary로 동작하지만, **한국 책은 알라딘 키를 넣어야 제대로** 검색됩니다.
키는 환경변수/시크릿으로 설정 — 자세한 건 [`frontend/.env.example`](frontend/.env.example).

```
NUXT_ALADIN_TTB_KEY=...     # 알라딘 (권장)
NUXT_KAKAO_REST_KEY=...     # 카카오 (선택)
NUXT_GOOGLE_BOOKS_KEY=...   # 구글 (선택)
```

## 로컬 개발

전제: `node`, `pnpm`.

```bash
./dev.sh
# 또는
cd frontend && pnpm install && pnpm dev
```

http://localhost:3000 — 화면과 API가 한 서버에서 뜨고, 로컬 D1(Miniflare)이 자동 생성·시드됩니다.

## 배포 (Cloudflare Pages)

`main`에 push 하면 GitHub Actions가 빌드 후 `wrangler pages deploy`로 자동 배포합니다
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

필요한 GitHub 시크릿:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

수동 배포:
```bash
cd frontend
pnpm build
npx wrangler pages deploy dist --project-name bookworm
```

DB 스키마/시드는 첫 요청 시 자동 생성됩니다(`server/utils/db.ts`).

## 구조

```
bookworm/
├── frontend/                  # Nuxt 앱 (화면 + API)
│   ├── pages/                 # 홈 / 책장 / 책 상세 / 즐겨찾기 / 통계
│   ├── components/            # BookCard, BookFormDialog, QuoteCard, ui/*
│   ├── composables/           # useApi, useToast
│   ├── server/
│   │   ├── api/               # Nitro 라우트: books / quotes / stats / search
│   │   └── utils/             # D1 헬퍼, 직렬화, 외부검색, zod 스키마
│   └── wrangler.toml          # D1 바인딩
└── .github/workflows/deploy.yml
```

## API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/books` `?status=` | 책 목록(상태 필터) |
| POST | `/api/books` | 책 추가 |
| GET/PATCH/DELETE | `/api/books/{id}` | 책 조회/수정/삭제(문장 함께 삭제) |
| GET | `/api/books/search?q=` | 외부 도서 검색 |
| GET | `/api/quotes` `?q=&book_id=&tag=&favorite=` | 문장 목록 |
| POST | `/api/quotes` | 문장 추가 |
| GET/PATCH/DELETE | `/api/quotes/{id}` | 문장 조회/수정/삭제 |
| GET | `/api/stats` | 통계 |

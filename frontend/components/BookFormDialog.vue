<script setup lang="ts">
import { Search, Check, Loader2, X } from "lucide-vue-next";
import { watchDebounced } from "@vueuse/core";
import type { Book, BookStatus, BookSearchResult } from "~/types";
import { STATUS_META } from "~/types";

const props = defineProps<{ book?: Book }>();
const emit = defineEmits<{ (e: "saved", book: Book): void }>();
const open = defineModel<boolean>("open", { default: false });

const api = useApi();
const toast = useToast();

const isEdit = computed(() => !!props.book);

// 폼 상태
const title = ref("");
const author = ref("");
const publisher = ref("");
const status = ref<BookStatus>("reading");
const rating = ref(0);
const totalPages = ref<string>("");
const currentPage = ref<string>("");
const note = ref("");
const coverUrl = ref("");
const isbn = ref("");
const saving = ref(false);
const lookingUp = ref(false);

// 외부 검색 상태
const searchQuery = ref("");
const results = ref<BookSearchResult[]>([]);
const searching = ref(false);
const searched = ref(false);
const picked = ref(false);

const statuses: BookStatus[] = ["want", "reading", "done"];

function reset() {
  const b = props.book;
  title.value = b?.title ?? "";
  author.value = b?.author ?? "";
  publisher.value = b?.publisher ?? "";
  status.value = b?.status ?? "reading";
  rating.value = b?.rating ?? 0;
  totalPages.value = b?.total_pages != null ? String(b.total_pages) : "";
  currentPage.value = b?.current_page != null ? String(b.current_page) : "";
  note.value = b?.note ?? "";
  coverUrl.value = b?.cover_url ?? "";
  isbn.value = b?.isbn ?? "";
  searchQuery.value = "";
  results.value = [];
  searched.value = false;
  picked.value = isEdit.value;
}

async function fillPagesByIsbn(bookIsbn: string) {
  if (!bookIsbn || totalPages.value) return;
  lookingUp.value = true;
  try {
    const detail = await api.lookupBook(bookIsbn);
    if (detail?.total_pages && !totalPages.value) {
      totalPages.value = String(detail.total_pages);
    }
    if (detail?.cover_url && !coverUrl.value) coverUrl.value = detail.cover_url;
  } catch {
    /* 무시 */
  } finally {
    lookingUp.value = false;
  }
}

watch(open, (v) => {
  if (!v) return;
  reset();
  // 수정 모드에서 페이지수가 비어 있고 ISBN이 있으면 자동 조회
  if (isEdit.value && !totalPages.value && props.book?.isbn) {
    fillPagesByIsbn(props.book.isbn);
  }
});

// 제목 검색 (디바운스)
watchDebounced(
  searchQuery,
  async (q) => {
    const term = q.trim();
    if (!term || term.length < 2) {
      results.value = [];
      searched.value = false;
      return;
    }
    searching.value = true;
    try {
      results.value = await api.searchBooks(term);
      searched.value = true;
    } catch {
      results.value = [];
    } finally {
      searching.value = false;
    }
  },
  { debounce: 450 },
);

async function pick(r: BookSearchResult) {
  title.value = r.title;
  author.value = r.author;
  publisher.value = r.publisher;
  coverUrl.value = r.cover_url;
  isbn.value = r.isbn;
  if (r.total_pages) totalPages.value = String(r.total_pages);
  picked.value = true;
  results.value = [];
  searchQuery.value = "";
  searched.value = false;

  // 검색 결과에 페이지수가 없으면 ISBN으로 상세조회해 보강
  if (!r.total_pages && r.isbn) await fillPagesByIsbn(r.isbn);
}

function clearCover() {
  coverUrl.value = "";
}

const canSave = computed(() => !!title.value.trim());

async function save() {
  if (!canSave.value || saving.value) return;
  saving.value = true;
  try {
    const payload = {
      title: title.value.trim(),
      author: author.value.trim(),
      publisher: publisher.value.trim(),
      status: status.value,
      rating: rating.value,
      note: note.value.trim(),
      total_pages: totalPages.value ? Number(totalPages.value) : null,
      current_page: currentPage.value ? Number(currentPage.value) : null,
      cover_url: coverUrl.value,
      isbn: isbn.value,
    };
    const saved = props.book
      ? await api.updateBook(props.book.id, payload)
      : await api.createBook(payload);
    toast.success(isEdit.value ? "책 정보를 저장했어요" : "책장에 추가했어요");
    open.value = false;
    emit("saved", saved);
  } catch {
    toast.error("저장에 실패했어요");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UiDialog
    v-model:open="open"
    :title="isEdit ? '책 정보 수정' : '책장에 추가'"
    :description="isEdit ? undefined : '제목으로 검색하거나 직접 입력하세요'"
  >
    <div class="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
      <!-- 외부 검색 (추가 모드) -->
      <div v-if="!isEdit" class="space-y-2">
        <div class="relative">
          <Search
            class="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
          />
          <UiInput
            v-model="searchQuery"
            placeholder="책 제목 검색 (예: 데미안)"
            class="pl-11"
          />
          <Loader2
            v-if="searching"
            class="absolute right-3.5 top-1/2 size-[18px] -translate-y-1/2 animate-spin text-muted-foreground"
          />
        </div>

        <div
          v-if="results.length"
          class="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-border bg-secondary/30 p-1"
        >
          <button
            v-for="(r, i) in results"
            :key="i"
            type="button"
            class="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-background"
            @click="pick(r)"
          >
            <BookCover :book="r" class="w-9 shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-[13px] font-semibold">{{ r.title }}</p>
              <p class="truncate text-[12px] text-muted-foreground">
                {{ r.author }}{{ r.publisher ? ` · ${r.publisher}` : "" }}
              </p>
            </div>
          </button>
        </div>
        <p
          v-else-if="searched && !searching"
          class="px-1 text-[12px] text-muted-foreground"
        >
          검색 결과가 없어요. 아래에 직접 입력해 주세요.
        </p>
      </div>

      <!-- 선택/입력된 책 미리보기 + 폼 -->
      <div class="flex gap-3">
        <div class="w-20 shrink-0">
          <BookCover :book="{ title, cover_url: coverUrl }" class="w-full" />
          <button
            v-if="coverUrl"
            type="button"
            class="mt-1 flex w-full items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
            @click="clearCover"
          >
            <X class="size-3" /> 표지 제거
          </button>
        </div>
        <div class="flex-1 space-y-2">
          <div class="space-y-1">
            <label class="text-[12px] font-semibold text-foreground/80">제목</label>
            <UiInput v-model="title" placeholder="책 제목" />
          </div>
          <div class="space-y-1">
            <label class="text-[12px] font-semibold text-foreground/80">저자</label>
            <UiInput v-model="author" placeholder="저자" />
          </div>
          <div class="space-y-1">
            <label class="text-[12px] font-semibold text-foreground/80"
              >출판사</label
            >
            <UiInput v-model="publisher" placeholder="출판사 (선택)" />
          </div>
        </div>
      </div>

      <!-- 상태 -->
      <div class="space-y-1.5">
        <label class="text-[12px] font-semibold text-foreground/80">상태</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="s in statuses"
            :key="s"
            type="button"
            class="rounded-xl border py-2.5 text-[13px] font-semibold transition-colors"
            :class="
              status === s
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-accent'
            "
            @click="status = s"
          >
            {{ STATUS_META[s].label }}
          </button>
        </div>
      </div>

      <!-- 별점 -->
      <div class="space-y-1.5">
        <label class="text-[12px] font-semibold text-foreground/80">별점</label>
        <UiRating v-model="rating" :size="26" />
      </div>

      <!-- 페이지 -->
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1">
          <label class="text-[12px] font-semibold text-foreground/80"
            >현재 페이지</label
          >
          <UiInput v-model="currentPage" type="number" placeholder="0" />
        </div>
        <div class="space-y-1">
          <label class="flex items-center gap-1 text-[12px] font-semibold text-foreground/80">
            전체 페이지
            <span v-if="lookingUp" class="flex items-center gap-1 text-primary">
              <Loader2 class="size-3 animate-spin" /> 가져오는 중
            </span>
          </label>
          <UiInput v-model="totalPages" type="number" placeholder="예: 320" />
        </div>
      </div>

      <!-- 한줄평 -->
      <div class="space-y-1">
        <label class="text-[12px] font-semibold text-foreground/80"
          >한줄평 (선택)</label
        >
        <UiTextarea v-model="note" placeholder="이 책에 대한 생각" class="min-h-16" />
      </div>

      <UiButton
        size="lg"
        class="w-full"
        :disabled="!canSave || saving"
        @click="save"
      >
        <Check class="size-5" />
        {{ saving ? "저장 중..." : isEdit ? "저장하기" : "책장에 추가" }}
      </UiButton>
    </div>
  </UiDialog>
</template>

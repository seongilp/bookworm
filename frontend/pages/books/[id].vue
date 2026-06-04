<script setup lang="ts">
import { ArrowLeft, Trash2, Pencil, Quote as QuoteIcon } from "lucide-vue-next";
import type { Book, Quote } from "~/types";
import { STATUS_META } from "~/types";

const route = useRoute();
const router = useRouter();
const api = useApi();
const toast = useToast();
const id = Number(route.params.id);

const editOpen = ref(false);
const quoteOpen = ref(false);
const confirmDelete = ref(false);

const { data: book, refresh: refreshBook, error } = await useAsyncData<Book>(
  `book-${id}`,
  () => api.getBook(id),
);
const { data: quotes, refresh: refreshQuotes } = await useAsyncData<Quote[]>(
  `book-quotes-${id}`,
  () => api.listQuotes({ book_id: id }),
  { default: () => [] },
);
const { data: allBooks, refresh: refreshAll } = await useAsyncData<Book[]>(
  "all-books-detail",
  () => api.listBooks(),
  { default: () => [] },
);

async function setStatus(status: Book["status"]) {
  if (!book.value || book.value.status === status) return;
  book.value = { ...book.value, status };
  try {
    await api.updateBook(id, { status });
  } catch {
    toast.error("변경에 실패했어요");
    await refreshBook();
  }
}

async function setRating(rating: number) {
  if (!book.value) return;
  book.value = { ...book.value, rating };
  try {
    await api.updateBook(id, { rating });
  } catch {
    toast.error("변경에 실패했어요");
    await refreshBook();
  }
}

async function toggleFavorite(q: Quote) {
  quotes.value = quotes.value.map((item) =>
    item.id === q.id ? { ...item, is_favorite: !item.is_favorite } : item,
  );
  try {
    await api.updateQuote(q.id, { is_favorite: !q.is_favorite });
  } catch {
    toast.error("변경에 실패했어요");
    await refreshQuotes();
  }
}

async function removeQuote(q: Quote) {
  quotes.value = quotes.value.filter((item) => item.id !== q.id);
  try {
    await api.deleteQuote(q.id);
    toast.success("삭제했어요");
    refreshBook();
  } catch {
    toast.error("삭제에 실패했어요");
    await refreshQuotes();
  }
}

async function deleteBook() {
  try {
    await api.deleteBook(id);
    toast.success("책을 삭제했어요");
    router.push("/books");
  } catch {
    toast.error("삭제에 실패했어요");
  }
}

function onBookSaved(updated: Book) {
  book.value = updated;
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <button
      class="mb-4 flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      @click="router.push('/books')"
    >
      <ArrowLeft class="size-4" /> 책장
    </button>

    <div v-if="error">
      <EmptyState title="책을 찾을 수 없어요">
        <template #icon>❓</template>
        <template #action>
          <UiButton variant="secondary" @click="router.push('/books')">책장으로</UiButton>
        </template>
      </EmptyState>
    </div>

    <template v-else-if="book">
      <!-- 헤더: 표지 + 정보 -->
      <div class="flex gap-4">
        <BookCover :book="book" class="w-28 shrink-0 shadow-md" />
        <div class="min-w-0 flex-1">
          <UiStatusBadge :status="book.status" />
          <h1 class="mt-2 text-xl font-extrabold leading-tight tracking-tight">
            {{ book.title }}
          </h1>
          <p v-if="book.author" class="mt-1 text-sm text-muted-foreground">
            {{ book.author }}
          </p>
          <p v-if="book.publisher" class="text-[13px] text-muted-foreground/80">
            {{ book.publisher }}
          </p>
          <div class="mt-2.5">
            <UiRating :model-value="book.rating" :size="20" @update:model-value="setRating" />
          </div>
        </div>
      </div>

      <!-- 진행률 -->
      <div
        v-if="book.status === 'reading' && book.progress !== null"
        class="mt-4 rounded-2xl border border-border/70 bg-card p-4"
      >
        <div class="mb-2 flex items-center justify-between text-[13px]">
          <span class="font-semibold">읽는 중</span>
          <span class="text-muted-foreground"
            >{{ book.current_page }} / {{ book.total_pages }}p · {{ book.progress }}%</span
          >
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-primary transition-all"
            :style="{ width: `${book.progress}%` }"
          />
        </div>
      </div>

      <!-- 상태 빠른 변경 -->
      <div class="mt-4 grid grid-cols-3 gap-2">
        <button
          v-for="s in (['want', 'reading', 'done'] as const)"
          :key="s"
          class="rounded-xl border py-2 text-[13px] font-semibold transition-colors"
          :class="
            book.status === s
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:bg-accent'
          "
          @click="setStatus(s)"
        >
          {{ STATUS_META[s].label }}
        </button>
      </div>

      <!-- 한줄평 -->
      <div
        v-if="book.note"
        class="mt-4 rounded-2xl bg-muted px-4 py-3 text-[14px] leading-relaxed text-foreground/90"
      >
        “{{ book.note }}”
      </div>

      <!-- 수정/삭제 -->
      <div class="mt-4 flex gap-2">
        <UiButton variant="secondary" class="flex-1" @click="editOpen = true">
          <Pencil class="size-4" /> 정보 수정
        </UiButton>
        <UiButton variant="ghost" size="icon" aria-label="책 삭제" @click="confirmDelete = true">
          <Trash2 class="size-5 text-muted-foreground" />
        </UiButton>
      </div>

      <!-- 문장 섹션 -->
      <div class="mt-8">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="flex items-center gap-1.5 text-[15px] font-bold">
            <QuoteIcon class="size-4 text-muted-foreground" /> 수집한 문장
            <span class="text-muted-foreground">{{ quotes.length }}</span>
          </h2>
          <button
            class="text-[13px] font-semibold text-primary hover:underline"
            @click="quoteOpen = true"
          >
            + 문장 추가
          </button>
        </div>

        <EmptyState
          v-if="!quotes.length"
          title="아직 이 책의 문장이 없어요"
          description="이 책에서 좋은 문장을 수집해보세요"
        >
          <template #icon>✍️</template>
          <template #action>
            <UiButton @click="quoteOpen = true">문장 수집하기</UiButton>
          </template>
        </EmptyState>

        <div v-else class="space-y-3">
          <QuoteCard
            v-for="q in quotes"
            :key="q.id"
            :quote="q"
            @toggle-favorite="toggleFavorite"
            @delete="removeQuote"
          />
        </div>
      </div>

      <!-- 다이얼로그들 -->
      <BookFormDialog v-model:open="editOpen" :book="book" @saved="onBookSaved" />
      <AddQuoteDialog
        v-model:open="quoteOpen"
        :books="allBooks"
        :preset-book-id="id"
        @created="
          () => {
            refreshQuotes();
            refreshBook();
          }
        "
        @book-created="refreshAll"
      />
      <UiDialog
        v-model:open="confirmDelete"
        title="책을 삭제할까요?"
        :description="`'${book.title}'와(과) 수집한 문장 ${quotes.length}개가 함께 삭제돼요.`"
      >
        <div class="flex gap-2">
          <UiButton variant="secondary" class="flex-1" @click="confirmDelete = false"
            >취소</UiButton
          >
          <UiButton variant="destructive" class="flex-1" @click="deleteBook">삭제</UiButton>
        </div>
      </UiDialog>
    </template>
  </div>
</template>

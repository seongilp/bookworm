<script setup lang="ts">
import { Search, Sparkles } from "lucide-vue-next";
import type { Quote, Book } from "~/types";

const api = useApi();
const toast = useToast();

const search = ref("");
const dialogOpen = ref(false);

const { data: books, refresh: refreshBooks } = await useAsyncData<Book[]>(
  "books",
  () => api.listBooks(),
  { default: () => [] },
);

const { data: quotes, refresh: refreshQuotes, pending } = await useAsyncData<
  Quote[]
>("quotes-home", () => api.listQuotes(), { default: () => [] });

// 클라이언트 측 검색 필터 (즉각 반응)
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return quotes.value;
  return quotes.value.filter(
    (item) =>
      item.content.toLowerCase().includes(q) ||
      item.memo.toLowerCase().includes(q) ||
      item.book_title.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)),
  );
});

async function onCreated() {
  await Promise.all([refreshQuotes(), refreshBooks()]);
}

async function toggleFavorite(q: Quote) {
  // 낙관적 업데이트
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

async function remove(q: Quote) {
  quotes.value = quotes.value.filter((item) => item.id !== q.id);
  try {
    await api.deleteQuote(q.id);
    toast.success("삭제했어요");
  } catch {
    toast.error("삭제에 실패했어요");
    await refreshQuotes();
  }
}
</script>

<template>
  <div>
    <!-- 인사 헤더 -->
    <div class="mb-6">
      <h1 class="text-2xl font-extrabold tracking-tight">
        오늘은 어떤 문장을<br />만나셨나요?
      </h1>
      <p class="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Sparkles class="size-4" />
        지금까지 {{ quotes.length }}개의 문장을 모았어요
      </p>
    </div>

    <!-- 검색 -->
    <div class="relative mb-5">
      <Search
        class="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
      />
      <input
        v-model="search"
        placeholder="문장, 책, 태그 검색"
        class="h-12 w-full rounded-2xl border border-input bg-secondary/50 pl-11 pr-4 text-sm transition-colors placeholder:text-muted-foreground focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>

    <!-- 문장 피드 -->
    <div v-if="pending" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="h-36 animate-pulse rounded-2xl bg-muted"
      />
    </div>

    <EmptyState
      v-else-if="!filtered.length && !search"
      title="아직 수집한 문장이 없어요"
      description="마음에 닿은 첫 문장을 기록해보세요"
    >
      <template #action>
        <UiButton @click="dialogOpen = true">첫 문장 수집하기</UiButton>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="!filtered.length"
      title="검색 결과가 없어요"
      :description="`'${search}'에 해당하는 문장을 찾지 못했어요`"
    >
      <template #icon>🔍</template>
    </EmptyState>

    <div v-else class="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
      <QuoteCard
        v-for="q in filtered"
        :key="q.id"
        :quote="q"
        show-book
        @toggle-favorite="toggleFavorite"
        @delete="remove"
      />
    </div>

    <Fab @click="dialogOpen = true" />
    <AddQuoteDialog
      v-model:open="dialogOpen"
      :books="books"
      @created="onCreated"
      @book-created="refreshBooks"
    />
  </div>
</template>

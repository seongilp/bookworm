<script setup lang="ts">
import type { Quote } from "~/types";

const api = useApi();
const toast = useToast();

const { data: quotes, refresh, pending } = await useAsyncData<Quote[]>(
  "favorites",
  () => api.listQuotes({ favorite: true }),
  { default: () => [] },
);

async function toggleFavorite(q: Quote) {
  // 즐겨찾기 해제 시 목록에서 제거
  quotes.value = quotes.value.filter((item) => item.id !== q.id);
  try {
    await api.updateQuote(q.id, { is_favorite: false });
  } catch {
    toast.error("변경에 실패했어요");
    await refresh();
  }
}

async function remove(q: Quote) {
  quotes.value = quotes.value.filter((item) => item.id !== q.id);
  try {
    await api.deleteQuote(q.id);
    toast.success("삭제했어요");
  } catch {
    toast.error("삭제에 실패했어요");
    await refresh();
  }
}
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-extrabold tracking-tight">즐겨찾기</h1>
      <p class="mt-1.5 text-sm text-muted-foreground">
        다시 꺼내보고 싶은 문장 {{ quotes.length }}개
      </p>
    </div>

    <div v-if="pending" class="space-y-3">
      <div
        v-for="i in 3"
        :key="i"
        class="h-36 animate-pulse rounded-2xl bg-muted"
      />
    </div>

    <EmptyState
      v-else-if="!quotes.length"
      title="즐겨찾기한 문장이 없어요"
      description="마음에 든 문장의 하트를 눌러 보관해보세요"
    >
      <template #icon>🤍</template>
    </EmptyState>

    <div v-else class="space-y-3">
      <QuoteCard
        v-for="q in quotes"
        :key="q.id"
        :quote="q"
        show-book
        @toggle-favorite="toggleFavorite"
        @delete="remove"
      />
    </div>
  </div>
</template>

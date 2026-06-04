<script setup lang="ts">
import { Plus } from "lucide-vue-next";
import type { Book, BookStatus } from "~/types";
import { STATUS_META } from "~/types";

const api = useApi();
const dialogOpen = ref(false);

const { data: books, refresh, pending } = await useAsyncData<Book[]>(
  "books-page",
  () => api.listBooks(),
  { default: () => [] },
);

const filter = ref<BookStatus | "all">("all");
const tabs: { key: BookStatus | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "reading", label: STATUS_META.reading.label },
  { key: "want", label: STATUS_META.want.label },
  { key: "done", label: STATUS_META.done.label },
];

const counts = computed(() => {
  const c: Record<string, number> = { all: books.value.length, want: 0, reading: 0, done: 0 };
  for (const b of books.value) c[b.status]++;
  return c;
});

const filtered = computed(() =>
  filter.value === "all"
    ? books.value
    : books.value.filter((b) => b.status === filter.value),
);

function onSaved() {
  refresh();
}
</script>

<template>
  <div>
    <div class="mb-5 flex items-end justify-between">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight">내 책장</h1>
        <p class="mt-1.5 text-sm text-muted-foreground">
          {{ books.length }}권의 책을 모았어요
        </p>
      </div>
      <UiButton size="sm" @click="dialogOpen = true">
        <Plus class="size-4" :stroke-width="2.5" /> 책 추가
      </UiButton>
    </div>

    <!-- 상태 탭 -->
    <div class="mb-5 flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
        :class="
          filter === t.key
            ? 'bg-foreground text-background'
            : 'bg-secondary text-muted-foreground hover:bg-accent'
        "
        @click="filter = t.key"
      >
        {{ t.label }}
        <span class="ml-1 opacity-60">{{ counts[t.key] }}</span>
      </button>
    </div>

    <div v-if="pending" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div v-for="i in 6" :key="i" class="h-64 animate-pulse rounded-2xl bg-muted" />
    </div>

    <EmptyState
      v-else-if="!books.length"
      title="책장이 비어 있어요"
      description="첫 책을 추가해보세요. 제목으로 검색하면 표지까지 채워져요."
    >
      <template #action>
        <UiButton @click="dialogOpen = true">책 추가하기</UiButton>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="!filtered.length"
      :title="`'${tabs.find((t) => t.key === filter)?.label}' 책이 없어요`"
    >
      <template #icon>📚</template>
    </EmptyState>

    <div
      v-else
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5"
    >
      <BookCard v-for="book in filtered" :key="book.id" :book="book" />
    </div>

    <Fab label="책 추가" @click="dialogOpen = true" />
    <BookFormDialog v-model:open="dialogOpen" @saved="onSaved" />
  </div>
</template>

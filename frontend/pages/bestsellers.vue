<script setup lang="ts">
import { Check, Plus, TrendingUp } from "lucide-vue-next";
import type { BestsellerResponse, BookSearchResult, Book } from "~/types";
import { BESTSELLER_TABS } from "~/types";

const api = useApi();
const toast = useToast();

const category = ref("all");

const { data, pending, refresh } = await useAsyncData<BestsellerResponse>(
  () => `bestsellers-${category.value}`,
  () => api.getBestsellers(category.value),
  { watch: [category], default: () => ({ category: "all", source: "aladin", items: [] }) },
);

// 이미 책장에 있는 책(제목+저자 기준) 표시용
const { data: myBooks } = await useAsyncData<Book[]>(
  "bestseller-mybooks",
  () => api.listBooks(),
  { default: () => [] },
);
const addedKeys = ref<Set<string>>(new Set());
const key = (b: { title: string; author: string }) => `${b.title}|${b.author}`;
const ownedKeys = computed(() => {
  const s = new Set<string>();
  for (const b of myBooks.value) s.add(key(b));
  for (const k of addedKeys.value) s.add(k);
  return s;
});

const adding = ref<string | null>(null);

async function add(item: BookSearchResult) {
  const k = key(item);
  if (ownedKeys.value.has(k) || adding.value) return;
  adding.value = k;
  try {
    await api.createBook({
      title: item.title,
      author: item.author,
      publisher: item.publisher,
      cover_url: item.cover_url,
      isbn: item.isbn,
      total_pages: item.total_pages ?? null,
      status: "want", // 담기 = 읽고 싶은
    });
    addedKeys.value = new Set([...addedKeys.value, k]);
    toast.success("책장에 담았어요");
  } catch {
    toast.error("담기에 실패했어요");
  } finally {
    adding.value = null;
  }
}
</script>

<template>
  <div>
    <div class="mb-5">
      <h1 class="flex items-center gap-2 text-2xl font-extrabold tracking-tight lg:text-3xl">
        베스트셀러
      </h1>
      <p class="mt-1.5 text-sm text-muted-foreground">
        지금 많이 읽는 책 · 담기를 누르면 내 책장으로
      </p>
    </div>

    <!-- 분야 탭 -->
    <div class="mb-5 flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="t in BESTSELLER_TABS"
        :key="t.key"
        class="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
        :class="
          category === t.key
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground hover:bg-accent'
        "
        @click="category = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <div v-if="pending" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div v-for="i in 6" :key="i" class="h-28 animate-pulse rounded-2xl bg-muted" />
    </div>

    <EmptyState
      v-else-if="!data.items.length"
      title="베스트셀러를 불러올 수 없어요"
      description="알라딘 API 키가 설정되면 표시됩니다."
    >
      <template #icon>🏆</template>
    </EmptyState>

    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="item in data.items"
        :key="item.rank + item.title"
        class="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3"
      >
        <span
          class="w-6 shrink-0 text-center text-lg font-extrabold tabular-nums"
          :class="(item.rank ?? 0) <= 3 ? 'text-primary' : 'text-muted-foreground/50'"
        >
          {{ item.rank }}
        </span>
        <BookCover :book="item" class="w-12 shrink-0 shadow-sm" />
        <div class="min-w-0 flex-1">
          <p class="line-clamp-2 text-[14px] font-bold leading-snug">{{ item.title }}</p>
          <p class="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground">
            {{ item.author }}
          </p>
        </div>
        <button
          class="flex shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-bold transition-all active:scale-95"
          :class="
            ownedKeys.has(key(item))
              ? 'bg-secondary text-muted-foreground'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          "
          :disabled="ownedKeys.has(key(item)) || adding === key(item)"
          @click="add(item)"
        >
          <component :is="ownedKeys.has(key(item)) ? Check : Plus" class="size-4" />
          {{ ownedKeys.has(key(item)) ? "담김" : "담기" }}
        </button>
      </div>
    </div>

    <p v-if="!pending && data.items.length" class="mt-5 text-center text-[12px] text-muted-foreground/70">
      베스트셀러 데이터: 알라딘 제공
    </p>
  </div>
</template>

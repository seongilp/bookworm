<script setup lang="ts">
import { BookMarked, Quote as QuoteIcon, Heart, Hash } from "lucide-vue-next";
import type { Stats } from "~/types";

const api = useApi();
const { data: stats, pending } = await useAsyncData<Stats>(
  "stats",
  () => api.getStats(),
  {
    default: () => ({
      total_books: 0,
      total_quotes: 0,
      total_favorites: 0,
      reading_status: { want: 0, reading: 0, done: 0 },
      top_tags: [],
    }),
  },
);

const cards = computed(() => [
  { label: "수집한 문장", value: stats.value.total_quotes, icon: QuoteIcon },
  { label: "내 책장", value: stats.value.total_books, icon: BookMarked },
  { label: "즐겨찾기", value: stats.value.total_favorites, icon: Heart },
]);

const readingCards = computed(() => [
  { label: "읽고 싶은", value: stats.value.reading_status.want },
  { label: "읽는 중", value: stats.value.reading_status.reading },
  { label: "다 읽음", value: stats.value.reading_status.done },
]);

const maxTag = computed(() =>
  Math.max(1, ...stats.value.top_tags.map((t) => t.count)),
);
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-extrabold tracking-tight">기록</h1>
      <p class="mt-1.5 text-sm text-muted-foreground">
        나의 문장수집 발자취를 돌아봐요
      </p>
    </div>

    <div v-if="pending" class="h-32 animate-pulse rounded-2xl bg-muted" />

    <template v-else>
      <!-- 요약 카드 -->
      <div class="mb-4 grid grid-cols-3 gap-3">
        <UiCard
          v-for="c in cards"
          :key="c.label"
          class="flex flex-col items-center justify-center gap-2 py-5"
        >
          <component :is="c.icon" class="size-5 text-muted-foreground" />
          <span class="text-2xl font-extrabold tracking-tight">{{
            c.value
          }}</span>
          <span class="text-[12px] font-medium text-muted-foreground">{{
            c.label
          }}</span>
        </UiCard>
      </div>

      <!-- 독서 상태 -->
      <UiCard class="mb-4 flex items-stretch divide-x divide-border/70 p-0">
        <div
          v-for="r in readingCards"
          :key="r.label"
          class="flex flex-1 flex-col items-center justify-center gap-1 py-4"
        >
          <span class="text-xl font-extrabold tracking-tight">{{ r.value }}</span>
          <span class="text-[12px] font-medium text-muted-foreground">{{ r.label }}</span>
        </div>
      </UiCard>

      <!-- 자주 쓴 태그 -->
      <UiCard class="p-5">
        <h2 class="mb-4 flex items-center gap-1.5 text-[15px] font-bold">
          <Hash class="size-4 text-muted-foreground" />
          자주 쓴 태그
        </h2>

        <div v-if="!stats.top_tags.length" class="py-6 text-center">
          <p class="text-sm text-muted-foreground">아직 태그가 없어요</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="t in stats.top_tags"
            :key="t.tag"
            class="flex items-center gap-3"
          >
            <span class="w-20 shrink-0 truncate text-[13px] font-medium"
              >#{{ t.tag }}</span
            >
            <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                class="h-full rounded-full bg-primary transition-all"
                :style="{ width: `${(t.count / maxTag) * 100}%` }"
              />
            </div>
            <span
              class="w-6 shrink-0 text-right text-[13px] font-semibold text-muted-foreground"
              >{{ t.count }}</span
            >
          </div>
        </div>
      </UiCard>
    </template>
  </div>
</template>

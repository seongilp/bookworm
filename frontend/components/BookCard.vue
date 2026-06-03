<script setup lang="ts">
import { Quote as QuoteIcon } from "lucide-vue-next";
import type { Book } from "~/types";

defineProps<{ book: Book }>();
</script>

<template>
  <NuxtLink
    :to="`/books/${book.id}`"
    class="group flex flex-col rounded-2xl border border-border/70 bg-card p-3 transition-all hover:border-border hover:shadow-sm"
  >
    <div class="relative">
      <BookCover :book="book" class="w-full shadow-sm" />
      <div class="absolute left-2 top-2">
        <UiStatusBadge :status="book.status" small />
      </div>
    </div>

    <div class="mt-3 flex flex-1 flex-col px-0.5">
      <h3 class="line-clamp-2 text-[14px] font-bold leading-snug tracking-tight">
        {{ book.title }}
      </h3>
      <p
        v-if="book.author"
        class="mt-0.5 line-clamp-1 text-[12px] text-muted-foreground"
      >
        {{ book.author }}
      </p>

      <!-- 별점 -->
      <div v-if="book.rating > 0" class="mt-2">
        <UiRating :model-value="book.rating" readonly :size="13" />
      </div>

      <!-- 읽는 중 진행률 -->
      <div v-if="book.status === 'reading' && book.progress !== null" class="mt-2">
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-primary"
            :style="{ width: `${book.progress}%` }"
          />
        </div>
        <span class="mt-1 block text-[11px] text-muted-foreground"
          >{{ book.progress }}%</span
        >
      </div>

      <!-- 문장 수 -->
      <div
        v-if="book.quote_count > 0"
        class="mt-auto flex items-center gap-1 pt-2 text-[12px] text-muted-foreground"
      >
        <QuoteIcon class="size-3" />
        문장 {{ book.quote_count }}
      </div>
    </div>
  </NuxtLink>
</template>

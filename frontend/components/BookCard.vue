<script setup lang="ts">
import { Quote as QuoteIcon, ChevronRight } from "lucide-vue-next";
import type { Book } from "~/types";

defineProps<{ book: Book }>();
</script>

<template>
  <NuxtLink
    :to="`/books/${book.id}`"
    class="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-3 transition-all hover:border-border hover:shadow-sm lg:p-4"
  >
    <BookCover :book="book" class="w-14 shrink-0 shadow-sm lg:w-16" />

    <div class="min-w-0 flex-1">
      <div class="mb-1 flex items-center gap-2">
        <UiStatusBadge :status="book.status" small />
        <UiRating v-if="book.rating > 0" :model-value="book.rating" readonly :size="13" />
      </div>
      <h3 class="truncate text-[15px] font-bold tracking-tight lg:text-base">
        {{ book.title }}
      </h3>
      <p class="truncate text-[13px] text-muted-foreground">
        {{ book.author }}{{ book.publisher ? ` · ${book.publisher}` : "" }}
      </p>

      <!-- 읽는 중 진행률 -->
      <div
        v-if="book.status === 'reading' && book.progress !== null"
        class="mt-2 flex items-center gap-2"
      >
        <div class="h-1.5 max-w-48 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            class="h-full rounded-full bg-primary"
            :style="{ width: `${book.progress}%` }"
          />
        </div>
        <span class="shrink-0 text-[11px] text-muted-foreground">{{ book.progress }}%</span>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-2 text-muted-foreground">
      <span
        v-if="book.quote_count > 0"
        class="hidden items-center gap-1 text-[12px] sm:flex"
      >
        <QuoteIcon class="size-3.5" />{{ book.quote_count }}
      </span>
      <ChevronRight class="size-5 transition-transform group-hover:translate-x-0.5" />
    </div>
  </NuxtLink>
</template>

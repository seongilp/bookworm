<script setup lang="ts">
import { Heart, Trash2, BookOpen } from "lucide-vue-next";
import type { Quote } from "~/types";

const props = defineProps<{ quote: Quote; showBook?: boolean }>();
const emit = defineEmits<{
  (e: "toggle-favorite", q: Quote): void;
  (e: "delete", q: Quote): void;
}>();
</script>

<template>
  <UiCard class="group p-5 transition-shadow hover:shadow-sm">
    <!-- 문장 본문 -->
    <p class="text-[15px] leading-[1.75] font-medium tracking-tight">
      <span class="mr-0.5 text-2xl leading-none text-muted-foreground/50">“</span
      >{{ quote.content
      }}<span class="ml-0.5 text-2xl leading-none text-muted-foreground/50"
        >”</span
      >
    </p>

    <!-- 메모 -->
    <p
      v-if="quote.memo"
      class="mt-3 rounded-xl bg-muted px-3.5 py-2.5 text-[13px] leading-relaxed text-muted-foreground"
    >
      {{ quote.memo }}
    </p>

    <!-- 태그 -->
    <div v-if="quote.tags.length" class="mt-3 flex flex-wrap gap-1.5">
      <UiBadge v-for="tag in quote.tags" :key="tag" variant="primary"
        >#{{ tag }}</UiBadge
      >
    </div>

    <!-- 하단: 출처 + 액션 -->
    <div class="mt-4 flex items-center justify-between border-t border-border/60 pt-3.5">
      <div class="flex min-w-0 items-center gap-1.5 text-[13px] text-muted-foreground">
        <BookOpen class="size-3.5 shrink-0" />
        <span v-if="showBook" class="truncate font-medium text-foreground/80">{{
          quote.book_title
        }}</span>
        <span v-if="showBook && quote.book_author" class="truncate"
          >· {{ quote.book_author }}</span
        >
        <span v-if="quote.page" class="shrink-0">{{
          showBook ? `· p.${quote.page}` : `p.${quote.page}`
        }}</span>
      </div>

      <div class="flex shrink-0 items-center gap-0.5">
        <button
          aria-label="즐겨찾기"
          class="rounded-full p-2 transition-colors hover:bg-accent"
          @click="emit('toggle-favorite', quote)"
        >
          <Heart
            class="size-[18px] transition-colors"
            :class="
              quote.is_favorite
                ? 'fill-primary text-primary'
                : 'text-muted-foreground'
            "
          />
        </button>
        <button
          aria-label="삭제"
          class="rounded-full p-2 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          @click="emit('delete', quote)"
        >
          <Trash2 class="size-[18px]" />
        </button>
      </div>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { Quote as QuoteIcon, BookOpen } from "lucide-vue-next";
import type { Quote } from "~/types";

defineProps<{ quotes: Quote[]; title?: string }>();

// 카드마다 또렷한 블루 그라데이션을 번갈아 적용 (라이트/다크 자동 대응)
const gradients = [
  "from-primary/45 via-primary/20 to-primary/5",
  "from-primary/10 via-primary/30 to-primary/50",
  "from-primary/40 via-primary/15 to-primary/30",
];
</script>

<template>
  <section v-if="quotes.length">
    <div class="mb-3 flex items-center gap-1.5 px-0.5">
      <QuoteIcon class="size-4 text-primary" />
      <h2 class="text-[15px] font-bold tracking-tight">{{ title ?? "다시 보는 문장" }}</h2>
    </div>

    <div
      class="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <NuxtLink
        v-for="(q, i) in quotes"
        :key="q.id"
        :to="`/books/${q.book_id}`"
        class="flex aspect-[5/3] w-[80%] shrink-0 snap-start flex-col justify-between rounded-3xl border border-border/60 bg-gradient-to-br p-5 transition-shadow hover:shadow-md sm:w-[360px]"
        :class="gradients[i % gradients.length]"
      >
        <p
          class="line-clamp-4 text-[16px] font-semibold leading-relaxed tracking-tight"
        >
          <span class="mr-0.5 text-xl leading-none text-primary/50">“</span
          >{{ q.content
          }}<span class="ml-0.5 text-xl leading-none text-primary/50">”</span>
        </p>
        <div
          class="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground"
        >
          <BookOpen class="size-3.5 shrink-0" />
          <span class="truncate text-foreground/80">{{ q.book_title }}</span>
          <span v-if="q.page" class="shrink-0">· p.{{ q.page }}</span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

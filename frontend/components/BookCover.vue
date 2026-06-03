<script setup lang="ts">
import { ref } from "vue";
import type { Book } from "~/types";

const props = withDefaults(
  defineProps<{ book: Pick<Book, "title" | "cover_url">; class?: string }>(),
  {},
);
const failed = ref(false);
</script>

<template>
  <div
    class="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted"
    :class="$props.class"
  >
    <img
      v-if="book.cover_url && !failed"
      :src="book.cover_url"
      :alt="book.title"
      loading="lazy"
      class="h-full w-full object-cover"
      @error="failed = true"
    />
    <div
      v-else
      class="flex h-full w-full items-center justify-center bg-foreground p-1 text-center font-bold leading-tight text-background"
    >
      <span class="line-clamp-3 text-[0.7em]">{{ book.title }}</span>
    </div>
  </div>
</template>

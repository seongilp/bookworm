<script setup lang="ts">
import { computed } from "vue";
import type { BookStatus } from "~/types";
import { STATUS_META } from "~/types";

const props = defineProps<{ status: BookStatus; small?: boolean }>();

const cls = computed(() => {
  const map: Record<BookStatus, string> = {
    want: "bg-secondary text-muted-foreground",
    reading: "bg-primary/10 text-primary",
    done: "bg-foreground text-background",
  };
  return map[props.status];
});
</script>

<template>
  <span
    class="inline-flex items-center rounded-full font-semibold"
    :class="[cls, small ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs']"
  >
    {{ STATUS_META[status].short }}
  </span>
</template>

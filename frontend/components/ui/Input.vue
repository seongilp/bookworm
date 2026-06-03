<script setup lang="ts">
import { cn } from "~/lib/utils";

defineProps<{ class?: string }>();
const model = defineModel<string | number>();
</script>

<template>
  <input
    v-model="model"
    :class="
      cn(
        'flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
        $props.class,
      )
    "
  />
</template>

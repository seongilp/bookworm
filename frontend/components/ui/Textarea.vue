<script setup lang="ts">
import { cn } from "~/lib/utils";

defineProps<{ class?: string }>();
const model = defineModel<string>();
</script>

<template>
  <textarea
    v-model="model"
    :class="
      cn(
        'flex min-h-24 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm leading-relaxed transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-foreground/25 focus-visible:ring-2 focus-visible:ring-foreground/[0.05] disabled:cursor-not-allowed disabled:opacity-50 resize-none',
        $props.class,
      )
    "
  />
</template>

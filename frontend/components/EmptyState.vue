<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-20 text-center">
    <div
      class="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted text-3xl"
    >
      <slot name="icon">📖</slot>
    </div>
    <h3 class="text-base font-bold tracking-tight">{{ title }}</h3>
    <p v-if="description" class="mt-1.5 max-w-xs text-sm text-muted-foreground">
      {{ description }}
    </p>
    <div class="mt-5">
      <slot name="action" />
    </div>
  </div>
</template>

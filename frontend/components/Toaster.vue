<script setup lang="ts">
import { Check, AlertCircle } from "lucide-vue-next";
const { toasts } = useToast();
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4"
  >
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-3 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto flex items-center gap-2.5 rounded-2xl bg-foreground px-4 py-3 text-sm font-medium text-background shadow-lg"
      >
        <Check v-if="t.type === 'success'" class="size-4" />
        <AlertCircle v-else class="size-4" />
        {{ t.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

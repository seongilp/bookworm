<script setup lang="ts">
import { Plus } from "lucide-vue-next";
withDefaults(defineProps<{ label?: string }>(), { label: "문장 수집" });
defineEmits<{ (e: "click"): void }>();
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 bottom-24 z-40">
    <div class="mx-auto flex max-w-2xl justify-end px-5">
      <button
        class="pointer-events-auto flex h-14 items-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-95"
        @click="$emit('click')"
      >
        <Plus class="size-5" :stroke-width="2.5" />
        {{ label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { X } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{ title?: string; description?: string; size?: "md" | "lg" }>(),
  { size: "md" },
);
const open = defineModel<boolean>("open", { default: false });

const maxW = computed(() => (props.size === "lg" ? "max-w-2xl" : "max-w-lg"));

// 모달이 열려 있는 동안 배경 스크롤 잠금
watch(open, (v) => {
  if (import.meta.client) {
    document.body.style.overflow = v ? "hidden" : "";
  }
});

function close() {
  open.value = false;
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") close();
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        @keydown="onKey"
      >
        <!-- 오버레이 -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          @click="close"
        />

        <!-- 콘텐츠 -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-4 sm:translate-y-0 sm:scale-95 opacity-0"
          enter-to-class="translate-y-0 sm:scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-4 opacity-0"
          appear
        >
          <div
            v-if="open"
            role="dialog"
            aria-modal="true"
            :class="[
              'relative z-10 m-0 w-full rounded-t-3xl border border-border bg-card p-6 shadow-xl sm:m-4 sm:rounded-3xl',
              maxW,
            ]"
          >
            <div class="mb-5 flex items-start justify-between gap-4">
              <div class="space-y-1">
                <h2 v-if="title" class="text-lg font-bold tracking-tight">
                  {{ title }}
                </h2>
                <p v-if="description" class="text-sm text-muted-foreground">
                  {{ description }}
                </p>
              </div>
              <button
                aria-label="닫기"
                class="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                @click="close"
              >
                <X class="size-5" />
              </button>
            </div>
            <slot />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

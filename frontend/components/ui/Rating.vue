<script setup lang="ts">
import { Star } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{ modelValue?: number; readonly?: boolean; size?: number }>(),
  { modelValue: 0, readonly: false, size: 20 },
);
const emit = defineEmits<{ (e: "update:modelValue", v: number): void }>();

function set(n: number) {
  if (props.readonly) return;
  // 같은 별을 다시 누르면 해제
  emit("update:modelValue", props.modelValue === n ? 0 : n);
}
</script>

<template>
  <div class="flex items-center gap-0.5">
    <button
      v-for="n in 5"
      :key="n"
      type="button"
      :disabled="readonly"
      :class="readonly ? 'cursor-default' : 'cursor-pointer'"
      :aria-label="`${n}점`"
      @click="set(n)"
    >
      <Star
        :style="{ width: `${size}px`, height: `${size}px` }"
        :class="
          n <= modelValue
            ? 'fill-foreground text-foreground'
            : 'text-muted-foreground/35'
        "
        :stroke-width="1.5"
      />
    </button>
  </div>
</template>

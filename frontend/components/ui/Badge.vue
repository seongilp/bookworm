<script setup lang="ts">
import { computed } from "vue";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        primary: "bg-primary/10 text-primary",
        outline: "border border-border text-muted-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const props = defineProps<{
  variant?: VariantProps<typeof badgeVariants>["variant"];
  class?: string;
}>();

const classes = computed(() =>
  cn(badgeVariants({ variant: props.variant }), props.class),
);
</script>

<template>
  <span :class="classes"><slot /></span>
</template>

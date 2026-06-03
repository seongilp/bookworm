<script setup lang="ts">
import { Moon, Sun } from "lucide-vue-next";
import { useColorMode } from "@vueuse/core";

const mode = useColorMode({
  attribute: "class",
  modes: { light: "", dark: "dark" },
});

const toggle = () => {
  mode.value = mode.value === "dark" ? "light" : "dark";
};
</script>

<template>
  <button
    aria-label="테마 전환"
    class="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    @click="toggle"
  >
    <Moon v-if="mode === 'light'" class="size-5" />
    <Sun v-else class="size-5" />
  </button>
</template>

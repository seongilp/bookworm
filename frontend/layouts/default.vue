<script setup lang="ts">
import { Home, Library, Heart, BarChart3 } from "lucide-vue-next";

const route = useRoute();

const tabs = [
  { to: "/", label: "홈", icon: Home },
  { to: "/books", label: "책장", icon: Library },
  { to: "/favorites", label: "즐겨찾기", icon: Heart },
  { to: "/stats", label: "통계", icon: BarChart3 },
];

const isActive = (to: string) =>
  to === "/" ? route.path === "/" : route.path.startsWith(to);
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-2xl flex-col">
    <!-- 상단 헤더 -->
    <header
      class="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md"
    >
      <div class="flex h-16 items-center justify-between px-5">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span
            class="flex size-8 items-center justify-center rounded-xl bg-foreground text-background text-sm font-black"
            >책</span
          >
          <span class="text-[17px] font-bold tracking-tight">문장수집</span>
        </NuxtLink>
        <ClientOnly>
          <DarkToggle />
        </ClientOnly>
      </div>
    </header>

    <!-- 본문 -->
    <main class="flex-1 px-5 pb-28 pt-6">
      <slot />
    </main>

    <!-- 하단 탭바 (토스 스타일) -->
    <nav
      class="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-md"
    >
      <div class="mx-auto flex max-w-2xl items-stretch">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors"
          :class="
            isActive(tab.to)
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          "
        >
          <component :is="tab.icon" class="size-[22px]" :stroke-width="2.2" />
          {{ tab.label }}
        </NuxtLink>
      </div>
      <div class="h-[env(safe-area-inset-bottom)]" />
    </nav>
  </div>
</template>

<script setup lang="ts">
import { Home, Library, TrendingUp, Heart, BarChart3 } from "lucide-vue-next";

const route = useRoute();

const tabs = [
  { to: "/", label: "홈", icon: Home },
  { to: "/books", label: "책장", icon: Library },
  { to: "/bestsellers", label: "베스트셀러", icon: TrendingUp },
  { to: "/favorites", label: "즐겨찾기", icon: Heart },
  { to: "/stats", label: "통계", icon: BarChart3 },
];

const isActive = (to: string) =>
  to === "/" ? route.path === "/" : route.path.startsWith(to);
</script>

<template>
  <div class="min-h-screen lg:flex">
    <!-- 데스크톱: 좌측 사이드바 -->
    <aside
      class="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border/60 bg-background px-4 py-6 md:flex"
    >
      <NuxtLink to="/" class="mb-8 flex items-center gap-2.5 px-2">
        <span
          class="flex size-9 items-center justify-center rounded-xl bg-primary text-base font-black text-primary-foreground"
          >책</span
        >
        <span class="text-[18px] font-bold tracking-tight">문장수집</span>
      </NuxtLink>

      <nav class="flex flex-1 flex-col gap-1">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors"
          :class="
            isActive(tab.to)
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          "
        >
          <component :is="tab.icon" class="size-[20px]" :stroke-width="2.2" />
          {{ tab.label }}
        </NuxtLink>
      </nav>

      <div class="px-1">
        <ClientOnly><DarkToggle /></ClientOnly>
      </div>
    </aside>

    <!-- 모바일: 상단 헤더 -->
    <header
      class="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md md:hidden"
    >
      <div class="flex h-16 items-center justify-between px-5">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span
            class="flex size-8 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground"
            >책</span
          >
          <span class="text-[17px] font-bold tracking-tight">문장수집</span>
        </NuxtLink>
        <ClientOnly><DarkToggle /></ClientOnly>
      </div>
    </header>

    <!-- 본문 -->
    <div class="flex-1 md:pl-60">
      <main
        class="mx-auto w-full max-w-5xl px-5 pb-28 pt-6 md:px-10 md:pb-16 md:pt-10"
      >
        <slot />
      </main>
    </div>

    <!-- 모바일: 하단 탭바 -->
    <nav
      class="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 backdrop-blur-md md:hidden"
    >
      <div class="mx-auto flex max-w-2xl items-stretch">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors"
          :class="
            isActive(tab.to)
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          "
        >
          <component :is="tab.icon" class="size-[21px]" :stroke-width="2.2" />
          {{ tab.label }}
        </NuxtLink>
      </div>
      <div class="h-[env(safe-area-inset-bottom)]" />
    </nav>
  </div>
</template>

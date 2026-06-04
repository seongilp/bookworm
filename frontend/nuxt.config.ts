import tailwindcss from "@tailwindcss/vite";
import blockStrayVue from "./vite-block-stray-vue";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  devtools: { enabled: false },
  // GitHub Pages 빌드 시 NUXT_SSR=false 로 SPA 정적 산출 (API는 Cloudflare 호출)
  ssr: process.env.NUXT_SSR !== "false",
  // Cloudflare Pages 풀스택: Nitro 서버 라우트가 Pages Functions로 배포된다.
  nitro: {
    preset: process.env.NITRO_PRESET || "cloudflare-pages",
  },
  // 로컬 `nuxt dev`에서 wrangler.toml의 D1 바인딩(Miniflare)을 주입한다.
  modules: ["nitro-cloudflare-dev"],
  css: ["~/assets/css/tailwind.css"],
  // 빌드와 무관한 디렉터리 변경으로 dev 서버가 재로딩되지 않도록 무시한다.
  ignore: ["**/.gstack/**", "**/*.db", "**/*.db-journal"],
  vite: {
    plugins: [blockStrayVue(), tailwindcss()],
    server: {
      watch: {
        ignored: ["**/.gstack/**", "**/*.db", "**/*.db-*"],
      },
    },
    // 런타임에 새 의존성을 발견해 전체 새로고침(상태 초기화)하는 것을 막기 위해
    // 클라이언트에서 쓰는 의존성을 서버 시작 시 미리 최적화한다.
    optimizeDeps: {
      include: [
        "reka-ui",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
        "lucide-vue-next",
        "@vueuse/core",
      ],
    },
  },
  runtimeConfig: {
    // 외부 도서 API 키 (서버 전용). 없으면 키 불필요한 구글북스로 폴백.
    aladinTtbKey: process.env.NUXT_ALADIN_TTB_KEY || "",
    kakaoRestKey: process.env.NUXT_KAKAO_REST_KEY || "",
    googleBooksKey: process.env.NUXT_GOOGLE_BOOKS_KEY || "",
    public: {
      // 같은 앱의 Nitro 라우트를 호출하므로 상대경로(빈 base)를 쓴다.
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "",
    },
  },
  app: {
    head: {
      title: "책벌레 · 문장수집",
      htmlAttrs: { lang: "ko" },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "책에서 만난 좋은 문장을 모으는 가장 단순한 방법",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "apple-touch-icon", href: "/favicon.svg" },
        { rel: "mask-icon", href: "/favicon.svg", color: "#191f28" },
      ],
    },
  },
});

import type { Plugin } from "vite";

/**
 * 일부 브라우저 확장 프로그램은 페이지에 대고 `/components/*.vue` 같은
 * 절대경로를 멋대로 요청한다. Nuxt는 컴포넌트를 `/_nuxt/...` 가상 모듈로
 * 제공하므로 이런 루트 경로 `.vue` 요청은 항상 존재하지 않는 헛요청이며,
 * Vite의 vue 플러그인이 변환을 시도하다 ENOENT로 빨간 에러 오버레이를 띄운다.
 *
 * 실제 앱 동작과 무관한 노이즈이므로 dev 서버 단에서 가로채 204로 응답한다.
 * (정상적인 Nuxt 컴포넌트 요청은 이 경로 패턴으로 오지 않으므로 안전하다.)
 */
export default function blockStrayVue(): Plugin {
  const stray = /^\/components\/.*\.vue(\?|$)/;
  return {
    name: "block-stray-vue-requests",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && stray.test(req.url)) {
          res.statusCode = 204;
          res.end();
          return;
        }
        next();
      });
    },
  };
}

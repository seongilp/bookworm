/**
 * /api 응답에 CORS 허용을 추가한다.
 * GitHub Pages(다른 도메인)에서 호스팅되는 SPA가 이 Cloudflare API를 호출할 수 있게 한다.
 */
export default defineEventHandler((event) => {
  if (!event.path.startsWith("/api")) return;

  setHeader(event, "Access-Control-Allow-Origin", "*");
  setHeader(event, "Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  setHeader(event, "Access-Control-Allow-Headers", "Content-Type");
  setHeader(event, "Access-Control-Max-Age", "86400");

  if (event.method === "OPTIONS") {
    setResponseStatus(event, 204);
    return "";
  }
});

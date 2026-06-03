import type { H3Event } from "h3";
import type { ZodType } from "zod";

/** 요청 본문을 zod 스키마로 검증한다. 실패 시 422와 첫 에러 메시지를 반환. */
export async function validateBody<T>(event: H3Event, schema: ZodType<T>): Promise<T> {
  const body = await readBody(event);
  const result = schema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    throw createError({
      statusCode: 422,
      statusMessage: first?.message ?? "잘못된 요청입니다.",
    });
  }
  return result.data;
}

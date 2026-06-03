import { z } from "zod";

export const BOOK_STATUSES = ["want", "reading", "done"] as const;

export const bookCreateSchema = z.object({
  title: z.string().trim().min(1, "제목은 비어 있을 수 없습니다."),
  author: z.string().trim().default(""),
  status: z.enum(BOOK_STATUSES).default("reading"),
  rating: z.number().int().min(0).max(5).default(0),
  note: z.string().trim().default(""),
  total_pages: z.number().int().positive().nullable().default(null),
  current_page: z.number().int().min(0).nullable().default(null),
  cover_url: z.string().trim().default(""),
  isbn: z.string().trim().default(""),
  publisher: z.string().trim().default(""),
});

export const bookUpdateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  author: z.string().trim().optional(),
  status: z.enum(BOOK_STATUSES).optional(),
  rating: z.number().int().min(0).max(5).optional(),
  note: z.string().trim().optional(),
  total_pages: z.number().int().positive().nullable().optional(),
  current_page: z.number().int().min(0).nullable().optional(),
  cover_url: z.string().trim().optional(),
  isbn: z.string().trim().optional(),
  publisher: z.string().trim().optional(),
});

export const quoteCreateSchema = z.object({
  book_id: z.number().int(),
  content: z.string().trim().min(1, "문장은 비어 있을 수 없습니다."),
  page: z.number().int().positive().nullable().default(null),
  memo: z.string().trim().default(""),
  tags: z.array(z.string()).default([]),
});

export const quoteUpdateSchema = z.object({
  content: z.string().trim().min(1).optional(),
  page: z.number().int().positive().nullable().optional(),
  memo: z.string().trim().optional(),
  tags: z.array(z.string()).optional(),
  is_favorite: z.boolean().optional(),
});

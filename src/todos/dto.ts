import * as z from 'zod';

// リクエストDTO用のスキーマ
export const getTodoParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  completed: z.boolean().optional().default(false),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  completed: z.boolean().optional(),
});

// 型定義
export type GetTodoParam = z.infer<typeof getTodoParamSchema>;
export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

// レスポンスDTO
export interface TodoResponse {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface DeleteTodoResponse {
  message: string;
}

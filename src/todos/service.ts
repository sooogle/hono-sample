import { HTTPException } from 'hono/http-exception';
import { db } from '../db';

import type { CreateTodoInput, UpdateTodoInput, TodoResponse } from './dto';

/**
 * すべてのTODOを取得
 */
export async function getAllTodos(): Promise<TodoResponse[]> {
  return await db.selectFrom('todos').selectAll().execute();
}

/**
 * 特定のTODOを取得
 */
export async function getTodoById(id: number): Promise<TodoResponse> {
  const todo = await db.selectFrom('todos').selectAll().where('id', '=', id).executeTakeFirst();
  if (!todo) {
    throw new HTTPException(404, { message: 'Todo not found' });
  }

  return todo;
}

/**
 * 新しいTODOを作成
 */
export async function createTodo(input: CreateTodoInput): Promise<TodoResponse> {
  const newTodo = await db
    .insertInto('todos')
    .values({
      title: input.title,
      description: input.description ?? null,
      completed: input.completed ?? false,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return newTodo;
}

/**
 * TODOを更新
 */
export async function updateTodo(id: number, input: UpdateTodoInput): Promise<TodoResponse> {
  const updatedTodo = await db
    .updateTable('todos')
    .set({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.completed !== undefined && { completed: input.completed }),
    })
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();

  if (!updatedTodo) {
    throw new HTTPException(404, { message: 'Todo not found' });
  }

  return updatedTodo;
}

/**
 * TODOを削除
 */
export async function deleteTodo(id: number): Promise<void> {
  const deletedTodo = await db
    .deleteFrom('todos')
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst();

  if (!deletedTodo) {
    throw new HTTPException(404, { message: 'Todo not found' });
  }
}

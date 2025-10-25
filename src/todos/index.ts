import { Hono } from 'hono';
import { validator } from 'hono/validator';
import * as todoService from './service';
import { getTodoParamSchema, createTodoSchema, updateTodoSchema } from './dto';

const app = new Hono();

// GET /todos - すべてのTODOを取得
app.get('/', async (c) => {
  const todos = await todoService.getAllTodos();
  return c.json(todos);
});

// GET /todos/:id - 特定のTODOを取得
app.get(
  '/:id',
  validator('param', (value, c) => {
    const parsed = getTodoParamSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ message: 'リクエストが不正です' }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { id } = c.req.valid('param');
    const todo = await todoService.getTodoById(id);
    return c.json(todo);
  }
);

// POST /todos - 新しいTODOを作成
app.post(
  '/',
  validator('json', (value, c) => {
    const parsed = createTodoSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ message: 'リクエストが不正です', errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const input = c.req.valid('json');
    const newTodo = await todoService.createTodo(input);
    return c.json(newTodo, 201);
  }
);

// PUT /todos/:id - TODOを更新
app.put(
  '/:id',
  validator('param', (value, c) => {
    const parsed = getTodoParamSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ message: 'リクエストが不正です' }, 400);
    }
    return parsed.data;
  }),
  validator('json', (value, c) => {
    const parsed = updateTodoSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ message: 'リクエストが不正です', errors: parsed.error.issues }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { id } = c.req.valid('param');
    const input = c.req.valid('json');
    const updatedTodo = await todoService.updateTodo(id, input);
    return c.json(updatedTodo);
  }
);

// DELETE /todos/:id - TODOを削除
app.delete(
  '/:id',
  validator('param', (value, c) => {
    const parsed = getTodoParamSchema.safeParse(value);
    if (!parsed.success) {
      return c.json({ message: 'リクエストが不正です' }, 400);
    }
    return parsed.data;
  }),
  async (c) => {
    const { id } = c.req.valid('param');
    await todoService.deleteTodo(id);
    return c.json({ message: 'Todo deleted successfully' });
  }
);

export default app;

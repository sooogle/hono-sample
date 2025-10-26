import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { db } from '../src/db';
import { createApp } from '../src/index';

// テスト用のHonoアプリケーションを作成
const app = createApp();

describe('Todos E2E Tests', () => {
  // テストデータを保存する変数
  let createdTodoId: number;

  beforeEach(async () => {
    // テスト前にテストデータをクリーンアップ
    await db.deleteFrom('todos').execute();
  });

  afterEach(async () => {
    // テスト後にテストデータをクリーンアップ
    await db.deleteFrom('todos').execute();
  });

  describe('POST /api/v1/todos', () => {
    it('新しいTODOを作成できる', async () => {
      const res = await app.request('/api/v1/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Todo',
          description: 'Test Description',
          completed: false,
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data).toHaveProperty('id');
      expect(data.title).toBe('Test Todo');
      expect(data.description).toBe('Test Description');
      expect(data.completed).toBe(false);
      expect(data).toHaveProperty('created_at');
      expect(data).toHaveProperty('updated_at');

      createdTodoId = data.id;
    });

    it('descriptionとcompletedは省略可能', async () => {
      const res = await app.request('/api/v1/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Minimal Todo',
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.title).toBe('Minimal Todo');
      expect(data.description).toBe(null);
      expect(data.completed).toBe(false);
    });

    it('titleが空の場合は400エラー', async () => {
      const res = await app.request('/api/v1/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty('message');
    });

    it('titleがない場合は400エラー', async () => {
      const res = await app.request('/api/v1/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'No title',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty('message');
    });
  });

  describe('GET /api/v1/todos', () => {
    beforeEach(async () => {
      // テストデータを投入
      await db
        .insertInto('todos')
        .values([
          { title: 'Todo 1', description: 'Description 1', completed: false },
          { title: 'Todo 2', description: 'Description 2', completed: true },
          { title: 'Todo 3', description: null, completed: false },
        ])
        .execute();
    });

    it('すべてのTODOを取得できる', async () => {
      const res = await app.request('/api/v1/todos');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('title');
      expect(data[0]).toHaveProperty('description');
      expect(data[0]).toHaveProperty('completed');
    });

    it('TODOが存在しない場合は空配列を返す', async () => {
      // テストデータを削除
      await db.deleteFrom('todos').execute();

      const res = await app.request('/api/v1/todos');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });
  });

  describe('GET /api/v1/todos/:id', () => {
    beforeEach(async () => {
      // テストデータを投入
      const result = await db
        .insertInto('todos')
        .values({ title: 'Test Todo', description: 'Test Description', completed: false })
        .returningAll()
        .executeTakeFirstOrThrow();

      createdTodoId = result.id;
    });

    it('指定したIDのTODOを取得できる', async () => {
      const res = await app.request(`/api/v1/todos/${createdTodoId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(createdTodoId);
      expect(data.title).toBe('Test Todo');
      expect(data.description).toBe('Test Description');
      expect(data.completed).toBe(false);
    });

    it('存在しないIDの場合は404エラー', async () => {
      const res = await app.request('/api/v1/todos/99999');

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toHaveProperty('message');
    });

    it('無効なIDの場合は400エラー', async () => {
      const res = await app.request('/api/v1/todos/invalid');

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty('message');
    });

    it('負の数のIDの場合は400エラー', async () => {
      const res = await app.request('/api/v1/todos/-1');

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty('message');
    });
  });

  describe('PUT /api/v1/todos/:id', () => {
    beforeEach(async () => {
      // テストデータを投入
      const result = await db
        .insertInto('todos')
        .values({ title: 'Original Title', description: 'Original Description', completed: false })
        .returningAll()
        .executeTakeFirstOrThrow();

      createdTodoId = result.id;
    });

    it('TODOを更新できる', async () => {
      const res = await app.request(`/api/v1/todos/${createdTodoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Updated Title',
          description: 'Updated Description',
          completed: true,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(createdTodoId);
      expect(data.title).toBe('Updated Title');
      expect(data.description).toBe('Updated Description');
      expect(data.completed).toBe(true);
    });

    it('一部のフィールドのみ更新できる', async () => {
      const res = await app.request(`/api/v1/todos/${createdTodoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Updated Title',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.title).toBe('Updated Title');
      expect(data.description).toBe('Original Description'); // 変更なし
      expect(data.completed).toBe(false); // 変更なし
    });

    it('descriptionをnullに更新できる', async () => {
      const res = await app.request(`/api/v1/todos/${createdTodoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: null,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.description).toBe(null);
    });

    it('存在しないIDの場合は404エラー', async () => {
      const res = await app.request('/api/v1/todos/99999', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Updated Title',
        }),
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toHaveProperty('message');
    });

    it('titleが空文字列の場合は400エラー', async () => {
      const res = await app.request(`/api/v1/todos/${createdTodoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: '',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty('message');
    });
  });

  describe('DELETE /api/v1/todos/:id', () => {
    beforeEach(async () => {
      // テストデータを投入
      const result = await db
        .insertInto('todos')
        .values({ title: 'Todo to Delete', description: 'Will be deleted', completed: false })
        .returningAll()
        .executeTakeFirstOrThrow();

      createdTodoId = result.id;
    });

    it('TODOを削除できる', async () => {
      const res = await app.request(`/api/v1/todos/${createdTodoId}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('message');

      // 削除されたことを確認
      const checkRes = await app.request(`/api/v1/todos/${createdTodoId}`);
      expect(checkRes.status).toBe(404);
    });

    it('存在しないIDの場合は404エラー', async () => {
      const res = await app.request('/api/v1/todos/99999', {
        method: 'DELETE',
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toHaveProperty('message');
    });

    it('無効なIDの場合は400エラー', async () => {
      const res = await app.request('/api/v1/todos/invalid', {
        method: 'DELETE',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty('message');
    });
  });
});

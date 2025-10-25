import { describe, it, expect } from 'vitest';
import { getTodoParamSchema, createTodoSchema, updateTodoSchema } from '../src/todos/dto';

describe('getTodoParamSchema', () => {
  it('正の整数を受け入れる', () => {
    const result = getTodoParamSchema.safeParse({ id: '123' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(123);
    }
  });

  it('文字列の数値を数値に変換する', () => {
    const result = getTodoParamSchema.safeParse({ id: '42' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(42);
    }
  });

  it('負の数を拒否する', () => {
    const result = getTodoParamSchema.safeParse({ id: '-1' });
    expect(result.success).toBe(false);
  });

  it('ゼロを拒否する', () => {
    const result = getTodoParamSchema.safeParse({ id: '0' });
    expect(result.success).toBe(false);
  });

  it('数値に変換できない文字列を拒否する', () => {
    const result = getTodoParamSchema.safeParse({ id: 'abc' });
    expect(result.success).toBe(false);
  });
});

describe('createTodoSchema', () => {
  it('有効なTODOデータを受け入れる', () => {
    const result = createTodoSchema.safeParse({
      title: 'Test Todo',
      description: 'Test Description',
      completed: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Test Todo');
      expect(result.data.description).toBe('Test Description');
      expect(result.data.completed).toBe(false);
    }
  });

  it('descriptionとcompletedは任意', () => {
    const result = createTodoSchema.safeParse({
      title: 'Test Todo',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Test Todo');
      expect(result.data.completed).toBe(false); // デフォルト値
    }
  });

  it('completedのデフォルト値はfalse', () => {
    const result = createTodoSchema.safeParse({
      title: 'Test Todo',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(false);
    }
  });

  it('descriptionにnullを受け入れる', () => {
    const result = createTodoSchema.safeParse({
      title: 'Test Todo',
      description: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe(null);
    }
  });

  it('titleが空文字列の場合は拒否する', () => {
    const result = createTodoSchema.safeParse({
      title: '',
    });
    expect(result.success).toBe(false);
  });

  it('titleがない場合は拒否する', () => {
    const result = createTodoSchema.safeParse({
      description: 'Test Description',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateTodoSchema', () => {
  it('すべてのフィールドを受け入れる', () => {
    const result = updateTodoSchema.safeParse({
      title: 'Updated Title',
      description: 'Updated Description',
      completed: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Updated Title');
      expect(result.data.description).toBe('Updated Description');
      expect(result.data.completed).toBe(true);
    }
  });

  it('一部のフィールドのみの更新を受け入れる', () => {
    const result = updateTodoSchema.safeParse({
      title: 'Updated Title',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Updated Title');
    }
  });

  it('空のオブジェクトを受け入れる', () => {
    const result = updateTodoSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('descriptionにnullを受け入れる', () => {
    const result = updateTodoSchema.safeParse({
      description: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe(null);
    }
  });

  it('titleが空文字列の場合は拒否する', () => {
    const result = updateTodoSchema.safeParse({
      title: '',
    });
    expect(result.success).toBe(false);
  });
});

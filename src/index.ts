import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { requestId } from 'hono/request-id';
import { logger } from 'hono/logger';
import { HTTPException } from 'hono/http-exception';
import todos from './todos';
import { authMiddleware } from './middleware';

// コンテキストに保存する変数の型定義
type Variables = {
  requestId: string;
  userId: number;
};

export function createApp() {
  const app = new Hono<{ Variables: Variables }>().basePath('/api');

  // Logger Middlewareの設定
  // https://hono.dev/docs/middleware/builtin/logger
  app.use(logger());

  // Request ID Middlewareの設定
  // https://hono.dev/docs/middleware/builtin/request-id
  app.use('*', requestId());

  // 認証ミドルウェアの設定
  app.use('/api/v*', authMiddleware());

  // 404ハンドラーの設定
  app.notFound((c) => c.json({ message: 'Not Found' }, 404));

  // 例外ハンドラーの設定
  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ message: err.message }, err.status);
    }
    return c.json({ message: 'Internal Server Error' }, 500);
  });

  // ハンドラーの登録
  app.get('/health', (c) => c.json({ status: 'ok' }));
  app.route('/v1/todos', todos);

  return app;
}

const app = createApp();
export const handler = handle(app);

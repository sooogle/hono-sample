import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { HTTPException } from 'hono/http-exception';
import { requestId } from 'hono/request-id';
import { PinoLogger, pinoLogger } from 'hono-pino';
import pino from 'pino';
import { authMiddleware } from '@/middleware';
import todos from '@/todos';

// コンテキストに保存する変数の型定義
type Variables = {
  requestId: string;
  userId: number;
  logger: PinoLogger;
};

export type HonoContext = { Variables: Variables };

export function createApp() {
  const app = new Hono<HonoContext>().basePath('/api');

  // Request ID Middlewareの設定
  // https://hono.dev/docs/middleware/builtin/request-id
  app.use('*', requestId());

  // Pino Logger Middlewareの設定（HTTPリクエスト/レスポンスのログ）
  app.use(
    '*',
    pinoLogger({
      pino: {
        messageKey: 'message',
        level: 'debug',
        formatters: {
          level: (label) => ({ level: label.toUpperCase() }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: { colorize: true },
              }
            : undefined,
        base: null,
      },
    })
  );

  // カスタムロガーをコンテキストに追加するミドルウェア
  app.use('*', async (c, next) => {
    const { logger, requestId } = c.var;
    logger.assign({ requestId });
    await next();
  });

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
  app.get('/health', (c) => {
    const { logger } = c.var;
    logger.info('Health check endpoint called');
    return c.json({ status: 'ok' });
  });
  app.route('/v1/todos', todos);

  return app;
}

const app = createApp();
export const handler = handle(app);

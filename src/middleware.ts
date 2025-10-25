import { bearerAuth } from 'hono/bearer-auth';

// Bearer Auth Middlewareをカスタマイズ
// https://hono.dev/docs/middleware/builtin/bearer-auth
export const authMiddleware = () =>
  bearerAuth({
    noAuthenticationHeaderMessage: { message: 'No Authorization Header' },
    invalidAuthenticationHeaderMessage: { message: 'Invalid Token' },
    invalidTokenMessage: { message: 'Unauthorized' },
    verifyToken: async (providedToken, c) => {
      // カスタムロジックでトークンを検証する場合はここに記述
      c.set('userId', 1);
      return true;
    },
  });

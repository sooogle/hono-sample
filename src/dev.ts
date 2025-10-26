import { serve } from '@hono/node-server';
import { createApp } from '@/index';

const app = createApp();
const port = 3000;

console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

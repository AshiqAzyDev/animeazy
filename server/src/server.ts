import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { config } from './config/env.js';
import { logInfo } from './logging.js';

const app = createApp();

serve({ fetch: app.fetch, port: config.port }, (info) => {
  logInfo('server.start', {
    port: info.port,
    mock: config.mockEnabled,
    cors: config.corsOrigins.join('|'),
  });
});

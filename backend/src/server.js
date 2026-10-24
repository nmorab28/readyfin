import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { openDb } from './db/connection.js';

const PORT = Number(process.env.PORT ?? 3001);
const DB_PATH = process.env.READYFIN_DB ?? fileURLToPath(new URL('../data/readyfin.sqlite', import.meta.url));

const db = openDb(DB_PATH);
const server = createApp(db).listen(PORT, () => {
  console.log(JSON.stringify({ level: 'info', event: 'server.started', port: PORT, db: DB_PATH }));
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

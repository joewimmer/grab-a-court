import { PORT } from './config.js';
import { createApp } from './app.js';
import { getDatabase } from './db/index.js';

getDatabase();

const app = createApp();

app.listen(PORT, () => {
  console.log(`Grab A Court API running at http://localhost:${PORT}`);
});

import fs from 'node:fs/promises';
import path from 'node:path';
import { App } from './app.js';

const configPath = path.join(process.cwd(), 'app.config.json');
const raw = await fs
  .readFile(configPath, 'utf8')
  .then(JSON.parse)
  .catch(() => ({}));

const app = new App(raw);
app.start();

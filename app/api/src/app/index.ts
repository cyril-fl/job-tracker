import fs from 'node:fs/promises';
import type { Server } from 'node:http';
import path from 'node:path';

import cors from 'cors';
import type { Express } from 'express';
import express from 'express';

import { Config } from '@config';
import applicationsRouter from '../routes/applications';
import companiesRouter from '../routes/companies';
import locationsRouter from '../routes/locations';
import recruitersRouter from '../routes/recruiters';

const configPath = path.join(process.cwd(), 'app.config.json');
const raw = await fs
  .readFile(configPath, 'utf8')
  .then(JSON.parse)
  .catch(() => ({}));

export class App {
  public server: Express;
  public readonly config: Config;
  private httpServer?: Server;

  constructor(raw: Record<string, unknown> = {}) {
    this.config = new Config(raw);
    this.server = express();
    this.server.use(cors({ origin: this.config.parameters.cors_origin }));
    this.server.use(express.json());
    this.server.use('/api/companies', companiesRouter);
    this.server.use('/api/applications', applicationsRouter);
    this.server.use('/api/locations', locationsRouter);
    this.server.use('/api/recruiters', recruitersRouter);
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      const { port } = this.config.parameters;
      this.httpServer = this.server.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.httpServer) return resolve();
      this.httpServer.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

const app = new App(raw);

for (const signal of ['SIGTERM', 'SIGINT', 'SIGQUIT'] as const) {
  process.on(signal, () => app.stop());
}

export default app;

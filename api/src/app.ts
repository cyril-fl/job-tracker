import type { Server } from 'node:http';
import cors from 'cors';
import type { Express } from 'express';
import express from 'express';

import { Config } from './.config';

export class App {
  server: Express;
  private httpServer?: Server;
  public readonly config: Config;

  constructor(raw: Record<string, unknown> = {}) {
    this.config = new Config(raw);
    this.server = this.init();
  }

  private init(): Express {
    const s = express();

    s.use(cors({ origin: this.config.parameters.cors_origin }));
    s.use(express.json());

    return s;
  }

  private listen(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer = this.server.listen(this.config.parameters.port, () => {
        console.log(`🚀Server started on port: ${this.config.parameters.port}`);
        resolve();
      });
    });
  }

  public start(): Promise<void> {
    return this.listen();
  }

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.httpServer) return resolve();
      this.httpServer.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

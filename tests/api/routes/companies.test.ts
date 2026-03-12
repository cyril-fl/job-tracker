import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const migrationsFolder = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../app/api/src/db/migrations',
);

import * as schema from '../../../app/api/src/db/schema';

let sqlite: InstanceType<typeof Database>;
let testDb: ReturnType<typeof drizzle>;

vi.mock('../../../app/api/src/db', () => ({
  get db() {
    return testDb;
  },
}));

const { default: companiesRouter } = await import('../../../app/api/src/routes/companies');

import type { Server } from 'node:http';
import express from 'express';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  testDb = drizzle(sqlite, { schema });
  migrate(testDb, { migrationsFolder });

  const app = express();
  app.use(express.json());
  app.use('/api/companies', companiesRouter);

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://localhost:${addr.port}`;
      }
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
  sqlite.close();
});

beforeEach(() => {
  sqlite.exec('DELETE FROM applications');
  sqlite.exec('DELETE FROM companies');
});

describe('Companies CRUD', () => {
  it('GET /api/companies returns empty list', async () => {
    const res = await fetch(`${baseUrl}/api/companies`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('POST /api/companies creates a company', async () => {
    const res = await fetch(`${baseUrl}/api/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Acme Corp' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe('Acme Corp');
    expect(body.id).toBeDefined();
  });

  it('POST /api/companies rejects invalid body', async () => {
    const res = await fetch(`${baseUrl}/api/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('PUT /api/companies/:id updates a company', async () => {
    const create = await fetch(`${baseUrl}/api/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Old Name' }),
    });
    const { id } = await create.json();

    const res = await fetch(`${baseUrl}/api/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Name' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('New Name');
  });

  it('PUT /api/companies/:id returns 404 for unknown id', async () => {
    const res = await fetch(`${baseUrl}/api/companies/9999`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/companies/:id deletes a company', async () => {
    const create = await fetch(`${baseUrl}/api/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'To Delete' }),
    });
    const { id } = await create.json();

    const res = await fetch(`${baseUrl}/api/companies/${id}`, { method: 'DELETE' });
    expect(res.status).toBe(204);

    const list = await fetch(`${baseUrl}/api/companies`);
    expect(await list.json()).toEqual([]);
  });

  it('DELETE /api/companies/:id returns 404 for unknown id', async () => {
    const res = await fetch(`${baseUrl}/api/companies/9999`, { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});

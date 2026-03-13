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
const { default: applicationsRouter } = await import('../../../app/api/src/routes/applications');

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
  app.use('/api/applications', applicationsRouter);

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

async function createCompany(name = 'Test Corp') {
  const res = await fetch(`${baseUrl}/api/companies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

beforeEach(() => {
  sqlite.exec('DELETE FROM applications');
  sqlite.exec('DELETE FROM addresses');
  sqlite.exec('DELETE FROM companies');
});

describe('Applications CRUD', () => {
  it('GET /api/applications returns empty list', async () => {
    const res = await fetch(`${baseUrl}/api/applications`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('POST /api/applications creates an application', async () => {
    const company = await createCompany();
    const res = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: company.id,
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.status).toBe('pending');
    expect(body.company.name).toBe('Test Corp');
  });

  it('POST /api/applications creates with address', async () => {
    const company = await createCompany();
    const res = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: company.id,

        address: { city: 'Arlon', region: 'Luxembourg', country: 'Belgique' },
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.address.city).toBe('Arlon');
    expect(body.address.region).toBe('Luxembourg');
    expect(body.address.country).toBe('Belgique');
  });

  it('POST /api/applications rejects invalid body', async () => {
    const res = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('PUT /api/applications/:id updates status', async () => {
    const company = await createCompany();
    const create = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: company.id }),
    });
    const { id } = await create.json();

    const res = await fetch(`${baseUrl}/api/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'in_progress' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('in_progress');
  });

  it('PUT /api/applications/:id adds address to existing application', async () => {
    const company = await createCompany();
    const create = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: company.id }),
    });
    const { id } = await create.json();

    const res = await fetch(`${baseUrl}/api/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: { city: 'Bruxelles', country: 'Belgique' } }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.address.city).toBe('Bruxelles');
  });

  it('PUT /api/applications/:id returns 404 for unknown id', async () => {
    const res = await fetch(`${baseUrl}/api/applications/9999`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    });
    expect(res.status).toBe(404);
  });

  it('DELETE /api/applications/:id deletes application and address', async () => {
    const company = await createCompany();
    const create = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: company.id,
        address: { city: 'Arlon' },
      }),
    });
    const { id } = await create.json();

    const res = await fetch(`${baseUrl}/api/applications/${id}`, { method: 'DELETE' });
    expect(res.status).toBe(204);

    const list = await fetch(`${baseUrl}/api/applications`);
    expect(await list.json()).toEqual([]);
  });

  it('DELETE /api/applications/:id returns 404 for unknown id', async () => {
    const res = await fetch(`${baseUrl}/api/applications/9999`, { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});

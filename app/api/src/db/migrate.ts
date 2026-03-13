import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'job-tracker.db');
const migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

migrate(db, { migrationsFolder });
sqlite.close();

console.log('Migrations applied successfully');

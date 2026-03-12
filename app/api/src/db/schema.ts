import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const applicationStatus = ['pending', 'in_progress', 'rejected', 'accepted'] as const;
export type ApplicationStatus = (typeof applicationStatus)[number];

export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  website: text('website'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const addresses = sqliteTable('addresses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  city: text('city'),
  region: text('region'),
  country: text('country'),
});

export const applications = sqliteTable('applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  addressId: integer('address_id').references(() => addresses.id, { onDelete: 'set null' }),
  position: text('position').notNull(),
  url: text('url'),
  appliedAt: text('applied_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  status: text('status', { enum: applicationStatus }).notNull().default('pending'),
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const companiesRelations = relations(companies, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  company: one(companies, {
    fields: [applications.companyId],
    references: [companies.id],
  }),
  address: one(addresses, {
    fields: [applications.addressId],
    references: [addresses.id],
  }),
}));

import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const applicationStatus = [
  'draft',
  'pending',
  'in_progress',
  'rejected',
  'accepted',
] as const;
export type ApplicationStatus = (typeof applicationStatus)[number];

export const applicationType = ['spontaneous', 'job_posting', 'recruitment', 'other'] as const;
export type ApplicationType = (typeof applicationType)[number];

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

export const locations = sqliteTable(
  'locations',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    country: text('country'),
    region: text('region'),
    city: text('city'),
  },
  (table) => [unique().on(table.country, table.region, table.city)],
);

export const recruiters = sqliteTable('recruiters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email'),
  linkedinUrl: text('linkedin_url'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const applications = sqliteTable('applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  locationId: integer('location_id').references(() => locations.id, { onDelete: 'set null' }),
  recruiterId: integer('recruiter_id').references(() => recruiters.id, { onDelete: 'set null' }),
  applicationType: text('application_type', { enum: applicationType }),
  jobPostingUrl: text('job_posting_url'),
  appliedAt: text('applied_at'),
  status: text('status', { enum: applicationStatus }).notNull().default('pending'),
  notes: text('notes'),
  rating: integer('rating'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const companiesRelations = relations(companies, ({ many }) => ({
  applications: many(applications),
  recruiters: many(recruiters),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  applications: many(applications),
}));

export const recruitersRelations = relations(recruiters, ({ one, many }) => ({
  company: one(companies, {
    fields: [recruiters.companyId],
    references: [companies.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  company: one(companies, {
    fields: [applications.companyId],
    references: [companies.id],
  }),
  location: one(locations, {
    fields: [applications.locationId],
    references: [locations.id],
  }),
  recruiter: one(recruiters, {
    fields: [applications.recruiterId],
    references: [recruiters.id],
  }),
}));

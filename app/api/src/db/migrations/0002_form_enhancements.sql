-- Rename addresses to locations
ALTER TABLE `addresses` RENAME TO `locations`;
--> statement-breakpoint
-- Add unique constraint on locations
CREATE UNIQUE INDEX `locations_country_region_city_unique` ON `locations` (`country`, `region`, `city`);
--> statement-breakpoint
-- Create recruiters table
CREATE TABLE `recruiters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_id` integer NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text,
	`linkedin_url` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
-- Rename address_id to location_id in applications
ALTER TABLE `applications` RENAME COLUMN `address_id` TO `location_id`;
--> statement-breakpoint
-- Drop url column from applications
ALTER TABLE `applications` DROP COLUMN `url`;
--> statement-breakpoint
-- Add application_type column
ALTER TABLE `applications` ADD COLUMN `application_type` text;
--> statement-breakpoint
-- Add job_posting_url column
ALTER TABLE `applications` ADD COLUMN `job_posting_url` text;
--> statement-breakpoint
-- Add recruiter_id column
ALTER TABLE `applications` ADD COLUMN `recruiter_id` integer REFERENCES `recruiters`(`id`) ON DELETE set null;
--> statement-breakpoint
-- Add rating column
ALTER TABLE `applications` ADD COLUMN `rating` integer;

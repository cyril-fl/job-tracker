-- Make applied_at nullable to support draft applications
-- SQLite requires table recreation to change column nullability
CREATE TABLE `applications_new` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_id` integer NOT NULL,
	`location_id` integer,
	`recruiter_id` integer,
	`application_type` text,
	`job_posting_url` text,
	`applied_at` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`rating` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`recruiter_id`) REFERENCES `recruiters`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `applications_new` SELECT `id`, `company_id`, `location_id`, `recruiter_id`, `application_type`, `job_posting_url`, `applied_at`, `status`, `notes`, `rating`, `created_at`, `updated_at` FROM `applications`;
--> statement-breakpoint
DROP TABLE `applications`;
--> statement-breakpoint
ALTER TABLE `applications_new` RENAME TO `applications`;

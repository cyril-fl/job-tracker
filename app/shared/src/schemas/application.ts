import { z } from 'zod';
import { addressSchema } from './address';

export const applicationStatusEnum = z.enum([
  'draft',
  'pending',
  'in_progress',
  'rejected',
  'accepted',
]);
export const applicationTypeEnum = z.enum(['spontaneous', 'job_posting', 'recruitment', 'other']);

export const createApplicationSchema = z.object({
  companyId: z.number().int().positive(),
  applicationType: applicationTypeEnum.optional(),
  jobPostingUrl: z.string().url().optional(),
  recruiterId: z.number().int().positive().optional(),
  appliedAt: z.string().optional(),
  status: applicationStatusEnum.optional(),
  notes: z.string().optional(),
  rating: z.number().int().min(0).max(5).optional(),
  address: addressSchema.optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

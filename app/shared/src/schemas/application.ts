import { z } from 'zod';
import { addressSchema } from './address';

export const applicationStatusEnum = z.enum(['pending', 'in_progress', 'rejected', 'accepted']);

export const createApplicationSchema = z.object({
  companyId: z.number().int().positive(),
  url: z.string().url().optional(),
  appliedAt: z.string().optional(),
  status: applicationStatusEnum.optional(),
  notes: z.string().optional(),
  address: addressSchema.optional(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;

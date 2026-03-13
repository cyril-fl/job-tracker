import { z } from 'zod';

export const createRecruiterSchema = z.object({
  companyId: z.number().int().positive(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  linkedinUrl: z.string().url().optional(),
});

export const updateRecruiterSchema = createRecruiterSchema.partial();

export type CreateRecruiterInput = z.infer<typeof createRecruiterSchema>;
export type UpdateRecruiterInput = z.infer<typeof updateRecruiterSchema>;

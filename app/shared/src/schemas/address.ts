import { z } from 'zod';

export const addressSchema = z.object({
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;

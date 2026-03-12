import type { ZodObject } from 'zod';

export interface Schema<T extends ZodObject = ZodObject> {
  name: string;
  shape: T;
}

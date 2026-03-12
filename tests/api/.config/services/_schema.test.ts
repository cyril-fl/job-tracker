import type { Schema } from 'shared';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { SchemaService } from '../../../../api/src/.config/services/_schema';

const testSchema: Schema = {
  name: 'TestSchema',
  shape: z.object({
    port: z.number().default(3001),
    verbose: z.boolean().default(false),
  }),
};

describe('SchemaService', () => {
  describe('parse', () => {
    it('should apply defaults for empty input', () => {
      const result = SchemaService.parse({ data: {}, schema: testSchema });
      expect(result).toEqual({ port: 3001, verbose: false });
    });

    it('should use provided values over defaults', () => {
      const result = SchemaService.parse({
        data: { port: 4000, verbose: true },
        schema: testSchema,
      });
      expect(result).toEqual({ port: 4000, verbose: true });
    });

    it('should partially override defaults', () => {
      const result = SchemaService.parse({
        data: { port: 5000 },
        schema: testSchema,
      });
      expect(result).toEqual({ port: 5000, verbose: false });
    });

    it('should throw on invalid data types', () => {
      expect(() =>
        SchemaService.parse({
          data: { port: 'not-a-number' },
          schema: testSchema,
        }),
      ).toThrow();
    });
  });
});

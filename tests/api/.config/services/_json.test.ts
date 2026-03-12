import { describe, expect, it } from 'vitest';
import { JSONService } from '../../../../app/api/.config/services/_json';

describe('JSONService', () => {
  describe('unflatten', () => {
    it('should return empty object for empty input', () => {
      expect(JSONService.unflatten({})).toEqual({});
    });

    it('should keep flat keys as-is', () => {
      expect(JSONService.unflatten({ port: 3001 })).toEqual({ port: 3001 });
    });

    it('should unflatten dotted keys into nested objects', () => {
      const input = { 'db.host': 'localhost', 'db.port': 5432 };
      expect(JSONService.unflatten(input)).toEqual({
        db: { host: 'localhost', port: 5432 },
      });
    });

    it('should handle deeply nested keys', () => {
      const input = { 'a.b.c.d': true };
      expect(JSONService.unflatten(input)).toEqual({
        a: { b: { c: { d: true } } },
      });
    });
  });

  describe('flatten', () => {
    it('should return empty object for empty input', () => {
      expect(JSONService.flatten({})).toEqual({});
    });

    it('should keep flat values as-is', () => {
      expect(JSONService.flatten({ port: 3001 })).toEqual({ port: 3001 });
    });

    it('should flatten nested objects with dot notation', () => {
      const input = { db: { host: 'localhost', port: 5432 } };
      expect(JSONService.flatten(input)).toEqual({
        'db.host': 'localhost',
        'db.port': 5432,
      });
    });

    it('should preserve arrays as leaf values', () => {
      const input = { tags: ['a', 'b'] };
      expect(JSONService.flatten(input)).toEqual({ tags: ['a', 'b'] });
    });
  });

  describe('flatten/unflatten roundtrip', () => {
    it('should be reversible for nested objects', () => {
      const original = { db: { host: 'localhost', port: 5432 }, verbose: true };
      const flat = JSONService.flatten(original);
      const restored = JSONService.unflatten(flat as Record<string, unknown>);
      expect(restored).toEqual(original);
    });
  });

  describe('delta', () => {
    it('should return empty object when A and B are equal', () => {
      const obj = { port: 3001, verbose: false };
      expect(JSONService.delta(obj, obj)).toEqual({});
    });

    it('should return keys present in B that differ from A', () => {
      const defaults = { port: 3001, verbose: false };
      const current = { port: 4000, verbose: false };
      expect(JSONService.delta(defaults, current)).toEqual({ port: 4000 });
    });

    it('should return keys present in B but not in A', () => {
      const defaults = { port: 3001 } as Record<string, unknown>;
      const current = { port: 3001, extra: true };
      expect(JSONService.delta(defaults, current)).toEqual({ extra: true });
    });
  });

  describe('deepEqual', () => {
    it('should return true for identical primitives', () => {
      expect(JSONService.deepEqual(1, 1)).toBe(true);
      expect(JSONService.deepEqual('a', 'a')).toBe(true);
      expect(JSONService.deepEqual(true, true)).toBe(true);
    });

    it('should return false for different primitives', () => {
      expect(JSONService.deepEqual(1, 2)).toBe(false);
      expect(JSONService.deepEqual('a', 'b')).toBe(false);
    });

    it('should return false when one side is null', () => {
      expect(JSONService.deepEqual(null, { a: 1 })).toBe(false);
      expect(JSONService.deepEqual({ a: 1 }, null)).toBe(false);
    });

    it('should compare arrays deeply', () => {
      expect(JSONService.deepEqual([1, 2], [1, 2])).toBe(true);
      expect(JSONService.deepEqual([1, 2], [1, 3])).toBe(false);
      expect(JSONService.deepEqual([1], [1, 2])).toBe(false);
    });

    it('should compare objects deeply', () => {
      expect(JSONService.deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(JSONService.deepEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(JSONService.deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('should compare nested structures', () => {
      const a = { x: { y: [1, 2] } };
      const b = { x: { y: [1, 2] } };
      expect(JSONService.deepEqual(a, b)).toBe(true);
    });
  });
});

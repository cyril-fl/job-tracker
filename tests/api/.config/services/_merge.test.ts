import { describe, expect, it } from 'vitest';
import { Merge } from '../../../../app/api/.config/services/_merge';

describe('Merge', () => {
  describe('objects', () => {
    it('should merge source into target', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = Merge.objects(target, source);
      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('should not overwrite with undefined (defu behavior)', () => {
      const target = { a: 1 };
      const source = { a: undefined, b: 2 };
      const result = Merge.objects(target, source);
      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
    });
  });

  describe('deep', () => {
    it('should merge multiple configs, last value wins', () => {
      const a = { x: 1 };
      const b = { y: 2 };
      const c = { x: 10, z: 3 };
      const result = Merge.deep(a, b, c);
      expect(result).toEqual({ x: 10, y: 2, z: 3 });
    });

    it('should return empty object with no arguments', () => {
      expect(Merge.deep()).toEqual({});
    });
  });
});

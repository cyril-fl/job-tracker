export class JSONService {
  public static unflatten(data: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const key in data) {
      const keys = key.split('.');
      let current = result;

      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (!(k in current)) {
          current[k] = {};
        }
        current = current[k] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = data[key];
    }

    return result;
  }

  public static flatten(data: object, prefix = ''): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const key in data) {
      const value = data[key as keyof typeof data];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, JSONService.flatten(value, newKey));
      } else {
        result[newKey] = value;
      }
    }

    return result;
  }

  public static delta(A: Record<string, unknown>, B: Record<string, unknown>) {
    const filtered = Object.entries(B).filter(([key, params]) => {
      return !JSONService.deepEqual(A[key], params);
    });

    return Object.fromEntries(filtered);
  }

  public static deepEqual(A: unknown, B: unknown): boolean {
    if (A === B) return true;

    if (A == null || B == null) return false;

    if (Array.isArray(A) && Array.isArray(B)) {
      if (A.length !== B.length) return false;
      return A.every((v, i) => JSONService.deepEqual(v, B[i]));
    }

    if (typeof A === 'object' && typeof B === 'object' && !Array.isArray(A) && !Array.isArray(B)) {
      const objA = A as Record<string, unknown>;
      const objB = B as Record<string, unknown>;

      const keysA = Object.keys(objA);
      const keysB = Object.keys(objB);

      if (keysA.length !== keysB.length) return false;

      return keysA.every((k) => JSONService.deepEqual(objA[k], objB[k]));
    }

    return false;
  }
}

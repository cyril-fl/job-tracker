import type { Schema } from '@Shared';
import type { ZodObject } from 'zod';
import type z from 'zod';

interface ParseProps<T extends ZodObject = ZodObject> {
  data: unknown;
  schema: Schema<T>;
}

export class SchemaService {
  public static parse<T extends ZodObject>(props: ParseProps<T>): z.infer<T> {
    const { data, schema } = props;
    const result = schema.shape.safeParse(data);

    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  }
}

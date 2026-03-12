import type { Schema } from 'shared';
import { z } from 'zod';

class ConfigSchema implements Schema {
  public name = 'ConfigSchema';

  public shape = z.object({
    port: z.number().default(3001),
    verbose: z.boolean().default(false),
    // TODO process env
    cors_origin: z.string().default('http://localhost:5173'),
  });
}

export default new ConfigSchema();

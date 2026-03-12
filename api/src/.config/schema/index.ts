import type { z } from 'zod';

import ConfigSchema from './_config.js';

export type ConfigType = z.infer<typeof ConfigSchema.shape>;

export { ConfigSchema };

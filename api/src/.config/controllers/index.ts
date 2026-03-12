import fs from 'node:fs/promises';
import path from 'node:path';

import ConfigState from '../models';
import { ConfigSchema as schema } from '../schema/';
import { JSONService, SchemaService } from '../services';

/* Controller */
export default class Config {
  private readonly config: ConfigState;

  constructor(raw: Record<string, unknown> = {}) {
    const data = JSONService.unflatten(raw);

    const parsed = SchemaService.parse({ data, schema });

    console.log('Loaded configuration:', parsed);

    this.config = new ConfigState(parsed);
  }

  // Getters
  public get parameters() {
    return this.config.state;
  }

  // Methods
  public async update() {
    const src = process.cwd();
    const configPath = path.join(src, 'app.config.json');

    const current = JSONService.flatten(this.parameters);
    const deflt = JSONService.flatten(schema.shape.parse({}));
    const delta = JSONService.delta(deflt, current);

    await fs.writeFile(configPath, JSON.stringify(delta, null, 2), 'utf8');
  }
}

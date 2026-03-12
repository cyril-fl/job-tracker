import type { ConfigType } from '../schema';

export default class Config {
  public readonly state: {
    port: number;
    verbose: boolean;
    cors_origin: string;
  };

  constructor(props: ConfigType) {
    this.state = {
      port: props.port,
      verbose: props.verbose,
      cors_origin: props.cors_origin,
    };
  }

  // Getters

  // Methods
}

export class ConfigEnvService {
  static get isProd(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  static get isStaging(): boolean {
    return process.env.NODE_ENV === 'staging';
  }

  static get isDev(): boolean {
    return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  }
}

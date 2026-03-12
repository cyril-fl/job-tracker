import { describe, expect, it } from 'vitest';
import Config from '../../../../app/api/.config/controllers/index';

describe('Config controller', () => {
  it('should use defaults when no raw config is provided', () => {
    const config = new Config();
    expect(config.parameters.port).toBe(3001);
    expect(config.parameters.verbose).toBe(false);
    expect(config.parameters.cors_origin).toBe('http://localhost:5173');
  });

  it('should override defaults with provided values', () => {
    const config = new Config({ port: 4000, verbose: true });
    expect(config.parameters.port).toBe(4000);
    expect(config.parameters.verbose).toBe(true);
    expect(config.parameters.cors_origin).toBe('http://localhost:5173');
  });

  it('should unflatten dotted keys before parsing', () => {
    const config = new Config({ port: 5000 });
    expect(config.parameters.port).toBe(5000);
  });

  it('should throw on invalid config values', () => {
    expect(() => new Config({ port: 'invalid' })).toThrow();
  });
});

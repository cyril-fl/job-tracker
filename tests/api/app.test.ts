import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../../app/api/src/app';

describe('App', () => {
  let app: App;

  afterEach(async () => {
    if (app) await app.stop().catch(() => {});
  });

  it('should create app with default config', () => {
    app = new App();
    expect(app.config.parameters.port).toBe(3001);
  });

  it('should create app with custom config', () => {
    app = new App({ port: 4000 });
    expect(app.config.parameters.port).toBe(4000);
  });

  it('should start and stop the server', async () => {
    app = new App({ port: 0 });
    await app.start();
    await app.stop();
  });

  it('should resolve stop even if not started', async () => {
    app = new App();
    await expect(app.stop()).resolves.toBeUndefined();
  });
});

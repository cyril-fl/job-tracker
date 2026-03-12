import { defu } from 'defu';

export class Merge {
  public static objects(
    target: Record<string, unknown>,
    source: Record<string, unknown>,
  ): Record<string, unknown> {
    return defu(source, target);
  }

  public static deep(...configs: Record<string, unknown>[]): Record<string, unknown> {
    return configs.reduce((result, config) => Merge.objects(result, config), {});
  }
}

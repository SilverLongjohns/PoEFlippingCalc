import NodeCache from 'node-cache';

export class AppCache {
  private cache: NodeCache;
  private timestamps: Map<string, string> = new Map();

  constructor(ttlSeconds: number) {
    this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2 });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T): void {
    this.cache.set(key, value);
    this.timestamps.set(key, new Date().toISOString());
  }

  getCachedAt(key: string): string | undefined {
    return this.timestamps.get(key);
  }

  invalidate(key: string): void {
    this.cache.del(key);
    this.timestamps.delete(key);
  }
}

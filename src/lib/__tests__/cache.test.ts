import { AppCache } from '../cache';

describe('AppCache', () => {
  it('returns cached value within TTL', () => {
    const cache = new AppCache(60);
    cache.set('key1', { data: 'hello' });
    expect(cache.get('key1')).toEqual({ data: 'hello' });
  });

  it('returns undefined for missing key', () => {
    const cache = new AppCache(60);
    expect(cache.get('missing')).toBeUndefined();
  });

  it('returns cache metadata with getCachedAt', () => {
    const cache = new AppCache(60);
    cache.set('key1', 'value');
    const cachedAt = cache.getCachedAt('key1');
    expect(cachedAt).toBeDefined();
    expect(typeof cachedAt).toBe('string');
  });

  it('clears specific key with invalidate', () => {
    const cache = new AppCache(60);
    cache.set('key1', 'value');
    cache.invalidate('key1');
    expect(cache.get('key1')).toBeUndefined();
  });
});

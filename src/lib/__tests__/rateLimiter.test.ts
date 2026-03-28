import { RateLimiter } from '../rateLimiter';

describe('RateLimiter', () => {
  it('parses X-Rate-Limit-* headers and tracks state', () => {
    const limiter = new RateLimiter();
    const headers = new Headers({
      'X-Rate-Limit-Ip': '12:4:10',
      'X-Rate-Limit-Ip-State': '3:4:0',
    });
    limiter.updateFromHeaders(headers);
    expect(limiter.canMakeRequest()).toBe(true);
  });

  it('blocks requests when at limit', () => {
    const limiter = new RateLimiter();
    const headers = new Headers({
      'X-Rate-Limit-Ip': '12:4:10',
      'X-Rate-Limit-Ip-State': '12:4:0',
    });
    limiter.updateFromHeaders(headers);
    expect(limiter.canMakeRequest()).toBe(false);
  });

  it('returns delay in ms when rate limited', () => {
    const limiter = new RateLimiter();
    const headers = new Headers({
      'X-Rate-Limit-Ip': '12:4:10',
      'X-Rate-Limit-Ip-State': '12:4:5',
    });
    limiter.updateFromHeaders(headers);
    expect(limiter.getDelayMs()).toBeGreaterThan(0);
  });

  it('allows requests when no headers have been set', () => {
    const limiter = new RateLimiter();
    expect(limiter.canMakeRequest()).toBe(true);
  });
});

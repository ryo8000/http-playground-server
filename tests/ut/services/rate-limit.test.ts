import { rateLimit, resetRateLimitWindows } from '../../../src/services/rate-limit.js';

describe('rateLimit', () => {
  beforeEach(() => {
    resetRateLimitWindows();
  });

  it('should allow requests up to the limit and then return 429', () => {
    expect(rateLimit('2', '10', 'a', 0)).toEqual({
      status: 200,
      headers: {
        'X-RateLimit-Limit': '2',
        'X-RateLimit-Remaining': '1',
        'X-RateLimit-Reset': '10',
      },
      body: { message: 'Request 1 of 2 allowed' },
    });
    expect(rateLimit('2', '10', 'a', 0)).toEqual({
      status: 200,
      headers: {
        'X-RateLimit-Limit': '2',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': '10',
      },
      body: { message: 'Request 2 of 2 allowed' },
    });
    expect(rateLimit('2', '10', 'a', 0)).toEqual({
      status: 429,
      headers: {
        'X-RateLimit-Limit': '2',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': '10',
        'Retry-After': '10',
      },
      body: { error: { message: 'Rate limit exceeded. Retry after 10 second(s).' } },
    });
  });

  it('should start a new window once the previous one expires', () => {
    rateLimit('1', '10', 'a', 0);
    expect(rateLimit('1', '10', 'a', 5000).status).toBe(429);
    expect(rateLimit('1', '10', 'a', 10_000)).toEqual({
      status: 200,
      headers: {
        'X-RateLimit-Limit': '1',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': '10',
      },
      body: { message: 'Request 1 of 1 allowed' },
    });
  });

  it('should report the remaining window time in Retry-After', () => {
    rateLimit('1', '10', 'a', 0);
    const result = rateLimit('1', '10', 'a', 7500);
    expect(result.status).toBe(429);
    expect(result.headers).toEqual({
      'X-RateLimit-Limit': '1',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': '3',
      'Retry-After': '3',
    });
  });

  it('should track windows per id independently', () => {
    rateLimit('1', '10', 'a', 0);
    expect(rateLimit('1', '10', 'b', 0).status).toBe(200);
    expect(rateLimit('1', '10', 'a', 0).status).toBe(429);
  });

  it('should default to 5 requests per 10 seconds and a shared id', () => {
    for (let i = 1; i <= 5; i++) {
      expect(rateLimit(undefined, undefined, undefined, 0).status).toBe(200);
    }
    expect(rateLimit(undefined, undefined, undefined, 0).status).toBe(429);
  });

  it.each([
    { limit: '0', reason: 'below valid range' },
    { limit: '10001', reason: 'above valid range' },
    { limit: 'abc', reason: 'non-numeric string' },
    { limit: ['1', '2'], reason: 'multiple values' },
  ])('should return 400 for invalid limit $limit ($reason)', ({ limit }) => {
    expect(rateLimit(limit, undefined, undefined, 0)).toEqual({
      status: 400,
      body: { error: { message: 'Invalid limit. Must be an integer between 1 and 10000.' } },
    });
  });

  it.each([
    { window: '0', reason: 'below valid range' },
    { window: '3601', reason: 'above valid range' },
    { window: 'abc', reason: 'non-numeric string' },
    { window: ['1', '2'], reason: 'multiple values' },
  ])('should return 400 for invalid window $window ($reason)', ({ window }) => {
    expect(rateLimit(undefined, window, undefined, 0)).toEqual({
      status: 400,
      body: { error: { message: 'Invalid window. Must be an integer between 1 and 3600.' } },
    });
  });

  it('should evict only the oldest window when the tracked id limit is reached', () => {
    rateLimit('1', '10', 'oldest', 0);
    rateLimit('1', '10', 'survivor', 0);
    // Fill the map up to MAX_TRACKED_IDS (10,000) entries
    for (let i = 0; i < 9998; i += 1) {
      rateLimit('1', '10', `filler-${i}`, 0);
    }
    // A new id evicts only 'oldest'; 'survivor' keeps its exhausted window.
    rateLimit('1', '10', 'new', 0);
    // Check 'survivor' first: re-adding 'oldest' below evicts the then-oldest entry again.
    expect(rateLimit('1', '10', 'survivor', 0).status).toBe(429);
    expect(rateLimit('1', '10', 'oldest', 0).status).toBe(200);
  });

  it('should return 400 for multiple id values', () => {
    expect(rateLimit(undefined, undefined, ['a', 'b'], 0)).toEqual({
      status: 400,
      body: { error: { message: 'Invalid id. Must be a single string value.' } },
    });
  });
});

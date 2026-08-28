import { cache, cacheControl } from '../../../src/services/cache.js';

describe('cache', () => {
  // Mirrors the fixed Last-Modified in the service
  const lastModified = 'Thu, 01 Jan 2026 00:00:00 GMT';

  it('should return 200 with the default ETag and Last-Modified when no etag is provided', () => {
    const result = cache(undefined);
    expect(result).toEqual({
      ok: true,
      status: 200,
      headers: {
        ETag: '"http-playground"',
        'Last-Modified': lastModified,
        'Cache-Control': 'no-cache',
      },
      body: { etag: 'http-playground', lastModified },
    });
  });

  it('should accept an etag of the maximum length', () => {
    const etag = 'a'.repeat(128);
    const result = cache(etag);
    expect(result).toEqual({
      ok: true,
      status: 200,
      headers: { ETag: `"${etag}"`, 'Last-Modified': lastModified, 'Cache-Control': 'no-cache' },
      body: { etag, lastModified },
    });
  });

  it('should use the etag query parameter when provided', () => {
    const result = cache('my-tag');
    expect(result).toEqual({
      ok: true,
      status: 200,
      headers: { ETag: '"my-tag"', 'Last-Modified': lastModified, 'Cache-Control': 'no-cache' },
      body: { etag: 'my-tag', lastModified },
    });
  });

  it.each([
    { etag: '', reason: 'empty string' },
    { etag: 'has space', reason: 'contains a space' },
    { etag: 'has"quote', reason: 'contains a double quote' },
    { etag: 'trailing\\', reason: 'contains a backslash' },
    { etag: 'a,b', reason: 'contains a comma (splits an If-None-Match list)' },
    { etag: ['a', 'b'], reason: 'repeated parameter' },
    { etag: 'a'.repeat(129), reason: 'longer than the maximum length' },
  ])('should return 400 for invalid etag ($reason)', ({ etag }) => {
    const result = cache(etag);
    expect(result).toEqual({
      ok: false,
      status: 400,
      body: {
        error: {
          message:
            'Invalid etag. Must be a printable ASCII string of 1 to 128 characters without spaces, double quotes, commas, or backslashes.',
        },
      },
    });
  });
});

describe('cacheControl', () => {
  it.each(['0', '60', '31536000'])('should return the Cache-Control result for %s', (seconds) => {
    const result = cacheControl(seconds);
    expect(result).toEqual({
      ok: true,
      status: 200,
      headers: { 'Cache-Control': `public, max-age=${seconds}` },
      body: { cacheControl: `public, max-age=${seconds}` },
    });
  });

  it.each([
    { seconds: '-1', reason: 'below valid range' },
    { seconds: '31536001', reason: 'above valid range' },
    { seconds: 'abc', reason: 'non-numeric string' },
    { seconds: '1.5', reason: 'floating point number' },
  ])('should return 400 for invalid seconds $seconds ($reason)', ({ seconds }) => {
    const result = cacheControl(seconds);
    expect(result).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Invalid seconds. Must be an integer between 0 and 31536000.' } },
    });
  });
});

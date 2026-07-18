import { cache, cacheControl } from '../../../src/services/cache.js';

describe('cache', () => {
  const now = new Date('2026-01-02T03:04:05Z');
  const lastModified = now.toUTCString();

  it('should return 200 with the default ETag and Last-Modified when no conditional headers are present', () => {
    const result = cache(undefined, undefined, undefined, now);
    expect(result).toEqual({
      ok: true,
      status: 200,
      headers: { ETag: '"http-playground"', 'Last-Modified': lastModified },
      body: { etag: '"http-playground"', lastModified },
    });
  });

  it('should use the etag query parameter when provided', () => {
    const result = cache(undefined, undefined, 'my-tag', now);
    expect(result).toEqual({
      ok: true,
      status: 200,
      headers: { ETag: '"my-tag"', 'Last-Modified': lastModified },
      body: { etag: '"my-tag"', lastModified },
    });
  });

  it.each([
    { ifNoneMatch: '"http-playground"', ifModifiedSince: undefined, reason: 'If-None-Match' },
    { ifNoneMatch: undefined, ifModifiedSince: lastModified, reason: 'If-Modified-Since' },
    { ifNoneMatch: '"x"', ifModifiedSince: lastModified, reason: 'both conditional headers' },
  ])('should return 304 when $reason is present', ({ ifNoneMatch, ifModifiedSince }) => {
    const result = cache(ifNoneMatch, ifModifiedSince, undefined, now);
    expect(result).toEqual({ ok: true, status: 304 });
  });

  it.each([
    { etag: '', reason: 'empty string' },
    { etag: 'has space', reason: 'contains a space' },
    { etag: 'has"quote', reason: 'contains a double quote' },
    { etag: ['a', 'b'], reason: 'repeated parameter' },
  ])('should return 400 for invalid etag ($reason)', ({ etag }) => {
    const result = cache(undefined, undefined, etag, now);
    expect(result).toEqual({
      ok: false,
      status: 400,
      body: {
        error: {
          message:
            'Invalid etag. Must be a non-empty printable ASCII string without spaces or double quotes.',
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

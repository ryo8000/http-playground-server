import { redirect } from '../../../src/services/redirect.js';

const TEST_URL = 'http://example.com';

describe('redirect', () => {
  it('should return 302 when no status is provided', () => {
    const result = redirect(TEST_URL, undefined);
    expect(result).toEqual({ ok: true, status: 302, url: TEST_URL });
  });

  it.each([301, 302, 303, 307, 308])('should return ok with status %d', (statusCode) => {
    const result = redirect(TEST_URL, String(statusCode));
    expect(result).toEqual({ ok: true, status: statusCode, url: TEST_URL });
  });

  it.each([
    { urlParam: undefined, reason: 'missing' },
    { urlParam: [TEST_URL, TEST_URL], reason: 'array' },
  ])('should return 400 when url is $reason', ({ urlParam }) => {
    const result = redirect(urlParam, undefined);
    expect(result).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Missing `url` query parameter' } },
    });
  });

  it.each([
    { statusParam: '300', reason: 'not a redirect status' },
    { statusParam: '200', reason: 'not a redirect status' },
    { statusParam: '2e1', reason: 'scientific notation' },
    { statusParam: 'abc', reason: 'non-numeric string' },
    { statusParam: '301.5', reason: 'floating point' },
  ])('should return 400 for invalid status $statusParam ($reason)', ({ statusParam }) => {
    const result = redirect(TEST_URL, statusParam);
    expect(result).toEqual({
      ok: false,
      status: 400,
      body: {
        error: {
          message:
            'Invalid redirect status code. Supported statuses are 301, 302, 303, 307 and 308',
        },
      },
    });
  });

  it('should return 400 when status is an array', () => {
    const result = redirect(TEST_URL, ['301', '302']);
    expect(result).toEqual({
      ok: false,
      status: 400,
      body: {
        error: {
          message:
            'Invalid redirect status code. Supported statuses are 301, 302, 303, 307 and 308',
        },
      },
    });
  });
});

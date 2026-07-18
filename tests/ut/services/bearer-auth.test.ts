import { bearerAuth } from '../../../src/services/bearer-auth.js';

describe('bearerAuth', () => {
  it('should return 200 when the token matches', () => {
    const result = bearerAuth('secret-token', 'Bearer secret-token');
    expect(result).toEqual({
      status: 200,
      body: { authenticated: true, message: 'Authentication successful' },
    });
  });

  it('should accept a case-insensitive scheme', () => {
    const result = bearerAuth('secret-token', 'bearer secret-token');
    expect(result).toEqual({
      status: 200,
      body: { authenticated: true, message: 'Authentication successful' },
    });
  });

  it.each([
    { token: undefined, reason: 'missing' },
    { token: '', reason: 'empty' },
    { token: '  ', reason: 'whitespace only' },
    { token: ['a', 'b'], reason: 'repeated parameter' },
  ])('should return 400 when the token parameter is $reason', ({ token }) => {
    const result = bearerAuth(token, 'Bearer secret-token');
    expect(result).toEqual({
      status: 400,
      body: { error: { message: 'Missing token query parameter' } },
    });
  });

  it.each([
    { header: undefined, reason: 'missing' },
    { header: 'Basic dXNlcjpwYXNz', reason: 'not a Bearer scheme' },
    { header: 'Bearer', reason: 'missing the token' },
  ])('should return 401 when the Authorization header is $reason', ({ header }) => {
    const result = bearerAuth('secret-token', header);
    expect(result).toEqual({
      status: 401,
      body: { authenticated: false, message: 'Authentication required' },
      headers: { 'WWW-Authenticate': 'Bearer realm="Access to /bearer-auth"' },
    });
  });

  it('should return 401 when the token does not match', () => {
    const result = bearerAuth('secret-token', 'Bearer wrong-token');
    expect(result).toEqual({
      status: 401,
      body: { authenticated: false, message: 'Authentication failed' },
      headers: { 'WWW-Authenticate': 'Bearer realm="Access to /bearer-auth"' },
    });
  });
});

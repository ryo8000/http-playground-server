import { basicAuth } from '../../../src/services/basic-auth.js';

const makeAuthHeader = (user: string, password: string): string => {
  const encoded = Buffer.from(`${user}:${password}`).toString('base64');
  return `Basic ${encoded}`;
};

describe('basicAuth', () => {
  it.each([
    { user: undefined, password: 'pass', reason: 'user is missing' },
    { user: 'user', password: undefined, reason: 'password is missing' },
    { user: undefined, password: undefined, reason: 'both are missing' },
    { user: '', password: 'pass', reason: 'user is empty string' },
    { user: 'user', password: '', reason: 'password is empty string' },
    { user: '   ', password: 'pass', reason: 'user is only whitespace' },
    { user: 'user', password: '   ', reason: 'password is only whitespace' },
    { user: ['user1', 'user2'], password: 'pass', reason: 'user is an array' },
  ])('should return 400 when $reason', ({ user, password }) => {
    const result = basicAuth(user, password, undefined);
    expect(result).toEqual({
      status: 400,
      body: { error: { message: 'Missing user or password query parameter' } },
    });
  });

  it.each([
    { authHeader: undefined, reason: 'missing' },
    { authHeader: 'Bearer token123', reason: 'using Bearer scheme' },
  ])('should return 401 when Authorization header is $reason', ({ authHeader }) => {
    const result = basicAuth('user', 'pass', authHeader);
    expect(result).toEqual({
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Access to /basic-auth"' },
      body: { authenticated: false, message: 'Authentication required' },
    });
  });

  describe('credential matching', () => {
    it('should return 200 when credentials match', () => {
      const result = basicAuth('user', 'pass', makeAuthHeader('user', 'pass'));
      expect(result).toEqual({
        status: 200,
        body: { authenticated: true, message: 'Authentication successful' },
      });
    });

    it('should return 401 when user does not match', () => {
      const result = basicAuth('expected', 'pass', makeAuthHeader('other', 'pass'));
      expect(result).toEqual({
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Access to /basic-auth"' },
        body: { authenticated: false, message: 'Authentication failed' },
      });
    });

    it('should return 401 when password does not match', () => {
      const result = basicAuth('user', 'expected', makeAuthHeader('user', 'other'));
      expect(result).toEqual({
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Access to /basic-auth"' },
        body: { authenticated: false, message: 'Authentication failed' },
      });
    });

    it('should be case-sensitive for credentials', () => {
      const result = basicAuth('User', 'Pass', makeAuthHeader('user', 'pass'));
      expect(result).toEqual({
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Access to /basic-auth"' },
        body: { authenticated: false, message: 'Authentication failed' },
      });
    });

    it('should handle passwords containing colons', () => {
      const password = 'pass:word:with:colons';
      const result = basicAuth('user', password, makeAuthHeader('user', password));
      expect(result).toEqual({
        status: 200,
        body: { authenticated: true, message: 'Authentication successful' },
      });
    });

    it('should handle unicode credentials', () => {
      const credentials = '测试用户';
      const result = basicAuth(credentials, credentials, makeAuthHeader(credentials, credentials));
      expect(result).toEqual({
        status: 200,
        body: { authenticated: true, message: 'Authentication successful' },
      });
    });
  });
});

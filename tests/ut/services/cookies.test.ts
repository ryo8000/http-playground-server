import { setCookies } from '../../../src/services/cookies.js';

describe('setCookies', () => {
  it('should return the cookie pairs for valid query parameters', () => {
    const result = setCookies({ flavor: 'chocolate', session: 'abc123' });
    expect(result).toEqual({ ok: true, cookies: { flavor: 'chocolate', session: 'abc123' } });
  });

  it('should return an empty object when there are no parameters', () => {
    const result = setCookies({});
    expect(result).toEqual({ ok: true, cookies: {} });
  });

  it('should allow an empty value', () => {
    const result = setCookies({ flavor: '' });
    expect(result).toEqual({ ok: true, cookies: { flavor: '' } });
  });

  it('should return 400 for a repeated parameter', () => {
    const result = setCookies({ flavor: ['chocolate', 'vanilla'] });
    expect(result).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: "Invalid value for cookie 'flavor'. Must be a single string." } },
    });
  });

  it('should return 400 for an invalid cookie name', () => {
    const result = setCookies({ 'bad name': 'value' });
    expect(result).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: "Invalid cookie name 'bad name'." } },
    });
  });
});

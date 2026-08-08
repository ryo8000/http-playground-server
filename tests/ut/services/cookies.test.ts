import { deleteCookies, readCookies, setCookies } from '../../../src/services/cookies.js';

describe('readCookies', () => {
  it('should return the cookies carried by the header', () => {
    const result = readCookies('flavor=chocolate; session=abc123');
    expect(result).toEqual({
      status: 200,
      body: { cookies: { flavor: 'chocolate', session: 'abc123' } },
    });
  });

  it('should return an empty object when there is no header', () => {
    expect(readCookies(undefined)).toEqual({ status: 200, body: { cookies: {} } });
  });
});

describe('setCookies', () => {
  it('should return the cookie pairs for valid query parameters', () => {
    const result = setCookies({ flavor: 'chocolate', session: 'abc123' });
    expect(result).toEqual({
      ok: true,
      status: 200,
      body: { cookies: { flavor: 'chocolate', session: 'abc123' } },
    });
  });

  it('should return an empty object when there are no parameters', () => {
    const result = setCookies({});
    expect(result).toEqual({ ok: true, status: 200, body: { cookies: {} } });
  });

  it('should allow an empty value', () => {
    const result = setCookies({ flavor: '' });
    expect(result).toEqual({ ok: true, status: 200, body: { cookies: { flavor: '' } } });
  });

  it('should store a cookie named __proto__', () => {
    const result = setCookies({ ['__proto__']: 'abc' });
    expect(result).toEqual({
      ok: true,
      status: 200,
      body: { cookies: { ['__proto__']: 'abc' } },
    });
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

describe('deleteCookies', () => {
  it('should return the cookie names to expire', () => {
    const result = deleteCookies({ flavor: '', session: '' });
    expect(result).toEqual({
      ok: true,
      status: 200,
      body: { deleted: ['flavor', 'session'] },
    });
  });

  it('should return an empty list when there are no parameters', () => {
    const result = deleteCookies({});
    expect(result).toEqual({ ok: true, status: 200, body: { deleted: [] } });
  });

  it('should return 400 for an invalid cookie name', () => {
    const result = deleteCookies({ 'bad name': '' });
    expect(result).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: "Invalid cookie name 'bad name'." } },
    });
  });
});

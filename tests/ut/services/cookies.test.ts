import { deleteCookies, readCookies, setCookies } from '../../../src/services/cookies.js';

const parseCases: [string, string | undefined, Record<string, string>][] = [
  ['a single pair', 'flavor=chocolate', { flavor: 'chocolate' }],
  [
    'multiple pairs',
    'flavor=chocolate; session=abc123',
    { flavor: 'chocolate', session: 'abc123' },
  ],
  ['no header', undefined, {}],
  ['an empty value', 'flavor=', { flavor: '' }],
  ['a percent-encoded value', 'flavor=chocolate%20chip', { flavor: 'chocolate chip' }],
  ['a quoted value', 'flavor="chocolate"', { flavor: 'chocolate' }],
  ['a malformed percent-encoded value', 'flavor=%zz', { flavor: '%zz' }],
  ["a cookie named '__proto__'", '__proto__=abc', { ['__proto__']: 'abc' }],
  ["a 'j:'-prefixed value as a string", 'a=j%3A%7B%22x%22%3A1%7D', { a: 'j:{"x":1}' }],
  [
    'a repeated name, keeping the first',
    'flavor=chocolate; flavor=vanilla',
    { flavor: 'chocolate' },
  ],
  ['an entry without a value', 'flavor', {}],
];

describe('readCookies', () => {
  it.each(parseCases)('should parse %s', (_description, header, cookies) => {
    expect(readCookies(header)).toEqual({ status: 200, body: { cookies } });
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

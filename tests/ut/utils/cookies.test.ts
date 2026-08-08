import { parseCookieHeader } from '../../../src/utils/cookies.js';

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

describe('parseCookieHeader', () => {
  it.each(parseCases)('should parse %s', (_description, header, cookies) => {
    expect(parseCookieHeader(header)).toEqual(cookies);
  });
});

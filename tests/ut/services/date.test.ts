import { date } from '../../../src/services/date.js';

describe('date', () => {
  it('should accept a valid HTTP date string', () => {
    expect(date('Wed, 21 Oct 2015 07:28:00 GMT')).toEqual({
      ok: true,
      status: 200,
      headers: { Date: 'Wed, 21 Oct 2015 07:28:00 GMT' },
      body: { date: 'Wed, 21 Oct 2015 07:28:00 GMT' },
    });
  });

  it('should accept an arbitrary non-date string', () => {
    expect(date('not-a-date')).toEqual({
      ok: true,
      status: 200,
      headers: { Date: 'not-a-date' },
      body: { date: 'not-a-date' },
    });
  });

  it('should return 400 when value is missing', () => {
    expect(date(undefined)).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Missing `value` query parameter' } },
    });
  });

  it.each([
    { value: '', reason: 'empty string' },
    { value: 'a\r\nX-Injected: 1', reason: 'CRLF characters' },
    { value: 'a\0b', reason: 'NUL character' },
    { value: '日本語', reason: 'non latin-1 characters' },
    { value: ['a', 'b'], reason: 'multiple values' },
  ])('should return 400 for invalid value ($reason)', ({ value }) => {
    expect(date(value)).toEqual({
      ok: false,
      status: 400,
      body: {
        error: {
          message: 'Invalid value. Must be a single non-empty string without control characters.',
        },
      },
    });
  });
});

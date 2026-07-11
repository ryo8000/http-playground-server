import { bigHeaders } from '../../../src/services/big-headers.js';

describe('bigHeaders', () => {
  it('should default to one 8192-byte header', () => {
    expect(bigHeaders(undefined, undefined)).toEqual({
      ok: true,
      status: 200,
      headers: { 'X-Big-Header-1': 'a'.repeat(8192) },
      body: { message: 'Sent 1 header(s) of 8192 byte(s)' },
    });
  });

  it('should resolve explicit size and count values', () => {
    expect(bigHeaders('100', '3')).toEqual({
      ok: true,
      status: 200,
      headers: {
        'X-Big-Header-1': 'a'.repeat(100),
        'X-Big-Header-2': 'a'.repeat(100),
        'X-Big-Header-3': 'a'.repeat(100),
      },
      body: { message: 'Sent 3 header(s) of 100 byte(s)' },
    });
  });

  it('should allow the maximum total header bytes', () => {
    expect(bigHeaders('1048576', '1')).toEqual({
      ok: true,
      status: 200,
      headers: { 'X-Big-Header-1': 'a'.repeat(1048576) },
      body: { message: 'Sent 1 header(s) of 1048576 byte(s)' },
    });
  });

  it.each([
    { size: '0', reason: 'below valid range' },
    { size: '1048577', reason: 'above valid range' },
    { size: 'abc', reason: 'non-numeric string' },
    { size: ['100', '200'], reason: 'multiple values' },
  ])('should return 400 for invalid size $size ($reason)', ({ size }) => {
    expect(bigHeaders(size, undefined)).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Invalid size. Must be an integer between 1 and 1048576.' } },
    });
  });

  it.each([
    { count: '0', reason: 'below valid range' },
    { count: '101', reason: 'above valid range' },
    { count: 'abc', reason: 'non-numeric string' },
    { count: ['1', '2'], reason: 'multiple values' },
  ])('should return 400 for invalid count $count ($reason)', ({ count }) => {
    expect(bigHeaders(undefined, count)).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Invalid count. Must be an integer between 1 and 100.' } },
    });
  });

  it('should return 400 when size times count exceeds the total cap', () => {
    expect(bigHeaders('1048576', '2')).toEqual({
      ok: false,
      status: 400,
      body: {
        error: {
          message:
            'Invalid size and count combination. Total header bytes must not exceed 1048576.',
        },
      },
    });
  });
});

import { truncate } from '../../../src/services/truncate.js';

describe('truncate', () => {
  it('should default to a 1024-byte body with half sent and no chunked transfer', () => {
    expect(truncate(undefined, undefined, undefined)).toEqual({
      ok: true,
      size: 1024,
      send: 512,
      chunked: false,
    });
  });

  it('should resolve explicit size and send values', () => {
    expect(truncate('100', '10', undefined)).toEqual({
      ok: true,
      size: 100,
      send: 10,
      chunked: false,
    });
  });

  it('should enable chunked transfer when chunked is true', () => {
    expect(truncate('100', '10', 'true')).toEqual({
      ok: true,
      size: 100,
      send: 10,
      chunked: true,
    });
  });

  it('should treat any chunked value other than true as false', () => {
    expect(truncate('100', '10', 'yes')).toEqual({
      ok: true,
      size: 100,
      send: 10,
      chunked: false,
    });
  });

  it('should allow sending 0 bytes', () => {
    expect(truncate('1', undefined, undefined)).toEqual({
      ok: true,
      size: 1,
      send: 0,
      chunked: false,
    });
  });

  it.each([
    { size: '0', reason: 'below valid range' },
    { size: '1048577', reason: 'above valid range' },
    { size: 'abc', reason: 'non-numeric string' },
    { size: '1.5', reason: 'floating point number' },
    { size: ['100', '200'], reason: 'multiple values' },
  ])('should return 400 for invalid size $size ($reason)', ({ size }) => {
    expect(truncate(size, undefined, undefined)).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Invalid size. Must be an integer between 1 and 1048576.' } },
    });
  });

  it.each([
    { send: '-1', reason: 'negative integer' },
    { send: '100', reason: 'equal to size' },
    { send: '101', reason: 'greater than size' },
    { send: 'abc', reason: 'non-numeric string' },
    { send: ['10', '20'], reason: 'multiple values' },
  ])('should return 400 for invalid send $send ($reason)', ({ send }) => {
    expect(truncate('100', send, undefined)).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Invalid send. Must be an integer between 0 and size - 1.' } },
    });
  });
});

import { crash } from '../../../src/services/crash.js';

describe('crash', () => {
  it('should return 200 when crashing is enabled', () => {
    expect(crash(true)).toEqual({
      ok: true,
      status: 200,
      body: { message: 'Server crashing' },
    });
  });

  it('should return 403 when crashing is disabled', () => {
    expect(crash(false)).toEqual({
      ok: false,
      status: 403,
      body: { error: { message: 'Crash is not enabled' } },
    });
  });
});

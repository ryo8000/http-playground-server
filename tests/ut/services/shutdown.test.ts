import { shutdown } from '../../../src/services/shutdown.js';

describe('shutdown', () => {
  it('should return 403 when shutdown is disabled', () => {
    const result = shutdown(false);
    expect(result).toEqual({
      ok: false,
      status: 403,
      body: { error: { message: 'Shutdown is not enabled' } },
    });
  });

  it('should return 200 when shutdown is enabled', () => {
    const result = shutdown(true);
    expect(result).toEqual({
      ok: true,
      status: 200,
      body: { message: 'Server shutting down' },
    });
  });
});

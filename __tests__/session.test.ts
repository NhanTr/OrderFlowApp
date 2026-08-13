import { ApiError } from '@/api/errors';
import { AuthSessionManager } from '@/auth/session';
import type { RefreshTokenStore } from '@/auth/tokenStore';

import { ownerSession } from '../test/fixtures';

function createTokenStore(initialValue: string | null = null) {
  let value = initialValue;
  const store: RefreshTokenStore = {
    clear: jest.fn(async () => {
      value = null;
    }),
    get: jest.fn(async () => value),
    set: jest.fn(async (refreshToken: string) => {
      value = refreshToken;
    }),
  };
  return store;
}

describe('AuthSessionManager', () => {
  test('rejects non-OWNER sessions before storing tokens', async () => {
    const tokenStore = createTokenStore();
    const manager = new AuthSessionManager(
      { refresh: jest.fn() },
      tokenStore,
    );

    await expect(
      manager.establish({
        ...ownerSession,
        user: { ...ownerSession.user, role: 'BARISTA' },
      }),
    ).rejects.toMatchObject({ code: 'OWNER_REQUIRED', status: 403 });
    expect(tokenStore.set).not.toHaveBeenCalled();
    expect(manager.getAccessToken()).toBeNull();
  });

  test('rotates refresh token once for concurrent refresh calls', async () => {
    const tokenStore = createTokenStore('refresh-token-old');
    let resolveRefresh!: (session: typeof ownerSession) => void;
    const refreshPromise = new Promise<typeof ownerSession>((resolve) => {
      resolveRefresh = resolve;
    });
    const refresh = jest.fn(() => refreshPromise);
    const manager = new AuthSessionManager({ refresh }, tokenStore);

    const first = manager.refreshAccessToken();
    const second = manager.refreshAccessToken();
    resolveRefresh({
      ...ownerSession,
      accessToken: 'access-token-new',
      refreshToken: 'refresh-token-new',
    });

    await expect(Promise.all([first, second])).resolves.toEqual([
      'access-token-new',
      'access-token-new',
    ]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledWith({ refreshToken: 'refresh-token-old' });
    expect(tokenStore.set).toHaveBeenCalledWith('refresh-token-new');
    expect(manager.getAccessToken()).toBe('access-token-new');
  });

  test('clears local session when refresh fails', async () => {
    const tokenStore = createTokenStore('expired-refresh-token');
    const manager = new AuthSessionManager(
      { refresh: jest.fn().mockRejectedValue(new ApiError('Expired', { status: 401 })) },
      tokenStore,
    );

    await expect(manager.refreshAccessToken()).rejects.toMatchObject({ status: 401 });
    expect(tokenStore.clear).toHaveBeenCalledTimes(1);
    expect(manager.getAccessToken()).toBeNull();
    expect(manager.getUser()).toBeNull();
  });

  test('restores a stored refresh token into an OWNER session', async () => {
    const tokenStore = createTokenStore('stored-refresh-token');
    const refresh = jest.fn().mockResolvedValue(ownerSession);
    const manager = new AuthSessionManager({ refresh }, tokenStore);

    await expect(manager.restore()).resolves.toEqual(ownerSession.user);
    expect(refresh).toHaveBeenCalledWith({ refreshToken: 'stored-refresh-token' });
  });
});

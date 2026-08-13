import { ApiError } from '@/api/errors';
import { configureApiClientAuth, createApiClient } from '@/api/client';
import { createAuthEndpoints } from '@/api/endpoints/auth';
import type { AuthSession, AuthUser } from '@/types';

import { refreshTokenStore, type RefreshTokenStore } from './tokenStore';

type RefreshEndpoints = Pick<ReturnType<typeof createAuthEndpoints>, 'refresh'>;
type SessionListener = () => void;

export type SessionSnapshot = {
  user: AuthUser | null;
};

export class AuthSessionManager {
  private accessToken: string | null = null;
  private readonly listeners = new Set<SessionListener>();
  private refreshPromise: Promise<string> | null = null;
  private snapshot: SessionSnapshot = { user: null };

  constructor(
    private readonly refreshEndpoints: RefreshEndpoints,
    private readonly tokenStore: RefreshTokenStore = refreshTokenStore,
  ) {}

  getAccessToken() {
    return this.accessToken;
  }

  getUser() {
    return this.snapshot.user;
  }

  getSnapshot = () => this.snapshot;

  subscribe = (listener: SessionListener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getRefreshToken() {
    return this.tokenStore.get();
  }

  async establish(session: AuthSession) {
    this.assertOwner(session.user);
    await this.tokenStore.set(session.refreshToken);
    this.accessToken = session.accessToken;
    this.updateUser(session.user);
  }

  async restore() {
    const refreshToken = await this.tokenStore.get();
    if (!refreshToken) return null;

    await this.refreshAccessToken(refreshToken);
    return this.snapshot.user;
  }

  refreshAccessToken(refreshToken?: string) {
    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh(refreshToken).finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  async clear() {
    this.accessToken = null;
    this.updateUser(null);
    await this.tokenStore.clear();
  }

  private updateUser(user: AuthUser | null) {
    if (this.snapshot.user === user) return;
    this.snapshot = { user };
    this.listeners.forEach((listener) => listener());
  }

  private assertOwner(user: AuthUser) {
    if (user.role !== 'OWNER') {
      throw new ApiError('Ứng dụng chỉ dành cho chủ quán.', {
        code: 'OWNER_REQUIRED',
        status: 403,
      });
    }
  }

  private async performRefresh(providedRefreshToken?: string) {
    try {
      const refreshToken = providedRefreshToken ?? (await this.tokenStore.get());
      if (!refreshToken) {
        throw new ApiError('Không tìm thấy phiên đăng nhập để khôi phục.', {
          code: 'SESSION_NOT_FOUND',
          status: 401,
        });
      }

      const session = await this.refreshEndpoints.refresh({ refreshToken });
      await this.establish(session);
      return session.accessToken;
    } catch (error) {
      try {
        await this.clear();
      } catch {
        this.accessToken = null;
        this.updateUser(null);
      }
      throw error;
    }
  }
}

const refreshClient = createApiClient();
const refreshEndpoints = createAuthEndpoints(refreshClient);

export const authSession = new AuthSessionManager(refreshEndpoints);

configureApiClientAuth({
  clearSession: () => authSession.clear(),
  getAccessToken: () => authSession.getAccessToken(),
  refreshAccessToken: () => authSession.refreshAccessToken(),
});

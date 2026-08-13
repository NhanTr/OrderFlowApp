import {
  create,
  isCancel,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

import { normalizeApiError } from '@/api/errors';
import { environment } from '@/config/environment';

export type AccessTokenProvider = () => string | null;

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type ApiClientAuth = {
  clearSession: () => Promise<void>;
  getAccessToken: AccessTokenProvider;
  refreshAccessToken: () => Promise<string>;
};

let apiClientAuth: ApiClientAuth | null = null;

const authLifecyclePaths = [
  '/admin/auth/login',
  '/admin/auth/refresh',
  '/admin/auth/logout',
];

function isAuthLifecycleRequest(url?: string) {
  return authLifecyclePaths.some((path) => url?.endsWith(path));
}

export function configureApiClientAuth(auth: ApiClientAuth) {
  apiClientAuth = auth;
}

function createBaseClient(getAccessToken: AccessTokenProvider): AxiosInstance {
  const client = create({
    baseURL: environment.apiBaseUrl,
    timeout: 15_000,
    headers: { Accept: 'application/json' },
  });

  client.interceptors.request.use((config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return config;
  });

  return client;
}

function installErrorNormalizer(client: AxiosInstance) {
  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(isCancel(error) ? error : normalizeApiError(error)),
  );
}

export function createApiClient(getAccessToken: AccessTokenProvider = () => null): AxiosInstance {
  const client = createBaseClient(getAccessToken);
  installErrorNormalizer(client);
  return client;
}

export const apiClient = createBaseClient(() => apiClientAuth?.getAccessToken() ?? null);

apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (isCancel(error) || typeof error !== 'object' || error === null) {
    return Promise.reject(error);
  }

  const candidate = error as {
    config?: RetriableRequestConfig;
    response?: { status?: number };
  };
  const request = candidate.config;

  if (
    candidate.response?.status !== 401 ||
    !request ||
    request._retry ||
    !apiClientAuth ||
    isAuthLifecycleRequest(request.url)
  ) {
    return Promise.reject(error);
  }

  request._retry = true;

  try {
    const accessToken = await apiClientAuth.refreshAccessToken();
    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return await apiClient(request);
  } catch (refreshError) {
    try {
      await apiClientAuth.clearSession();
    } catch {
      // The in-memory token is cleared even when secure storage cleanup fails.
    }
    return Promise.reject(refreshError);
  }
});

installErrorNormalizer(apiClient);

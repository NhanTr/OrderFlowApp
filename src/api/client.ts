import { create, isCancel, type AxiosInstance } from 'axios';

import { normalizeApiError } from '@/api/errors';
import { environment } from '@/config/environment';

export type AccessTokenProvider = () => string | null;

export function createApiClient(getAccessToken: AccessTokenProvider = () => null): AxiosInstance {
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

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(isCancel(error) ? error : normalizeApiError(error)),
  );

  return client;
}

export const apiClient = createApiClient();

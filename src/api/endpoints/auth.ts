import type { AxiosInstance } from 'axios';

import {
  authSessionDtoSchema,
  authUserDtoSchema,
  loginRequestSchema,
  logoutRequestSchema,
  refreshRequestSchema,
  singleEnvelopeSchema,
  type LoginRequestDto,
  type LogoutRequestDto,
  type RefreshRequestDto,
} from '@/api/dto';
import { mapAuthSession, mapAuthUser } from '@/api/mappers';
import { parseDto } from '@/api/parse';
import { apiClient } from '@/api/client';

export function createAuthEndpoints(client: AxiosInstance = apiClient) {
  return {
    async login(input: LoginRequestDto, signal?: AbortSignal) {
      const body = loginRequestSchema.parse(input);
      const response = await client.post('/admin/auth/login', body, { signal });
      const envelope = parseDto(singleEnvelopeSchema(authSessionDtoSchema), response.data);
      return mapAuthSession(envelope.data);
    },

    async refresh(input: RefreshRequestDto, signal?: AbortSignal) {
      const body = refreshRequestSchema.parse(input);
      const response = await client.post('/admin/auth/refresh', body, { signal });
      const envelope = parseDto(singleEnvelopeSchema(authSessionDtoSchema), response.data);
      return mapAuthSession(envelope.data);
    },

    async logout(input: LogoutRequestDto, signal?: AbortSignal) {
      const body = logoutRequestSchema.parse(input);
      await client.post('/admin/auth/logout', body, { signal });
    },

    async me(signal?: AbortSignal) {
      const response = await client.get('/admin/auth/me', { signal });
      const envelope = parseDto(singleEnvelopeSchema(authUserDtoSchema), response.data);
      return mapAuthUser(envelope.data);
    },
  };
}

export const authEndpoints = createAuthEndpoints();

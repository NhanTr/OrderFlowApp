import type { AxiosInstance } from 'axios';

import { dashboardSnapshotDtoSchema, singleEnvelopeSchema } from '@/api/dto';
import { mapDashboardSnapshot } from '@/api/mappers';
import { parseDto } from '@/api/parse';
import { apiClient } from '@/api/client';
import type { DashboardDays } from '@/types';

export function createDashboardEndpoints(client: AxiosInstance = apiClient) {
  return {
    async getSnapshot(days: DashboardDays, signal?: AbortSignal) {
      const response = await client.get('/admin/dashboard', { params: { days }, signal });
      const envelope = parseDto(singleEnvelopeSchema(dashboardSnapshotDtoSchema), response.data);
      return mapDashboardSnapshot(envelope.data);
    },
  };
}

export const dashboardEndpoints = createDashboardEndpoints();

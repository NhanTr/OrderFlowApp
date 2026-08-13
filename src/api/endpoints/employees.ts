import type { AxiosInstance } from 'axios';

import { employeeDtoSchema, listEnvelopeSchema, singleEnvelopeSchema } from '@/api/dto';
import { mapEmployee } from '@/api/mappers';
import { parseDto } from '@/api/parse';
import { compactQueryParams } from '@/api/query-params';
import { apiClient } from '@/api/client';
import type { EmployeeFilters, PaginatedResult } from '@/types';

export function createEmployeeEndpoints(client: AxiosInstance = apiClient) {
  return {
    async list(filters: EmployeeFilters = {}, signal?: AbortSignal): Promise<PaginatedResult<ReturnType<typeof mapEmployee>>> {
      const response = await client.get('/admin/employees', {
        params: compactQueryParams(filters),
        signal,
      });
      const envelope = parseDto(listEnvelopeSchema(employeeDtoSchema), response.data);
      return { data: envelope.data.map(mapEmployee), meta: envelope.meta };
    },

    async detail(employeeId: string, signal?: AbortSignal) {
      const response = await client.get(`/admin/employees/${encodeURIComponent(employeeId)}`, { signal });
      const envelope = parseDto(singleEnvelopeSchema(employeeDtoSchema), response.data);
      return mapEmployee(envelope.data);
    },
  };
}

export const employeeEndpoints = createEmployeeEndpoints();

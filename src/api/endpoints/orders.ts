import type { AxiosInstance } from 'axios';

import { listEnvelopeSchema, orderDetailDtoSchema, orderSummaryDtoSchema, singleEnvelopeSchema } from '@/api/dto';
import { mapOrderDetail, mapOrderSummary } from '@/api/mappers';
import { parseDto } from '@/api/parse';
import { compactQueryParams } from '@/api/query-params';
import { apiClient } from '@/api/client';
import type { OrderFilters, PaginatedResult } from '@/types';

export function createOrderEndpoints(client: AxiosInstance = apiClient) {
  return {
    async list(filters: OrderFilters = {}, signal?: AbortSignal): Promise<PaginatedResult<ReturnType<typeof mapOrderSummary>>> {
      const response = await client.get('/admin/orders', {
        params: compactQueryParams(filters),
        signal,
      });
      const envelope = parseDto(listEnvelopeSchema(orderSummaryDtoSchema), response.data);
      return { data: envelope.data.map(mapOrderSummary), meta: envelope.meta };
    },

    async detail(orderId: string, signal?: AbortSignal) {
      const response = await client.get(`/admin/orders/${encodeURIComponent(orderId)}`, { signal });
      const envelope = parseDto(singleEnvelopeSchema(orderDetailDtoSchema), response.data);
      return mapOrderDetail(envelope.data);
    },
  };
}

export const orderEndpoints = createOrderEndpoints();

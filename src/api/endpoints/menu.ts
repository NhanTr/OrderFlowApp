import type { AxiosInstance } from 'axios';

import { listEnvelopeSchema, menuCategoryDtoSchema, menuItemDtoSchema, singleEnvelopeSchema } from '@/api/dto';
import { mapMenuCategory, mapMenuItem } from '@/api/mappers';
import { parseDto } from '@/api/parse';
import { compactQueryParams } from '@/api/query-params';
import { apiClient } from '@/api/client';
import type { CategoryFilters, MenuItemFilters, PaginatedResult } from '@/types';

export function createMenuEndpoints(client: AxiosInstance = apiClient) {
  return {
    async categories(filters: CategoryFilters = {}, signal?: AbortSignal) {
      const response = await client.get('/admin/menu-categories', {
        params: compactQueryParams(filters),
        signal,
      });
      const envelope = parseDto(singleEnvelopeSchema(menuCategoryDtoSchema.array()), response.data);
      return envelope.data.map(mapMenuCategory).sort((a, b) => a.displayOrder - b.displayOrder);
    },

    async items(filters: MenuItemFilters = {}, signal?: AbortSignal): Promise<PaginatedResult<ReturnType<typeof mapMenuItem>>> {
      const response = await client.get('/admin/menu-items', {
        params: compactQueryParams(filters),
        signal,
      });
      const envelope = parseDto(listEnvelopeSchema(menuItemDtoSchema), response.data);
      return { data: envelope.data.map(mapMenuItem), meta: envelope.meta };
    },

    async item(itemId: string, signal?: AbortSignal) {
      const response = await client.get(`/admin/menu-items/${encodeURIComponent(itemId)}`, { signal });
      const envelope = parseDto(singleEnvelopeSchema(menuItemDtoSchema), response.data);
      return mapMenuItem(envelope.data);
    },
  };
}

export const menuEndpoints = createMenuEndpoints();

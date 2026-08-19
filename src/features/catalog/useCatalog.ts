import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { menuEndpoints } from '@/api/endpoints/menu';
import { queryKeys } from '@/query/keys';
import type { CategoryFilters, MenuItemFilters } from '@/types';

export type CatalogFilters = {
  categoryId?: string;
  isAvailable?: boolean;
};

const pageSize = 20;

export function useCategories(filters: CategoryFilters = {}) {
  return useQuery({
    queryKey: queryKeys.categories(filters),
    queryFn: ({ signal }) => menuEndpoints.categories(filters, signal),
  });
}

export function useMenuItems(filters: CatalogFilters) {
  const queryFilters: MenuItemFilters = { limit: pageSize };
  if (filters.categoryId) queryFilters.categoryId = filters.categoryId;
  if (filters.isAvailable !== undefined) queryFilters.isAvailable = filters.isAvailable;

  return useInfiniteQuery({
    queryKey: queryKeys.menuItems(queryFilters),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      menuEndpoints.items({ ...queryFilters, page: pageParam }, signal),
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
  });
}

export function useMenuItem(itemId: string) {
  return useQuery({
    enabled: itemId.length > 0,
    queryKey: queryKeys.menuItem(itemId),
    queryFn: ({ signal }) => menuEndpoints.item(itemId, signal),
  });
}

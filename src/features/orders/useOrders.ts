import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { orderEndpoints } from '@/api/endpoints/orders';
import { queryKeys } from '@/query/keys';
import type { FulfillmentStatus, OrderFilters, PaymentStatus } from '@/types';

export type OrderListFilters = {
  fulfillmentStatus?: FulfillmentStatus;
  paymentStatus?: PaymentStatus;
};

const pageSize = 20;

export function useOrders(filters: OrderListFilters) {
  const queryFilters: OrderFilters = { limit: pageSize };
  if (filters.fulfillmentStatus) queryFilters.fulfillmentStatus = filters.fulfillmentStatus;
  if (filters.paymentStatus) queryFilters.paymentStatus = filters.paymentStatus;

  return useInfiniteQuery({
    queryKey: queryKeys.orders(queryFilters),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      orderEndpoints.list({ ...queryFilters, page: pageParam }, signal),
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
  });
}

export function useOrderDetail(orderId: string) {
  return useQuery({
    enabled: orderId.length > 0,
    queryKey: queryKeys.order(orderId),
    queryFn: ({ signal }) => orderEndpoints.detail(orderId, signal),
  });
}

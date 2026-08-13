import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { employeeEndpoints } from '@/api/endpoints/employees';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { queryKeys } from '@/query/keys';
import type { EmployeeFilters, EmployeeRole, UserStatus } from '@/types';

export type EmployeeListFilters = {
  role?: EmployeeRole;
  search: string;
  status?: UserStatus;
};

const pageSize = 20;

export function useEmployees(filters: EmployeeListFilters) {
  const debouncedSearch = useDebouncedValue(filters.search.trim(), 350);
  const queryFilters: EmployeeFilters = { limit: pageSize };
  if (debouncedSearch) queryFilters.search = debouncedSearch;
  if (filters.role) queryFilters.role = filters.role;
  if (filters.status) queryFilters.status = filters.status;

  return useInfiniteQuery({
    queryKey: queryKeys.employees(queryFilters),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      employeeEndpoints.list({ ...queryFilters, page: pageParam }, signal),
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined,
  });
}

export function useEmployee(employeeId: string) {
  return useQuery({
    enabled: employeeId.length > 0,
    queryKey: queryKeys.employee(employeeId),
    queryFn: ({ signal }) => employeeEndpoints.detail(employeeId, signal),
  });
}

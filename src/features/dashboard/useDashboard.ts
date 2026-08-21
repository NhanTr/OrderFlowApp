import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { dashboardEndpoints } from '@/api/endpoints/dashboard';
import { queryKeys } from '@/query/keys';
import type { DashboardDays } from '@/types';

export function useDashboard(days: DashboardDays) {
  return useQuery({
    queryKey: queryKeys.dashboard(days),
    queryFn: ({ signal }) => dashboardEndpoints.getSnapshot(days, signal),
    placeholderData: keepPreviousData,
  });
}

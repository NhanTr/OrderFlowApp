import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/errors';

function shouldRetry(failureCount: number, error: Error) {
  if (error instanceof ApiError && error.status !== undefined && error.status < 500) {
    return false;
  }

  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
    },
  },
});

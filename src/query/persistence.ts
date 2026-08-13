import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

function isSafeToPersist(queryKey: readonly unknown[]) {
  const root = queryKey[0];
  if (root === 'dashboard' || root === 'categories' || root === 'menu-items') return true;

  // Order lists are operational snapshots. Details may contain customer notes.
  return root === 'orders' && typeof queryKey[1] === 'object' && queryKey[1] !== null;
}

export const queryPersister = createAsyncStoragePersister({
  key: 'orderflow.readonly-query-cache.v1',
  storage: AsyncStorage,
  throttleTime: 1_000,
});

export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  buster: 'orderflow-cache-v1',
  maxAge: 1000 * 60 * 60 * 12,
  persister: queryPersister,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      query.state.status === 'success' && isSafeToPersist(query.queryKey),
  },
};

export function clearPersistedQueryCache() {
  return queryPersister.removeClient();
}

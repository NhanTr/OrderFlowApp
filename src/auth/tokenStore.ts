import * as SecureStore from 'expo-secure-store';

const refreshTokenKey = 'orderflow.refresh-token';
const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export type RefreshTokenStore = {
  clear: () => Promise<void>;
  get: () => Promise<string | null>;
  set: (refreshToken: string) => Promise<void>;
};

export const refreshTokenStore: RefreshTokenStore = {
  clear() {
    return SecureStore.deleteItemAsync(refreshTokenKey, secureStoreOptions);
  },
  get() {
    return SecureStore.getItemAsync(refreshTokenKey, secureStoreOptions);
  },
  set(refreshToken) {
    return SecureStore.setItemAsync(refreshTokenKey, refreshToken, secureStoreOptions);
  },
};

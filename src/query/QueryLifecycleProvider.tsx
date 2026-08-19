import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import { AppState, Platform, StyleSheet, Text, View } from 'react-native';

import { AppColors, Spacing, Typography } from '@/theme/tokens';

type NetworkContextValue = {
  isOffline: boolean;
};

const NetworkContext = createContext<NetworkContextValue>({ isOffline: false });

export function QueryLifecycleProvider({ children }: PropsWithChildren) {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected !== false && state.isInternetReachable !== false;
      onlineManager.setOnline(online);
      setIsOffline(!online);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });
    return () => subscription.remove();
  }, []);

  return (
    <NetworkContext.Provider value={{ isOffline }}>
      <View style={styles.container}>
        {isOffline ? (
          <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.banner}>
            <Text style={styles.bannerText}>Đang offline · Dữ liệu có thể đã cũ</Text>
          </View>
        ) : null}
        <View style={styles.content}>{children}</View>
      </View>
    </NetworkContext.Provider>
  );
}

export function useNetworkStatus() {
  return useContext(NetworkContext);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  banner: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: '#FEF3C7',
  },
  bannerText: {
    color: AppColors.warning,
    fontSize: Typography.caption,
    fontWeight: '700',
    textAlign: 'center',
  },
});

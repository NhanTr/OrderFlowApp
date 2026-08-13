import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const buildPropertiesPlugin: NonNullable<ExpoConfig['plugins']>[number] = [
    'expo-build-properties',
    {
      android: {
        usesCleartextTraffic: process.env.APP_VARIANT !== 'production',
      },
    },
  ];
  const secureStorePlugin: NonNullable<ExpoConfig['plugins']>[number] = [
    'expo-secure-store',
    { configureAndroidBackup: true },
  ];

  return {
    ...config,
    name: config.name ?? 'Order Flow Manager',
    slug: config.slug ?? 'order-flow-manager',
    ios: {
      ...config.ios,
      config: {
        ...config.ios?.config,
        usesNonExemptEncryption: false,
      },
    },
    plugins: [...(config.plugins ?? []), secureStorePlugin, buildPropertiesPlugin],
  };
};

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

  return {
    ...config,
    name: config.name ?? 'Order Flow Manager',
    slug: config.slug ?? 'order-flow-manager',
    plugins: [...(config.plugins ?? []), buildPropertiesPlugin],
  };
};

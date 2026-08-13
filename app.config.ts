import type { ConfigContext, ExpoConfig } from 'expo/config';

type AppVariant = 'development' | 'staging' | 'production';

const variants: Record<
  AppVariant,
  Pick<ExpoConfig, 'name' | 'scheme'> & {
    androidPackage: string;
    iosBundleIdentifier: string;
  }
> = {
  development: {
    name: 'Order Flow Manager Dev',
    scheme: 'orderflow-dev',
    androidPackage: 'nhantr.orderflowmanager.dev',
    iosBundleIdentifier: 'nhantr.OrderFlowManager.dev',
  },
  staging: {
    name: 'Order Flow Manager Staging',
    scheme: 'orderflow-staging',
    androidPackage: 'nhantr.orderflowmanager.staging',
    iosBundleIdentifier: 'nhantr.OrderFlowManager.staging',
  },
  production: {
    name: 'Order Flow Manager',
    scheme: 'orderflow',
    androidPackage: 'nhantr.orderflowmanager',
    iosBundleIdentifier: 'nhantr.OrderFlowManager',
  },
};

function getAppVariant(value: string | undefined): AppVariant {
  const variant = value ?? 'development';
  if (variant === 'development' || variant === 'staging' || variant === 'production') {
    return variant;
  }

  throw new Error(`APP_VARIANT must be development, staging, or production; received "${variant}".`);
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const appVariant = getAppVariant(process.env.APP_VARIANT);
  const variant = variants[appVariant];
  const isDevelopment = appVariant === 'development';
  const infoPlist = { ...(config.ios?.infoPlist ?? {}) };

  if (isDevelopment) {
    infoPlist.NSLocalNetworkUsageDescription =
      'Order Flow cần kết nối với máy chủ quản lý trong cùng mạng Wi-Fi.';
    infoPlist.NSAppTransportSecurity = { NSAllowsLocalNetworking: true };
  } else {
    delete infoPlist.NSLocalNetworkUsageDescription;
    delete infoPlist.NSAppTransportSecurity;
  }

  const buildPropertiesPlugin: NonNullable<ExpoConfig['plugins']>[number] = [
    'expo-build-properties',
    {
      android: {
        usesCleartextTraffic: isDevelopment,
      },
    },
  ];
  const secureStorePlugin: NonNullable<ExpoConfig['plugins']>[number] = [
    'expo-secure-store',
    { configureAndroidBackup: true },
  ];

  return {
    ...config,
    name: variant.name,
    slug: config.slug ?? 'order-flow-manager',
    scheme: variant.scheme,
    extra: {
      ...config.extra,
      appVariant,
    },
    ios: {
      ...config.ios,
      bundleIdentifier: variant.iosBundleIdentifier,
      infoPlist,
      config: {
        ...config.ios?.config,
        usesNonExemptEncryption: false,
      },
    },
    android: {
      ...config.android,
      package: variant.androidPackage,
    },
    plugins: [...(config.plugins ?? []), secureStorePlugin, buildPropertiesPlugin],
  };
};

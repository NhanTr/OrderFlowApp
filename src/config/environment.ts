import Constants from 'expo-constants';

export type AppEnvironment = {
  apiBaseUrl: string;
  name: string;
};

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:3001/api/v1';
const DEFAULT_ENVIRONMENT_NAME = 'Development';

function resolveApiBaseUrl(environmentName: string, configuredUrl: string | undefined) {
  const appVariant = Constants.expoConfig?.extra?.appVariant;
  const isReleaseEnvironment =
    appVariant === 'staging' ||
    appVariant === 'production' ||
    /^(staging|production)$/i.test(environmentName.trim());
  const apiBaseUrl = configuredUrl?.trim() || (isReleaseEnvironment ? undefined : DEFAULT_API_BASE_URL);

  if (!apiBaseUrl) {
    throw new Error(`EXPO_PUBLIC_API_BASE_URL is required for ${environmentName}.`);
  }

  let url: URL;
  try {
    url = new URL(apiBaseUrl);
  } catch {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must be a valid absolute URL.');
  }

  if (isReleaseEnvironment && url.protocol !== 'https:') {
    throw new Error(`${environmentName} builds require an HTTPS API URL.`);
  }

  return apiBaseUrl.replace(/\/$/, '');
}

const environmentName = process.env.EXPO_PUBLIC_API_ENVIRONMENT ?? DEFAULT_ENVIRONMENT_NAME;

export const environment: AppEnvironment = {
  apiBaseUrl: resolveApiBaseUrl(environmentName, process.env.EXPO_PUBLIC_API_BASE_URL),
  name: environmentName,
};

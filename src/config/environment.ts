export type AppEnvironment = {
  apiBaseUrl: string;
  name: string;
};

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:3001/api/v1';
const DEFAULT_ENVIRONMENT_NAME = 'Development';

export const environment: AppEnvironment = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  name: process.env.EXPO_PUBLIC_API_ENVIRONMENT ?? DEFAULT_ENVIRONMENT_NAME,
};

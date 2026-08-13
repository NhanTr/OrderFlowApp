describe('environment configuration', () => {
  const originalApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const originalEnvironment = process.env.EXPO_PUBLIC_API_ENVIRONMENT;

  afterEach(() => {
    jest.resetModules();
    if (originalApiBaseUrl === undefined) delete process.env.EXPO_PUBLIC_API_BASE_URL;
    else process.env.EXPO_PUBLIC_API_BASE_URL = originalApiBaseUrl;
    if (originalEnvironment === undefined) delete process.env.EXPO_PUBLIC_API_ENVIRONMENT;
    else process.env.EXPO_PUBLIC_API_ENVIRONMENT = originalEnvironment;
  });

  it('uses the local API fallback for development', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    delete process.env.EXPO_PUBLIC_API_ENVIRONMENT;

    jest.isolateModules(() => {
      const { environment } = require('@/config/environment');
      expect(environment).toEqual({
        apiBaseUrl: 'http://127.0.0.1:3001/api/v1',
        name: 'Development',
      });
    });
  });

  it('requires an explicit API URL for staging', () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    process.env.EXPO_PUBLIC_API_ENVIRONMENT = 'Staging';

    expect(() => {
      jest.isolateModules(() => require('@/config/environment'));
    }).toThrow('EXPO_PUBLIC_API_BASE_URL is required for Staging.');
  });

  it('rejects HTTP for production', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'http://api.example.com/api/v1';
    process.env.EXPO_PUBLIC_API_ENVIRONMENT = 'Production';

    expect(() => {
      jest.isolateModules(() => require('@/config/environment'));
    }).toThrow('Production builds require an HTTPS API URL.');
  });

  it('accepts and normalizes an HTTPS staging URL', () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://staging-api.example.com/api/v1/';
    process.env.EXPO_PUBLIC_API_ENVIRONMENT = 'Staging';

    jest.isolateModules(() => {
      const { environment } = require('@/config/environment');
      expect(environment).toEqual({
        apiBaseUrl: 'https://staging-api.example.com/api/v1',
        name: 'Staging',
      });
    });
  });
});

export const environment = {
  production: true,
  apiUrl: (globalThis as any)?.process?.env?.['API_BASE_URL'] || 'https://osa-backend-production.up.railway.app/api/v1',
  appName: 'Online Sharia Academy',
  version: '1.0.0'
};

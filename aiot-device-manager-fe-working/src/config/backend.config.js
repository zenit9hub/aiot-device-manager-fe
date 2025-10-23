const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const rawCacheMinutes = Number(import.meta.env.VITE_TOKEN_CACHE_MINUTES ?? 5);
const cacheMinutes = Number.isFinite(rawCacheMinutes) ? clamp(rawCacheMinutes, 2, 10) : 5;

export const backendConfig = {
  baseUrl: (import.meta.env.VITE_BACKEND_BASE_URL ?? 'http://localhost:4000').replace(/\/+$/, ''),
  sensorEndpoint: '/api/sensors/data',
  tokenCacheMinutes: cacheMinutes
};

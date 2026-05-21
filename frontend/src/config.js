// v2
function normalizeApiUrl(raw) {
  const base = (raw || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
}
export const API_BASE_URL = normalizeApiUrl(process.env.REACT_APP_API_URL);
console.log('API_BASE_URL:', API_BASE_URL);
export function appOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return (process.env.REACT_APP_PUBLIC_URL || '').trim().replace(/\/+$/, '');
}
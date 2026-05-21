export const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');

export function appOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return (process.env.REACT_APP_PUBLIC_URL || '').trim().replace(/\/+$/, '');
}
/**
 * API: URL base del backend (incluye /api).
 * En producción define REACT_APP_API_URL en el build (ej. https://tu-api.onrender.com/api).
 */
function normalizeApiUrl(raw) {
  const base = (raw || 'http://localhost:5000').trim().replace(/\/+$/, '');
  return base.endsWith('/api') ? base : `${base}/api`;
}

export const API_BASE_URL = normalizeApiUrl(process.env.REACT_APP_API_URL);

/**
 * Origen público del front (QR, enlaces compartidos).
 * En el navegador usa window.location.origin; opcional REACT_APP_PUBLIC_URL en build (CI).
 */
export function appOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return (process.env.REACT_APP_PUBLIC_URL || '').trim().replace(/\/+$/, '');
}

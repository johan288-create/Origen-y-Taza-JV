import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

/** QR tipo 2: ubicación → Google Maps (ruta o búsqueda si no hay coords) */
export default function QrMapsRedirect() {
  const { id } = useParams();

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/cafeterias/${id}`);
        if (!r.ok || cancel) return;
        const c = await r.json();
        const lat = c.latitud;
        const lng = c.longitud;
        const label = encodeURIComponent(
          [c.nombre, c.direccion, c.ubicacion].filter(Boolean).join(' — ')
        );
        if (lat != null && lng != null) {
          window.location.replace(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
          );
        } else {
          window.location.replace(`https://www.google.com/maps/search/?api=1&query=${label}`);
        }
      } catch {
        if (!cancel) window.location.replace('https://www.google.com/maps');
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-jv-cream px-6 text-jv-coffee">
      <div className="w-16 h-16 rounded-2xl bg-jv-rose/40 border border-jv-gold/40 mb-4 animate-pulse" />
      <p className="font-display text-xl text-center">Abriendo la ruta en Google Maps…</p>
      <p className="text-sm text-jv-coffee/60 mt-2 text-center">Origen y Taza JV</p>
    </div>
  );
}

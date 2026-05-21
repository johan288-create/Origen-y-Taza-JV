import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import QRCode from 'qrcode';
import { API_BASE_URL as BASE_URL, appOrigin } from '../config';
import { BRAND, JV } from '../theme/brand';

// Fix icono leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const ICONO_CAFE = new L.DivIcon({
  html: `<div style="
    background: linear-gradient(135deg,${JV.gold},${JV.rose});
    width: 36px; height: 36px; border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg); border: 3px solid ${JV.coffee};
    box-shadow: 0 3px 12px rgba(212,175,55,0.5);
    display:flex; align-items:center; justify-content:center;
  ">
    <span style="transform:rotate(45deg); font-size:16px;">☕</span>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  className: '',
});

function CentrarMapa({ centro }) {
  const map = useMap();
  useEffect(() => {
    if (centro) map.flyTo(centro, 13, { duration: 1.5 });
  }, [centro, map]);
  return null;
}

function ModalCafeteria({ cafeteria, onCerrar }) {
  const [qrURL, setQrURL] = useState('');
  const url = `${appOrigin()}/cafeteria/${cafeteria.qr_token}`;

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 220, margin: 2,
      color: { dark: JV.qrDark, light: JV.qrLight }
    }).then(setQrURL).catch(() => {});
  }, [url]);

  function abrirNavegacion() {
    const destino = `${cafeteria.latitud},${cafeteria.longitud}`;
    const nombre  = encodeURIComponent(cafeteria.nombre);
    const isMobile = /iPhone|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.open(`geo:${destino}?q=${destino}(${nombre})`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destino}&destination_place_id=${nombre}`, '_blank');
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(10,5,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onCerrar}>
      <div onClick={e => e.stopPropagation()} style={{
        background: JV.bgPage,
        border: `1px solid ${JV.border}`,
        borderRadius: 20, padding: '32px 28px',
        maxWidth: 420, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#fdf6ec', margin: '0 0 4px' }}>
              {cafeteria.nombre}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(245,234,216,0.5)', margin: 0 }}>
              📍 {cafeteria.ubicacion || cafeteria.direccion || 'Colombia'}
            </p>
          </div>
          <button onClick={onCerrar} style={{
            background: 'transparent', border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: 8, padding: '6px 12px', color: 'rgba(245,234,216,0.5)',
            cursor: 'pointer', fontSize: 16,
          }}>✕</button>
        </div>

        {/* Descripción */}
        {cafeteria.descripcion && (
          <p style={{ fontSize: 13, color: 'rgba(245,234,216,0.6)', lineHeight: 1.7, marginBottom: 20 }}>
            {cafeteria.descripcion}
          </p>
        )}

        {/* QR */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: 'rgba(245,234,216,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Escanea para ver el menú
          </p>
          {qrURL && (
            <img src={qrURL} alt="QR Cafetería"
              style={{ borderRadius: 12, border: '4px solid rgba(212,175,55,0.4)', width: 180, height: 180 }}
            />
          )}
          <p style={{ fontSize: 11, color: 'rgba(245,234,216,0.3)', marginTop: 8 }}>
            O toca el botón para ir con navegación GPS
          </p>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={abrirNavegacion} style={{
            flex: 1, background: JV.btn,
            border: 'none', borderRadius: 10, padding: '12px',
            color: JV.btnText, fontWeight: 700, fontSize: 14, cursor: 'pointer',
            fontFamily: 'inherit',
          }}>
            🗺 Cómo llegar
          </button>
<a href={url} target="_blank" rel="noreferrer" style={{
  flex: 1, background: 'transparent',
  border: '1px solid rgba(212,175,55,0.4)', borderRadius: 10, padding: '12px',
  color: 'C.gold', fontWeight: 700, fontSize: 14, cursor: 'pointer',
  fontFamily: 'inherit', textDecoration: 'none', textAlign: 'center',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}}>
  ☕ Ver menú
</a>
        </div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(212,175,55,0.2)', fontSize: 10, color: 'rgba(245,234,216,0.45)', lineHeight: 1.65, wordBreak: 'break-all' }}>
          <strong style={{ color: 'C.gold' }}>QR Origen y Taza JV</strong><br />
          Menú / entrada: {url}<br />
          Entrada (alias): {`${appOrigin()}/qr/entrada/${cafeteria.qr_token}`}<br />
          Ubicación (Maps): {`${appOrigin()}/qr/mapa/${cafeteria.id}`}
        </div>
      </div>
    </div>
  );
}

export default function MapaCafeterias({ onLogin }) {
  const [cafeterias,   setCafeterias]   = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [centro,       setCentro]       = useState(null);
  const [cargando,     setCargando]     = useState(true);

  // Centro inicial: Colombia
  const COLOMBIA = [4.5709, -74.2973];

  useEffect(() => {
    fetch(`${BASE_URL}/mapa/cafeterias`)
      .then(r => r.json())
      .then(data => { setCafeterias(Array.isArray(data) ? data : []); setCargando(false); })
      .catch(() => setCargando(false));
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: "'Outfit','Segoe UI',sans-serif" }}>

      {/* MAPA */}
      <MapContainer
        center={COLOMBIA} zoom={6}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {centro && <CentrarMapa centro={centro} />}
        {cafeterias.map(c => (
          <Marker
            key={c.id}
            position={[c.latitud, c.longitud]}
            icon={ICONO_CAFE}
            eventHandlers={{
              click: () => {
                setCentro([c.latitud, c.longitud]);
                setSeleccionada(c);
              }
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'inherit', minWidth: 160 }}>
                <strong style={{ fontSize: 14 }}>{c.nombre}</strong>
                <br />
                <span style={{ fontSize: 12, color: '#666' }}>{c.ubicacion}</span>
                <br />
                <button onClick={() => setSeleccionada(c)}
                  style={{ marginTop: 8, background: JV.gold, border: 'none', borderRadius: 6, padding: '5px 12px', color: JV.btnText, fontSize: 12, cursor: 'pointer', width: '100%' }}>
                  Ver cafetería
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* HEADER FLOTANTE */}
      <div style={{
        position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 1000, display: 'flex', alignItems: 'center', gap: 16,
        background: 'rgba(75,46,43,0.92)', border: `1px solid ${JV.border}`,
        borderRadius: 99, padding: '10px 24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
      }}>
        <img src={`${process.env.PUBLIC_URL}/logo-cafe.jpeg`} alt="" style={{ width: 32, height: 32, borderRadius: 8 }} />
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 15, color: JV.gold, fontWeight: 700 }}>
          {BRAND.short}
        </span>
        <span style={{ color: JV.border, fontSize: 18 }}>|</span>
        <span style={{ fontSize: 12, color: JV.textMuted }}>
          {cargando ? 'Cargando...' : `${cafeterias.length} cafeterías`}
        </span>
        <button onClick={onLogin} style={{
          background: JV.btn,
          border: 'none', borderRadius: 99, padding: '8px 20px',
          color: JV.btnText, fontWeight: 700, fontSize: 13, cursor: 'pointer',
          fontFamily: 'inherit',
        }}>
          Iniciar sesión
        </button>
      </div>

      {/* CONTADOR ESQUINA */}
      {!cargando && cafeterias.length === 0 && (
        <div style={{
          position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: 'rgba(26,10,0,0.9)', border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: 12, padding: '16px 24px', textAlign: 'center',
        }}>
          <p style={{ color: 'rgba(245,234,216,0.5)', fontSize: 14, margin: 0 }}>
            Aún no hay cafeterías registradas en el mapa
          </p>
          <p style={{ color: 'rgba(245,234,216,0.3)', fontSize: 12, margin: '4px 0 0' }}>
            Los dueños deben agregar sus coordenadas al registrar su cafetería
          </p>
        </div>
      )}

      {/* MODAL */}
      {seleccionada && (
        <ModalCafeteria
          cafeteria={seleccionada}
          onCerrar={() => setSeleccionada(null)}
        />
      )}
    </div>
  );
}
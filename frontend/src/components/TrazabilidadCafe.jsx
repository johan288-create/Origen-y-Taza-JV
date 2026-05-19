import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { JV } from '../theme/brand';

const COLORES_ETAPA = {
  'Siembra':      { color: '#7ec8a0', bg: 'rgba(126,200,160,0.1)',  border: 'rgba(126,200,160,0.3)'  },
  'Cosecha':      { color: '#e87a4a', bg: 'rgba(232,122,74,0.1)',   border: 'rgba(232,122,74,0.3)'   },
  'Despulpado':   { color: JV.gold, bg: 'rgba(212,175,55,0.1)',   border: 'rgba(212,175,55,0.3)'   },
  'Fermentación': { color: '#a0c87e', bg: 'rgba(160,200,126,0.1)',  border: 'rgba(160,200,126,0.3)'  },
  'Secado':       { color: '#f5d78e', bg: 'rgba(245,215,142,0.1)',  border: 'rgba(245,215,142,0.3)'  },
  'Tostión':      { color: JV.gold, bg: 'rgba(212,175,55,0.1)',   border: 'rgba(212,175,55,0.3)'   },
  'Taza':         { color: '#fdf6ec', bg: 'rgba(253,246,236,0.08)', border: 'rgba(253,246,236,0.2)'  },
};

export default function TrazabilidadCafe({ cafeId, cafeNombre }) {
  const [etapas,   setEtapas]   = useState([]);
  const [activa,   setActiva]   = useState(0);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetch(`${API_BASE_URL}/cafes/${cafeId}/trazabilidad`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setEtapas(data);
      } catch (e) {
        console.error('Error cargando trazabilidad:', e);
      }
      setCargando(false);
    }
    cargar();
  }, [cafeId]);

  if (cargando) return (
    <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(245,234,216,0.3)', fontSize: 13 }}>
      Cargando trazabilidad...
    </div>
  );

  if (etapas.length === 0) return (
    <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(245,234,216,0.3)', fontSize: 13 }}>
      Trazabilidad no disponible para este café.
    </div>
  );

  const etapaActiva = etapas[activa];
  const colores     = COLORES_ETAPA[etapaActiva?.etapa] || COLORES_ETAPA['Taza'];

  return (
    <div style={{ marginBottom: 16 }}>

      {/* TÍTULO */}
      <p style={{ color: 'rgba(245,234,216,0.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
        🗺️ Trazabilidad — Del campo a tu taza
      </p>

      {/* LÍNEA DE TIEMPO HORIZONTAL */}
      <div style={{ position: 'relative', marginBottom: 24 }}>

        {/* LÍNEA CONECTORA */}
        <div style={{ position: 'absolute', top: 20, left: 20, right: 20, height: 2, background: 'rgba(212,175,55,0.15)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 20, left: 20, height: 2, background: `linear-gradient(90deg, ${JV.gold}, ${JV.rose})`, zIndex: 1, transition: 'width 0.5s ease', width: `calc(${(activa / (etapas.length - 1)) * 100}% - 40px + ${activa === 0 ? 0 : 20}px)` }} />

        {/* NODOS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          {etapas.map((e, i) => {
            const c = COLORES_ETAPA[e.etapa] || COLORES_ETAPA['Taza'];
            const esActiva    = i === activa;
            const esCompletada = i < activa;
            return (
              <div key={e.id} onClick={() => setActiva(i)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1 }}>

                {/* CÍRCULO */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: esActiva ? c.bg : esCompletada ? 'rgba(212,175,55,0.15)' : 'rgba(26,10,0,0.6)',
                  border: `2px solid ${esActiva ? c.color : esCompletada ? JV.gold : 'rgba(212,175,55,0.2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: esActiva ? 20 : 16,
                  transition: 'all 0.3s',
                  boxShadow: esActiva ? `0 0 16px ${c.color}44` : 'none',
                  transform: esActiva ? 'scale(1.2)' : 'scale(1)',
                }}>
                  {esCompletada && !esActiva ? '✓' : e.icono}
                </div>

                {/* LABEL */}
                <span style={{
                  fontSize: 10, textAlign: 'center', lineHeight: 1.3,
                  color: esActiva ? c.color : esCompletada ? 'rgba(212,175,55,0.7)' : 'rgba(245,234,216,0.3)',
                  fontWeight: esActiva ? 700 : 400,
                  transition: 'color 0.3s',
                }}>
                  {e.etapa}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETALLE DE ETAPA ACTIVA */}
      <div style={{
        background: colores.bg,
        border: `1px solid ${colores.border}`,
        borderRadius: 12, padding: '18px 20px',
        transition: 'all 0.3s',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{etapaActiva.icono}</span>
            <div>
              <p style={{ color: colores.color, fontWeight: 700, fontSize: 15 }}>{etapaActiva.etapa}</p>
              <p style={{ color: 'rgba(245,234,216,0.35)', fontSize: 11 }}>
                Etapa {activa + 1} de {etapas.length}
              </p>
            </div>
          </div>
          <div style={{ background: 'rgba(26,10,0,0.4)', padding: '4px 12px', borderRadius: 20, border: `1px solid ${colores.border}` }}>
            <span style={{ color: colores.color, fontSize: 12 }}>
              📅 {new Date(etapaActiva.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
        <p style={{ color: 'rgba(245,234,216,0.7)', fontSize: 13, lineHeight: 1.8 }}>
          {etapaActiva.descripcion}
        </p>

        {/* NAVEGACIÓN */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
          <button onClick={() => setActiva(Math.max(0, activa - 1))} disabled={activa === 0}
            style={{ padding: '6px 14px', background: 'transparent', border: `1px solid ${activa === 0 ? 'rgba(212,175,55,0.1)' : colores.border}`, borderRadius: 6, color: activa === 0 ? 'rgba(245,234,216,0.2)' : colores.color, fontSize: 12, cursor: activa === 0 ? 'default' : 'pointer', fontFamily: "'Outfit',sans-serif" }}>
            ← Anterior
          </button>
          <div style={{ display: 'flex', gap: 4 }}>
            {etapas.map((_, i) => (
              <div key={i} onClick={() => setActiva(i)}
                style={{ width: 6, height: 6, borderRadius: '50%', background: i === activa ? colores.color : 'rgba(212,175,55,0.2)', cursor: 'pointer', transition: 'background 0.3s' }} />
            ))}
          </div>
          <button onClick={() => setActiva(Math.min(etapas.length - 1, activa + 1))} disabled={activa === etapas.length - 1}
            style={{ padding: '6px 14px', background: 'transparent', border: `1px solid ${activa === etapas.length - 1 ? 'rgba(212,175,55,0.1)' : colores.border}`, borderRadius: 6, color: activa === etapas.length - 1 ? 'rgba(245,234,216,0.2)' : colores.color, fontSize: 12, cursor: activa === etapas.length - 1 ? 'default' : 'pointer', fontFamily: "'Outfit',sans-serif" }}>
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
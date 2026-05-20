import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RadarCafe from './RadarCafe';
import TrazabilidadCafe from './TrazabilidadCafe';
import { API_BASE_URL as BASE_URL } from '../config';
import { C, BRAND, JV } from '../theme/brand';

const ATRIBUTOS_CATA = [
  { key: 'acidez',      label: 'Acidez',       emoji: '🍋', color: '#7ec8a0', desc: 'Vivacidad y frescura'       },
  { key: 'cuerpo',      label: 'Cuerpo',        emoji: '💪', color: C.goldL, desc: 'Peso y textura en boca'     },
  { key: 'dulzor',      label: 'Dulzor',        emoji: '🍯', color: '#f5d78e', desc: 'Azúcares naturales'         },
  { key: 'amargor',     label: 'Amargor',       emoji: '☕', color: C.gold, desc: 'Intensidad del residual'    },
  { key: 'intensidad',  label: 'Intensidad',    emoji: '⚡', color: '#e87a4a', desc: 'Fuerza general del perfil'  },
  { key: 'aroma',       label: 'Aroma',         emoji: '🌸', color: '#c4a0f0', desc: 'Complejidad aromática'      },
  { key: 'balance',     label: 'Balance',       emoji: '⚖️', color: '#7ec8a0', desc: 'Armonía entre atributos'    },
];

function RadarCompleto({ cafe, cata }) {
  // Si hay cata del catador usa esos valores, si no usa los del café
  const valores = cata ? {
    acidez:     cata.acidez,
    cuerpo:     cata.cuerpo,
    dulzor:     cata.dulzor,
    amargor:    cata.amargor,
    intensidad: cata.intensidad,
    aroma:      cata.aroma,
    balance:    cata.balance,
  } : {
    acidez:     cafe.acidez,
    cuerpo:     cafe.cuerpo,
    dulzor:     cafe.dulzor,
    amargor:    cafe.amargor,
    intensidad: cafe.intensidad,
  };

  const attrs = cata ? ATRIBUTOS_CATA : ATRIBUTOS_CATA.slice(0, 5);
  const size  = 200;
  const cx    = size / 2;
  const cy    = size / 2;
  const r     = 75;
  const n     = attrs.length;

  function punto(i, val) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const pct   = (val || 0) / 10;
    return { x: cx + r * pct * Math.cos(angle), y: cy + r * pct * Math.sin(angle) };
  }

  function puntoBase(i) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const puntosData = attrs.map((a, i) => punto(i, valores[a.key]));
  const poly       = puntosData.map(p => `${p.x},${p.y}`).join(' ');
  const grids      = [0.25, 0.5, 0.75, 1].map(pct =>
    attrs.map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${cx + r * pct * Math.cos(angle)},${cy + r * pct * Math.sin(angle)}`;
    }).join(' ')
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {grids.map((g, i) => <polygon key={i} points={g} fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="1" />)}
        {attrs.map((_, i) => {
      
          return <line key={i} x1={cx} y1={cy} x2={b.x} y2={b.y} stroke="rgba(212,175,55,0.15)" strokeWidth="1" />;
        })}
        <polygon points={poly} fill="rgba(212,175,55,0.2)" stroke={JV.gold} strokeWidth="2" />
        {puntosData.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill={attrs[i].color} />)}
        {attrs.map((a, i) => {

          const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
          const lx    = cx + (r + 20) * Math.cos(angle);
          const ly    = cy + (r + 20) * Math.sin(angle);
          return (
            <text key={i} x={lx} y={ly + 4} textAnchor="middle" fontSize="10" fill="rgba(245,234,216,0.5)">
              {a.emoji}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export default function CafePublico() {
  const { id } = useParams();
  const [cafe,          setCafe]          = useState(null);
  const [historia,      setHistoria]      = useState(null);
  const [preparaciones, setPreparaciones] = useState([]);
  const [cata,          setCata]          = useState(null);
  const [cargando,      setCargando]      = useState(true);
  const [verTexto,      setVerTexto]      = useState(false);
  const [audioURL,      setAudioURL]      = useState(null);
  const [seccion,       setSeccion]       = useState('trazabilidad');

  useEffect(() => {
    async function cargar() {
      try {
        const [resCafes, resHist, resPrep] = await Promise.all([
          fetch(`${BASE_URL}/cafes`).then(r => r.json()),
          fetch(`${BASE_URL}/cafes/${id}/historia-narrada`).then(r => r.json()),
          fetch(`${BASE_URL}/cafes/${id}/preparaciones`).then(r => r.json()),
        ]);

        const cafeData = Array.isArray(resCafes) ? resCafes.find(c => c.id === Number(id)) : null;
        setCafe(cafeData);
        setHistoria(resHist);
        setPreparaciones(Array.isArray(resPrep) ? resPrep : []);

        // Cargar cata del catador
        try {
          const resCata = await fetch(`${BASE_URL}/cataciones/cafe/${id}`);
          if (resCata.ok) {
            const dataCata = await resCata.json();
            if (dataCata && dataCata.id) setCata(dataCata);
          }
        } catch {}

        if (resHist?.audio_base64) {
          const binary = atob(resHist.audio_base64);
          const array  = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
          const blob = new Blob([array], { type: resHist.audio_tipo || 'audio/webm' });
          setAudioURL(URL.createObjectURL(blob));
        }
      } catch (e) {
        console.error(e);
      }
      setCargando(false);
    }
    cargar();
  }, [id]);

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: JV.coffeeDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(245,234,216,0.4)', fontFamily: "'Outfit',sans-serif" }}>
      Cargando...
    </div>
  );

  if (!cafe) return (
    <div style={{ minHeight: '100vh', background: JV.coffeeDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ fontSize: 48 }}>☕</div>
      <p style={{ color: 'rgba(245,234,216,0.5)' }}>Café no encontrado</p>
    </div>
  );

  const sabores = Array.isArray(cafe.sabores) ? cafe.sabores : (cafe.sabores ? cafe.sabores.split(',') : []);

  const TABS = [
    { key: 'trazabilidad', label: '🗺 Trazabilidad'    },
    { key: 'sensorial',    label: '📊 Perfil sensorial' },
    { key: 'historia',     label: '🎙 Historia'         },
    { key: 'preparacion',  label: '☕ Cómo prepararlo'  },
  ];

  return (
    <div style={{ minHeight: '100vh', background: JV.bgPage, fontFamily: "'Outfit',sans-serif", color: '#f5ead8' }}>

      {/* HERO */}
      <div style={{ background: 'rgba(26,10,0,0.9)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '28px 24px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <p style={{ fontSize: 11, color: 'rgba(245,234,216,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            ☕ {BRAND.short} — Tu café
          </p>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: C.cream, margin: '0 0 6px' }}>{cafe.nombre}</h1>
          <p style={{ color: C.gold, fontSize: 14, margin: '0 0 14px' }}>
            {cafe.origen} · {cafe.variedad} · {cafe.proceso}
            {cafe.altitud && ` · ${cafe.altitud} msnm`}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {sabores.map(s => (
              <span key={s} style={{ background: 'rgba(212,175,55,0.15)', color: C.goldL, padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{s}</span>
            ))}
          </div>

          {/* Puntaje del catador */}
          {cata?.puntaje_total && (
            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 99, padding: '6px 16px' }}>
              <span style={{ fontSize: 12, color: 'rgba(245,234,216,0.5)' }}>Puntaje catador</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: Number(cata.puntaje_total) >= 8 ? '#7ec8a0' : 'C.gold' }}>
                {cata.puntaje_total}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(245,234,216,0.35)' }}>/10</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px' }}>

        {cafe.descripcion && (
          <p style={{ color: 'rgba(245,234,216,0.6)', fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>{cafe.descripcion}</p>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setSeccion(t.key)}
              style={{ background: seccion === t.key ? 'rgba(212,175,55,0.2)' : 'transparent', border: `1px solid ${seccion === t.key ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.15)'}`, borderRadius: 8, padding: '7px 14px', color: seccion === t.key ? 'C.gold' : 'rgba(245,234,216,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: seccion === t.key ? 700 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TRAZABILIDAD */}
        {seccion === 'trazabilidad' && (
          <TrazabilidadCafe cafeId={cafe.id} cafeNombre={cafe.nombre} />
        )}

        {/* PERFIL SENSORIAL */}
        {seccion === 'sensorial' && (
          <div>
            {/* Datos del catador */}
            {cata ? (
              <div style={{ background: 'rgba(75,46,43,0.7)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 16, padding: '22px 24px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'rgba(245,234,216,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      🍵 Evaluado por el catador
                    </p>
                    {cata.metodo_catacion && (
                      <p style={{ fontSize: 12, color: 'rgba(245,234,216,0.35)', margin: 0 }}>Método: {cata.metodo_catacion}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: Number(cata.puntaje_total) >= 8 ? '#7ec8a0' : 'C.gold', lineHeight: 1 }}>
                      {cata.puntaje_total}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(245,234,216,0.35)' }}>puntaje total / 10</div>
                  </div>
                </div>

                {/* Radar */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <RadarCompleto cafe={cafe} cata={cata} />
                </div>

                {/* Barras de atributos */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
                  {ATRIBUTOS_CATA.map(a => (
                    <div key={a.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'rgba(245,234,216,0.5)' }}>{a.emoji} {a.label}</span>
                        <span style={{ color: a.color, fontWeight: 700 }}>{cata[a.key] || '—'}</span>
                      </div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${(cata[a.key] || 0) * 10}%`, background: a.color, borderRadius: 3, transition: 'width 0.6s' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Descriptores */}
                {cata.descriptores && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 11, color: 'rgba(245,234,216,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                      Descriptores identificados
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {cata.descriptores.split(',').map(d => (
                        <span key={d} style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 99, padding: '3px 10px', fontSize: 12, color: C.goldL }}>
                          {d.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notas del catador */}
                {cata.notas && (
                  <div style={{ marginTop: 16, background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 10, padding: '12px 16px' }}>
                    <p style={{ fontSize: 11, color: 'rgba(245,234,216,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                      Notas del catador
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(245,234,216,0.7)', fontStyle: 'italic', margin: 0, lineHeight: 1.7 }}>
                      "{cata.notas}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Sin cata — mostrar perfil básico del café */
              <div style={{ background: 'rgba(75,46,43,0.7)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: 'rgba(245,234,216,0.35)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
                  📊 Perfil sensorial del café
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <RadarCafe cafe={cafe} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Acidez',     valor: cafe.acidez,     color: '#7ec8a0' },
                    { label: 'Cuerpo',     valor: cafe.cuerpo,     color: C.goldL },
                    { label: 'Dulzor',     valor: cafe.dulzor,     color: '#a0c87e' },
                    { label: 'Amargor',    valor: cafe.amargor,    color: '#e87a4a' },
                    { label: 'Intensidad', valor: cafe.intensidad, color: C.gold },
                  ].map(a => (
                    <div key={a.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(245,234,216,0.5)', marginBottom: 5 }}>
                        <span>{a.label}</span><span>{a.valor}/10</span>
                      </div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${(a.valor || 0) * 10}%`, background: a.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'rgba(245,234,216,0.25)', textAlign: 'center', marginTop: 14, marginBottom: 0 }}>
                  Aún no hay evaluación del catador para este café
                </p>
              </div>
            )}
          </div>
        )}

        {/* HISTORIA */}
        {seccion === 'historia' && (
          <div>
            {audioURL ? (
              <div style={{ background: 'rgba(126,200,160,0.07)', border: '1px solid rgba(126,200,160,0.2)', borderRadius: 14, padding: '20px 22px', marginBottom: 14 }}>
                <p style={{ color: '#7ec8a0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  🎙 Historia narrada por el caficultor
                </p>
                <audio controls src={audioURL} style={{ width: '100%', borderRadius: 8 }} />
                {historia?.texto && (
                  <>
                    <button onClick={() => setVerTexto(!verTexto)}
                      style={{ marginTop: 12, background: 'transparent', border: '1px solid rgba(126,200,160,0.3)', borderRadius: 7, padding: '6px 14px', color: '#7ec8a0', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {verTexto ? '📖 Ocultar texto' : '📖 Leer historia'}
                    </button>
                    {verTexto && (
                      <p style={{ color: 'rgba(245,234,216,0.75)', fontSize: 13, lineHeight: 1.85, fontStyle: 'italic', marginTop: 12, marginBottom: 0 }}>
                        "{historia.texto}"
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : historia?.texto ? (
              <div style={{ background: 'rgba(126,200,160,0.07)', border: '1px solid rgba(126,200,160,0.2)', borderRadius: 14, padding: '20px 22px' }}>
                <p style={{ color: '#7ec8a0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  📖 Historia del caficultor
                </p>
                <p style={{ color: 'rgba(245,234,216,0.75)', fontSize: 14, lineHeight: 1.85, fontStyle: 'italic', margin: 0 }}>
                  "{historia.texto}"
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(245,234,216,0.3)' }}>
                El caficultor aún no ha narrado la historia de este café.
              </div>
            )}
          </div>
        )}

        {/* CÓMO PREPARARLO */}
        {seccion === 'preparacion' && (
          <div>
            {preparaciones.length === 0
              ? <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(245,234,216,0.3)' }}>
                  El caficultor aún no ha agregado recomendaciones de preparación.
                </div>
              : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
                  {preparaciones.map(p => (
                    <div key={p.id} style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 14, padding: '18px 20px' }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>☕</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.goldL, marginBottom: 12 }}>{p.metodo}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                          ['🌡', 'Temperatura', p.temperatura],
                          ['⚙️', 'Molienda',    p.molienda],
                          ['⚖️', 'Dosis',       p.dosis_gr  && `${p.dosis_gr}g`],
                          ['💧', 'Agua',        p.agua_ml   && `${p.agua_ml}ml`],
                          ['⏱', 'Tiempo',      p.tiempo],
                        ].filter(([,,v]) => v).map(([icon, label, val]) => (
                          <div key={label} style={{ display: 'flex', gap: 6, fontSize: 13 }}>
                            <span>{icon}</span>
                            <span style={{ color: 'rgba(245,234,216,0.4)' }}>{label}:</span>
                            <span style={{ color: 'rgba(245,234,216,0.8)' }}>{val}</span>
                          </div>
                        ))}
                      </div>
                      {p.notas && (
                        <p style={{ fontSize: 12, color: 'rgba(245,234,216,0.4)', fontStyle: 'italic', marginTop: 10, marginBottom: 0, borderTop: '1px solid rgba(212,175,55,0.15)', paddingTop: 8 }}>
                          "{p.notas}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}
      </div>
    </div>
  );
}
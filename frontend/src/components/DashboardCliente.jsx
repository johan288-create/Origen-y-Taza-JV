import React, { useState, useEffect } from 'react';
import RadarCafe from './RadarCafe';
import TrazabilidadCafe from './TrazabilidadCafe';
import { getCafes, crearPedido } from '../api';
import { API_BASE_URL } from '../config';
import { C, BRAND, JV } from '../theme/brand';

const PREGUNTAS = [
  { id: 'sabor', texto: '¿Qué sabores prefieres?', opciones: [
    { label: 'Frutal y floral',     value: 'frutal'    },
    { label: 'Chocolate y nueces',  value: 'chocolate' },
    { label: 'Dulce y caramelo',    value: 'dulce'     },
    { label: 'Intenso y robusto',   value: 'intenso'   },
  ]},
  { id: 'cuerpo', texto: '¿Cómo te gusta el cuerpo del café?', opciones: [
    { label: 'Ligero',  value: 'ligero'  },
    { label: 'Medio',   value: 'medio'   },
    { label: 'Intenso', value: 'intenso' },
  ]},
  { id: 'momento', texto: '¿Para qué momento es?', opciones: [
    { label: 'Despertar / Mañana',      value: 'manana'   },
    { label: 'Trabajo / Concentración', value: 'trabajo'  },
    { label: 'Relajarme',               value: 'relajar'  },
    { label: 'Explorar algo nuevo',     value: 'explorar' },
  ]},
];

function recomendar(cafes, respuestas) {
  let puntuados = cafes.map(cafe => {
    let score = 0;
    if (respuestas.cuerpo === 'ligero'    && cafe.cuerpo <= 5) score += 2;
    if (respuestas.cuerpo === 'medio'     && cafe.cuerpo >= 5 && cafe.cuerpo <= 7) score += 2;
    if (respuestas.cuerpo === 'intenso'   && cafe.cuerpo >= 8) score += 2;
    if (respuestas.sabor  === 'frutal'    && cafe.acidez >= 7)     score += 2;
    if (respuestas.sabor  === 'chocolate' && cafe.amargor >= 5)    score += 2;
    if (respuestas.sabor  === 'dulce'     && cafe.dulzor >= 7)     score += 2;
    if (respuestas.sabor  === 'intenso'   && cafe.intensidad >= 4) score += 2;
    return { ...cafe, score };
  });
  return puntuados.sort((a, b) => b.score - a.score).slice(0, 3).map((c, i) => ({
    ...c,
    razon: i === 0 ? 'Perfecto para tu perfil de sabor y momento del día'
         : i === 1 ? 'Excelente balance entre lo que buscas'
         : 'Una opción diferente que te podría sorprender',
  }));
}

function BarraSensorial({ label, valor, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(245,234,216,0.5)', marginBottom: 4 }}>
        <span>{label}</span><span>{valor}/10</span>
      </div>
      <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${valor * 10}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function TarjetaCafe({ cafe, onPedir }) {
  const [expandido,            setExpandido]            = useState(false);
  const [historia,             setHistoria]             = useState('');
  const [verHistoria,          setVerHistoria]          = useState(false);
  const [verTrazabilidad,      setVerTrazabilidad]      = useState(false);
  const [historiaCompleta,     setHistoriaCompleta]     = useState(null);
  const [preparaciones,        setPreparaciones]        = useState([]);
  const [verHistoriaCompleta,  setVerHistoriaCompleta]  = useState(false);
  const [verTextoHistoria,     setVerTextoHistoria]     = useState(false);
  const [audioURL,             setAudioURL]             = useState(null);
  const [cargandoHistoria,     setCargandoHistoria]     = useState(false);

  const sabores = Array.isArray(cafe.sabores)
    ? cafe.sabores
    : (cafe.sabores ? cafe.sabores.split(',') : []);

  // Historia de texto (la original del servidor)
  async function cargarHistoria() {
    if (historia) { setVerHistoria(!verHistoria); return; }
    try {
      const res  = await fetch(`${API_BASE_URL}/cafes/${cafe.id}/historia`);
      const data = await res.json();
      setHistoria(data.historia);
      setVerHistoria(true);
    } catch {
      setHistoria('No se pudo cargar la historia del caficultor.');
      setVerHistoria(true);
    }
  }

  // Historia narrada + preparaciones (del caficultor)
  async function cargarHistoriaCompleta() {
    if (historiaCompleta) {
      setVerHistoriaCompleta(!verHistoriaCompleta);
      return;
    }
    setCargandoHistoria(true);
    try {
      const [h, p] = await Promise.all([
        fetch(`${API_BASE_URL}/cafes/${cafe.id}/historia-narrada`).then(r => r.json()),
        fetch(`${API_BASE_URL}/cafes/${cafe.id}/preparaciones`).then(r => r.json()),
      ]);
      setHistoriaCompleta(h || {});
      setPreparaciones(Array.isArray(p) ? p : []);
      if (h?.audio_base64) {
        const binary = atob(h.audio_base64);
        const array  = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
        const blob = new Blob([array], { type: h.audio_tipo || 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
      }
      setVerHistoriaCompleta(true);
    } catch {
      setHistoriaCompleta({});
      setVerHistoriaCompleta(true);
    } finally {
      setCargandoHistoria(false);
    }
  }

  const ICONOS_METODO = {
    'V60': '☕', 'Chemex': '🫗', 'Aeropress': '🔧', 'Prensa francesa': '🫖',
    'Espresso': '⚡', 'Cold Brew': '🧊', 'Moka': '🍶', 'Kalita Wave': '🌊',
    'Sifón': '🔬', 'Goteo': '💧', 'Turco': '🏺', 'Otro': '☕',
  };

  return (
    <div
      style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'}
    >

      {/* ENCABEZADO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <h3 style={{ color: '#fdf6ec', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{cafe.nombre}</h3>
          <p style={{ color: C.gold, fontSize: 12 }}>{cafe.origen} · {cafe.altitud}</p>
        </div>
        <span style={{ background: 'rgba(212,175,55,0.15)', color: C.gold, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
          ${Number(cafe.precio).toLocaleString()}
        </span>
      </div>

      {/* SABORES */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {sabores.map(s => (
          <span key={s} style={{ background: 'rgba(244,169,196,0.12)', color: 'rgba(245,234,216,0.7)', padding: '3px 9px', borderRadius: 20, fontSize: 11 }}>{s}</span>
        ))}
      </div>

      {/* DESCRIPCIÓN */}
      <p style={{ color: 'rgba(245,234,216,0.55)', fontSize: 13, marginBottom: 12, lineHeight: 1.6 }}>{cafe.descripcion}</p>

      {/* DETALLES */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {[
          { label: 'Variedad', valor: cafe.variedad },
          { label: 'Proceso',  valor: cafe.proceso  },
          { label: 'Altitud',  valor: cafe.altitud  },
        ].map(d => (
          <div key={d.label} style={{ background: 'rgba(26,10,0,0.4)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: 6, padding: '4px 10px' }}>
            <span style={{ color: 'rgba(245,234,216,0.35)', fontSize: 10, display: 'block' }}>{d.label}</span>
            <span style={{ color: 'rgba(245,234,216,0.75)', fontSize: 12 }}>{d.valor}</span>
          </div>
        ))}
      </div>

      {/* PERFIL SENSORIAL */}
      {expandido && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ color: 'rgba(245,234,216,0.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Perfil Sensorial
          </p>
          <RadarCafe cafe={cafe} />
          <BarraSensorial label="Acidez"  valor={cafe.acidez}  color="#7ec8a0" />
          <BarraSensorial label="Cuerpo"  valor={cafe.cuerpo}  color={C.gold} />
          <BarraSensorial label="Dulzor"  valor={cafe.dulzor}  color="#a0c87e" />
          <BarraSensorial label="Amargor" valor={cafe.amargor} color="#e87a4a" />
        </div>
      )}

      {/* HISTORIA DE TEXTO (original) */}
      {verHistoria && historia && (
        <div style={{ background: 'rgba(160,200,126,0.07)', border: '1px solid rgba(160,200,126,0.2)', borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <p style={{ color: '#a0c87e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            🌱 Historia del Caficultor
          </p>
          <p style={{ color: 'rgba(245,234,216,0.75)', fontSize: 13, lineHeight: 1.8, fontStyle: 'italic' }}>
            {historia}
          </p>
        </div>
      )}

      {/* TRAZABILIDAD */}
      {verTrazabilidad && (
        <div style={{ marginBottom: 14 }}>
          <TrazabilidadCafe cafeId={cafe.id} cafeNombre={cafe.nombre} />
        </div>
      )}

      {/* HISTORIA NARRADA + PREPARACIONES */}
      {verHistoriaCompleta && (
        <div style={{ marginBottom: 14 }}>

          {/* AUDIO */}
          {audioURL && (
            <div style={{ background: 'rgba(93,168,110,0.07)', border: '1px solid rgba(93,168,110,0.25)', borderRadius: 12, padding: '16px 18px', marginBottom: 12 }}>
              <p style={{ color: '#7ec8a0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                🎙 Historia narrada por el caficultor
              </p>
              <audio controls src={audioURL} style={{ width: '100%', borderRadius: 8 }} />
              {historiaCompleta?.texto && (
                <button
                  onClick={() => setVerTextoHistoria(!verTextoHistoria)}
                  style={{ marginTop: 10, background: 'transparent', border: '1px solid rgba(93,168,110,0.3)', borderRadius: 7, padding: '6px 14px', color: '#7ec8a0', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {verTextoHistoria ? '📖 Ocultar texto' : '📖 Leer historia'}
                </button>
              )}
              {verTextoHistoria && historiaCompleta?.texto && (
                <p style={{ color: 'rgba(245,234,216,0.75)', fontSize: 13, lineHeight: 1.85, fontStyle: 'italic', marginTop: 10, marginBottom: 0 }}>
                  "{historiaCompleta.texto}"
                </p>
              )}
            </div>
          )}

          {/* SOLO TEXTO SI NO HAY AUDIO */}
          {!audioURL && historiaCompleta?.texto && (
            <div style={{ background: 'rgba(93,168,110,0.07)', border: '1px solid rgba(93,168,110,0.25)', borderRadius: 12, padding: '16px 18px', marginBottom: 12 }}>
              <p style={{ color: '#7ec8a0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                📖 Historia del caficultor
              </p>
              <p style={{ color: 'rgba(245,234,216,0.75)', fontSize: 13, lineHeight: 1.85, fontStyle: 'italic', margin: 0 }}>
                "{historiaCompleta.texto}"
              </p>
            </div>
          )}

          {/* PREPARACIONES */}
          {preparaciones.length > 0 && (
            <div style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
              <p style={{ color: C.gold, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                ☕ Cómo preparar este café — recomendado por el caficultor
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {preparaciones.map(p => (
                  <div key={p.id}
                    style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', flex: '1 1 160px', minWidth: 150 }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{ICONOS_METODO[p.metodo] || '☕'}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.gold, marginBottom: 10 }}>{p.metodo}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {[
                        ['🌡', 'Temp.',    p.temperatura],
                        ['⚙️', 'Molienda', p.molienda],
                        ['⚖️', 'Dosis',    p.dosis_gr  && `${p.dosis_gr}g`],
                        ['💧', 'Agua',     p.agua_ml   && `${p.agua_ml}ml`],
                        ['⏱', 'Tiempo',   p.tiempo],
                      ].filter(([,,v]) => v).map(([icon, label, val]) => (
                        <div key={label} style={{ display: 'flex', gap: 5, fontSize: 12, alignItems: 'center' }}>
                          <span style={{ flexShrink: 0 }}>{icon}</span>
                          <span style={{ color: 'rgba(245,234,216,0.4)' }}>{label}:</span>
                          <span style={{ color: 'rgba(245,234,216,0.8)' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                    {p.notas && (
                      <p style={{ fontSize: 11, color: 'rgba(245,234,216,0.45)', fontStyle: 'italic', marginTop: 10, marginBottom: 0, borderTop: '1px solid rgba(212,175,55,0.15)', paddingTop: 8 }}>
                        "{p.notas}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sin contenido aún */}
          {!audioURL && !historiaCompleta?.texto && preparaciones.length === 0 && (
            <div style={{ textAlign: 'center', padding: '16px', color: 'rgba(245,234,216,0.3)', fontSize: 13, background: 'rgba(45,18,0,0.4)', borderRadius: 10 }}>
              El caficultor aún no ha agregado historia ni preparaciones para este café.
            </div>
          )}
        </div>
      )}

      {/* BOTONES */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setExpandido(!expandido)}
          style={{ flex: 1, padding: '9px', background: expandido ? 'rgba(212,175,55,0.15)' : 'transparent', border: `1px solid ${C.border}`, borderRadius: 7, color: C.gold, fontSize: 12, cursor: 'pointer', minWidth: 90 }}>
          {expandido ? '📊 Ocultar perfil' : '📊 Perfil sensorial'}
        </button>
        <button onClick={cargarHistoria}
          style={{ flex: 1, padding: '9px', background: verHistoria ? 'rgba(160,200,126,0.15)' : 'transparent', border: `1px solid ${verHistoria ? 'rgba(160,200,126,0.4)' : 'rgba(160,200,126,0.2)'}`, borderRadius: 7, color: '#a0c87e', fontSize: 12, cursor: 'pointer', minWidth: 90 }}>
          {verHistoria ? '🌱 Ocultar' : '🌱 Historia'}
        </button>
        <button onClick={() => setVerTrazabilidad(!verTrazabilidad)}
          style={{ flex: 1, padding: '9px', background: verTrazabilidad ? 'rgba(245,215,142,0.15)' : 'transparent', border: `1px solid ${verTrazabilidad ? 'rgba(245,215,142,0.4)' : 'rgba(245,215,142,0.2)'}`, borderRadius: 7, color: '#f5d78e', fontSize: 12, cursor: 'pointer', minWidth: 90 }}>
          {verTrazabilidad ? '🗺️ Ocultar ruta' : '🗺️ Trazabilidad'}
        </button>
        <button onClick={cargarHistoriaCompleta} disabled={cargandoHistoria}
          style={{ flex: 1, padding: '9px', background: verHistoriaCompleta ? 'rgba(93,168,110,0.15)' : 'transparent', border: `1px solid ${verHistoriaCompleta ? 'rgba(93,168,110,0.4)' : 'rgba(93,168,110,0.2)'}`, borderRadius: 7, color: '#7ec8a0', fontSize: 12, cursor: cargandoHistoria ? 'wait' : 'pointer', minWidth: 90, opacity: cargandoHistoria ? 0.6 : 1 }}>
          {cargandoHistoria ? '⏳ Cargando...' : verHistoriaCompleta ? '🎙 Ocultar' : '🎙 Historia & Prep.'}
        </button>
        <button onClick={() => onPedir(cafe)}
          style={{ flex: 1, padding: '9px', background: C.btn, border: 'none', borderRadius: 7, color: C.btnText, fontSize: 12, fontWeight: 700, cursor: 'pointer', minWidth: 90 }}>
          ☕ Pedir
        </button>
      </div>
    </div>
  );
}

export default function DashboardCliente({ usuario, onLogout }) {
  const [seccion,      setSeccion]      = useState('inicio');
  const [paso,         setPaso]         = useState(0);
  const [respuestas,   setRespuestas]   = useState({});
  const [recomendados, setRecomendados] = useState([]);
  const [pedido,       setPedido]       = useState(null);
  const [historial,    setHistorial]    = useState([]);
  const [cafes,        setCafes]        = useState([]);
  const [cargando,     setCargando]     = useState(true);

  useEffect(() => {
    getCafes().then(data => {
      if (Array.isArray(data)) setCafes(data);
      setCargando(false);
    }).catch(() => setCargando(false));
  }, []);

  function responder(preguntaId, valor) {
    const nuevas = { ...respuestas, [preguntaId]: valor };
    setRespuestas(nuevas);
    if (paso < PREGUNTAS.length - 1) {
      setPaso(paso + 1);
    } else {
      setRecomendados(recomendar(cafes, nuevas));
      setSeccion('recomendaciones');
    }
  }

  async function hacerPedido(cafe) {
    const nuevoPedido = { ...cafe, hora: new Date().toLocaleTimeString(), idLocal: Date.now() };
    try {
      await crearPedido({ cliente_id: usuario.id, cafe_id: cafe.id, mesa: 'App', metodo: 'V60' });
    } catch(e) {}
    setPedido(nuevoPedido);
    setHistorial(prev => [nuevoPedido, ...prev]);
    setSeccion('pedido');
  }

  const NAV = [
    { key: 'inicio',       label: '☕ Inicio'     },
    { key: 'cuestionario', label: '🎯 Recomendar' },
    { key: 'menu',         label: '📋 Menú'       },
    { key: 'historial',    label: '📜 Historial'  },
  ];

  return (
    <div style={{ minHeight: '100vh', background: JV.bgPage, fontFamily: "'Outfit',sans-serif", color: C.cream }}>

      {/* NAVBAR */}
      <nav style={{ background: 'rgba(45,18,0,0.9)', borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: C.gold, fontWeight: 700 }}>☕ {BRAND.short}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV.map(n => (
            <button key={n.key} onClick={() => { setSeccion(n.key); setPaso(0); setRespuestas({}); }}
              style={{ padding: '8px 16px', background: seccion === n.key ? 'rgba(212,175,55,0.2)' : 'transparent', border: seccion === n.key ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent', borderRadius: 7, color: seccion === n.key ? C.gold : 'rgba(245,234,216,0.5)', fontSize: 13, cursor: 'pointer' }}>
              {n.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(245,234,216,0.5)' }}>{usuario.email}</span>
          <button onClick={onLogout} style={{ padding: '7px 14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 7, color: C.gold, fontSize: 12, cursor: 'pointer' }}>Salir</button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        {/* INICIO */}
        {seccion === 'inicio' && (
          <div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 32, color: '#fdf6ec', marginBottom: 8 }}>Hola, bienvenido ☕</h1>
            <p style={{ color: 'rgba(245,234,216,0.55)', fontSize: 15, marginBottom: 40 }}>Descubre el café perfecto para ti hoy</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                { icon: '🎯', titulo: 'Recomendación', desc: 'Responde 3 preguntas y te sugerimos tu café ideal', accion: () => setSeccion('cuestionario') },
                { icon: '📋', titulo: 'Ver Menú',      desc: `${cafes.length} cafés de origen disponibles`,        accion: () => setSeccion('menu') },
                { icon: '📜', titulo: 'Mi Historial',  desc: `${historial.length} pedidos realizados`,              accion: () => setSeccion('historial') },
              ].map(card => (
                <div key={card.titulo} onClick={card.accion}
                  style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
                  <h3 style={{ color: '#fdf6ec', fontSize: 16, marginBottom: 8 }}>{card.titulo}</h3>
                  <p style={{ color: 'rgba(245,234,216,0.5)', fontSize: 13 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUESTIONARIO */}
        {seccion === 'cuestionario' && (
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: 'rgba(245,234,216,0.4)' }}>Pregunta {paso + 1} de {PREGUNTAS.length}</span>
                <span style={{ fontSize: 13, color: C.gold }}>{Math.round((paso / PREGUNTAS.length) * 100)}%</span>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${(paso / PREGUNTAS.length) * 100}%`, background: C.gold, borderRadius: 2, transition: 'width 0.4s' }} />
              </div>
            </div>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 36 }}>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#fdf6ec', marginBottom: 28, lineHeight: 1.4 }}>{PREGUNTAS[paso].texto}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PREGUNTAS[paso].opciones.map(op => (
                  <button key={op.value} onClick={() => responder(PREGUNTAS[paso].id, op.value)}
                    style={{ padding: '14px 20px', background: 'rgba(26,10,0,0.5)', border: `1px solid ${C.border}`, borderRadius: 10, color: C.cream, fontSize: 14, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = 'rgba(212,175,55,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; e.currentTarget.style.background = 'rgba(26,10,0,0.5)'; }}>
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RECOMENDACIONES */}
        {seccion === 'recomendaciones' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 26, color: '#fdf6ec', marginBottom: 6 }}>Tus cafés recomendados</h2>
            <p style={{ color: 'rgba(245,234,216,0.5)', fontSize: 14, marginBottom: 28 }}>Basado en tus preferencias, estos son los mejores para ti hoy</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
              {recomendados.map((cafe, i) => (
                <div key={cafe.id}>
                  {i === 0 && <div style={{ background: C.gold, color: C.btnText, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: '6px 6px 0 0', width: 'fit-content' }}>⭐ MEJOR OPCIÓN</div>}
                  <TarjetaCafe cafe={cafe} onPedir={hacerPedido} />
                  <p style={{ color: C.gold, fontSize: 12, marginTop: 8, padding: '0 4px' }}>💡 {cafe.razon}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MENÚ */}
        {seccion === 'menu' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 26, color: '#fdf6ec', marginBottom: 6 }}>Menú de cafés</h2>
            <p style={{ color: 'rgba(245,234,216,0.5)', fontSize: 14, marginBottom: 28 }}>Cafés de origen de la región Sumapaz</p>
            {cargando
              ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(245,234,216,0.3)' }}>Cargando cafés...</div>
              : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
                  {cafes.map(cafe => <TarjetaCafe key={cafe.id} cafe={cafe} onPedir={hacerPedido} />)}
                </div>
            }
          </div>
        )}

        {/* PEDIDO CONFIRMADO */}
        {seccion === 'pedido' && pedido && (
          <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>☕</div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 26, color: '#fdf6ec', marginBottom: 8 }}>¡Pedido realizado!</h2>
            <p style={{ color: 'rgba(245,234,216,0.5)', marginBottom: 28 }}>Tu {pedido.nombre} está siendo preparado</p>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 24, textAlign: 'left' }}>
              {[
                { label: 'Café',   valor: pedido.nombre,                               color: '#fdf6ec' },
                { label: 'Origen', valor: pedido.origen,                               color: '#fdf6ec' },
                { label: 'Precio', valor: `$${Number(pedido.precio).toLocaleString()}`, color: C.gold },
                { label: 'Hora',   valor: pedido.hora,                                 color: '#fdf6ec' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ color: 'rgba(245,234,216,0.5)', fontSize: 13 }}>{item.label}</span>
                  <span style={{ color: item.color, fontSize: 13 }}>{item.valor}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSeccion('inicio')}
              style={{ padding: '12px 32px', background: C.btn, border: 'none', borderRadius: 8, color: C.btnText, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Volver al inicio
            </button>
          </div>
        )}

        {/* HISTORIAL */}
        {seccion === 'historial' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 26, color: '#fdf6ec', marginBottom: 6 }}>Mi historial</h2>
            <p style={{ color: 'rgba(245,234,216,0.5)', fontSize: 14, marginBottom: 28 }}>Tus pedidos anteriores</p>
            {historial.length === 0
              ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(245,234,216,0.3)' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>☕</div>
                  <p>Aún no tienes pedidos. ¡Pide tu primer café!</p>
                </div>
              : historial.map(p => (
                <div key={p.idLocal} style={{ background: C.bgCard, border: '1px solid rgba(212,175,55,0.15)', borderRadius: 10, padding: '16px 20px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#fdf6ec', fontWeight: 600, marginBottom: 3 }}>{p.nombre}</p>
                    <p style={{ color: 'rgba(245,234,216,0.4)', fontSize: 12 }}>{p.origen} · {p.hora}</p>
                  </div>
                  <span style={{ color: C.gold, fontWeight: 600 }}>${Number(p.precio).toLocaleString()}</span>
                </div>
              ))
            }
          </div>
        )}

      </div>
    </div>
  );
}
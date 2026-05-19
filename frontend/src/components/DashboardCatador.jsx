import React, { useState, useEffect } from 'react';
import { API_BASE_URL as BASE_URL } from '../config';
import { C, BRAND, JV } from '../theme/brand';

const ATRIBUTOS = [
  { key: 'acidez',     label: 'Acidez',     emoji: '🍋', desc: 'Vivacidad y frescura en taza',         color: '#7ec8a0' },
  { key: 'cuerpo',     label: 'Cuerpo',     emoji: '💪', desc: 'Peso y textura en boca',               color: C.gold },
  { key: 'dulzor',     label: 'Dulzor',     emoji: '🍯', desc: 'Percepción de azúcares naturales',     color: '#f5d78e' },
  { key: 'amargor',    label: 'Amargor',    emoji: '☕', desc: 'Intensidad del amargor residual',      color: JV.gold },
  { key: 'intensidad', label: 'Intensidad', emoji: '⚡', desc: 'Fuerza general del perfil',            color: '#e87a4a' },
  { key: 'aroma',      label: 'Aroma',      emoji: '🌸', desc: 'Complejidad y calidad aromática',      color: '#c4a0f0' },
  { key: 'balance',    label: 'Balance',    emoji: '⚖️', desc: 'Armonía entre todos los atributos',    color: '#7ec8a0' },
];

const METODOS = ['Espresso','V60','Chemex','Aeropress','Prensa francesa','Cold Brew','Moka','Goteo','Sin especificar'];

const DESCRIPTORES_SUGERIDOS = [
  'Jazmín','Durazno','Ciruela','Chocolate','Caramelo','Panela',
  'Naranja','Limón','Frutos rojos','Nuez','Tabaco','Madera',
  'Miel','Vainilla','Especias','Floral','Frutal','Herbal',
];

function Slider({ label, emoji, desc, color, value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{emoji}</span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.cream }}>{label}</span>
            <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>{desc}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: value ? color : C.muted, minWidth: 28, textAlign: 'right' }}>
            {value || '—'}
          </span>
          <span style={{ fontSize: 11, color: C.muted }}>/10</span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 36, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(value || 0) * 10}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: 99, transition: 'width 0.3s ease' }} />
        </div>
        <input type="range" min="1" max="10" value={value || 1}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'relative', width: '100%', appearance: 'none', background: 'transparent', cursor: 'pointer', height: 36, zIndex: 1,
            WebkitAppearance: 'none',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.muted, marginTop: 2 }}>
        <span>1 — Bajo</span><span>5 — Medio</span><span>10 — Alto</span>
      </div>
    </div>
  );
}

function RadarMini({ valores }) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 60;
  const n = ATRIBUTOS.length;

  function punto(i, val) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const pct = (val || 0) / 10;
    return { x: cx + r * pct * Math.cos(angle), y: cy + r * pct * Math.sin(angle) };
  }

  function puntoBase(i) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const puntosData = ATRIBUTOS.map((a, i) => punto(i, valores[a.key]));
  const poly = puntosData.map(p => `${p.x},${p.y}`).join(' ');

  const grids = [0.25, 0.5, 0.75, 1].map(pct =>
    ATRIBUTOS.map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return `${cx + r * pct * Math.cos(angle)},${cy + r * pct * Math.sin(angle)}`;
    }).join(' ')
  );

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {grids.map((g, i) => <polygon key={i} points={g} fill="none" stroke="rgba(160,120,220,0.15)" strokeWidth="1" />)}
      {ATRIBUTOS.map((_, i) => {
        const b = puntoBase(i);
        return <line key={i} x1={cx} y1={cy} x2={b.x} y2={b.y} stroke="rgba(160,120,220,0.15)" strokeWidth="1" />;
      })}
      <polygon points={poly} fill="rgba(155,111,212,0.25)" stroke="#9b6fd4" strokeWidth="2" />
      {puntosData.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={ATRIBUTOS[i].color} />)}
      {ATRIBUTOS.map((a, i) => {
        const b = puntoBase(i);
        const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
        const lx = cx + (r + 18) * Math.cos(angle);
        const ly = cy + (r + 18) * Math.sin(angle);
        return <text key={i} x={lx} y={ly + 4} textAnchor="middle" fontSize="9" fill="rgba(245,240,255,0.5)">{a.emoji}</text>;
      })}
    </svg>
  );
}

function TarjetaCatacion({ cafe, catadorId, onGuardada }) {
  const yaCatado = !!cafe.catacion_id;
  const [abierto, setAbierto] = useState(false);
  const [valores, setValores] = useState({
    acidez:     cafe.cat_acidez     || 5,
    cuerpo:     cafe.cat_cuerpo     || 5,
    dulzor:     cafe.cat_dulzor     || 5,
    amargor:    cafe.cat_amargor    || 5,
    intensidad: cafe.cat_intensidad || 5,
    aroma:      cafe.cat_aroma      || 5,
    balance:    cafe.cat_balance    || 5,
  });
  const [notas,           setNotas]           = useState(cafe.notas || '');
  const [descriptores,    setDescriptores]    = useState(
    cafe.descriptores ? cafe.descriptores.split(',') : []
  );
  const [metodo,          setMetodo]          = useState(cafe.metodo_catacion || 'Sin especificar');
  const [cargando,        setCargando]        = useState(false);
  const [msg,             setMsg]             = useState(null);

  const puntajeTotal = (Object.values(valores).reduce((a, b) => a + b, 0) / 7).toFixed(1);

  function toggleDescriptor(d) {
    setDescriptores(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  async function guardar() {
    setCargando(true); setMsg(null);
    try {
      const res = await fetch(`${BASE_URL}/cataciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafe_id: cafe.id, catador_id: catadorId,
          ...valores, notas, descriptores: descriptores.join(','), metodo_catacion: metodo,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ tipo: 'ok', texto: data.mensaje });
        setTimeout(() => { setMsg(null); onGuardada(); }, 1500);
      } else {
        setMsg({ tipo: 'error', texto: data.error });
      }
    } catch {
      setMsg({ tipo: 'error', texto: 'Error de conexión' });
    } finally { setCargando(false); }
  }

  const sabores = Array.isArray(cafe.sabores) ? cafe.sabores : (cafe.sabores ? cafe.sabores.split(',') : []);

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${yaCatado ? 'rgba(155,111,212,0.5)' : C.border}`, borderRadius: 16, overflow: 'hidden', transition: 'border-color 0.2s' }}>

      {/* CABECERA */}
      <div style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', gap: 16, alignItems: 'flex-start' }}
        onClick={() => setAbierto(!abierto)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.cream, margin: 0 }}>{cafe.nombre}</h3>
            {yaCatado && (
              <span style={{ background: 'rgba(155,111,212,0.2)', border: '1px solid rgba(155,111,212,0.4)', borderRadius: 99, padding: '2px 10px', fontSize: 11, color: C.purpleL }}>
                ✓ Catado — {cafe.puntaje_total} pts
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: C.muted, margin: '0 0 8px' }}>{cafe.origen} · {cafe.variedad} · {cafe.proceso}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {sabores.slice(0, 4).map(s => (
              <span key={s} style={{ fontSize: 11, background: 'rgba(155,111,212,0.1)', border: '1px solid rgba(155,111,212,0.2)', borderRadius: 99, padding: '2px 8px', color: C.purpleL }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Mini radar si ya catado */}
        {yaCatado && (
          <div style={{ flexShrink: 0 }}>
            <RadarMini valores={{
              acidez: cafe.cat_acidez, cuerpo: cafe.cat_cuerpo,
              dulzor: cafe.cat_dulzor, amargor: cafe.cat_amargor,
              intensidad: cafe.cat_intensidad, aroma: cafe.cat_aroma,
              balance: cafe.cat_balance,
            }} />
          </div>
        )}

        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {!yaCatado && (
            <div style={{ width: 52, height: 52, borderRadius: '50%', border: `2px dashed ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              🍵
            </div>
          )}
          <span style={{ fontSize: 11, color: C.muted }}>{abierto ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* PANEL DE CATACIÓN */}
      {abierto && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '24px 20px' }}>

          {/* Método */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>
              Método de preparación
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {METODOS.map(m => (
                <button key={m} onClick={() => setMetodo(m)}
                  style={{ background: metodo === m ? 'rgba(155,111,212,0.2)' : 'transparent', border: `1px solid ${metodo === m ? C.purple : C.border}`, borderRadius: 8, padding: '6px 14px', color: metodo === m ? C.purpleL : C.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px', marginBottom: 20 }}>
            {ATRIBUTOS.map(a => (
              <Slider key={a.key} label={a.label} emoji={a.emoji} desc={a.desc} color={a.color}
                value={valores[a.key]}
                onChange={v => setValores(prev => ({ ...prev, [a.key]: v }))}
              />
            ))}
          </div>

          {/* Puntaje total */}
          <div style={{ background: 'linear-gradient(135deg,rgba(155,111,212,0.15),rgba(212,175,55,0.1))', border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 3 }}>Puntaje total calculado</div>
              <div style={{ fontSize: 11, color: C.muted }}>Promedio de los 7 atributos</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: Number(puntajeTotal) >= 8 ? C.green : Number(puntajeTotal) >= 6 ? C.gold : C.purpleL, lineHeight: 1 }}>
                {puntajeTotal}
              </div>
              <div style={{ fontSize: 11, color: C.muted }}>/ 10</div>
            </div>
          </div>

          {/* Descriptores */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 10 }}>
              Descriptores de sabor — selecciona los que identifies
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DESCRIPTORES_SUGERIDOS.map(d => (
                <button key={d} onClick={() => toggleDescriptor(d)}
                  style={{ background: descriptores.includes(d) ? 'rgba(155,111,212,0.2)' : 'transparent', border: `1px solid ${descriptores.includes(d) ? C.purple : C.border}`, borderRadius: 99, padding: '5px 14px', color: descriptores.includes(d) ? C.purpleL : C.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  {descriptores.includes(d) ? '✓ ' : ''}{d}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>
              Notas de catación
            </label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3}
              placeholder="Describe lo que percibes en taza — aromas, sabores, retrogusto, defectos..."
              style={{ width: '100%', boxSizing: 'border-box', background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.cream, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          {/* Mensaje */}
          {msg && (
            <div style={{ background: msg.tipo === 'ok' ? 'rgba(126,200,160,0.12)' : 'rgba(224,92,92,0.12)', border: `1px solid ${msg.tipo === 'ok' ? C.green : C.danger}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: msg.tipo === 'ok' ? C.green : C.danger, marginBottom: 16 }}>
              {msg.tipo === 'ok' ? '✓ ' : '✕ '}{msg.texto}
            </div>
          )}

          {/* Botón guardar */}
          <button onClick={guardar} disabled={cargando}
            style={{ background: `linear-gradient(135deg, ${C.purple}, #7040b0)`, border: 'none', borderRadius: 10, padding: '12px 28px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: cargando ? 'wait' : 'pointer', opacity: cargando ? 0.7 : 1, fontFamily: 'inherit' }}>
            {cargando ? '⏳ Guardando...' : yaCatado ? '🔄 Actualizar catación' : '✓ Guardar catación'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────

const NAV = [
  { key: 'inicio',    label: '🏠 Inicio'    },
  { key: 'catar',     label: '🍵 Catar'     },
  { key: 'registro',  label: '📋 Mis cataciones' },
];

export default function DashboardCatador({ usuario, onLogout }) {
  const [seccion,  setSeccion]  = useState('inicio');
  const [cafes,    setCafes]    = useState([]);
  const [stats,    setStats]    = useState(null);
  const [filtro,   setFiltro]   = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargar(); }, []);

  async function cargar() {
    setCargando(true);
    try {
      const [c, s] = await Promise.all([
        fetch(`${BASE_URL}/cataciones/catador/${usuario.id}`).then(r => r.json()),
        fetch(`${BASE_URL}/cataciones/stats/${usuario.id}`).then(r => r.json()),
      ]);
      setCafes(Array.isArray(c) ? c : []);
      setStats(s);
    } catch { setCafes([]); }
    finally { setCargando(false); }
  }

  const catados    = cafes.filter(c => c.catacion_id);
  const sinCatar   = cafes.filter(c => !c.catacion_id);
  const progreso   = cafes.length > 0 ? Math.round((catados.length / cafes.length) * 100) : 0;

  const cafesFiltrados = cafes.filter(c => {
    const matchFiltro = filtro === 'todos' ? true : filtro === 'catados' ? c.catacion_id : !c.catacion_id;
    const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          (c.origen || '').toLowerCase().includes(busqueda.toLowerCase());
    return matchFiltro && matchBusqueda;
  });

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, fontFamily: "'Outfit','Segoe UI',sans-serif", color: C.cream }}>

      {/* NAVBAR */}
      <nav style={{ background: 'rgba(7,4,10,0.95)', borderBottom: `1px solid ${C.border}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58, position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, color: C.purpleL, fontWeight: 700 }}>🍵 {BRAND.short} — Catador</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV.map(n => (
            <button key={n.key} onClick={() => setSeccion(n.key)}
              style={{ background: seccion === n.key ? 'rgba(155,111,212,0.15)' : 'transparent', border: seccion === n.key ? `1px solid ${C.purple}` : '1px solid transparent', borderRadius: 8, padding: '6px 14px', color: seccion === n.key ? C.purpleL : C.muted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              {n.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: C.muted }}>{usuario?.nombre || usuario?.email}</span>
          <button onClick={onLogout} style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 14px', color: C.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Salir</button>
        </div>
      </nav>

      <main style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── INICIO ── */}
        {seccion === 'inicio' && (
          <div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, fontWeight: 700, color: C.cream, margin: '0 0 6px' }}>
              Bienvenido, {usuario?.nombre?.split(' ')[0] || 'Catador'} 🍵
            </h1>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
              Tu misión: probar cada café y documentar su perfil sensorial real
            </p>

            {/* Métricas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 32 }}>
              {[
                { icon: '🍵', valor: cafes.length,       label: 'Cafés disponibles',   color: C.purpleL },
                { icon: '✓',  valor: catados.length,     label: 'Cafés catados',        color: C.green   },
                { icon: '⏳', valor: sinCatar.length,    label: 'Pendientes de catar',  color: C.gold    },
                { icon: '⭐', valor: stats?.puntaje_promedio || '—', label: 'Puntaje promedio', color: C.purpleL },
              ].map(m => (
                <div key={m.label} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 22px' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: m.color, marginBottom: 3 }}>{m.valor}</div>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Barra de progreso */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 26px', marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.cream, marginBottom: 3 }}>Progreso de catación</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{catados.length} de {cafes.length} cafés catados</div>
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: progreso === 100 ? C.green : C.purpleL }}>{progreso}%</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${C.purple},${C.purpleL})`, width: `${progreso}%`, transition: 'width 0.6s ease' }} />
              </div>
              {progreso === 100 && (
                <div style={{ marginTop: 12, fontSize: 13, color: C.green, textAlign: 'center' }}>
                  🎉 ¡Has catado todos los cafés disponibles!
                </div>
              )}
            </div>

            {/* Acceso rápido */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div onClick={() => setSeccion('catar')}
                style={{ background: 'linear-gradient(135deg,rgba(155,111,212,0.1),rgba(155,111,212,0.05))', border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.purple}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>🍵</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.cream, marginBottom: 6 }}>Ir a catar</div>
                <div style={{ fontSize: 12, color: C.muted }}>{sinCatar.length} cafés esperando tu evaluación</div>
              </div>
              <div onClick={() => setSeccion('registro')}
                style={{ background: 'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.05))', border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.cream, marginBottom: 6 }}>Mis cataciones</div>
                <div style={{ fontSize: 12, color: C.muted }}>{catados.length} cafés evaluados</div>
              </div>
            </div>
          </div>
        )}

        {/* ── CATAR ── */}
        {seccion === 'catar' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: C.cream, margin: '0 0 6px' }}>🍵 Catar cafés</h2>
            <p style={{ color: C.muted, fontSize: 14, margin: '0 0 24px' }}>
              Evalúa el perfil sensorial de cada café. Tu puntuación actualiza el perfil real del café.
            </p>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { key: 'todos',   label: `Todos (${cafes.length})`        },
                { key: 'sinCatar',label: `Pendientes (${sinCatar.length})` },
                { key: 'catados', label: `Catados (${catados.length})`     },
              ].map(f => (
                <button key={f.key} onClick={() => setFiltro(f.key)}
                  style={{ background: filtro === f.key ? C.purple : 'transparent', border: `1px solid ${filtro === f.key ? C.purple : C.border}`, borderRadius: 8, padding: '7px 16px', color: filtro === f.key ? '#fff' : C.muted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {f.label}
                </button>
              ))}
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar café..."
                style={{ flex: 1, minWidth: 180, background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', color: C.cream, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
              />
            </div>

            {cargando
              ? <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted }}>Cargando cafés...</div>
              : cafesFiltrados.length === 0
                ? <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted }}>No hay cafés con ese filtro.</div>
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {cafesFiltrados.map(cafe => (
                      <TarjetaCatacion key={cafe.id} cafe={cafe} catadorId={usuario.id} onGuardada={cargar} />
                    ))}
                  </div>
                )
            }
          </div>
        )}

        {/* ── MIS CATACIONES ── */}
        {seccion === 'registro' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: C.cream, margin: '0 0 6px' }}>📋 Mis cataciones</h2>
            <p style={{ color: C.muted, fontSize: 14, margin: '0 0 28px' }}>Resumen de todos los cafés que has evaluado</p>

            {catados.length === 0
              ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: C.muted }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>🍵</div>
                  <div style={{ fontSize: 16, color: C.cream, marginBottom: 8 }}>Aún no has catado ningún café</div>
                  <button onClick={() => setSeccion('catar')}
                    style={{ background: C.purple, border: 'none', borderRadius: 8, padding: '10px 24px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Ir a catar →
                  </button>
                </div>
              )
              : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                  {catados.map(cafe => (
                    <div key={cafe.id} style={{ background: C.bgCard, border: `1px solid rgba(155,111,212,0.35)`, borderRadius: 16, padding: '20px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: C.cream, marginBottom: 4 }}>{cafe.nombre}</div>
                          <div style={{ fontSize: 12, color: C.muted }}>{cafe.variedad} · {cafe.proceso}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 28, fontWeight: 800, color: Number(cafe.puntaje_total) >= 8 ? C.green : Number(cafe.puntaje_total) >= 6 ? C.gold : C.purpleL }}>
                            {cafe.puntaje_total}
                          </div>
                          <div style={{ fontSize: 10, color: C.muted }}>/ 10</div>
                        </div>
                      </div>

                      <RadarMini valores={{
                        acidez: cafe.cat_acidez, cuerpo: cafe.cat_cuerpo,
                        dulzor: cafe.cat_dulzor, amargor: cafe.cat_amargor,
                        intensidad: cafe.cat_intensidad, aroma: cafe.cat_aroma,
                        balance: cafe.cat_balance,
                      }} />

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 12 }}>
                        {ATRIBUTOS.map(a => (
                          <div key={a.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                            <span style={{ color: C.muted }}>{a.emoji} {a.label}</span>
                            <span style={{ color: a.color, fontWeight: 700 }}>{cafe[`cat_${a.key}`] || '—'}</span>
                          </div>
                        ))}
                      </div>

                      {cafe.descriptores && (
                        <div style={{ marginTop: 12, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {cafe.descriptores.split(',').map(d => (
                            <span key={d} style={{ fontSize: 10, background: 'rgba(155,111,212,0.12)', border: '1px solid rgba(155,111,212,0.25)', borderRadius: 99, padding: '2px 8px', color: C.purpleL }}>{d}</span>
                          ))}
                        </div>
                      )}

                      {cafe.notas && (
                        <p style={{ fontSize: 12, color: C.muted, fontStyle: 'italic', marginTop: 10, marginBottom: 0, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                          "{cafe.notas}"
                        </p>
                      )}

                      <button onClick={() => { setSeccion('catar'); }}
                        style={{ marginTop: 14, width: '100%', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px', color: C.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ✏️ Editar catación
                      </button>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

      </main>
    </div>
  );
}
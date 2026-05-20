import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RadarCafe from './RadarCafe';
import { API_BASE_URL as BASE_URL, appOrigin } from '../config';
const PREGUNTAS = [
  { id: 'sabor', texto: '¿Qué sabores prefieres?', opciones: [
    { label: 'Frutal y floral',    value: 'frutal'    },
    { label: 'Chocolate y nueces', value: 'chocolate' },
    { label: 'Dulce y caramelo',   value: 'dulce'     },
    { label: 'Intenso y robusto',  value: 'intenso'   },
  ]},
  { id: 'cuerpo', texto: '¿Cómo te gusta el cuerpo?', opciones: [
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

const METODOS = ['Espresso', 'Americano', 'V60', 'Chemex', 'Prensa francesa', 'Aeropress', 'Cold Brew', 'Filtrado'];

function recomendar(cafes, respuestas) {
  return cafes.map(cafe => {
    let score = 0;
    if (respuestas.cuerpo === 'ligero'    && cafe.cuerpo <= 5)  score += 2;
    if (respuestas.cuerpo === 'medio'     && cafe.cuerpo >= 5 && cafe.cuerpo <= 7) score += 2;
    if (respuestas.cuerpo === 'intenso'   && cafe.cuerpo >= 8)  score += 2;
    if (respuestas.sabor  === 'frutal'    && cafe.acidez >= 7)  score += 2;
    if (respuestas.sabor  === 'chocolate' && cafe.amargor >= 5) score += 2;
    if (respuestas.sabor  === 'dulce'     && cafe.dulzor >= 7)  score += 2;
    if (respuestas.sabor  === 'intenso'   && cafe.intensidad >= 4) score += 2;
    return { ...cafe, score };
  }).sort((a, b) => b.score - a.score).slice(0, 3).map((c, i) => ({
    ...c,
    razon: i === 0 ? 'Perfecto para ti hoy' : i === 1 ? 'Excelente balance' : 'Te podría sorprender',
  }));
}

// ── Tarjeta de café en el menú ────────────────────────────────────────────────
function TarjetaCafeMenu({ cafe, onPedir }) {
  const [expandido, setExpandido] = useState(false);
  const sabores = Array.isArray(cafe.sabores) ? cafe.sabores : (cafe.sabores ? cafe.sabores.split(',') : []);

  return (
    <div style={{ background: 'rgba(75,46,43,0.7)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 14, padding: 18, transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <h3 style={{ color: C.cream, fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{cafe.nombre}</h3>
          <p style={{ color: C.gold, fontSize: 12 }}>{cafe.origen} · {cafe.variedad}</p>
        </div>
        <span style={{ background: 'rgba(212,175,55,0.15)', color: C.goldL, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
          ${Number(cafe.precio || 0).toLocaleString()}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
        {sabores.map(s => (
          <span key={s} style={{ background: 'rgba(212,175,55,0.1)', color: 'rgba(245,234,216,0.7)', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{s}</span>
        ))}
      </div>

      {cafe.descripcion && (
        <p style={{ color: 'rgba(245,234,216,0.5)', fontSize: 12, marginBottom: 10, lineHeight: 1.6 }}>{cafe.descripcion}</p>
      )}

      {expandido && (
        <div style={{ marginBottom: 12 }}>
          <RadarCafe cafe={cafe} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setExpandido(!expandido)}
          style={{ flex: 1, padding: '8px', background: expandido ? 'rgba(212,175,55,0.15)' : 'transparent', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 7, color: C.gold, fontSize: 12, cursor: 'pointer', minWidth: 80 }}>
          {expandido ? '📊 Ocultar' : '📊 Perfil sensorial'}
        </button>
        <button onClick={() => onPedir(cafe)}
          style={{ flex: 1, padding: '8px', background: C.btn, border: 'none', borderRadius: 7, color: C.btnText, fontSize: 12, fontWeight: 700, cursor: 'pointer', minWidth: 80 }}>
          ☕ Pedir
        </button>
      </div>
    </div>
  );
}

// ── Modal Login ───────────────────────────────────────────────────────────────
function ModalLogin({ cafeteria, onLogin, onCerrar }) {
  const [form,     setForm]     = useState({ email: '', password: '' });
  const [error,    setError]    = useState('');
  const [cargando, setCargando] = useState(false);
  const [registro, setRegistro] = useState(false);
  const [formReg,  setFormReg]  = useState({ nombre: '', email: '', password: '' });
  const [msgReg,   setMsgReg]   = useState('');

  async function hacerLogin(e) {
    e.preventDefault();
    setCargando(true); setError('');
    try {
      const res  = await fetch(`${BASE_URL}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.usuario.rol === 'cliente') {
        onLogin(data.usuario);
      } else if (res.ok) {
        setError('Solo clientes pueden hacer pedidos desde el QR');
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch { setError('Error de conexión'); }
    setCargando(false);
  }

  async function hacerRegistro(e) {
    e.preventDefault();
    setCargando(true); setMsgReg('');
    try {
      const res  = await fetch(`${BASE_URL}/registro`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formReg, rol: 'cliente' }),
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.usuario);
      } else {
        setMsgReg(data.error || 'Error al registrarse');
      }
    } catch { setMsgReg('Error de conexión'); }
    setCargando(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(10,5,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onCerrar}>
      <div onClick={e => e.stopPropagation()} style={{ background: JV.bgPage, border: '1px solid rgba(212,175,55,0.4)', borderRadius: 20, padding: '28px 24px', maxWidth: 400, width: '100%' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: C.cream, margin: '0 0 4px' }}>
              {registro ? 'Crear cuenta' : 'Inicia sesión'}
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(245,234,216,0.4)', margin: 0 }}>
              para hacer tu pedido en {cafeteria?.nombre}
            </p>
          </div>
          <button onClick={onCerrar} style={{ background: 'transparent', border: 'none', color: 'rgba(245,234,216,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {!registro ? (
          <form onSubmit={hacerLogin}>
            {['email','password'].map(campo => (
              <div key={campo} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'rgba(245,234,216,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  {campo === 'email' ? 'Correo electrónico' : 'Contraseña'}
                </label>
                <input type={campo === 'password' ? 'password' : 'email'} value={form[campo]}
                  onChange={e => setForm(p => ({ ...p, [campo]: e.target.value }))}
                  placeholder={campo === 'email' ? 'tu@correo.com' : '••••••••'} required
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 8, padding: '11px 14px', color: C.cream, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
              </div>
            ))}
            {error && <div style={{ background: 'rgba(224,92,92,0.12)', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#e05c5c', marginBottom: 14 }}>✕ {error}</div>}
            <button type="submit" disabled={cargando}
              style={{ width: '100%', background: C.btn, border: 'none', borderRadius: 10, padding: '13px', color: C.btnText, fontWeight: 700, fontSize: 15, cursor: cargando ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: cargando ? 0.7 : 1, marginBottom: 12 }}>
              {cargando ? 'Ingresando...' : '☕ Entrar'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(245,234,216,0.35)', margin: 0 }}>
              ¿No tienes cuenta?{' '}
              <button onClick={() => setRegistro(true)} type="button"
                style={{ background: 'none', border: 'none', color: C.goldL, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', textDecoration: 'underline' }}>
                Regístrate aquí
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={hacerRegistro}>
            {[
              { campo: 'nombre',   label: 'Tu nombre',          type: 'text',     ph: 'ej. María'    },
              { campo: 'email',    label: 'Correo electrónico',  type: 'email',    ph: 'tu@correo.com'},
              { campo: 'password', label: 'Contraseña',         type: 'password', ph: '••••••••'     },
            ].map(({ campo, label, type, ph }) => (
              <div key={campo} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'rgba(245,234,216,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</label>
                <input type={type} value={formReg[campo]} onChange={e => setFormReg(p => ({ ...p, [campo]: e.target.value }))}
                  placeholder={ph} required
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 8, padding: '11px 14px', color: C.cream, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
              </div>
            ))}
            {msgReg && <div style={{ background: 'rgba(224,92,92,0.12)', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#e05c5c', marginBottom: 14 }}>✕ {msgReg}</div>}
            <button type="submit" disabled={cargando}
              style={{ width: '100%', background: C.btn, border: 'none', borderRadius: 10, padding: '13px', color: C.btnText, fontWeight: 700, fontSize: 15, cursor: cargando ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: cargando ? 0.7 : 1, marginBottom: 12 }}>
              {cargando ? 'Creando cuenta...' : '✓ Crear cuenta y pedir'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(245,234,216,0.35)', margin: 0 }}>
              ¿Ya tienes cuenta?{' '}
              <button onClick={() => setRegistro(false)} type="button"
                style={{ background: 'none', border: 'none', color: C.goldL, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', textDecoration: 'underline' }}>
                Inicia sesión
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
function QRVaso({ vasoToken, cafeId }) {
  const [qrURL, setQrURL] = useState('');
  const url = vasoToken ? `${appOrigin()}/taza/${encodeURIComponent(vasoToken)}` : `${appOrigin()}/cafe/${cafeId}`;

  useEffect(() => {
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(url, {
        width: 200, margin: 2,
        color: { dark: JV.coffee, light: JV.cream }
      }).then(setQrURL).catch(() => {});
    });
  }, [url]);

  return qrURL
    ? <img src={qrURL} alt="QR café" style={{ borderRadius: 12, border: '4px solid rgba(212,175,55,0.4)', width: 180, height: 180 }} />
    : <div style={{ width: 180, height: 180, background: 'rgba(255,255,255,0.05)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(245,234,216,0.3)', fontSize: 13 }}>Generando QR...</div>;
}
// ── Modal Pedido ──────────────────────────────────────────────────────────────
function ModalPedido({ cafe, cafeteriaId, usuario, onLogin, onCerrar, onConfirmado }) {
  const [paso,          setPaso]          = useState(usuario ? 'form' : 'login');
  const [nombre,        setNombre]        = useState(usuario?.nombre || '');
  const [metodo,        setMetodo]        = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [cargando,      setCargando]      = useState(false);
  const [pedidoCreado,  setPedidoCreado]  = useState(null);

  async function procesarPago() {
    setCargando(true);
    await new Promise(r => setTimeout(r, 1500));
    try {
      const res = await fetch(`${BASE_URL}/pedidos-cafeteria`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeteria_id:     cafeteriaId,
          cafe_id:          cafe.id,
          cliente_nombre:   nombre || usuario?.nombre || 'Cliente',
          cliente_id:       usuario?.id || null,
          tipo_preparacion: metodo,
          observaciones,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPedidoCreado(data);
        setPaso('enviado');
        onConfirmado();
      } else console.error(data.error);
    } catch (e) { console.error(e); }
    setCargando(false);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(10,5,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={paso === 'enviado' ? onCerrar : undefined}>
      <div onClick={e => e.stopPropagation()} style={{ background: JV.bgPage, border: '1px solid rgba(212,175,55,0.4)', borderRadius: 20, padding: '28px 24px', maxWidth: 420, width: '100%' }}>

        {/* LOGIN */}
        {paso === 'login' && (
          <ModalLogin
            cafeteria={{ nombre: '' }}
            onLogin={u => { onLogin(u); setNombre(u.nombre); setPaso('form'); }}
            onCerrar={onCerrar}
          />
        )}

        {/* FORMULARIO */}
        {paso === 'form' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: C.cream, margin: 0 }}>☕ {cafe.nombre}</h3>
              <button onClick={onCerrar} style={{ background: 'transparent', border: 'none', color: 'rgba(245,234,216,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {usuario && (
              <div style={{ background: 'rgba(126,200,160,0.08)', border: '1px solid rgba(126,200,160,0.2)', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: '#7ec8a0', marginBottom: 16 }}>
                👤 Pidiendo como <strong>{usuario.nombre}</strong>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(245,234,216,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                Método de preparación
              </label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {METODOS.map(m => (
                  <button key={m} onClick={() => setMetodo(m)}
                    style={{ background: metodo === m ? 'rgba(212,175,55,0.2)' : 'transparent', border: `1px solid ${metodo === m ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.2)'}`, borderRadius: 8, padding: '6px 12px', color: metodo === m ? C.gold : 'rgba(245,234,216,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(245,234,216,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                Observaciones <span style={{ color: 'rgba(245,234,216,0.2)' }}>(opcional)</span>
              </label>
              <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={2}
                placeholder="Sin azúcar, doble shot..."
                style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 8, padding: '10px 14px', color: C.cream, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'none' }} />
            </div>

            <button onClick={() => setPaso('pago')}
              style={{ width: '100%', background: C.btn, border: 'none', borderRadius: 10, padding: '13px', color: C.btnText, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>
              Continuar al pago →
            </button>
          </>
        )}

        {/* PAGO */}
        {paso === 'pago' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: C.cream, margin: 0 }}>💳 Pago</h3>
              <button onClick={onCerrar} style={{ background: 'transparent', border: 'none', color: 'rgba(245,234,216,0.4)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: '16px 18px', marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: 'rgba(245,234,216,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Resumen</p>
              {[
                ['☕ Café',    cafe.nombre],
                ['⚙️ Método',  metodo || 'Sin especificar'],
                ['📝 Notas',   observaciones || '—'],
                ['👤 Cliente', usuario?.nombre || nombre],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'rgba(245,234,216,0.45)' }}>{k}</span>
                  <span style={{ color: C.cream }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: C.goldL, fontSize: 15 }}>Total</span>
                <span style={{ fontWeight: 700, color: C.goldL, fontSize: 15 }}>${Number(cafe.precio || 0).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'rgba(245,234,216,0.4)', marginBottom: 10 }}>Método de pago</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['💳 Tarjeta', '📱 Nequi', '💵 Efectivo'].map(m => (
                  <div key={m} style={{ flex: 1, background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 8, padding: '8px', textAlign: 'center', fontSize: 12, color: 'rgba(245,234,216,0.6)' }}>
                    {m}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'rgba(245,234,216,0.25)', textAlign: 'center', marginTop: 10, marginBottom: 0 }}>
                Pago procesado en caja — confirma con el barista
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setPaso('form')}
                style={{ flex: 1, background: 'transparent', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 10, padding: '12px', color: 'rgba(245,234,216,0.5)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                ← Volver
              </button>
              <button onClick={procesarPago} disabled={cargando}
                style={{ flex: 2, background: cargando ? 'rgba(212,175,55,0.4)' : C.btn, border: 'none', borderRadius: 10, padding: '12px', color: C.btnText, fontWeight: 700, fontSize: 14, cursor: cargando ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                {cargando ? '⏳ Procesando...' : '✓ Confirmar y pagar'}
              </button>
            </div>
          </>
        )}

        {/* CONFIRMADO */}
{paso === 'enviado' && (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: 60, marginBottom: 16 }}>☕</div>
    <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: C.cream, marginBottom: 8 }}>¡Pedido confirmado!</h3>
    <p style={{ color: 'rgba(245,234,216,0.5)', fontSize: 14, marginBottom: 20 }}>
      Tu <strong style={{ color: C.goldL }}>{cafe.nombre}</strong> está siendo preparado
    </p>

    {/* QR del vaso */}
    <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 14, padding: '20px', marginBottom: 20 }}>
      <p style={{ fontSize: 12, color: 'rgba(245,234,216,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
        📱 QR de tu vaso
      </p>
      <QRVaso vasoToken={pedidoCreado?.qr_vaso_token} cafeId={cafe.id} />
      <p style={{ fontSize: 12, color: 'rgba(245,234,216,0.35)', marginTop: 12, marginBottom: 0, lineHeight: 1.6 }}>
        Escanea este QR cuando recibas tu café para ver su historia, trazabilidad y cómo disfrutarlo al máximo
      </p>
    </div>

    <button onClick={onCerrar}
      style={{ background: C.btn, border: 'none', borderRadius: 10, padding: '12px 32px', color: C.btnText, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
      Volver al menú
    </button>
  </div>
)}
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function CafeteriaPublica() {
  const { token } = useParams();
  const [cafeteria,    setCafeteria]    = useState(null);
  const [menu,         setMenu]         = useState([]);
  const [baristas,     setBaristas]     = useState([]);
  const [cargando,     setCargando]     = useState(true);
  const [error,        setError]        = useState(null);
  const [vista,        setVista]        = useState('menu');
  const [paso,         setPaso]         = useState(0);
  const [respuestas,   setRespuestas]   = useState({});
  const [recomendados, setRecomendados] = useState([]);
  const [cafeModal,    setCafeModal]    = useState(null);
  const [usuario,      setUsuario]      = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        const resCaf = await fetch(`${BASE_URL}/cafeterias/qr/${token}`);
        if (!resCaf.ok) { setError('Cafetería no encontrada'); setCargando(false); return; }
        const caf = await resCaf.json();
        setCafeteria(caf);
        const [resMenu, resBar] = await Promise.all([
          fetch(`${BASE_URL}/cafeterias/${caf.id}/menu`).then(r => r.json()),
          fetch(`${BASE_URL}/cafeterias/${caf.id}/baristas`).then(r => r.json()),
        ]);
        setMenu(Array.isArray(resMenu) ? resMenu : []);
        setBaristas(Array.isArray(resBar) ? resBar : []);
      } catch (e) {
        setError('Error al cargar la cafetería');
      }
      setCargando(false);
    }
    cargar();
  }, [token]);

  function responder(preguntaId, valor) {
    const nuevas = { ...respuestas, [preguntaId]: valor };
    setRespuestas(nuevas);
    if (paso < PREGUNTAS.length - 1) {
      setPaso(paso + 1);
    } else {
      setRecomendados(recomendar(menu, nuevas));
      setPaso(paso + 1);
    }
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: JV.coffeeDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(245,234,216,0.4)', fontFamily: "'Outfit',sans-serif" }}>
      Cargando cafetería...
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: JV.coffeeDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ fontSize: 48 }}>☕</div>
      <p style={{ color: 'rgba(245,234,216,0.5)' }}>{error}</p>
    </div>
  );

  if (!cafeteria) return (
    <div style={{ minHeight: '100vh', background: JV.coffeeDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(245,234,216,0.4)', fontFamily: "'Outfit',sans-serif" }}>
      Cargando...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: JV.bgPage, fontFamily: "'Outfit',sans-serif", color: C.cream }}>

      {/* HEADER */}
      

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px' }}>

        {cafeteria.descripcion && (
          <p style={{ color: 'rgba(245,234,216,0.5)', fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>{cafeteria.descripcion}</p>
        )}

        {baristas.length > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'rgba(245,234,216,0.35)' }}>Baristas hoy:</span>
            {baristas.map(b => (
              <span key={b.id} style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 99, padding: '3px 12px', fontSize: 12, color: C.goldL }}>
                👨‍🍳 {b.nombre}
              </span>
            ))}
          </div>
        )}

        {/* TABS */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { key: 'menu',       label: '📋 Ver menú completo' },
            { key: 'recomendar', label: '🎯 Recomendar para mí' },
          ].map(t => (
            <button key={t.key} onClick={() => { setVista(t.key); setPaso(0); setRespuestas({}); }}
              style={{ background: vista === t.key ? 'rgba(212,175,55,0.2)' : 'transparent', border: `1px solid ${vista === t.key ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.2)'}`, borderRadius: 8, padding: '9px 18px', color: vista === t.key ? C.gold : 'rgba(245,234,216,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: vista === t.key ? 700 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* MENÚ */}
        {vista === 'menu' && (
          menu.length === 0
            ? <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(245,234,216,0.3)' }}>No hay cafés disponibles en este momento.</div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                {menu.map(cafe => <TarjetaCafeMenu key={cafe.id} cafe={cafe} onPedir={c => setCafeModal(c)} />)}
              </div>
        )}

        {/* RECOMENDADOR */}
        {vista === 'recomendar' && (
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            {paso < PREGUNTAS.length ? (
              <>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(245,234,216,0.4)', marginBottom: 8 }}>
                    <span>Pregunta {paso + 1} de {PREGUNTAS.length}</span>
                    <span style={{ color: C.gold }}>{Math.round((paso / PREGUNTAS.length) * 100)}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                    <div style={{ height: '100%', width: `${(paso / PREGUNTAS.length) * 100}%`, background: C.gold, borderRadius: 2, transition: 'width 0.4s' }} />
                  </div>
                </div>
                <div style={{ background: 'rgba(75,46,43,0.7)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 16, padding: '28px 24px' }}>
                  <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: C.cream, marginBottom: 24 }}>{PREGUNTAS[paso].texto}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {PREGUNTAS[paso].opciones.map(op => (
                      <button key={op.value} onClick={() => responder(PREGUNTAS[paso].id, op.value)}
                        style={{ padding: '13px 18px', background: 'rgba(26,10,0,0.5)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 10, color: C.cream, fontSize: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.background = 'rgba(212,175,55,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; e.currentTarget.style.background = 'rgba(26,10,0,0.5)'; }}>
                        {op.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: C.cream, marginBottom: 6 }}>Tus cafés recomendados</h2>
                <p style={{ color: 'rgba(245,234,216,0.4)', fontSize: 13, marginBottom: 20 }}>Basado en tus preferencias en {cafeteria.nombre}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recomendados.map((cafe, i) => (
                    <div key={cafe.id}>
                      {i === 0 && <div style={{ background: C.gold, color: C.btnText, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: '6px 6px 0 0', width: 'fit-content' }}>⭐ MEJOR OPCIÓN</div>}
                      <TarjetaCafeMenu cafe={cafe} onPedir={c => setCafeModal(c)} />
                      <p style={{ color: C.gold, fontSize: 12, marginTop: 6 }}>💡 {cafe.razon}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setPaso(0); setRespuestas({}); }}
                  style={{ marginTop: 16, background: 'transparent', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8, padding: '8px 20px', color: 'rgba(245,234,216,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ↺ Volver a responder
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL LOGIN */}
      {cafeModal === 'login' && (
        <ModalLogin
          cafeteria={cafeteria}
          onLogin={u => { setUsuario(u); setCafeModal(null); }}
          onCerrar={() => setCafeModal(null)}
        />
      )}

      {/* MODAL PEDIDO */}
      {cafeModal && cafeModal !== 'login' && (
        <ModalPedido
          cafe={cafeModal}
          cafeteriaId={cafeteria.id}
          usuario={usuario}
          onLogin={u => setUsuario(u)}
          onCerrar={() => setCafeModal(null)}
          onConfirmado={() => setPaso(p => p + 1)}
        />
      )}
    </div>
  );
}
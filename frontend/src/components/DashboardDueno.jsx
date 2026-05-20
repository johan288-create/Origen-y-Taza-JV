import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { API_BASE_URL as BASE_URL, appOrigin } from '../config';
import { C, BRAND, JV } from '../theme/brand';

function Alerta({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      background: msg.tipo === 'ok' ? 'rgba(126,200,160,0.12)' : 'rgba(224,92,92,0.12)',
      border: `1px solid ${msg.tipo === 'ok' ? C.green : C.danger}`,
      borderRadius: 8, padding: '10px 14px', fontSize: 13,
      color: msg.tipo === 'ok' ? C.green : C.danger, marginBottom: 16,
    }}>
      {msg.tipo === 'ok' ? '✓ ' : '✕ '}{msg.texto}
    </div>
  );
}

function Campo({ label, name, type = 'text', value, onChange, placeholder, required, step }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        {label}{required && <span style={{ color: C.danger }}> *</span>}
      </label>
      {type === 'textarea'
        ? <textarea name={name} value={value || ''} onChange={onChange} placeholder={placeholder} rows={3}
            style={{ width: '100%', boxSizing: 'border-box', background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.cream, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
        : <input type={type} name={name} value={value || ''} onChange={onChange} placeholder={placeholder} step={step}
            style={{ width: '100%', boxSizing: 'border-box', background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.cream, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
      }
    </div>
  );
}

function Boton({ children, onClick, type = 'button', disabled, color, outline, small }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        background: outline ? 'transparent' : (color || C.teal),
        border: outline ? `1px solid ${C.border}` : 'none',
        borderRadius: 8, padding: small ? '6px 14px' : '10px 22px',
        color: outline ? C.muted : C.btnText,
        fontWeight: 700, fontSize: small ? 12 : 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, fontFamily: 'inherit',
      }}>
      {children}
    </button>
  );
}

// ── Campos de coordenadas reutilizables ───────────────────────────────────────
function CamposCoordenas({ form, onChange }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Campo
          label="Latitud"
          name="latitud"
          type="number"
          step="0.0000001"
          value={form.latitud}
          onChange={onChange}
          placeholder="ej. 4.3315"
        />
        <Campo
          label="Longitud"
          name="longitud"
          type="number"
          step="0.0000001"
          value={form.longitud}
          onChange={onChange}
          placeholder="ej. -74.3324"
        />
      </div>
      <div style={{
        background: 'rgba(20,160,200,0.06)', border: `1px solid rgba(20,160,200,0.2)`,
        borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: C.muted,
      }}>
        💡 Para obtener las coordenadas: abre{' '}
        <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" style={{ color: C.tealL }}>
          Google Maps
        </a>
        , busca tu dirección, haz clic derecho sobre el punto exacto y copia las coordenadas que aparecen arriba del menú.
      </div>
    </div>
  );
}

// ── Panel QR ──────────────────────────────────────────────────────────────────
function PanelQR({ cafeteria }) {
  const [qrURL, setQrURL] = useState('');
  const url = `${appOrigin()}/cafeteria/${cafeteria.qr_token}`;

  useEffect(() => {
    QRCode.toDataURL(url, { width: 256, margin: 2, color: { dark: JV.qrDark, light: JV.qrLight } })
      .then(setQrURL).catch(() => {});
  }, [url]);

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px', textAlign: 'center' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>QR de la Cafetería</div>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Los clientes escanean este QR para ver el menú</div>
      {qrURL && <img src={qrURL} alt="QR Cafetería" style={{ borderRadius: 12, border: `4px solid ${C.teal}`, marginBottom: 16 }} />}
      <div style={{ fontSize: 11, color: C.muted, wordBreak: 'break-all', marginBottom: 16 }}>{url}</div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {qrURL && (
          <a href={qrURL} download={`qr-${cafeteria.nombre}.png`}
            style={{ background: C.gold, border: 'none', borderRadius: 8, padding: '8px 18px', color: C.btnText, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            ⬇ Descargar QR
          </a>
        )}
        <a href={url} target="_blank" rel="noreferrer"
          style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 18px', color: C.tealL, fontSize: 13, textDecoration: 'none' }}>
          🔗 Ver página
        </a>
      </div>

      {/* Estado coordenadas */}
      <div style={{ marginTop: 20, padding: '12px 16px', background: cafeteria.latitud ? 'rgba(126,200,160,0.08)' : 'rgba(232,168,74,0.08)', border: `1px solid ${cafeteria.latitud ? C.green : C.gold}40`, borderRadius: 10 }}>
        {cafeteria.latitud
          ? <p style={{ fontSize: 12, color: C.green, margin: 0 }}>✓ Cafetería visible en el mapa — {cafeteria.latitud}, {cafeteria.longitud}</p>
          : <p style={{ fontSize: 12, color: C.gold, margin: 0 }}>⚠️ Sin coordenadas — ve a <strong>Mi Cafetería → Editar</strong> para aparecer en el mapa</p>
        }
      </div>
    </div>
  );
}

// ── Panel Menú ────────────────────────────────────────────────────────────────
function PanelMenu({ cafeteria }) {
  const [menu,       setMenu]       = useState([]);
  const [todosCafes, setTodosCafes] = useState([]);
  const [agregando,  setAgregando]  = useState(false);
  const [editando,   setEditando]   = useState(null);
  const [form,       setForm]       = useState({ cafe_id: '', precio: '', stock: '' });
  const [formEdit,   setFormEdit]   = useState({});
  const [msg,        setMsg]        = useState(null);
  const [cargando,   setCargando]   = useState(false);

  useEffect(() => { cargarMenu(); cargarCafes(); }, []);
// eslint-disable-next-line react-hooks/exhaustive-deps
  async function cargarMenu() {
    const res = await fetch(`${BASE_URL}/cafeterias/${cafeteria.id}/menu`);
    const data = await res.json();
    setMenu(Array.isArray(data) ? data : []);
  }

  async function cargarCafes() {
    const res = await fetch(`${BASE_URL}/cafes`);
    const data = await res.json();
    setTodosCafes(Array.isArray(data) ? data : []);
  }

  async function agregar(e) {
    e.preventDefault();
    if (!form.cafe_id) return setMsg({ tipo: 'error', texto: 'Selecciona un café' });
    setCargando(true);
    const res = await fetch(`${BASE_URL}/cafeterias/${cafeteria.id}/menu`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMsg({ tipo: res.ok ? 'ok' : 'error', texto: res.ok ? 'Café agregado al menú' : data.error });
    if (res.ok) { setAgregando(false); setForm({ cafe_id: '', precio: '', stock: '' }); cargarMenu(); }
    setCargando(false);
  }

  async function guardarEdicion(cafe_id) {
    const res = await fetch(`${BASE_URL}/cafeterias/${cafeteria.id}/menu/${cafe_id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formEdit),
    });
    const data = await res.json();
    setMsg({ tipo: res.ok ? 'ok' : 'error', texto: res.ok ? 'Inventario actualizado' : data.error });
    if (res.ok) { setEditando(null); cargarMenu(); }
  }

  async function quitar(cafe_id) {
    if (!window.confirm('¿Quitar este café del menú?')) return;
    await fetch(`${BASE_URL}/cafeterias/${cafeteria.id}/menu/${cafe_id}`, { method: 'DELETE' });
    cargarMenu();
  }

  const enMenu = menu.map(m => m.cafe_id);
  const disponibles = todosCafes.filter(c => !enMenu.includes(c.id));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.cream }}>Menú de cafés</div>
          <div style={{ fontSize: 12, color: C.muted }}>{menu.length} cafés en el menú</div>
        </div>
        {!agregando && <Boton onClick={() => setAgregando(true)} small>+ Agregar café</Boton>}
      </div>

      <Alerta msg={msg} />

      {agregando && (
        <div style={{ background: 'rgba(20,160,200,0.06)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px', marginBottom: 20 }}>
          <form onSubmit={agregar}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>Café *</label>
                <select value={form.cafe_id} onChange={e => setForm(p => ({ ...p, cafe_id: e.target.value }))}
                  style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: form.cafe_id ? C.cream : C.muted, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}>
                  <option value="">— Seleccionar —</option>
                  {disponibles.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <Campo label="Precio (COP)" name="precio" type="number" value={form.precio} onChange={e => setForm(p => ({ ...p, precio: e.target.value }))} placeholder="ej. 8000" />
              <Campo label="Stock inicial" name="stock" type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} placeholder="ej. 20" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Boton type="submit" disabled={cargando}>{cargando ? 'Agregando...' : 'Agregar'}</Boton>
              <Boton onClick={() => { setAgregando(false); setMsg(null); }} outline>Cancelar</Boton>
            </div>
          </form>
        </div>
      )}

      {menu.length === 0
        ? <div style={{ textAlign: 'center', padding: '40px', color: C.muted }}>No hay cafés en el menú aún.</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {menu.map(item => (
              <div key={item.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' }}>
                {editando === item.cafe_id ? (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 12 }}>{item.nombre}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <Campo label="Precio" name="precio" type="number" value={formEdit.precio} onChange={e => setFormEdit(p => ({ ...p, precio: e.target.value }))} />
                      <Campo label="Stock" name="stock" type="number" value={formEdit.stock} onChange={e => setFormEdit(p => ({ ...p, stock: e.target.value }))} />
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 11, color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>Disponible</label>
                        <select value={formEdit.disponible} onChange={e => setFormEdit(p => ({ ...p, disponible: e.target.value === 'true' }))}
                          style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.cream, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}>
                          <option value="true">Disponible</option>
                          <option value="false">No disponible</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <Boton onClick={() => guardarEdicion(item.cafe_id)} color={C.green} small>💾 Guardar</Boton>
                      <Boton onClick={() => setEditando(null)} outline small>Cancelar</Boton>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>{item.nombre}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{item.variedad} · {item.proceso} · {item.origen}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>${Number(item.precio || 0).toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>precio</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: item.stock > 5 ? C.green : C.danger }}>{item.stock}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>stock</div>
                      </div>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: item.disponible ? 'rgba(126,200,160,0.12)' : 'rgba(224,92,92,0.12)', color: item.disponible ? C.green : C.danger }}>
                        {item.disponible ? 'Disponible' : 'No disponible'}
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Boton onClick={() => { setEditando(item.cafe_id); setFormEdit({ precio: item.precio, stock: item.stock, disponible: item.disponible }); }} small outline>✏️ Editar</Boton>
                        <button onClick={() => quitar(item.cafe_id)}
                          style={{ background: 'transparent', border: `1px solid ${C.danger}40`, borderRadius: 8, padding: '6px 10px', color: C.danger, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                          🗑 Quitar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

// ── Panel Baristas ────────────────────────────────────────────────────────────
function PanelBaristas({ cafeteria }) {
  const [baristas,      setBaristas]      = useState([]);
  const [todosBaristas, setTodosBaristas] = useState([]);
  const [agregando,     setAgregando]     = useState(false);
  const [seleccionado,  setSeleccionado]  = useState('');
  const [msg,           setMsg]           = useState(null);

  useEffect(() => { cargarBaristas(); cargarTodos(); }, []);
// eslint-disable-next-line react-hooks/exhaustive-deps
  async function cargarBaristas() {
    const res = await fetch(`${BASE_URL}/cafeterias/${cafeteria.id}/baristas`);
    const data = await res.json();
    setBaristas(Array.isArray(data) ? data : []);
  }

  async function cargarTodos() {
    const res = await fetch(`${BASE_URL}/baristas`);
    const data = await res.json();
    setTodosBaristas(Array.isArray(data) ? data : []);
  }

  async function agregar() {
    if (!seleccionado) return setMsg({ tipo: 'error', texto: 'Selecciona un barista' });
    const res = await fetch(`${BASE_URL}/cafeterias/${cafeteria.id}/baristas`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barista_id: seleccionado }),
    });
    const data = await res.json();
    setMsg({ tipo: res.ok ? 'ok' : 'error', texto: res.ok ? data.mensaje : data.error });
    if (res.ok) { setAgregando(false); setSeleccionado(''); cargarBaristas(); }
  }

  async function quitar(barista_id) {
    if (!window.confirm('¿Quitar este barista?')) return;
    await fetch(`${BASE_URL}/cafeterias/${cafeteria.id}/baristas/${barista_id}`, { method: 'DELETE' });
    cargarBaristas();
  }

  const enCafeteria = baristas.map(b => b.id);
  const disponibles = todosBaristas.filter(b => !enCafeteria.includes(b.id));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.cream }}>Baristas</div>
          <div style={{ fontSize: 12, color: C.muted }}>{baristas.length} baristas en esta cafetería</div>
        </div>
        {!agregando && <Boton onClick={() => setAgregando(true)} small>+ Agregar barista</Boton>}
      </div>

      <Alerta msg={msg} />

      {agregando && (
        <div style={{ background: 'rgba(20,160,200,0.06)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 11, color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>Barista</label>
              <select value={seleccionado} onChange={e => setSeleccionado(e.target.value)}
                style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: seleccionado ? C.cream : C.muted, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}>
                <option value="">— Seleccionar —</option>
                {disponibles.map(b => <option key={b.id} value={b.id}>{b.nombre} ({b.email})</option>)}
              </select>
            </div>
            <Boton onClick={agregar}>Agregar</Boton>
            <Boton onClick={() => { setAgregando(false); setMsg(null); }} outline>Cancelar</Boton>
          </div>
        </div>
      )}

      {baristas.length === 0
        ? <div style={{ textAlign: 'center', padding: '40px', color: C.muted }}>No hay baristas asignados aún.</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {baristas.map(b => (
              <div key={b.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.cream }}>{b.nombre}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{b.email}</div>
                </div>
                <button onClick={() => quitar(b.id)}
                  style={{ background: 'transparent', border: `1px solid ${C.danger}40`, borderRadius: 8, padding: '6px 12px', color: C.danger, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Quitar
                </button>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

// ── Panel Pedidos ─────────────────────────────────────────────────────────────
function PanelPedidos({ cafeteria }) {
  const [pedidos,  setPedidos]  = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargar(); const t = setInterval(cargar, 15000); return () => clearInterval(t); }, []);
// eslint-disable-next-line react-hooks/exhaustive-deps
  async function cargar() {
    const res = await fetch(`${BASE_URL}/pedidos-cafeteria/${cafeteria.id}`);
    const data = await res.json();
    setPedidos(Array.isArray(data) ? data : []);
    setCargando(false);
  }

  async function cambiarEstado(id, estado) {
    await fetch(`${BASE_URL}/pedidos-cafeteria/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    cargar();
  }

  const COLORES = {
    pendiente:   { bg: 'rgba(232,168,74,0.12)',  color: C.gold, label: 'Pendiente'   },
    preparando:  { bg: 'rgba(77,200,232,0.12)',  color: '#4dc8e8', label: 'Preparando'  },
    listo:       { bg: 'rgba(126,200,160,0.12)', color: '#7ec8a0', label: 'Listo'       },
    entregado:   { bg: 'rgba(255,255,255,0.05)', color: 'rgba(240,248,255,0.3)', label: 'Entregado' },
    cancelado:   { bg: 'rgba(224,92,92,0.12)',   color: '#e05c5c', label: 'Cancelado'   },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.cream }}>Pedidos</div>
          <div style={{ fontSize: 12, color: C.muted }}>Se actualiza cada 15 segundos</div>
        </div>
        <Boton onClick={cargar} small outline>🔄 Actualizar</Boton>
      </div>

      {cargando
        ? <div style={{ textAlign: 'center', padding: '40px', color: C.muted }}>Cargando pedidos...</div>
        : pedidos.length === 0
          ? <div style={{ textAlign: 'center', padding: '40px', color: C.muted }}>No hay pedidos aún.</div>
          : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pedidos.map(p => {
                const est = COLORES[p.estado] || COLORES.pendiente;
                return (
                  <div key={p.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.cream, marginBottom: 4 }}>{p.cafe_nombre}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>
                          {p.cliente_nombre} · {p.tipo_preparacion || 'Sin especificar'}
                          {p.observaciones && <span> · "{p.observaciones}"</span>}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                          {new Date(p.creado_en).toLocaleTimeString('es-CO')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ background: est.bg, color: est.color, padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                          {est.label}
                        </span>
                        {p.estado === 'pendiente' && (
                          <Boton onClick={() => cambiarEstado(p.id, 'preparando')} color="#4dc8e8" small>Iniciar</Boton>
                        )}
                        {p.estado === 'preparando' && (
                          <Boton onClick={() => cambiarEstado(p.id, 'listo')} color={C.green} small>Listo</Boton>
                        )}
                        {p.estado === 'listo' && (
                          <Boton onClick={() => cambiarEstado(p.id, 'entregado')} small>Entregado</Boton>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
      }
    </div>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────
const NAV = [
  { key: 'inicio',    label: '🏠 Inicio'       },
  { key: 'cafeteria', label: '🏪 Mi Cafetería' },
  { key: 'menu',      label: '📋 Menú'         },
  { key: 'baristas',  label: '👨‍🍳 Baristas'    },
  { key: 'pedidos',   label: '📦 Pedidos'      },
  { key: 'qr',        label: '📲 QR'           },
];

const FORM_INICIAL = {
  nombre: '', ubicacion: '', descripcion: '',
  direccion: '', telefono: '', latitud: '', longitud: '',
};

export default function DashboardDueno({ usuario, onLogout }) {
  const [seccion,   setSeccion]   = useState('inicio');
  const [cafeteria, setCafeteria] = useState(null);
  const [cargando,  setCargando]  = useState(true);
  const [creando,   setCreando]   = useState(false);
  const [editando,  setEditando]  = useState(false);
  const [form,      setForm]      = useState(FORM_INICIAL);
  const [msg,       setMsg]       = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargarCafeteria(); }, []);
// eslint-disable-next-line react-hooks/exhaustive-deps
  async function cargarCafeteria() {
    setCargando(true);
    try {
      const res  = await fetch(`${BASE_URL}/cafeterias/dueno/${usuario.id}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const c = data[0];
        setCafeteria(c);
        setForm({
          nombre:      c.nombre      || '',
          ubicacion:   c.ubicacion   || '',
          descripcion: c.descripcion || '',
          direccion:   c.direccion   || '',
          telefono:    c.telefono    || '',
          latitud:     c.latitud     || '',
          longitud:    c.longitud    || '',
        });
      }
    } catch {}
    setCargando(false);
  }

  function handleForm(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function crearCafeteria(e) {
    e.preventDefault();
    if (!form.nombre) return setMsg({ tipo: 'error', texto: 'El nombre es obligatorio' });
    setGuardando(true); setMsg(null);
    try {
      const res  = await fetch(`${BASE_URL}/cafeterias`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, dueno_id: usuario.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setCafeteria(data);
        setCreando(false);
        setMsg({ tipo: 'ok', texto: '¡Cafetería creada con QR automático!' });
      } else {
        setMsg({ tipo: 'error', texto: data.error });
      }
    } catch {
      setMsg({ tipo: 'error', texto: 'Error de conexión' });
    } finally { setGuardando(false); }
  }

  async function guardarEdicion(e) {
    e.preventDefault();
    setGuardando(true); setMsg(null);
    try {
      const res  = await fetch(`${BASE_URL}/cafeterias/${cafeteria.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setCafeteria(data);
        setEditando(false);
        setMsg({ tipo: 'ok', texto: 'Cafetería actualizada correctamente' });
      } else {
        setMsg({ tipo: 'error', texto: data.error });
      }
    } catch {
      setMsg({ tipo: 'error', texto: 'Error de conexión' });
    } finally { setGuardando(false); }
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontFamily: 'inherit' }}>
      Cargando...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, fontFamily: "'Outfit','Segoe UI',sans-serif", color: C.cream }}>

      {/* NAVBAR */}
      <nav style={{ background: 'rgba(5,10,14,0.95)', borderBottom: `1px solid ${C.border}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58, position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, color: C.tealL, fontWeight: 700 }}>🏪 {BRAND.short} — Dueño</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {cafeteria && NAV.map(n => (
            <button key={n.key} onClick={() => setSeccion(n.key)}
              style={{ background: seccion === n.key ? 'rgba(20,160,200,0.15)' : 'transparent', border: seccion === n.key ? `1px solid ${C.teal}` : '1px solid transparent', borderRadius: 8, padding: '6px 13px', color: seccion === n.key ? C.tealL : C.muted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              {n.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: C.muted }}>{usuario?.nombre}</span>
          <button onClick={onLogout} style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 14px', color: C.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Salir</button>
        </div>
      </nav>

      <main style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── SIN CAFETERÍA — pantalla de bienvenida ── */}
        {!cafeteria && !creando && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 26, color: C.cream, marginBottom: 8 }}>
              Bienvenido, {usuario?.nombre?.split(' ')[0]}
            </h1>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
              Aún no tienes una cafetería registrada. Crea la tuya y obtén tu QR automáticamente.
            </p>
            <Boton onClick={() => setCreando(true)} color={C.teal}>🏪 Crear mi cafetería</Boton>
          </div>
        )}

        {/* ── FORMULARIO CREAR ── */}
        {!cafeteria && creando && (
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>🏪 Crear cafetería</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>Al crear tu cafetería se generará un QR único automáticamente</p>
            <Alerta msg={msg} />
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 32px' }}>
              <form onSubmit={crearCafeteria}>
                <Campo label="Nombre de la cafetería" name="nombre" value={form.nombre} onChange={handleForm} placeholder="ej. Café Sumapaz" required />
                <Campo label="Ubicación / Ciudad"     name="ubicacion"   value={form.ubicacion}   onChange={handleForm} placeholder="ej. Fusagasugá, Cundinamarca" />
                <Campo label="Dirección"              name="direccion"   value={form.direccion}   onChange={handleForm} placeholder="ej. Calle 5 #10-20" />
                <Campo label="Teléfono"               name="telefono"    value={form.telefono}    onChange={handleForm} placeholder="ej. 311 234 5678" />
                <Campo label="Descripción"            name="descripcion" type="textarea" value={form.descripcion} onChange={handleForm} placeholder="Cuéntanos sobre tu cafetería..." />

                {/* COORDENADAS */}
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 4, marginBottom: 4 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.cream, marginBottom: 12 }}>
                    📍 Ubicación en el mapa <span style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>(opcional — para aparecer en el mapa de cafeterías)</span>
                  </p>
                  <CamposCoordenas form={form} onChange={handleForm} />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <Boton type="submit" disabled={guardando} color={C.teal}>{guardando ? 'Creando...' : '✓ Crear cafetería'}</Boton>
                  <Boton onClick={() => { setCreando(false); setMsg(null); }} outline>Cancelar</Boton>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── CON CAFETERÍA ── */}
        {cafeteria && (
          <>
            {/* INICIO */}
            {seccion === 'inicio' && (
              <div>
                <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: C.cream, margin: '0 0 4px' }}>
                  {cafeteria.nombre}
                </h1>
                <p style={{ color: C.muted, fontSize: 14, marginBottom: 32 }}>
                  {cafeteria.ubicacion}{cafeteria.direccion ? ` · ${cafeteria.direccion}` : ''}
                  {cafeteria.latitud
                    ? <span style={{ color: C.green }}> · 📍 En el mapa</span>
                    : <span style={{ color: C.gold }}> · ⚠️ Sin coordenadas — <button onClick={() => setSeccion('cafeteria')} style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', textDecoration: 'underline', fontSize: 14, padding: 0, fontFamily: 'inherit' }}>agregar</button></span>
                  }
                </p>
                <Alerta msg={msg} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 32 }}>
                  {[
                    { icon: '📋', label: 'Ir al menú',   key: 'menu',     color: C.teal  },
                    { icon: '👨‍🍳', label: 'Ver baristas', key: 'baristas', color: C.gold  },
                    { icon: '📦', label: 'Ver pedidos',  key: 'pedidos',  color: C.green },
                    { icon: '📲', label: 'Ver QR',       key: 'qr',       color: C.tealL },
                  ].map(card => (
                    <div key={card.key} onClick={() => setSeccion(card.key)}
                      style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '22px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = card.color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.cream }}>{card.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MI CAFETERÍA */}
            {seccion === 'cafeteria' && (
              <div style={{ maxWidth: 640 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: C.cream, margin: 0 }}>🏪 Mi Cafetería</h2>
                  {!editando && <Boton onClick={() => setEditando(true)} small>✏️ Editar</Boton>}
                </div>
                <Alerta msg={msg} />

                {editando ? (
                  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 32px' }}>
                    <form onSubmit={guardarEdicion}>
                      <Campo label="Nombre"      name="nombre"      value={form.nombre}      onChange={handleForm} required />
                      <Campo label="Ubicación"   name="ubicacion"   value={form.ubicacion}   onChange={handleForm} />
                      <Campo label="Dirección"   name="direccion"   value={form.direccion}   onChange={handleForm} />
                      <Campo label="Teléfono"    name="telefono"    value={form.telefono}    onChange={handleForm} />
                      <Campo label="Descripción" name="descripcion" type="textarea" value={form.descripcion} onChange={handleForm} />

                      {/* COORDENADAS */}
                      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 4, marginBottom: 4 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: C.cream, marginBottom: 12 }}>
                          📍 Ubicación en el mapa
                        </p>
                        <CamposCoordenas form={form} onChange={handleForm} />
                      </div>

                      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                        <Boton type="submit" disabled={guardando} color={C.teal}>{guardando ? 'Guardando...' : '💾 Guardar cambios'}</Boton>
                        <Boton onClick={() => { setEditando(false); setMsg(null); }} outline>Cancelar</Boton>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 32px' }}>
                    {[
                      ['🏪 Nombre',      cafeteria.nombre],
                      ['📍 Ubicación',   cafeteria.ubicacion],
                      ['🗺 Dirección',   cafeteria.direccion],
                      ['📞 Teléfono',    cafeteria.telefono],
                      ['📝 Descripción', cafeteria.descripcion],
                    ].map(([label, valor]) => valor && (
                      <div key={label} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 13, color: C.muted, minWidth: 120 }}>{label}</span>
                        <span style={{ fontSize: 13, color: C.cream }}>{valor}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 12, padding: '12px 0' }}>
                      <span style={{ fontSize: 13, color: C.muted, minWidth: 120 }}>📍 Coordenadas</span>
                      {cafeteria.latitud
                        ? <span style={{ fontSize: 13, color: C.green }}>✓ {cafeteria.latitud}, {cafeteria.longitud}</span>
                        : <span style={{ fontSize: 13, color: C.gold }}>⚠️ Sin coordenadas — haz clic en Editar para agregarlas</span>
                      }
                    </div>
                  </div>
                )}
              </div>
            )}

            {seccion === 'menu'     && <PanelMenu     cafeteria={cafeteria} />}
            {seccion === 'baristas' && <PanelBaristas cafeteria={cafeteria} />}
            {seccion === 'pedidos'  && <PanelPedidos  cafeteria={cafeteria} />}
            {seccion === 'qr'       && <PanelQR       cafeteria={cafeteria} />}
          </>
        )}
      </main>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { getSolicitudes, getUsuarios, responderSolicitud, cambiarRolUsuario } from '../api';
import { Link } from 'react-router-dom';

const VENTAS_SEMANA = [
  { dia: 'Lun', ventas: 320000, pedidos: 28 },
  { dia: 'Mar', ventas: 285000, pedidos: 24 },
  { dia: 'Mié', ventas: 410000, pedidos: 35 },
  { dia: 'Jue', ventas: 375000, pedidos: 31 },
  { dia: 'Vie', ventas: 520000, pedidos: 44 },
  { dia: 'Sáb', ventas: 680000, pedidos: 58 },
  { dia: 'Dom', ventas: 590000, pedidos: 50 },
];

const CAFES_INVENTARIO = [
  { nombre: 'Geisha Sumapaz',  stock: 2,  minimo: 5, precio: 12000, vendidos: 48 },
  { nombre: 'Tabi Natural',    stock: 8,  minimo: 5, precio: 10000, vendidos: 35 },
  { nombre: 'Castillo Honey',  stock: 12, minimo: 5, precio: 9000,  vendidos: 29 },
  { nombre: 'Borbón Oscuro',   stock: 6,  minimo: 5, precio: 11000, vendidos: 22 },
  { nombre: 'Caturra Fresco',  stock: 15, minimo: 5, precio: 8000,  vendidos: 18 },
];

const CAFETERIAS = [
  { nombre: 'Café Sumapaz Centro',  ventas: 1850000, satisfaccion: 4.8, pedidos: 158 },
  { nombre: 'El Origen Fusagasugá', ventas: 1420000, satisfaccion: 4.6, pedidos: 124 },
  { nombre: 'Finca & Taza',         ventas: 910000,  satisfaccion: 4.7, pedidos: 88  },
];

const ROLES_OPCIONES = ['cliente','barista','admin','caficultor'];
const COLORES_ROL = {
  cliente:    '#7ec8a0',
  barista:    C.gold,
  admin:      '#e87a4a',
  caficultor: '#a0c87e',
};

const maxVenta = Math.max(...VENTAS_SEMANA.map(v => v.ventas));

function Metrica({ icon, valor, label, sub, color }) {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '22px 24px' }}>
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || '#fdf6ec', marginBottom: 4 }}>{valor}</div>
      <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: C.green, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function DashboardAdmin({ usuario, onLogout }) {
  const [seccion, setSeccion]       = useState('resumen');
  const [solicitudes, setSolicitudes] = useState([]);
  const [usuarios, setUsuarios]     = useState([]);
  const [cargando, setCargando]     = useState(false);
  const [toast, setToast]           = useState('');
  const [editandoRol, setEditandoRol] = useState(null);

  const esSuperAdmin = usuario.es_super_admin || usuario.email === 'admin@cafe.co';
  const totalVentas  = VENTAS_SEMANA.reduce((a, v) => a + v.ventas, 0);
  const totalPedidos = VENTAS_SEMANA.reduce((a, v) => a + v.pedidos, 0);
  const stockCritico = CAFES_INVENTARIO.filter(c => c.stock <= c.minimo).length;

  useEffect(() => {
    if (seccion === 'solicitudes') cargarSolicitudes();
    if (seccion === 'usuarios')    cargarUsuarios();
  }, [seccion]);

  async function cargarSolicitudes() {
    setCargando(true);
    const data = await getSolicitudes();
    if (Array.isArray(data)) setSolicitudes(data);
    setCargando(false);
  }

  async function cargarUsuarios() {
    setCargando(true);
    const data = await getUsuarios();
    if (Array.isArray(data)) setUsuarios(data);
    setCargando(false);
  }

  async function aprobar(id, rol) {
    await responderSolicitud(id, 'activo', rol);
    mostrarToast('✅ Usuario aprobado correctamente');
    cargarSolicitudes();
  }

  async function rechazar(id, rol) {
    await responderSolicitud(id, 'rechazado', rol);
    mostrarToast('❌ Solicitud rechazada');
    cargarSolicitudes();
  }

  async function guardarRol(id, rol, esSuperAdminNuevo) {
    await cambiarRolUsuario(id, rol, esSuperAdminNuevo);
    mostrarToast('✅ Rol actualizado correctamente');
    setEditandoRol(null);
    cargarUsuarios();
  }

  function mostrarToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const NAV = [
    { key: 'resumen',      label: '📊 Resumen' },
    { key: 'ventas',       label: '💰 Ventas' },
    { key: 'inventario',   label: '📦 Inventario' },
    { key: 'cafeterias',   label: '🏪 Cafeterías' },
    { key: 'solicitudes',  label: `🔔 Solicitudes${solicitudes.filter(s=>s.estado==='pendiente').length > 0 ? ` (${solicitudes.filter(s=>s.estado==='pendiente').length})` : ''}` },
    ...(esSuperAdmin ? [{ key: 'usuarios', label: '👑 Usuarios' }] : []),
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, fontFamily: "'Outfit',sans-serif", color: C.cream }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 24px', fontSize: 14, color: C.cream, zIndex: 100, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}

      {/* NAVBAR */}
      <nav style={{ background: C.bgCard, borderBottom: '1px solid rgba(212,175,55,0.2)', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: C.gold, fontWeight: 700 }}>☕ {BRAND.short} — Admin</span>
          {esSuperAdmin && <span style={{ background: 'rgba(244,169,196,0.15)', color: C.gold, fontSize: 10, padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(244,169,196,0.3)' }}>👑 SUPER ADMIN</span>}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {NAV.map(n => (
            <button key={n.key} onClick={() => setSeccion(n.key)}
              style={{ padding: '8px 14px', background: seccion === n.key ? 'rgba(212,175,55,0.2)' : 'transparent', border: seccion === n.key ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent', borderRadius: 7, color: seccion === n.key ? C.gold : 'rgba(245,234,216,0.5)', fontSize: 12, cursor: 'pointer' }}>
              {n.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(245,234,216,0.5)' }}>{usuario.email}</span>
          <button onClick={onLogout} style={{ padding: '7px 14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 7, color: C.gold, fontSize: 12, cursor: 'pointer' }}>Salir</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>

        {/* RESUMEN */}
        {seccion === 'resumen' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>Resumen semanal</h2>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>Vista general del negocio esta semana</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
              <Metrica icon="💰" valor={`$${(totalVentas/1000000).toFixed(1)}M`} label="Ventas totales"     sub="↑ 12% vs semana anterior" color={C.gold} />
              <Metrica icon="☕" valor={totalPedidos}                              label="Pedidos totales"    sub="↑ 8% vs semana anterior"  color="#7ec8a0" />
              <Metrica icon="⭐" valor="4.7"                                       label="Satisfacción prom." sub="Basado en 270 valoraciones" color={C.gold} />
              <Metrica icon="⚠️" valor={stockCritico}                              label="Alertas de stock"  sub="Requieren atención"        color="#e87a4a" />
            </div>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <h3 style={{ color: C.cream, fontSize: 16, marginBottom: 24 }}>Ventas por día</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
                {VENTAS_SEMANA.map(v => (
                  <div key={v.dia} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 10, color: 'rgba(245,234,216,0.4)' }}>${(v.ventas/1000).toFixed(0)}k</span>
                    <div style={{ width: '100%', height: `${(v.ventas/maxVenta)*120}px`, background: `linear-gradient(to top, ${C.gold}, ${C.goldL})`, borderRadius: '4px 4px 0 0', minHeight: 4 }} />
                    <span style={{ fontSize: 12, color: 'rgba(245,234,216,0.5)' }}>{v.dia}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <h3 style={{ color: C.cream, fontSize: 16, marginBottom: 20 }}>Top cafés por ventas</h3>
              {CAFES_INVENTARIO.sort((a,b) => b.vendidos - a.vendidos).map((c, i) => (
                <div key={c.nombre} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <span style={{ fontSize: 13, color: C.gold, fontWeight: 700, width: 20 }}>#{i+1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                      <span style={{ color: C.cream }}>{c.nombre}</span>
                      <span style={{ color: C.muted }}>{c.vendidos} vendidos</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${(c.vendidos/48)*100}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.goldL})`, borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VENTAS */}
        {seccion === 'ventas' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>Reporte de ventas</h2>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>Detalle diario de la semana actual</p>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '14px 20px', background: 'rgba(212,175,55,0.08)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
                {['Día','Ventas','Pedidos','Ticket promedio'].map(h => (
                  <span key={h} style={{ fontSize: 11, color: 'rgba(245,234,216,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
              {VENTAS_SEMANA.map((v, i) => (
                <div key={v.dia} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: i < VENTAS_SEMANA.length-1 ? '1px solid rgba(212,175,55,0.08)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(212,175,55,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <span style={{ color: C.cream, fontSize: 14 }}>{v.dia}</span>
                  <span style={{ color: C.gold, fontSize: 14, fontWeight: 600 }}>${v.ventas.toLocaleString()}</span>
                  <span style={{ color: 'rgba(245,234,216,0.7)', fontSize: 14 }}>{v.pedidos}</span>
                  <span style={{ color: 'rgba(245,234,216,0.7)', fontSize: 14 }}>${Math.round(v.ventas/v.pedidos).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '14px 20px', background: 'rgba(212,175,55,0.08)', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
                <span style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>TOTAL</span>
                <span style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>${totalVentas.toLocaleString()}</span>
                <span style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>{totalPedidos}</span>
                <span style={{ color: C.gold, fontSize: 13, fontWeight: 700 }}>${Math.round(totalVentas/totalPedidos).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* INVENTARIO */}
        {seccion === 'inventario' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>Gestión de inventario</h2>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>Estado actual del stock de cafés</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CAFES_INVENTARIO.map(c => {
                const critico = c.stock <= c.minimo;
                return (
                  <div key={c.nombre} style={{ background: C.bgCard, border: `1px solid ${critico ? 'rgba(232,122,74,0.4)' : 'rgba(212,175,55,0.2)'}`, borderRadius: 10, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ color: C.cream, fontWeight: 600, fontSize: 15 }}>{c.nombre}</span>
                        {critico && <span style={{ background: 'rgba(232,122,74,0.15)', color: '#e87a4a', padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>⚠ STOCK BAJO</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 20 }}>
                        <span style={{ fontSize: 12, color: C.muted }}>Stock: <strong style={{ color: critico ? '#e87a4a' : '#7ec8a0' }}>{c.stock}</strong></span>
                        <span style={{ fontSize: 12, color: C.muted }}>Mínimo: {c.minimo}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>Vendidos: {c.vendidos}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: C.gold, fontWeight: 700, fontSize: 16 }}>${c.precio.toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: 'rgba(245,234,216,0.35)' }}>por porción</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CAFETERÍAS */}
        {seccion === 'cafeterias' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>Rendimiento por cafetería</h2>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>Comparativo de las 3 cafeterías registradas</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
              {CAFETERIAS.map((c, i) => (
                <div key={c.nombre} style={{ background: C.bgCard, border: `1px solid ${i===0 ? 'rgba(212,175,55,0.5)' : 'rgba(212,175,55,0.2)'}`, borderRadius: 12, padding: 24, position: 'relative' }}>
                  {i===0 && <div style={{ position: 'absolute', top: -10, left: 20, background: C.gold, color: C.btnText, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>⭐ MEJOR RENDIMIENTO</div>}
                  <h3 style={{ color: C.cream, fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{c.nombre}</h3>
                  {[
                    { label: 'Ventas semanales', valor: `$${(c.ventas/1000000).toFixed(2)}M`, color: C.gold },
                    { label: 'Pedidos',           valor: c.pedidos,                            color: C.cream },
                    { label: 'Satisfacción',      valor: `${c.satisfaccion}/5 ⭐`,             color: C.green },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                      <span style={{ color: 'rgba(245,234,216,0.5)', fontSize: 13 }}>{item.label}</span>
                      <span style={{ color: item.color, fontSize: 13, fontWeight: 600 }}>{item.valor}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SOLICITUDES */}
        {seccion === 'solicitudes' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>Solicitudes de acceso</h2>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>Usuarios que requieren aprobación de rol</p>

            {cargando
              ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(245,234,216,0.3)' }}>Cargando solicitudes...</div>
              : solicitudes.length === 0
                ? <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                    <p style={{ color: 'rgba(245,234,216,0.4)' }}>No hay solicitudes pendientes</p>
                  </div>
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {solicitudes.map(u => (
                      <div key={u.id} style={{ background: C.bgCard, border: `1px solid ${u.estado==='pendiente' ? 'rgba(244,169,196,0.4)' : 'rgba(232,122,74,0.3)'}`, borderRadius: 10, padding: '18px 22px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <span style={{ color: C.cream, fontWeight: 600, fontSize: 15 }}>{u.nombre}</span>
                              <span style={{ background: `rgba(212,175,55,0.1)`, color: COLORES_ROL[u.rol] || C.gold, padding: '2px 10px', borderRadius: 20, fontSize: 11, border: `1px solid ${COLORES_ROL[u.rol]}44` }}>
                                {u.rol}
                              </span>
                              <span style={{ background: u.estado==='pendiente' ? 'rgba(244,169,196,0.1)' : 'rgba(232,122,74,0.1)', color: u.estado==='pendiente' ? C.gold : '#e87a4a', padding: '2px 10px', borderRadius: 20, fontSize: 11 }}>
                                {u.estado}
                              </span>
                            </div>
                            <p style={{ color: 'rgba(245,234,216,0.4)', fontSize: 12 }}>{u.email}</p>
                          </div>
                          {u.estado === 'pendiente' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => aprobar(u.id, u.rol)}
                                style={{ padding: '8px 18px', background: 'rgba(126,200,160,0.15)', border: '1px solid rgba(126,200,160,0.4)', borderRadius: 7, color: C.green, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                                ✅ Aprobar
                              </button>
                              <button onClick={() => rechazar(u.id, u.rol)}
                                style={{ padding: '8px 18px', background: 'rgba(232,122,74,0.1)', border: '1px solid rgba(232,122,74,0.3)', borderRadius: 7, color: '#e87a4a', fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                                ❌ Rechazar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
            }
          </div>
        )}

        {/* USUARIOS — SOLO SUPER ADMIN */}
        {seccion === 'usuarios' && esSuperAdmin && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: C.cream, marginBottom: 6 }}>👑 Gestión de usuarios</h2>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>Solo el Super Admin puede cambiar roles y permisos</p>

            {cargando
              ? <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(245,234,216,0.3)' }}>Cargando usuarios...</div>
              : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {usuarios.map(u => (
                    <div key={u.id} style={{ background: C.bgCard, border: `1px solid ${u.es_super_admin ? 'rgba(244,169,196,0.5)' : 'rgba(212,175,55,0.2)'}`, borderRadius: 10, padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ color: C.cream, fontWeight: 600 }}>{u.nombre}</span>
                            {u.es_super_admin && <span style={{ background: 'rgba(244,169,196,0.15)', color: C.gold, fontSize: 10, padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(244,169,196,0.3)' }}>👑 SUPER ADMIN</span>}
                            <span style={{ background: 'rgba(212,175,55,0.1)', color: COLORES_ROL[u.rol] || C.gold, padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{u.rol}</span>
                            <span style={{ background: u.estado==='activo' ? 'rgba(126,200,160,0.1)' : 'rgba(232,122,74,0.1)', color: u.estado==='activo' ? '#7ec8a0' : '#e87a4a', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{u.estado}</span>
                          </div>
                          <p style={{ color: 'rgba(245,234,216,0.4)', fontSize: 12 }}>{u.email}</p>
                        </div>

                        {editandoRol === u.id
                          ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                              <select defaultValue={u.rol}
                                id={`rol-${u.id}`}
                                style={{ padding: '7px 12px', background: 'rgba(26,10,0,0.8)', border: `1px solid ${C.border}`, borderRadius: 7, color: C.cream, fontSize: 12, fontFamily: "'Outfit',sans-serif" }}>
                                {ROLES_OPCIONES.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(245,234,216,0.6)', cursor: 'pointer' }}>
                                <input type="checkbox" defaultChecked={u.es_super_admin} id={`super-${u.id}`} style={{ accentColor: C.gold }} />
                                Super Admin
                              </label>
                              <button onClick={() => {
                                const rol = document.getElementById(`rol-${u.id}`).value;
                                const esSuper = document.getElementById(`super-${u.id}`).checked;
                                guardarRol(u.id, rol, esSuper);
                              }} style={{ padding: '7px 14px', background: 'rgba(126,200,160,0.15)', border: '1px solid rgba(126,200,160,0.4)', borderRadius: 7, color: C.green, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                                Guardar
                              </button>
                              <button onClick={() => setEditandoRol(null)}
                                style={{ padding: '7px 14px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 7, color: 'rgba(245,234,216,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                                Cancelar
                              </button>
                            </div>
                          : <button onClick={() => setEditandoRol(u.id)}
                              style={{ padding: '7px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 7, color: C.gold, fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                              ✏️ Editar rol
                            </button>
                        }
                      </div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

      </div>
    </div>
  );
}
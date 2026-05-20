import React, { useState } from 'react';
import { registrarUsuario } from '../api';
import { C, BRAND, JV } from '../theme/brand';
const ROLES = [
  { key: 'cliente',         label: 'Cliente',        color: '#7ec8a0', desc: 'Descubre y valora cafés' },
  { key: 'barista',         label: 'Barista',         color: C.goldL, desc: 'Gestiona pedidos y preparación' },
  { key: 'caficultor',      label: 'Caficultor',      color: '#a0c87e', desc: 'Conecta tu finca con el mercado' },
  { key: 'catador',         label: 'Catador',         color: '#c4a0f0', desc: 'Evalúa perfiles sensoriales' },
  { key: 'dueno_cafeteria', label: 'Dueño Cafetería', color: '#4dc8e8', desc: 'Crea y administra tu cafetería' },
];
export default function Registro({ onVolver, onRegistro }) {
  const [nombre,    setNombre]    = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [rol,       setRol]       = useState('cliente');
  const [error,     setError]     = useState('');
  const [cargando,  setCargando]  = useState(false);
  const [showPwd,   setShowPwd]   = useState(false);
  const [pendiente, setPendiente] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener mínimo 6 caracteres');
      return;
    }

    setCargando(true);
    try {
      const data = await registrarUsuario(nombre, email, password, rol);
      if (data.token) {
        localStorage.setItem('token', data.token);
        onRegistro({ ...data.usuario, role: data.usuario.rol });
      } else if (data.pendiente) {
        setPendiente(true);
      } else {
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('No se pudo conectar al servidor');
    }
    setCargando(false);
  }

  // PANTALLA DE SOLICITUD PENDIENTE
  if (pendiente) {
    return (
      <div style={{ minHeight: '100vh', background: C.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit',sans-serif" }}>
        <div style={{ background: 'rgba(75,46,43,0.8)', border: '1px solid rgba(232,168,74,0.4)', borderRadius: 16, padding: '48px 52px', maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>⏳</div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: C.cream, marginBottom: 12 }}>Cuenta creada</h2>
<p style={{ color: 'rgba(245,234,216,0.6)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
  Tu cuenta está siendo verificada, esto puede tardar hasta <strong style={{ color: C.goldL }}>40 minutos</strong>, intenta iniciar sesión en unos minutos para saber si ya fue aprobada.
</p>
          <button onClick={onVolver}
            style={{ padding: '12px 32px', background: C.btn, border: 'none', borderRadius: 8, color: C.btnText, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* IZQUIERDA */}
      <div style={styles.left}>
        <div style={styles.brandName}>
          Origen y Taza<br /><em style={{ color: JV.rose }}>JV</em>
        </div>
        <p style={styles.brandSub}>Sumapaz · Cundinamarca · Colombia</p>
        <p style={styles.tagline}>
          Únete a nuestra comunidad cafetera.<br />
          Crea tu cuenta y comienza a <strong style={{ color: 'C.gold' }}>descubrir el café</strong> de otra manera.
        </p>
        <div style={{ marginTop: 40 }}> 
          <p style={styles.rolesLabel}>Elige tu rol</p>
          {ROLES.map(r => (
            <div key={r.key} onClick={() => setRol(r.key)}
              style={{ ...styles.roleChip, borderColor: rol === r.key ? r.color : 'rgba(212,175,55,0.18)', background: rol === r.key ? 'rgba(212,175,55,0.08)' : 'transparent', cursor: 'pointer' }}>
              <span style={{ ...styles.dot, background: r.color }} />
              <div>
                <div style={{ color: rol === r.key ? r.color : 'rgba(245,234,216,0.65)', fontSize: 13 }}>{r.label}</div>
                <div style={{ color: 'rgba(245,234,216,0.35)', fontSize: 11 }}>{r.desc}</div>
                {r.key !== 'cliente' && (
                  <div style={{ color: C.goldL, fontSize: 10, marginTop: 2 }}>⚠ Requiere aprobación del administrador</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DERECHA */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Crear cuenta</h2>
          <p style={styles.cardSub}>Completa los datos para registrarte</p>

          <form onSubmit={handleSubmit}>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre completo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre" required style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Correo electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com" required style={styles.input} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Contraseña</label>
              <input type={showPwd ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres" required style={styles.input} />
              <span onClick={() => setShowPwd(!showPwd)} style={styles.showPwd}>
                {showPwd ? 'Ocultar' : 'Mostrar'}
              </span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirmar contraseña</label>
              <input type={showPwd ? 'text' : 'password'} value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repite tu contraseña" required style={styles.input} />
            </div>

            {/* SELECTOR DE ROL */}
            <div style={{ marginBottom: 20 }}>
              <label style={styles.label}>Rol en el sistema</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                {ROLES.map(r => (
                  <button key={r.key} type="button" onClick={() => setRol(r.key)}
                    style={{ padding: '8px 6px', border: `1px solid ${rol === r.key ? r.color : 'rgba(212,175,55,0.2)'}`, borderRadius: 8, background: rol === r.key ? 'rgba(212,175,55,0.12)' : 'transparent', color: rol === r.key ? r.color : 'rgba(245,234,216,0.45)', fontSize: 12, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                    {r.label}
                  </button>
                ))}
              </div>
              {rol !== 'cliente' && (
                <p style={{ color: C.goldL, fontSize: 11, marginTop: 8, padding: '6px 10px', background: 'rgba(232,168,74,0.08)', borderRadius: 6, border: '1px solid rgba(232,168,74,0.2)' }}>
                  ⚠ El rol <strong>{rol}</strong> requiere aprobación del administrador antes de poder acceder.
                </p>
              )}
            </div>

            {error && (
              <p style={{ color: '#e87a4a', fontSize: 13, marginBottom: 12, background: 'rgba(232,122,74,0.1)', padding: '8px 12px', borderRadius: 6 }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={cargando}
              style={{ ...styles.btnLogin, opacity: cargando ? 0.7 : 1 }}>
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div style={styles.divider}>¿ya tienes cuenta?</div>

          <button onClick={onVolver}
            style={{ width: '100%', padding: 12, background: 'transparent', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8, color: 'C.gold', fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 460px', background: JV.bgPage, fontFamily: "'Outfit',sans-serif" },
  left: { padding: '60px 70px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(212,175,55,0.15)' },
  brandName: { fontSize: 42, fontWeight: 700, lineHeight: 1.15, color: C.cream, fontFamily: 'Georgia,serif' },
  brandSub: { marginTop: 12, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,234,216,0.4)' },
  tagline: { marginTop: 36, fontSize: 15, lineHeight: 1.8, color: 'rgba(245,234,216,0.6)', maxWidth: 380 },
  rolesLabel: { fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,234,216,0.3)', marginBottom: 12 },
  roleChip: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', marginBottom: 8, border: '1px solid', borderRadius: 8, transition: 'all 0.2s' },
  dot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  right: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 44px' },
  card: { width: '100%', background: 'rgba(75,46,43,0.7)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 16, padding: '36px 38px' },
  cardTitle: { fontSize: 26, fontWeight: 700, color: C.cream, fontFamily: 'Georgia,serif', marginBottom: 4 },
  cardSub: { fontSize: 13, color: 'rgba(245,234,216,0.4)', marginBottom: 24 },
  formGroup: { marginBottom: 14, position: 'relative' },
  label: { display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(245,234,216,0.5)', marginBottom: 7 },
  input: { width: '100%', padding: '11px 14px', background: 'rgba(26,10,0,0.6)', border: '1px solid rgba(212,175,55,0.22)', borderRadius: 8, color: '#f5ead8', fontSize: 14, outline: 'none', fontFamily: "'Outfit',sans-serif", boxSizing: 'border-box' },
  showPwd: { position: 'absolute', right: 12, bottom: 12, fontSize: 11, color: 'C.gold', cursor: 'pointer' },
  btnLogin: { width: '100%', padding: 13, background: JV.btn, border: 'none', borderRadius: 8, color: JV.btnText, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" },
  divider: { textAlign: 'center', margin: '20px 0', fontSize: 12, color: 'rgba(245,234,216,0.25)', borderTop: '1px solid rgba(212,175,55,0.12)', paddingTop: 16 },
};
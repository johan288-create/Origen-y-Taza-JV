import React, { useState } from 'react';
import { loginUsuario } from '../api';
import Registro from './Registro';
import { BRAND, JV } from '../theme/brand';

const ROLES = [
  { key: 'cliente',         label: 'Cliente',        color: '#7ec8a0' },
  { key: 'barista',         label: 'Barista',         color: JV.gold },
  { key: 'admin',           label: 'Administrador',   color: '#e87a4a' },
  { key: 'caficultor',      label: 'Caficultor',      color: '#a0c87e' },
  { key: 'catador',         label: 'Catador',         color: '#c4a0f0' },
  { key: 'dueno_cafeteria', label: 'Dueño Cafetería', color: '#4dc8e8' },
];

export default function Login({ onLogin, onVolver }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [roleActivo, setRole]   = useState('cliente');
  const [error,    setError]    = useState('');
  const [cargando, setCargando] = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [mostrarRegistro, setMostrarRegistro] = useState(false);

  if (mostrarRegistro) {
    return <Registro onVolver={() => setMostrarRegistro(false)} onRegistro={onLogin} />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCargando(true);
    setError('');
    try {
      const data = await loginUsuario(email, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
        onLogin({ ...data.usuario, rol: data.usuario.rol });
      } else if (data.error && data.error.includes('pendiente')) {
        setError('⏳ Su solicitud se encuentra en espera, intente iniciar sesión en los próximos 30 minutos.');
      } else if (data.error && data.error.includes('rechazada')) {
        setError('❌ Su solicitud fue rechazada. Contacte al administrador para más información.');
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('No se pudo conectar al servidor');
    }
    setCargando(false);
  }

  return (
    <div style={styles.page}>
      {onVolver && (
        <button type="button" onClick={onVolver} style={{
          position: 'absolute', top: 20, left: 20,
          background: 'transparent', border: `1px solid ${JV.border}`,
          borderRadius: 8, padding: '7px 14px', color: JV.textMuted,
          fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', zIndex: 10,
        }}>← Volver al mapa</button>
      )}

      {/* IZQUIERDA */}
      <div style={styles.left}>
        <div style={styles.brandName}>Origen y Taza<br /><em style={{ color: JV.rose }}>JV</em></div>
        <p style={styles.brandSub}>{BRAND.region}</p>
        <p style={styles.tagline}>{BRAND.slogan}</p>
        <div style={{ marginTop: 40 }}>
          <p style={styles.rolesLabel}>Acceso por rol</p>
          {ROLES.map(r => (
            <div key={r.key} style={styles.roleChip}>
              <span style={{ ...styles.dot, background: r.color }} />
              {r.label}
            </div>
          ))}
        </div>
      </div>

      {/* DERECHA */}
      <div style={styles.right}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Bienvenido</h2>
          <p style={styles.cardSub}>Selecciona tu rol e ingresa tus credenciales</p>

          {/* TABS */}
          <div style={styles.tabs}>
            {ROLES.map(r => (
              <button key={r.key} onClick={() => setRole(r.key)}
                style={{ ...styles.tab, borderColor: roleActivo === r.key ? r.color : 'rgba(212,175,55,0.2)', color: roleActivo === r.key ? r.color : 'rgba(245,234,216,0.5)', background: roleActivo === r.key ? 'rgba(212,175,55,0.1)' : 'transparent' }}>
                <span style={{ ...styles.dot, background: r.color }} />
                {r.label}
              </button>
            ))}
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Correo electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="usuario@cafe.co" required style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Contraseña</label>
              <input type={showPwd ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={styles.input} />
              <span onClick={() => setShowPwd(!showPwd)} style={styles.showPwd}>
                {showPwd ? 'Ocultar' : 'Mostrar'}
              </span>
            </div>

            {error && (
              <p style={{
                fontSize: 13, marginBottom: 12, padding: '10px 12px', borderRadius: 6,
                background: error.includes('⏳') ? 'rgba(232,168,74,0.1)' : 'rgba(232,122,74,0.1)',
                color: error.includes('⏳') ? JV.gold : '#e87a4a',
                border: `1px solid ${error.includes('⏳') ? 'rgba(232,168,74,0.3)' : 'rgba(232,122,74,0.2)'}`,
                lineHeight: 1.6
              }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={cargando}
              style={{ ...styles.btnLogin, opacity: cargando ? 0.7 : 1 }}>
              {cargando ? 'Ingresando...' : 'Ingresar al sistema'}
            </button>
          </form>

          <div style={styles.divider}>¿no tienes cuenta?</div>
          <button onClick={() => setMostrarRegistro(true)}
            style={{ width: '100%', padding: 12, background: 'transparent', border: `1px solid ${JV.border}`, borderRadius: 8, color: JV.gold, fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
            Crear cuenta nueva
          </button>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { position: 'relative', minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 460px)', background: JV.bgPage, fontFamily: "'Outfit', sans-serif" },
  left: { padding: '60px 70px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: `1px solid ${JV.border}` },
  brandName: { fontSize: 42, fontWeight: 700, lineHeight: 1.15, color: JV.cream, fontFamily: 'Georgia, serif' },
  brandSub: { marginTop: 12, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', color: JV.textSoft },
  tagline: { marginTop: 36, fontSize: 15, lineHeight: 1.8, color: JV.textMuted, maxWidth: 380 },
  rolesLabel: { fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: JV.textSoft, marginBottom: 12 },
  roleChip: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', marginBottom: 8, width: 'fit-content', border: `1px solid ${JV.border}`, borderRadius: 4, fontSize: 13, color: JV.textMuted },
  dot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  right: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 44px' },
  card: { width: '100%', background: JV.card, border: `1px solid ${JV.border}`, borderRadius: 16, padding: '40px 38px' },
  cardTitle: { fontSize: 26, fontWeight: 700, color: JV.cream, fontFamily: 'Georgia, serif', marginBottom: 4 },
  cardSub: { fontSize: 13, color: JV.textSoft, marginBottom: 28 },
  tabs: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 24 },
  tab: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '9px 6px', border: '1px solid', borderRadius: 8, fontSize: 11, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" },
  formGroup: { marginBottom: 16, position: 'relative' },
  label: { display: 'block', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: JV.textMuted, marginBottom: 7 },
  input: { width: '100%', padding: '12px 14px', background: 'rgba(58,35,31,0.6)', border: `1px solid ${JV.border}`, borderRadius: 8, color: JV.cream, fontSize: 14, outline: 'none', fontFamily: "'Outfit', sans-serif", boxSizing: 'border-box' },
  showPwd: { position: 'absolute', right: 12, bottom: 13, fontSize: 11, color: JV.gold, cursor: 'pointer' },
  btnLogin: { width: '100%', padding: 13, background: JV.btn, border: 'none', borderRadius: 8, color: JV.btnText, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", marginTop: 4 },
  divider: { textAlign: 'center', margin: '22px 0', fontSize: 12, color: JV.textSoft, borderTop: `1px solid ${JV.border}`, paddingTop: 18 },
};
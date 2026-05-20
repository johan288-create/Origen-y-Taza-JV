import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL as BASE_URL } from '../config';
import { C, BRAND } from '../theme/brand';

const ETAPAS = [
  { key: 'siembra',   label: 'Siembra',   emoji: '🌱', color: '#5da86e' },
  { key: 'cosecha',   label: 'Cosecha',   emoji: '🍒', color: C.gold },
  { key: 'beneficio', label: 'Beneficio', emoji: '⚙️',  color: '#5b9bd5' },
  { key: 'secado',    label: 'Secado',    emoji: '☀️',  color: '#e8c84a' },
  { key: 'tostion',   label: 'Tostión',   emoji: '🔥', color: '#e07050' },
  { key: 'empaque',   label: 'Empaque',   emoji: '📦', color: '#9b7ec8' },
];

const CAMPOS_ETAPA = {
  siembra: [
    { name: 'variedad',        label: 'Variedad de café',   type: 'text',   placeholder: 'ej. Geisha, Tabi, Pink Bourbon' },
    { name: 'num_plantas',     label: 'N° de plantas',      type: 'number', placeholder: 'ej. 2500' },
    { name: 'altitud_siembra', label: 'Altitud de siembra', type: 'text',   placeholder: 'ej. 1700 msnm' },
    { name: 'tipo_suelo',      label: 'Tipo de suelo',      type: 'text',   placeholder: 'ej. Franco arcilloso' },
    { name: 'sistema_siembra', label: 'Sistema de siembra', type: 'text',   placeholder: 'ej. Agroforestal, Pleno sol' },
  ],
  cosecha: [
    { name: 'tipo_cosecha',     label: 'Tipo de cosecha',     type: 'select', options: [
      { value: 'manual_selectiva', label: 'Manual selectiva' },
      { value: 'mecanica',         label: 'Mecánica' },
      { value: 'por_bandeo',       label: 'Por bandeo' },
    ]},
    { name: 'kg_recolectados',  label: 'Kg recolectados',     type: 'number', placeholder: 'ej. 1200' },
    { name: 'num_recolectores', label: 'N° de recolectores',  type: 'number', placeholder: 'ej. 8' },
    { name: 'dias_cosecha',     label: 'Días de cosecha',     type: 'number', placeholder: 'ej. 15' },
    { name: 'brix_promedio',    label: 'Brix promedio (°Bx)', type: 'number', placeholder: 'ej. 22.5', step: '0.1' },
  ],
  beneficio: [
    { name: 'proceso_beneficio',  label: 'Proceso',               type: 'select', options: [
      { value: 'lavado',      label: 'Lavado' },
      { value: 'natural',     label: 'Natural' },
      { value: 'honey',       label: 'Honey' },
      { value: 'anaeorobico', label: 'Anaeróbico' },
    ]},
    { name: 'horas_fermentacion', label: 'Horas de fermentación', type: 'number', placeholder: 'ej. 36' },
    { name: 'ph_fermentacion',    label: 'pH de fermentación',    type: 'number', placeholder: 'ej. 5.5', step: '0.1' },
    { name: 'agua_usada_litros',  label: 'Agua utilizada (L)',    type: 'number', placeholder: 'ej. 500' },
  ],
  secado: [
    { name: 'metodo_secado',        label: 'Método de secado',       type: 'select', options: [
      { value: 'camas_africanas',  label: 'Camas africanas' },
      { value: 'patio',            label: 'Patio' },
      { value: 'marquesina',       label: 'Marquesina' },
      { value: 'secador_mecanico', label: 'Secador mecánico' },
    ]},
    { name: 'dias_secado',          label: 'Días de secado',         type: 'number', placeholder: 'ej. 18' },
    { name: 'humedad_inicial',      label: 'Humedad inicial (%)',    type: 'number', placeholder: 'ej. 55', step: '0.1' },
    { name: 'humedad_final',        label: 'Humedad final (%)',      type: 'number', placeholder: 'ej. 11', step: '0.1' },
    { name: 'temperatura_promedio', label: 'Temperatura prom. (°C)', type: 'number', placeholder: 'ej. 28', step: '0.1' },
  ],
  tostion: [
    { name: 'perfil_tueste',      label: 'Perfil de tueste', type: 'select', options: [
      { value: 'claro',      label: 'Claro (Light)' },
      { value: 'medio',      label: 'Medio (Medium)' },
      { value: 'oscuro',     label: 'Oscuro (Dark)' },
      { value: 'muy_oscuro', label: 'Muy oscuro (French)' },
    ]},
    { name: 'temperatura_tueste', label: 'Temperatura (°C)', type: 'number', placeholder: 'ej. 205', step: '0.1' },
    { name: 'tiempo_tueste_min',  label: 'Tiempo (min)',     type: 'number', placeholder: 'ej. 12' },
    { name: 'perdida_peso_pct',   label: 'Pérdida peso (%)', type: 'number', placeholder: 'ej. 16', step: '0.1' },
  ],
  empaque: [
    { name: 'tipo_empaque',      label: 'Tipo de empaque',       type: 'text',   placeholder: 'ej. Bolsa kraft válvula desgasificante' },
    { name: 'peso_empaque_gr',   label: 'Peso por empaque (gr)', type: 'number', placeholder: 'ej. 250' },
    { name: 'num_unidades',      label: 'N° de unidades',        type: 'number', placeholder: 'ej. 120' },
    { name: 'fecha_vencimiento', label: 'Fecha de vencimiento',  type: 'date' },
    { name: 'certificacion',     label: 'Certificación',         type: 'text',   placeholder: 'ej. Rainforest Alliance' },
  ],
};

const METODOS_PREPARACION = [
  'V60', 'Chemex', 'Aeropress', 'Prensa francesa',
  'Espresso', 'Cold Brew', 'Moka', 'Kalita Wave',
  'Sifón', 'Goteo', 'Turco', 'Otro',
];

// ── Componentes base ──────────────────────────────────────────────────────────

function Estrellas({ rating = 0 }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rating ? C.goldL : 'rgba(245,234,216,0.15)', fontSize: 13 }}>★</span>
      ))}
    </span>
  );
}

function Metrica({ icon, valor, label, color, sub }) {
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || C.cream, marginBottom: 3 }}>{valor}</div>
      <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function CampoInput({ label, name, type = 'text', value, onChange, placeholder, step, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        {label}{required && <span style={{ color: C.danger }}> *</span>}
      </label>
      <input type={type} name={name} value={value || ''} onChange={onChange}
        placeholder={placeholder} step={step}
        style={{ width: '100%', boxSizing: 'border-box', background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.cream, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
      />
    </div>
  );
}

function CampoSelect({ label, name, value, onChange, options, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
        {label}{required && <span style={{ color: C.danger }}> *</span>}
      </label>
      <select name={name} value={value || ''} onChange={onChange}
        style={{ width: '100%', boxSizing: 'border-box', background: '#1a0800', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: value ? C.cream : C.muted, fontSize: 14, outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
        <option value="">— Seleccionar —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function CampoTextArea({ label, name, value, onChange, placeholder, rows = 3 }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</label>
      <textarea name={name} value={value || ''} onChange={onChange} placeholder={placeholder} rows={rows}
        style={{ width: '100%', boxSizing: 'border-box', background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: C.cream, fontSize: 14, outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
      />
    </div>
  );
}

function Boton({ children, onClick, type = 'button', disabled, color, outline, small }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{
        background: outline ? 'transparent' : (color || C.gold),
        border: outline ? `1px solid ${C.border}` : 'none',
        borderRadius: 8,
        padding: small ? '6px 14px' : '10px 22px',
        color: outline ? C.muted : '#1a0800',
        fontWeight: 700,
        fontSize: small ? 12 : 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'inherit',
      }}>
      {children}
    </button>
  );
}

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

// ── Editar café ───────────────────────────────────────────────────────────────

function FormEditarCafe({ cafe, onGuardado, onCancelar }) {
  const [form, setForm] = useState({
    nombre:      cafe.nombre      || '',
    origen:      cafe.origen      || '',
    variedad:    cafe.variedad    || '',
    proceso:     cafe.proceso     || '',
    altitud:     cafe.altitud     || '',
    precio:      cafe.precio      || '',
    intensidad:  cafe.intensidad  || 5,
    acidez:      cafe.acidez      || 5,
    cuerpo:      cafe.cuerpo      || 5,
    dulzor:      cafe.dulzor      || 5,
    amargor:     cafe.amargor     || 5,
    descripcion: cafe.descripcion || '',
    sabores:     Array.isArray(cafe.sabores) ? cafe.sabores.join(', ') : (cafe.sabores || ''),
  });
  const [msg,      setMsg]      = useState(null);
  const [cargando, setCargando] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function guardar(e) {
    e.preventDefault();
    setCargando(true); setMsg(null);
    try {
      const res = await fetch(`${BASE_URL}/cafes/${cafe.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sabores: form.sabores ? form.sabores.split(',').map(s => s.trim()).filter(Boolean) : [],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ tipo: 'ok', texto: 'Café actualizado correctamente' });
        setTimeout(() => onGuardado(), 1000);
      } else {
        setMsg({ tipo: 'error', texto: data.error });
      }
    } catch {
      setMsg({ tipo: 'error', texto: 'Error de conexión' });
    }
    setCargando(false);
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={onCancelar}
          style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 14px', color: C.muted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          ← Volver
        </button>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: C.cream, margin: 0 }}>✏️ Editar {cafe.nombre}</h2>
      </div>

      <Alerta msg={msg} />

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 32px' }}>
        <form onSubmit={guardar}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            <CampoInput label="Nombre del café" name="nombre" value={form.nombre} onChange={handleChange} required />
            <CampoInput label="Origen / municipio" name="origen" value={form.origen} onChange={handleChange} placeholder="ej. Arbeláez, Cundinamarca" />
            <CampoInput label="Variedad" name="variedad" value={form.variedad} onChange={handleChange} placeholder="ej. Geisha, Tabi, Caturra" />
            <CampoSelect label="Proceso" name="proceso" value={form.proceso} onChange={handleChange} options={[
              { value: 'Lavado',     label: 'Lavado'     },
              { value: 'Natural',    label: 'Natural'    },
              { value: 'Honey',      label: 'Honey'      },
              { value: 'Anaeróbico', label: 'Anaeróbico' },
            ]} />
            <CampoInput label="Altitud (msnm)" name="altitud" type="number" value={form.altitud} onChange={handleChange} placeholder="ej. 1700" />
            <CampoInput label="Precio (COP)"   name="precio"  type="number" value={form.precio}  onChange={handleChange} placeholder="ej. 12000" />
          </div>

          <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '8px 0 14px' }}>
            Perfil sensorial (1–10)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 16 }}>
            {['intensidad','acidez','cuerpo','dulzor','amargor'].map(campo => (
              <div key={campo}>
                <label style={{ display: 'block', fontSize: 11, color: C.muted, textTransform: 'capitalize', marginBottom: 5 }}>{campo}</label>
                <input type="number" name={campo} min="1" max="10" value={form[campo]} onChange={handleChange}
                  style={{ width: '100%', boxSizing: 'border-box', background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 10px', color: C.cream, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
              </div>
            ))}
          </div>

          <CampoInput label="Sabores (separados por coma)" name="sabores" value={form.sabores} onChange={handleChange} placeholder="ej. chocolate, naranja, panela" />
          <CampoTextArea label="Descripción" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Características principales de este café en grano..." />

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Boton type="submit" disabled={cargando} color={C.green}>{cargando ? 'Guardando...' : '💾 Guardar cambios'}</Boton>
            <Boton onClick={onCancelar} outline>Cancelar</Boton>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Historia narrada ──────────────────────────────────────────────────────────

function PanelHistoria({ cafe, usuario }) {
  const [historia,    setHistoria]    = useState(null);
  const [texto,       setTexto]       = useState('');
  const [editando,    setEditando]    = useState(false);
  const [verTexto,    setVerTexto]    = useState(false);
  const [grabando,    setGrabando]    = useState(false);
  const [audioURL,    setAudioURL]    = useState(null);
  const [audioBase64, setAudioBase64] = useState(null);
  const [msg,         setMsg]         = useState(null);
  const [cargando,    setCargando]    = useState(false);
  const mediaRef  = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => { cargar(); }, [cafe.id]);
// eslint-disable-next-line react-hooks/exhaustive-deps
  async function cargar() {
    try {
      const res  = await fetch(`${BASE_URL}/cafes/${cafe.id}/historia-narrada`);
      const data = await res.json();
      if (data) {
        setHistoria(data);
        setTexto(data.texto || '');
        if (data.audio_base64) {
          const blob = base64ToBlob(data.audio_base64, data.audio_tipo || 'audio/webm');
          setAudioURL(URL.createObjectURL(blob));
        }
      }
    } catch {}
  }

  function base64ToBlob(base64, tipo) {
    const binary = atob(base64);
    const array  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return new Blob([array], { type: tipo });
  }

  async function iniciarGrabacion() {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
        const reader = new FileReader();
        reader.onloadend = () => setAudioBase64(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRef.current = recorder;
      recorder.start();
      setGrabando(true);
    } catch {
      setMsg({ tipo: 'error', texto: 'No se pudo acceder al micrófono' });
    }
  }

  function detenerGrabacion() {
    mediaRef.current?.stop();
    setGrabando(false);
  }

  async function guardar() {
    setCargando(true); setMsg(null);
    try {
      const res  = await fetch(`${BASE_URL}/cafes/${cafe.id}/historia-narrada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caficultor_id: usuario.id,
          texto,
          audio_base64: audioBase64 || historia?.audio_base64 || null,
          audio_tipo:   'audio/webm',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ tipo: 'ok', texto: data.mensaje });
        setEditando(false);
        cargar();
      } else {
        setMsg({ tipo: 'error', texto: data.error });
      }
    } catch {
      setMsg({ tipo: 'error', texto: 'Error de conexión' });
    } finally { setCargando(false); }
  }

  const tieneContenido = historia?.texto || historia?.audio_base64;

  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(93,168,110,0.06),rgba(212,175,55,0.06))', border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 26px', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.cream, marginBottom: 3 }}>🎙 Historia de este café</div>
          <div style={{ fontSize: 12, color: C.muted }}>Narrada por el caficultor — en voz e historia</div>
        </div>
        {!editando && (
          <Boton onClick={() => setEditando(true)} color={C.green} small>
            {tieneContenido ? '✏️ Editar' : '+ Agregar historia'}
          </Boton>
        )}
      </div>

      {!editando && tieneContenido && (
        <div>
          {audioURL && (
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>🎙 Escucha la historia</div>
              <audio controls src={audioURL} style={{ width: '100%', borderRadius: 8 }} />
            </div>
          )}
          {historia?.texto && (
            <div>
              <button onClick={() => setVerTexto(!verTexto)}
                style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 16px', color: C.goldL, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', marginBottom: verTexto ? 12 : 0 }}>
                {verTexto ? '📖 Ocultar texto' : '📖 Leer historia'}
              </button>
              {verTexto && (
                <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px', marginTop: 8 }}>
                  <p style={{ fontSize: 14, color: C.cream, lineHeight: 1.85, fontStyle: 'italic', margin: 0 }}>"{historia.texto}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!editando && !tieneContenido && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: C.muted, fontSize: 13 }}>
          Aún no has narrado la historia de este café. ¡Cuéntale al mundo tu proceso!
        </div>
      )}

      {editando && (
        <div>
          <Alerta msg={msg} />
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.cream, marginBottom: 12 }}>🎙 Grabar tu voz</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              {!grabando
                ? <Boton onClick={iniciarGrabacion} color={C.danger}>⏺ Iniciar grabación</Boton>
                : (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.danger, fontSize: 13 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.danger, display: 'inline-block' }} />
                      Grabando...
                    </div>
                    <Boton onClick={detenerGrabacion} color={C.goldL}>⏹ Detener</Boton>
                  </div>
                )
              }
              {audioURL && !grabando && (
                <div style={{ flex: 1, minWidth: 200 }}>
                  <audio controls src={audioURL} style={{ width: '100%', borderRadius: 8 }} />
                </div>
              )}
            </div>
          </div>
          <CampoTextArea label="Historia en texto (opcional)" name="texto" value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder="Cuenta la historia de este café: de dónde viene, quién lo cultiva, qué lo hace especial..."
            rows={5} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Boton onClick={guardar} disabled={cargando} color={C.green}>{cargando ? 'Guardando...' : '💾 Guardar historia'}</Boton>
            <Boton onClick={() => { setEditando(false); setMsg(null); }} outline>Cancelar</Boton>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Preparaciones ─────────────────────────────────────────────────────────────

function PanelPreparaciones({ cafe, usuario }) {
  const [preparaciones, setPreparaciones] = useState([]);
  const [agregando,     setAgregando]     = useState(false);
  const [editandoId,    setEditandoId]    = useState(null);
  const [form,          setForm]          = useState({ metodo: '', temperatura: '', molienda: '', dosis_gr: '', agua_ml: '', tiempo: '', notas: '' });
  const [formEdit,      setFormEdit]      = useState({});
  const [msg,           setMsg]           = useState(null);
  const [cargando,      setCargando]      = useState(false);

  useEffect(() => { cargar(); }, [cafe.id]);
// eslint-disable-next-line react-hooks/exhaustive-deps
  async function cargar() {
    try {
      const res  = await fetch(`${BASE_URL}/cafes/${cafe.id}/preparaciones`);
      const data = await res.json();
      setPreparaciones(Array.isArray(data) ? data : []);
    } catch {}
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function guardar(e) {
    e.preventDefault();
    if (!form.metodo) return setMsg({ tipo: 'error', texto: 'Selecciona un método' });
    setCargando(true); setMsg(null);
    try {
      const res  = await fetch(`${BASE_URL}/cafes/${cafe.id}/preparaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, caficultor_id: usuario.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ tipo: 'ok', texto: data.mensaje });
        setForm({ metodo: '', temperatura: '', molienda: '', dosis_gr: '', agua_ml: '', tiempo: '', notas: '' });
        setAgregando(false);
        cargar();
      } else {
        setMsg({ tipo: 'error', texto: data.error });
      }
    } catch {
      setMsg({ tipo: 'error', texto: 'Error de conexión' });
    } finally { setCargando(false); }
  }

  async function guardarEdicion(id) {
    setCargando(true); setMsg(null);
    try {
      const res  = await fetch(`${BASE_URL}/preparaciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEdit),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ tipo: 'ok', texto: 'Preparación actualizada' });
        setEditandoId(null);
        cargar();
      } else {
        setMsg({ tipo: 'error', texto: data.error });
      }
    } catch {
      setMsg({ tipo: 'error', texto: 'Error de conexión' });
    } finally { setCargando(false); }
  }

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar esta preparación?')) return;
    await fetch(`${BASE_URL}/preparaciones/${id}`, { method: 'DELETE' });
    cargar();
  }

  const ICONOS_METODO = {
    'V60': '☕', 'Chemex': '🫗', 'Aeropress': '🔧', 'Prensa francesa': '🫖',
    'Espresso': '⚡', 'Cold Brew': '🧊', 'Moka': '🍶', 'Kalita Wave': '🌊',
    'Sifón': '🔬', 'Goteo': '💧', 'Turco': '🏺', 'Otro': '☕',
  };

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 26px', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.cream, marginBottom: 3 }}>☕ Recomendaciones de preparación</div>
          <div style={{ fontSize: 12, color: C.muted }}>Comparte cómo disfrutar mejor este café en grano</div>
        </div>
        {!agregando && <Boton onClick={() => setAgregando(true)} small>+ Agregar método</Boton>}
      </div>

      <Alerta msg={msg} />

      {preparaciones.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: agregando ? 20 : 0 }}>
          {preparaciones.map(p => (
            <div key={p.id}>
              {editandoId === p.id ? (
                <div style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                    <CampoInput label="Temperatura" name="temperatura" value={formEdit.temperatura} onChange={e => setFormEdit(p => ({ ...p, temperatura: e.target.value }))} placeholder="ej. 92°C" />
                    <CampoInput label="Molienda"    name="molienda"    value={formEdit.molienda}    onChange={e => setFormEdit(p => ({ ...p, molienda: e.target.value }))}    placeholder="ej. Media-fina" />
                    <CampoInput label="Dosis (g)"   name="dosis_gr"    type="number" value={formEdit.dosis_gr} onChange={e => setFormEdit(p => ({ ...p, dosis_gr: e.target.value }))} placeholder="ej. 15" />
                    <CampoInput label="Agua (ml)"   name="agua_ml"     type="number" value={formEdit.agua_ml}  onChange={e => setFormEdit(p => ({ ...p, agua_ml: e.target.value }))}  placeholder="ej. 250" />
                    <CampoInput label="Tiempo"      name="tiempo"      value={formEdit.tiempo}      onChange={e => setFormEdit(p => ({ ...p, tiempo: e.target.value }))}      placeholder="ej. 3:30 min" />
                  </div>
                  <CampoTextArea label="Notas" name="notas" value={formEdit.notas} onChange={e => setFormEdit(pr => ({ ...pr, notas: e.target.value }))} rows={2} />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Boton onClick={() => guardarEdicion(p.id)} color={C.green} small disabled={cargando}>💾 Guardar</Boton>
                    <Boton onClick={() => setEditandoId(null)} outline small>Cancelar</Boton>
                  </div>
                </div>
              ) : (
                <div style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid rgba(212,175,55,0.2)`, borderRadius: 12, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{ICONOS_METODO[p.metodo] || '☕'}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.goldL }}>{p.metodo}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {[
                        ['🌡', p.temperatura],
                        ['⚙️', p.molienda],
                        ['⚖️', p.dosis_gr && `${p.dosis_gr}g`],
                        ['💧', p.agua_ml && `${p.agua_ml}ml`],
                        ['⏱', p.tiempo],
                      ].filter(([,v]) => v).map(([icon, val]) => (
                        <span key={icon} style={{ fontSize: 12, color: C.muted }}>{icon} {val}</span>
                      ))}
                    </div>
                    {p.notas && <div style={{ fontSize: 12, color: C.muted, fontStyle: 'italic', marginTop: 6 }}>"{p.notas}"</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <Boton onClick={() => { setEditandoId(p.id); setFormEdit({ temperatura: p.temperatura, molienda: p.molienda, dosis_gr: p.dosis_gr, agua_ml: p.agua_ml, tiempo: p.tiempo, notas: p.notas }); }} small outline>✏️</Boton>
                    <button onClick={() => eliminar(p.id)}
                      style={{ background: 'transparent', border: 'none', color: C.danger, cursor: 'pointer', fontSize: 16, padding: 4 }}>🗑</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {preparaciones.length === 0 && !agregando && (
        <div style={{ textAlign: 'center', padding: '16px 0', color: C.muted, fontSize: 13 }}>
          Aún no hay recomendaciones. Agrega cómo preparar este café en grano.
        </div>
      )}

      {agregando && (
        <div style={{ background: 'rgba(212,175,55,0.06)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.cream, marginBottom: 16 }}>Nuevo método de preparación</div>
          <form onSubmit={guardar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  Método <span style={{ color: C.danger }}>*</span>
                </label>
                <select name="metodo" value={form.metodo} onChange={handleChange}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#1a0800', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: form.metodo ? C.cream : C.muted, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}>
                  <option value="">— Seleccionar —</option>
                  {METODOS_PREPARACION.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <CampoInput label="Temperatura" name="temperatura" value={form.temperatura} onChange={handleChange} placeholder="ej. 92°C" />
              <CampoInput label="Molienda"    name="molienda"    value={form.molienda}    onChange={handleChange} placeholder="ej. Media-fina" />
              <CampoInput label="Dosis (g)"   name="dosis_gr"    type="number" value={form.dosis_gr} onChange={handleChange} placeholder="ej. 15" step="0.1" />
              <CampoInput label="Agua (ml)"   name="agua_ml"     type="number" value={form.agua_ml}  onChange={handleChange} placeholder="ej. 250" />
              <CampoInput label="Tiempo"      name="tiempo"      value={form.tiempo}      onChange={handleChange} placeholder="ej. 3:30 min" />
            </div>
            <CampoTextArea label="Nota del caficultor" name="notas" value={form.notas} onChange={handleChange} placeholder="Tip especial, observación..." rows={2} />
            <div style={{ display: 'flex', gap: 10 }}>
              <Boton type="submit" disabled={cargando}>{cargando ? 'Guardando...' : '💾 Guardar'}</Boton>
              <Boton onClick={() => { setAgregando(false); setMsg(null); }} outline>Cancelar</Boton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Barra de progreso ─────────────────────────────────────────────────────────

function BarraProgreso({ resumen }) {
  if (!resumen) return null;
  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 22px', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.cream }}>Progreso del proceso productivo</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: C.goldL }}>{resumen.porcentaje_completado}%</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 99, height: 8, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg,${C.gold},${C.green})`, width: `${resumen.porcentaje_completado}%`, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ETAPAS.map(etapa => {
          const info = resumen.etapas?.find(e => e.etapa === etapa.key);
          const ok   = info?.registrada;
          return (
            <div key={etapa.key} style={{ display: 'flex', alignItems: 'center', gap: 6, background: ok ? 'rgba(126,200,160,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${ok ? C.green : C.border}`, borderRadius: 99, padding: '5px 12px', fontSize: 12, color: ok ? C.green : C.muted }}>
              {etapa.emoji} {etapa.label} {ok && '✓'}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Formulario de etapa ───────────────────────────────────────────────────────

function FormularioEtapa({ etapa, misCafes, caficultor_id, onGuardado, onCancelar }) {
  const info   = ETAPAS.find(e => e.key === etapa);
  const campos = CAMPOS_ETAPA[etapa] || [];
  const [form,     setForm]     = useState({ fecha: new Date().toISOString().split('T')[0], completada: false });
  const [cargando, setCargando] = useState(false);
  const [msg,      setMsg]      = useState(null);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.cafe_id) return setMsg({ tipo: 'error', texto: 'Selecciona un café' });
    setCargando(true); setMsg(null);
    try {
      const res  = await fetch(`${BASE_URL}/proceso-productivo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, etapa, caficultor_id }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetch(`${BASE_URL}/cafes/${form.cafe_id}/sincronizar-trazabilidad`, { method: 'POST' });
        setMsg({ tipo: 'ok', texto: '✓ Guardado y trazabilidad actualizada' });
        setTimeout(() => onGuardado(), 1200);
      } else {
        setMsg({ tipo: 'error', texto: data.error });
      }
    } catch {
      setMsg({ tipo: 'error', texto: 'Error de conexión' });
    } finally { setCargando(false); }
  }

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 32px', maxWidth: 680 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
        <div style={{ width: 50, height: 50, borderRadius: 12, background: `${info?.color}22`, border: `1px solid ${info?.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
          {info?.emoji}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.cream }}>Registrar {info?.label}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>La trazabilidad se actualizará automáticamente</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 4 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              Café <span style={{ color: C.danger }}>*</span>
            </label>
            <select name="cafe_id" value={form.cafe_id || ''} onChange={handleChange}
              style={{ width: '100%', boxSizing: 'border-box', background: '#1a0800', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', color: form.cafe_id ? C.cream : C.muted, fontSize: 14, outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
              <option value="">— Seleccionar —</option>
              {misCafes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <CampoInput label="Fecha" name="fecha" type="date" value={form.fecha} onChange={handleChange} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {campos.map(campo =>
            campo.type === 'select'
              ? <CampoSelect key={campo.name} label={campo.label} name={campo.name} value={form[campo.name]} onChange={handleChange} options={campo.options} />
              : <CampoInput  key={campo.name} label={campo.label} name={campo.name} type={campo.type} value={form[campo.name]} onChange={handleChange} placeholder={campo.placeholder} step={campo.step} />
          )}
        </div>

        <CampoTextArea label="Descripción general"  name="descripcion"   value={form.descripcion}   onChange={handleChange} placeholder={`Describe el proceso de ${info?.label.toLowerCase()}...`} />
        <CampoTextArea label="Observaciones"         name="observaciones" value={form.observaciones} onChange={handleChange} placeholder="Condiciones climáticas, anomalías, notas especiales..." />

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 20 }}>
          <input type="checkbox" name="completada" checked={form.completada} onChange={handleChange}
            style={{ width: 18, height: 18, accentColor: C.green, cursor: 'pointer' }} />
          <span style={{ fontSize: 13, color: C.cream }}>Marcar esta etapa como completada</span>
        </label>

        <Alerta msg={msg} />

        <div style={{ display: 'flex', gap: 10 }}>
          <Boton type="submit" disabled={cargando}>{cargando ? 'Guardando...' : `Guardar ${info?.label}`}</Boton>
          <Boton onClick={onCancelar} outline>Cancelar</Boton>
        </div>
      </form>
    </div>
  );
}

// ── Panel proceso productivo ──────────────────────────────────────────────────

function PanelProceso({ usuario, misCafes }) {
  const [etapaActiva,     setEtapaActiva]     = useState(null);
  const [cafeVer,         setCafeVer]         = useState(misCafes[0]?.id || null);
  const [resumen,         setResumen]         = useState(null);
  const [registros,       setRegistros]       = useState([]);
  const [registroDetalle, setRegistroDetalle] = useState(null);

  useEffect(() => { if (cafeVer) cargarDatos(cafeVer); }, [cafeVer]);

  async function cargarDatos(cafe_id) {
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${BASE_URL}/proceso-productivo/resumen/${cafe_id}`).then(r => r.json()),
        fetch(`${BASE_URL}/proceso-productivo/cafe/${cafe_id}`).then(r => r.json()),
      ]);
      setResumen(r1);
      setRegistros(Array.isArray(r2) ? r2 : []);
    } catch { setResumen(null); setRegistros([]); }
  }

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar este registro?')) return;
    await fetch(`${BASE_URL}/proceso-productivo/${id}`, { method: 'DELETE' });
    cargarDatos(cafeVer);
  }

  function formatFecha(f) {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  if (misCafes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 20px', color: C.muted }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>☕</div>
        <div style={{ fontSize: 16, color: C.cream, marginBottom: 8 }}>No tienes cafés en tu perfil</div>
        <div style={{ fontSize: 13 }}>Ve a <strong style={{ color: C.goldL }}>Mis Cafés</strong> para agregar o crear un café</div>
      </div>
    );
  }

  if (etapaActiva) {
    return (
      <FormularioEtapa
        etapa={etapaActiva}
        misCafes={misCafes}
        caficultor_id={usuario.id}
        onGuardado={() => { setEtapaActiva(null); cargarDatos(cafeVer); }}
        onCancelar={() => setEtapaActiva(null)}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: C.muted }}>Café:</span>
        {misCafes.map(c => (
          <button key={c.id} onClick={() => setCafeVer(c.id)}
            style={{ background: cafeVer === c.id ? C.gold : 'transparent', border: `1px solid ${cafeVer === c.id ? C.gold : C.border}`, borderRadius: 8, padding: '7px 16px', color: cafeVer === c.id ? '#1a0800' : C.cream, fontWeight: cafeVer === c.id ? 700 : 400, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
            {c.nombre}
          </button>
        ))}
      </div>

      <BarraProgreso resumen={resumen} />

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Registrar nueva etapa</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10 }}>
          {ETAPAS.map(etapa => {
            const info = resumen?.etapas?.find(e => e.etapa === etapa.key);
            return (
              <button key={etapa.key} onClick={() => setEtapaActiva(etapa.key)}
                style={{ background: info?.registrada ? `${etapa.color}18` : C.bgCard, border: `1px solid ${info?.registrada ? etapa.color + '55' : C.border}`, borderRadius: 12, padding: '16px 14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 26 }}>{etapa.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.cream }}>{etapa.label}</span>
                <span style={{ fontSize: 10, color: info?.registrada ? etapa.color : C.muted }}>
                  {info?.registrada ? '✓ Registrada' : '+ Agregar'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {registros.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Historial registrado</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {registros.map(r => {
              const ei     = ETAPAS.find(e => e.key === r.etapa);
              const abierto = registroDetalle === r.id;
              return (
                <div key={r.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}
                    onClick={() => setRegistroDetalle(abierto ? null : r.id)}>
                    <span style={{ fontSize: 20 }}>{ei?.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.cream }}>{ei?.label}</span>
                      {r.descripcion && <span style={{ fontSize: 12, color: C.muted, marginLeft: 10 }}>{r.descripcion.slice(0,55)}{r.descripcion.length > 55 ? '…' : ''}</span>}
                    </div>
                    <span style={{ fontSize: 12, color: C.muted }}>{formatFecha(r.fecha)}</span>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: r.completada ? 'rgba(126,200,160,0.12)' : 'rgba(232,168,74,0.12)', color: r.completada ? C.green : C.goldL }}>
                      {r.completada ? 'Completada' : 'En proceso'}
                    </span>
                    <span style={{ color: C.muted }}>{abierto ? '▲' : '▼'}</span>
                    <button onClick={e => { e.stopPropagation(); eliminar(r.id); }}
                      style={{ background: 'transparent', border: 'none', color: C.danger, cursor: 'pointer', fontSize: 16, padding: 4 }}>🗑</button>
                  </div>
                  {abierto && (
                    <div style={{ borderTop: `1px solid ${C.border}`, padding: '16px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12 }}>
                      {[
                        ['Variedad', r.variedad], ['N° plantas', r.num_plantas], ['Altitud', r.altitud_siembra],
                        ['Tipo suelo', r.tipo_suelo], ['Sistema', r.sistema_siembra],
                        ['Cosecha', r.tipo_cosecha], ['Kg', r.kg_recolectados && `${r.kg_recolectados} kg`],
                        ['Recolectores', r.num_recolectores], ['Días cosecha', r.dias_cosecha],
                        ['Brix', r.brix_promedio && `${r.brix_promedio}°Bx`],
                        ['Proceso', r.proceso_beneficio], ['Fermentación', r.horas_fermentacion && `${r.horas_fermentacion} h`],
                        ['pH', r.ph_fermentacion], ['Agua', r.agua_usada_litros && `${r.agua_usada_litros} L`],
                        ['Secado', r.metodo_secado], ['Días secado', r.dias_secado],
                        ['Humedad ini', r.humedad_inicial && `${r.humedad_inicial}%`],
                        ['Humedad fin', r.humedad_final && `${r.humedad_final}%`],
                        ['Temp prom', r.temperatura_promedio && `${r.temperatura_promedio}°C`],
                        ['Tueste', r.perfil_tueste],
                        ['Temp tueste', r.temperatura_tueste && `${r.temperatura_tueste}°C`],
                        ['Tiempo tueste', r.tiempo_tueste_min && `${r.tiempo_tueste_min} min`],
                        ['Pérdida peso', r.perdida_peso_pct && `${r.perdida_peso_pct}%`],
                        ['Empaque', r.tipo_empaque],
                        ['Peso empaque', r.peso_empaque_gr && `${r.peso_empaque_gr} gr`],
                        ['Unidades', r.num_unidades],
                        ['Vence', r.fecha_vencimiento && formatFecha(r.fecha_vencimiento)],
                        ['Certificación', r.certificacion],
                      ].filter(([,v]) => v !== null && v !== undefined && v !== '').map(([k,v]) => (
                        <div key={k}>
                          <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{k}</div>
                          <div style={{ fontSize: 13, color: C.cream }}>{v}</div>
                        </div>
                      ))}
                      {r.observaciones && (
                        <div style={{ gridColumn: '1/-1' }}>
                          <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Observaciones</div>
                          <div style={{ fontSize: 13, color: C.cream }}>{r.observaciones}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {registros.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 20px', color: C.muted, fontSize: 14 }}>
          Usa los botones de arriba para comenzar a documentar el proceso de este café.
        </div>
      )}
    </div>
  );
}

// ── Panel Mis Cafés ───────────────────────────────────────────────────────────

function PanelMisCafes({ usuario, misCafes, onActualizar }) {
  const [todosLosCafes, setTodosLosCafes] = useState([]);
  const [vista,         setVista]         = useState('misCafes');
  const [msg,           setMsg]           = useState(null);
  const [cargando,      setCargando]      = useState(false);
  const [cafeDetalle,   setCafeDetalle]   = useState(null);
  const [cafeEditando,  setCafeEditando]  = useState(null);

  const [formCafe, setFormCafe] = useState({
    nombre: '', origen: '', variedad: '', proceso: '', altitud: '',
    precio: '', intensidad: '5', acidez: '5', cuerpo: '5',
    dulzor: '5', amargor: '5', descripcion: '', sabores: '',
  });

  useEffect(() => { if (vista === 'agregar') cargarTodos(); }, [vista]);

  async function cargarTodos() {
    try {
      const res  = await fetch(`${BASE_URL}/cafes`);
      const data = await res.json();
      setTodosLosCafes(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function vincular(cafe_id) {
    setCargando(true); setMsg(null);
    try {
      const res  = await fetch(`${BASE_URL}/caficultor/${usuario.id}/vincular-cafe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cafe_id }),
      });
      const data = await res.json();
      setMsg({ tipo: res.ok ? 'ok' : 'error', texto: data.mensaje || data.error });
      if (res.ok) onActualizar();
    } catch {
      setMsg({ tipo: 'error', texto: 'Error de conexión' });
    } finally { setCargando(false); }
  }

  async function desvincular(cafe_id) {
    if (!window.confirm('¿Quitar este café de tu perfil?')) return;
    await fetch(`${BASE_URL}/caficultor/${usuario.id}/vincular-cafe/${cafe_id}`, { method: 'DELETE' });
    onActualizar();
  }

  function handleFormCafe(e) {
    const { name, value } = e.target;
    setFormCafe(prev => ({ ...prev, [name]: value }));
  }

  async function crearCafe(e) {
    e.preventDefault();
    if (!formCafe.nombre) return setMsg({ tipo: 'error', texto: 'El nombre del café es obligatorio' });
    setCargando(true); setMsg(null);
    try {
      const sabores = formCafe.sabores ? formCafe.sabores.split(',').map(s => s.trim()).filter(Boolean) : [];
      const res     = await fetch(`${BASE_URL}/cafes/nuevo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formCafe, caficultor_id: usuario.id, sabores }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ tipo: 'ok', texto: data.mensaje });
        setFormCafe({ nombre: '', origen: '', variedad: '', proceso: '', altitud: '', precio: '', intensidad: '5', acidez: '5', cuerpo: '5', dulzor: '5', amargor: '5', descripcion: '', sabores: '' });
        onActualizar();
        setTimeout(() => setVista('misCafes'), 1500);
      } else {
        setMsg({ tipo: 'error', texto: data.error });
      }
    } catch {
      setMsg({ tipo: 'error', texto: 'Error de conexión' });
    } finally { setCargando(false); }
  }

  const yaVinculados    = misCafes.map(c => c.id);
  const cafesDisponibles = todosLosCafes.filter(c => !yaVinculados.includes(c.id));

  // Vista editar café
  if (cafeEditando) {
    return (
      <FormEditarCafe
        cafe={cafeEditando}
        onGuardado={() => { setCafeEditando(null); onActualizar(); }}
        onCancelar={() => setCafeEditando(null)}
      />
    );
  }

  // Vista detalle de un café
  if (cafeDetalle) {
    return (
      <div>
        <button onClick={() => setCafeDetalle(null)}
          style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 14px', color: C.muted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20 }}>
          ← Volver a mis cafés
        </button>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: C.cream, marginBottom: 4 }}>{cafeDetalle.nombre}</div>
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>{cafeDetalle.variedad} · {cafeDetalle.proceso} · {cafeDetalle.altitud} msnm</div>
        <PanelHistoria     cafe={cafeDetalle} usuario={usuario} />
        <PanelPreparaciones cafe={cafeDetalle} usuario={usuario} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[
          { key: 'misCafes', label: '☕ Mis cafés'        },
          { key: 'agregar',  label: '＋ Agregar existente' },
          { key: 'crear',    label: '✦ Crear nuevo'        },
        ].map(t => (
          <button key={t.key} onClick={() => { setVista(t.key); setMsg(null); }}
            style={{ background: vista === t.key ? C.gold : 'transparent', border: `1px solid ${vista === t.key ? C.gold : C.border}`, borderRadius: 8, padding: '8px 18px', color: vista === t.key ? '#1a0800' : C.cream, fontWeight: vista === t.key ? 700 : 400, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
            {t.label}
          </button>
        ))}
      </div>

      <Alerta msg={msg} />

      {vista === 'misCafes' && (
        misCafes.length === 0
          ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: C.muted }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>☕</div>
              <div style={{ fontSize: 15, color: C.cream, marginBottom: 8 }}>Aún no tienes cafés en tu perfil</div>
              <div style={{ fontSize: 13, marginBottom: 20 }}>Agrega un café existente o crea uno nuevo</div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <Boton onClick={() => setVista('agregar')}>Agregar café existente</Boton>
                <Boton onClick={() => setVista('crear')} color={C.green}>Crear café nuevo</Boton>
              </div>
            </div>
          )
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {misCafes.map(cafe => (
                <div key={cafe.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 22px' }}>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, marginBottom: 5 }}>{cafe.nombre}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>
                    {cafe.variedad || '—'} · {cafe.proceso || '—'} · {cafe.altitud ? `${cafe.altitud} msnm` : '—'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {(cafe.sabores || []).map(s => (
                      <span key={s} style={{ fontSize: 11, background: 'rgba(212,175,55,0.12)', border: `1px solid ${C.border}`, borderRadius: 99, padding: '2px 10px', color: C.goldL }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: C.goldL }}>${cafe.precio?.toLocaleString()}</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Boton onClick={() => setCafeDetalle(cafe)} color={C.green} small>🎙 Historia</Boton>
                      <Boton onClick={() => setCafeEditando(cafe)} small outline>✏️ Editar</Boton>
                      <button onClick={() => desvincular(cafe.id)}
                        style={{ background: 'transparent', border: `1px solid ${C.danger}40`, borderRadius: 8, padding: '6px 10px', color: C.danger, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
      )}

      {vista === 'agregar' && (
        <div>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Selecciona un café del catálogo para agregarlo a tu perfil:</div>
          {cafesDisponibles.length === 0
            ? <div style={{ color: C.muted, fontSize: 14 }}>Todos los cafés disponibles ya están en tu perfil.</div>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
                {cafesDisponibles.map(cafe => (
                  <div key={cafe.id} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px' }}>
                    <div style={{ fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{cafe.nombre}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{cafe.variedad || '—'} · {cafe.proceso || '—'}</div>
                    <Boton onClick={() => vincular(cafe.id)} disabled={cargando} color={C.green}>+ Agregar a mi perfil</Boton>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      )}

      {vista === 'crear' && (
        <div style={{ maxWidth: 680 }}>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 32px' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.cream, marginBottom: 6 }}>✦ Crear nuevo café</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Se creará y se agregará automáticamente a tu perfil</div>
            <form onSubmit={crearCafe}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                <CampoInput label="Nombre del café"    name="nombre"   value={formCafe.nombre}   onChange={handleFormCafe} placeholder="ej. Geisha Sumapaz" required />
                <CampoInput label="Origen / municipio" name="origen"   value={formCafe.origen}   onChange={handleFormCafe} placeholder="ej. Arbeláez, Cundinamarca" />
                <CampoInput label="Variedad"           name="variedad" value={formCafe.variedad} onChange={handleFormCafe} placeholder="ej. Geisha, Tabi, Caturra" />
                <CampoSelect label="Proceso" name="proceso" value={formCafe.proceso} onChange={handleFormCafe} options={[
                  { value: 'Lavado',     label: 'Lavado'     },
                  { value: 'Natural',    label: 'Natural'    },
                  { value: 'Honey',      label: 'Honey'      },
                  { value: 'Anaeróbico', label: 'Anaeróbico' },
                ]} />
                <CampoInput label="Altitud (msnm)" name="altitud" type="number" value={formCafe.altitud} onChange={handleFormCafe} placeholder="ej. 1700" />
                <CampoInput label="Precio (COP)"   name="precio"  type="number" value={formCafe.precio}  onChange={handleFormCafe} placeholder="ej. 12000" />
              </div>
              <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '8px 0 14px' }}>Perfil sensorial (1–10)</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 16 }}>
                {['intensidad','acidez','cuerpo','dulzor','amargor'].map(campo => (
                  <div key={campo}>
                    <label style={{ display: 'block', fontSize: 11, color: C.muted, textTransform: 'capitalize', marginBottom: 5 }}>{campo}</label>
                    <input type="number" name={campo} min="1" max="10" value={formCafe[campo]} onChange={handleFormCafe}
                      style={{ width: '100%', boxSizing: 'border-box', background: C.bgInput, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 10px', color: C.cream, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                  </div>
                ))}
              </div>
              <CampoInput label="Sabores (separados por coma)" name="sabores" value={formCafe.sabores} onChange={handleFormCafe} placeholder="ej. chocolate, naranja, panela" />
              <CampoTextArea label="Descripción" name="descripcion" value={formCafe.descripcion} onChange={handleFormCafe} placeholder="Características principales de este café en grano..." />
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <Boton type="submit" disabled={cargando} color={C.green}>{cargando ? 'Creando...' : '✦ Crear café'}</Boton>
                <Boton onClick={() => setVista('misCafes')} outline>Cancelar</Boton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Trazabilidad ──────────────────────────────────────────────────────────────

function PanelTrazabilidad({ misCafes }) {
  const [cafeSeleccionado, setCafeSeleccionado] = useState(misCafes[0] || null);
  const [trazabilidad,     setTrazabilidad]     = useState([]);

  useEffect(() => { if (cafeSeleccionado) cargar(cafeSeleccionado.id); }, [cafeSeleccionado]);

  async function cargar(cafe_id) {
    try {
      const res  = await fetch(`${BASE_URL}/cafes/${cafe_id}/trazabilidad`);
      const data = await res.json();
      setTrazabilidad(Array.isArray(data) ? data : []);
    } catch {}
  }

  function formatFecha(f) {
    if (!f) return '—';
    return new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const COLORES_ETAPA = {
    'Siembra':       '#5da86e',
    'Cosecha':       C.gold,
    'Procesamiento': '#5b9bd5',
    'Secado':        '#e8c84a',
    'Tostión':       '#e07050',
    'En taza':       '#9b7ec8',
  };

  if (misCafes.length === 0) {
    return <div style={{ color: C.muted, fontSize: 14 }}>Agrega cafés a tu perfil para ver su trazabilidad.</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {misCafes.map(c => (
          <button key={c.id} onClick={() => setCafeSeleccionado(c)}
            style={{ background: cafeSeleccionado?.id === c.id ? C.gold : 'transparent', border: `1px solid ${cafeSeleccionado?.id === c.id ? C.gold : C.border}`, borderRadius: 8, padding: '7px 16px', color: cafeSeleccionado?.id === c.id ? '#1a0800' : C.cream, fontWeight: cafeSeleccionado?.id === c.id ? 700 : 400, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
            {c.nombre}
          </button>
        ))}
      </div>

      {trazabilidad.length === 0 ? (
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🌱</div>
          <div style={{ fontSize: 15, color: C.cream, marginBottom: 6 }}>Trazabilidad vacía</div>
          <div style={{ fontSize: 13, color: C.muted }}>
            Registra etapas en <strong style={{ color: C.goldL }}>Proceso Productivo</strong> y la trazabilidad se completará automáticamente.
          </div>
        </div>
      ) : (
        <div>
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '28px 24px', marginBottom: 24, overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, minWidth: 500, position: 'relative' }}>
              {trazabilidad.map((etapa, i) => {
                const color     = COLORES_ETAPA[etapa.etapa] || C.gold;
                const completada = etapa.completada;
                return (
                  <div key={etapa.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    {i < trazabilidad.length - 1 && (
                      <div style={{ position: 'absolute', top: 20, left: '50%', width: '100%', height: 3, background: completada ? `linear-gradient(90deg,${color},${COLORES_ETAPA[trazabilidad[i+1]?.etapa] || C.gold})` : C.border, zIndex: 0 }} />
                    )}
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: completada ? `${color}25` : C.bgCard, border: `3px solid ${completada ? color : C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, zIndex: 1, marginBottom: 10, boxShadow: completada ? `0 0 14px ${color}44` : 'none' }}>
                      {completada ? etapa.icono || '✓' : etapa.icono || '○'}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: completada ? color : C.muted, textAlign: 'center', marginBottom: 3 }}>{etapa.etapa}</div>
                    <div style={{ fontSize: 10, color: C.muted, textAlign: 'center' }}>{formatFecha(etapa.fecha)}</div>
                    {completada && <div style={{ fontSize: 9, color: color, marginTop: 2 }}>✓ Completa</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trazabilidad.map(etapa => {
              const color = COLORES_ETAPA[etapa.etapa] || C.gold;
              return (
                <div key={etapa.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: C.bgCard, border: `1px solid ${etapa.completada ? color + '44' : C.border}`, borderLeft: `4px solid ${etapa.completada ? color : C.border}`, borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>{etapa.icono || '🔹'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: etapa.completada ? color : C.cream }}>{etapa.etapa}</span>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: C.muted }}>{formatFecha(etapa.fecha)}</span>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: etapa.completada ? `${color}18` : 'rgba(245,234,216,0.06)', color: etapa.completada ? color : C.muted, border: `1px solid ${etapa.completada ? color + '44' : C.border}` }}>
                          {etapa.completada ? '✓ Completada' : 'En proceso'}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.6 }}>{etapa.descripcion}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────

const NAV = [
  { key: 'inicio',       label: '🏠 Inicio'       },
  { key: 'proceso',      label: '🌿 Proceso'       },
  { key: 'miscafes',     label: '☕ Mis Cafés'     },
  { key: 'valoraciones', label: '⭐ Valoraciones'  },
  { key: 'trazabilidad', label: '🗺 Trazabilidad'  },
];

const VALORACIONES_DEMO = [
  { cafe: 'Geisha Sumapaz', cliente: 'Carlos M.', rating: 5, comentario: 'Notas florales increíbles, la mejor taza del año', fecha: '10 mar 2026' },
  { cafe: 'Tabi Natural',   cliente: 'Laura R.',  rating: 5, comentario: 'El chocolate y la ciruela son perfectos juntos',  fecha: '8 mar 2026'  },
  { cafe: 'Geisha Sumapaz', cliente: 'Andrés P.', rating: 4, comentario: 'Excelente calidad, acidez muy balanceada',         fecha: '5 mar 2026'  },
];

export default function DashboardCaficultor({ usuario, onLogout }) {
  const [seccion,  setSeccion]  = useState('inicio');
  const [misCafes, setMisCafes] = useState([]);

  useEffect(() => { cargarMisCafes(); }, []);
// eslint-disable-next-line react-hooks/exhaustive-deps
  async function cargarMisCafes() {
    try {
      const res  = await fetch(`${BASE_URL}/caficultor/${usuario.id}/mis-cafes`);
      const data = await res.json();
      setMisCafes(Array.isArray(data) ? data : []);
    } catch { setMisCafes([]); }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, fontFamily: "'Outfit','Segoe UI',sans-serif", color: C.cream }}>

      <nav style={{ background: 'rgba(14,7,0,0.92)', borderBottom: `1px solid ${C.border}`, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 58, position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 17, color: C.green, fontWeight: 700 }}>🌿 {BRAND.short} — Caficultor</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {NAV.map(n => (
            <button key={n.key} onClick={() => setSeccion(n.key)}
              style={{ background: seccion === n.key ? 'rgba(212,175,55,0.15)' : 'transparent', border: seccion === n.key ? `1px solid ${C.gold}` : '1px solid transparent', borderRadius: 8, padding: '6px 13px', color: seccion === n.key ? C.goldL : C.muted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
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

        {seccion === 'inicio' && (
          <div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, fontWeight: 700, color: C.cream, margin: '0 0 6px' }}>
              Bienvenido, {usuario?.nombre?.split(' ')[0] || 'Caficultor'} 👋
            </h1>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>Gestiona tus cafés en grano — del proceso a la historia</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 32 }}>
              <Metrica icon="☕" valor={misCafes.length} label="Mis cafés"         color={C.goldL} sub={misCafes.length === 0 ? 'Agrega un café' : 'en tu perfil'} />
              <Metrica icon="🌿" valor="6"              label="Etapas productivas" color={C.green} />
              <Metrica icon="⭐" valor="4.8"            label="Rating promedio"    color={C.goldL} sub="De tus consumidores" />
              <Metrica icon="🎙" valor={misCafes.length} label="Historias posibles" color={C.green} sub="Una por café" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
              {[
                { icon: '🌿', titulo: 'Proceso Productivo', desc: 'Siembra → Cosecha → Beneficio → Secado → Tostión → Empaque', key: 'proceso',      color: C.green },
                { icon: '☕', titulo: 'Mis Cafés',          desc: 'Agrega historia, preparaciones y gestiona tu catálogo',       key: 'miscafes',     color: C.gold  },
                { icon: '🗺', titulo: 'Trazabilidad',       desc: 'Se completa automáticamente con tu proceso productivo',       key: 'trazabilidad', color: C.goldL },
              ].map(card => (
                <div key={card.key} onClick={() => setSeccion(card.key)}
                  style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: '22px 24px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = card.color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.cream, marginBottom: 6 }}>{card.titulo}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{card.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Últimas valoraciones</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {VALORACIONES_DEMO.map((v, i) => (
                <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{v.cafe}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{v.cliente} · {v.fecha}</div>
                    <div style={{ fontSize: 13, color: C.muted, marginTop: 4, fontStyle: 'italic' }}>"{v.comentario}"</div>
                  </div>
                  <Estrellas rating={v.rating} />
                </div>
              ))}
            </div>
          </div>
        )}

        {seccion === 'proceso' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: C.cream, margin: '0 0 6px' }}>🌿 Proceso Productivo</h2>
            <p style={{ color: C.muted, fontSize: 14, margin: '0 0 28px' }}>Cada etapa que registres actualizará la trazabilidad automáticamente</p>
            <PanelProceso usuario={usuario} misCafes={misCafes} />
          </div>
        )}

        {seccion === 'miscafes' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: C.cream, margin: '0 0 6px' }}>☕ Mis Cafés</h2>
            <p style={{ color: C.muted, fontSize: 14, margin: '0 0 28px' }}>Administra tu catálogo · Historia narrada · Recomendaciones de preparación</p>
            <PanelMisCafes usuario={usuario} misCafes={misCafes} onActualizar={cargarMisCafes} />
          </div>
        )}

        {seccion === 'valoraciones' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: C.cream, margin: '0 0 24px' }}>⭐ Valoraciones</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {VALORACIONES_DEMO.map((v, i) => (
                <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{v.cafe}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{v.cliente} · {v.fecha}</div>
                    </div>
                    <Estrellas rating={v.rating} />
                  </div>
                  <div style={{ fontSize: 14, color: C.muted, fontStyle: 'italic', borderLeft: `3px solid ${C.gold}`, paddingLeft: 12 }}>
                    "{v.comentario}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {seccion === 'trazabilidad' && (
          <div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: C.cream, margin: '0 0 6px' }}>🗺 Trazabilidad</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 28 }}>Se completa automáticamente desde el Proceso Productivo</p>
            <PanelTrazabilidad misCafes={misCafes} />
          </div>
        )}

      </main>
    </div>
  );
}

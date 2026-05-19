import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

/** T(t) = T_amb + (T0 - T_amb) * e^(-k*t)  — t en minutos */
function tempCelsius(tMin, T0, Tamb, k) {
  return Tamb + (T0 - Tamb) * Math.exp(-k * tMin);
}

function tempEstado(T) {
  if (T > 70) return { key: 'hot', label: 'Muy caliente', emoji: '🔴' };
  if (T >= 60) return { key: 'ideal', label: 'Ideal para degustar', emoji: '🟡' };
  return { key: 'cold', label: 'Más frío — perfil más suave', emoji: '🔵' };
}

const CHAT_SCRIPT = [
  { delay: 400, text: 'Hola, soy tu asistente de taza. Voy a acompañarte en esta experiencia.' },
  { delay: 1200, text: 'Espera un momento… deja que el aroma se asiente en la taza.' },
  { delay: 2200, text: 'Observa el color y la crema. ¿Notas algún brillo dorado?' },
];

export default function TazaJV() {
  const { token } = useParams();
  const [pedido, setPedido] = useState(null);
  const [err, setErr] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [scriptIdx, setScriptIdx] = useState(0);
  const [fase, setFase] = useState('intro'); // intro | temp | degusta | traza | fin
  const [tMin, setTMin] = useState(0);
  const [T0, setT0] = useState(88);
  const [Tamb, setTamb] = useState(22);
  const [k, setK] = useState(0.12);
  const [simOn, setSimOn] = useState(true);
  const [manualT, setManualT] = useState(null);
  const [deg, setDeg] = useState({ aroma: 5, sabor: 5, acidez: 5, cuerpo: 5, retrogusto: 5 });
  const bottomRef = useRef(null);
  const idealAnnounced = useRef(false);

  const T = useMemo(() => {
    if (manualT != null) return manualT;
    return tempCelsius(tMin, T0, Tamb, k);
  }, [tMin, T0, Tamb, k, manualT]);
  const estado = tempEstado(T);

  const pushBot = useCallback((text) => {
    setMsgs((m) => [...m, { who: 'bot', text, t: Date.now() }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, fase]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/pedidos-cafeteria/vaso/${encodeURIComponent(token)}`);
        const data = await r.json();
        if (!alive) return;
        if (!r.ok) {
          setErr(data.error || 'No se encontró el pedido');
          return;
        }
        setPedido(data);
      } catch {
        if (alive) setErr('No se pudo conectar al servidor');
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]);

  useEffect(() => {
    if (!pedido || scriptIdx >= CHAT_SCRIPT.length) return;
    const t = setTimeout(() => {
      pushBot(CHAT_SCRIPT[scriptIdx].text);
      setScriptIdx((i) => i + 1);
    }, CHAT_SCRIPT[scriptIdx].delay);
    return () => clearTimeout(t);
  }, [pedido, scriptIdx, pushBot]);

  useEffect(() => {
    if (scriptIdx !== CHAT_SCRIPT.length || fase !== 'intro') return;
    const t = setTimeout(() => {
      pushBot('Cuando quieras, revisa la temperatura abajo. Te avisaré cuando sea el momento ideal para beber (60–70 °C).');
      setFase('temp');
    }, 800);
    return () => clearTimeout(t);
  }, [scriptIdx, fase, pushBot]);

  useEffect(() => {
    if (fase !== 'temp' || !simOn) return;
    const id = setInterval(() => setTMin((x) => Math.round((x + 0.25) * 100) / 100), 800);
    return () => clearInterval(id);
  }, [fase, simOn]);

  useEffect(() => {
    if (fase !== 'temp' || idealAnnounced.current) return;
    if (estado.key === 'ideal') {
      idealAnnounced.current = true;
      pushBot('Ahora es ideal probar tu café. Toma un sorbo pequeño y deja que cubra toda la lengua.');
      setFase('degusta');
    }
  }, [estado.key, fase, pushBot]);

  function guardarDegustacion() {
    try {
      localStorage.setItem(
        `otj_deg_${token}`,
        JSON.stringify({ ...deg, cafe: pedido?.cafe_nombre, ts: Date.now() })
      );
      fetch(`${API_BASE_URL}/taza/degustacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_vaso_token: token, ...deg }),
      }).catch(() => {});
    } catch {
      /* noop */
    }
    pushBot('¡Gracias! Guardamos tu degustación en este dispositivo.');
    setFase('traza');
  }

  if (err) {
    return (
      <div className="min-h-screen bg-jv-cream flex flex-col items-center justify-center p-6 text-center">
        <p className="text-jv-coffee font-display text-xl mb-2">{err}</p>
        <Link to="/" className="text-jv-gold font-medium underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-jv-cream flex items-center justify-center">
        <p className="text-jv-coffee/70 animate-pulse font-display">Preparando tu experiencia…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-jv-cream to-jv-rose/25 text-jv-coffee pb-10">
      <header className="sticky top-0 z-10 backdrop-blur-md bg-jv-cream/90 border-b border-jv-gold/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={`${process.env.PUBLIC_URL}/logo-origen-taza.svg`} alt="" className="w-10 h-10 rounded-xl" />
          <div>
            <h1 className="font-display text-lg leading-tight text-jv-coffee">Origen y Taza JV</h1>
            <p className="text-[11px] text-jv-coffee/60">Conectando historias, desde la finca hasta tu mesa</p>
          </div>
        </div>
        <Link to="/" className="text-xs font-medium text-jv-gold border border-jv-gold/50 rounded-full px-3 py-1">
          Inicio
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <section className="rounded-2xl bg-white/70 border border-jv-rose/40 shadow-sm p-4">
          <p className="text-xs uppercase tracking-widest text-jv-coffee/50 mb-1">Tu pedido</p>
          <p className="font-display text-xl text-jv-coffee">{pedido.cafe_nombre}</p>
          <p className="text-sm text-jv-coffee/70 mt-1">{pedido.cafeteria_nombre}</p>
        </section>

        <section className="rounded-2xl bg-jv-coffee text-jv-cream p-4 max-h-[42vh] overflow-y-auto space-y-2">
          {msgs.map((m) => (
            <div key={m.t + m.text.slice(0, 8)} className="text-sm leading-relaxed">
              <span className="text-jv-gold mr-1">●</span>
              {m.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </section>

        {(fase === 'temp' || fase === 'degusta' || fase === 'traza') && (
          <section className="rounded-2xl bg-white/80 border border-jv-gold/35 p-4 space-y-3">
            <h2 className="font-display text-lg text-jv-coffee flex items-center gap-2">
              🌡️ Temperatura de la taza
            </h2>
            <p className="text-xs text-jv-coffee/60">
              Modelo: T(t) = T<sub>amb</sub> + (T<sub>0</sub> − T<sub>amb</sub>) · e<sup>−kt</sup> &nbsp;(t en min)
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-display text-jv-coffee">{T.toFixed(1)}</span>
              <span className="text-jv-gold font-semibold">°C</span>
              <span className="ml-auto text-2xl">{estado.emoji}</span>
            </div>
            <p className="text-sm font-medium text-jv-coffee">{estado.label}</p>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={simOn} onChange={(e) => setSimOn(e.target.checked)} />
              Simular enfriamiento (tiempo +0.25 min ciclos)
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex flex-col gap-1">
                T₀ inicial (°C)
                <input type="range" min="75" max="96" value={T0} onChange={(e) => setT0(+e.target.value)} className="w-full" />
              </label>
              <label className="flex flex-col gap-1">
                k (enfriamiento)
                <input type="range" min="0.04" max="0.35" step="0.01" value={k} onChange={(e) => setK(+e.target.value)} className="w-full" />
              </label>
              <label className="flex flex-col gap-1 col-span-2">
                T ambiente (°C)
                <input type="range" min="18" max="30" value={Tamb} onChange={(e) => setTamb(+e.target.value)} className="w-full" />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-xs">
              Temperatura manual (opcional — anula simulación mientras uses el slider)
              <input
                type="range"
                min="45"
                max="95"
                value={manualT ?? T}
                onChange={(e) => setManualT(+e.target.value)}
                onDoubleClick={() => setManualT(null)}
                className="w-full"
              />
              <span className="text-jv-coffee/50">Doble clic en el slider para volver al modelo</span>
            </label>
          </section>
        )}

        {fase === 'degusta' && (
          <section className="rounded-2xl bg-white/80 border border-jv-rose/40 p-4 space-y-4">
            <h2 className="font-display text-lg">☕ Guía de degustación</h2>
            {(['aroma', 'sabor', 'acidez', 'cuerpo', 'retrogusto']).map((campo) => (
              <label key={campo} className="block text-sm capitalize">
                <span className="text-jv-coffee/80">{campo}</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={deg[campo]}
                  onChange={(e) => setDeg((d) => ({ ...d, [campo]: +e.target.value }))}
                  className="w-full mt-1"
                />
                <span className="text-jv-gold font-semibold">{deg[campo]}</span>
              </label>
            ))}
            <button
              type="button"
              onClick={guardarDegustacion}
              className="w-full py-3 rounded-xl bg-jv-coffee text-jv-cream font-semibold shadow-md active:scale-[0.99] transition"
            >
              Guardar degustación
            </button>
          </section>
        )}

        {fase === 'traza' && (
          <section className="rounded-2xl bg-jv-coffee text-jv-cream p-4 space-y-3">
            <h2 className="font-display text-lg text-jv-gold">🌱 Trazabilidad y perfil</h2>
            <ul className="text-sm space-y-2 opacity-95">
              <li>
                <strong>Origen:</strong> {pedido.origen || '—'}
              </li>
              <li>
                <strong>Variedad / proceso:</strong> {pedido.variedad || '—'} · {pedido.proceso || '—'}
              </li>
              <li>
                <strong>Altitud:</strong> {pedido.altitud || '—'}
              </li>
              <li>
                <strong>Relación con taza:</strong> lo que registraste se compara con el perfil del café en la finca y la
                cafetería para recomendar tu próxima visita.
              </li>
            </ul>
            <p className="text-xs text-jv-cream/60">
              Preferencias en este dispositivo: revisa <code className="text-jv-rose">localStorage otj_prefs</code> (próximo paso en panel cliente).
            </p>
            <Link
              to={`/cafe/${pedido.cafe_id}`}
              className="inline-block mt-2 text-jv-gold font-medium underline text-sm"
            >
              Ver ficha pública del café
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}

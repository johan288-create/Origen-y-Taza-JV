// frontend/src/components/DashboardBarista.jsx
import React, { useEffect, useState } from "react";
import { API_BASE_URL as BASE_URL, appOrigin } from "../config";
import { C,JV, BRAND } from "../theme/brand";

/* ─────────────────── UI ─────────────────── */
function Boton({ children, onClick, small, outline, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: outline ? "transparent" : color || C.teal,
        border: outline ? `1px solid ${C.border}` : "none",
        borderRadius: 8,
        padding: small ? "6px 14px" : "10px 22px",
        color: outline ? C.muted : C.btnText,
        fontWeight: 700,
        fontSize: small ? 12 : 14,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function EsperandoAsignacion({ usuario, onLogout }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.pageBg,
        color: C.cream,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 8,
        fontFamily: "'Outfit','Segoe UI',sans-serif",
        padding: 24,
        textAlign: "center",
      }}
    >
      <h2>☕ Hola, {usuario?.nombre?.split(" ")[0]}</h2>
      <p style={{ color: C.muted, maxWidth: 560 }}>
        Aún no estás asignado a una cafetería. Cuando el dueño te agregue desde su
        panel, este dashboard se habilitará automáticamente.
      </p>
      <small style={{ color: C.muted }}>
        (Se verifica la asignación cada 10 segundos)
      </small>

      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <button
          onClick={onLogout}
          style={{
            background: "transparent",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: "6px 14px",
            color: C.muted,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Salir
        </button>
      </div>
    </div>
  );
}

/* ─────────────────── MAIN ─────────────────── */
export default function DashboardBarista({ usuario, onLogout }) {
  // Si el login ya trae cafeteria_id, úsalo; si no, esperaremos asignación del dueño
  const [cafeteriaId, setCafeteriaId] = useState(usuario?.cafeteria_id ?? null);

  // Polling cada 10s para detectar si el dueño ya lo asignó
  useEffect(() => {
    if (cafeteriaId) return; // ya asignado, no seguimos consultando
    let alive = true;

    const check = async () => {
      try {
        const res = await fetch(`${BASE_URL}/baristas/${usuario.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (alive && data?.cafeteria_id) {
          setCafeteriaId(data.cafeteria_id);
        }
      } catch {
        // silencioso
      }
    };

    check();
    const t = setInterval(check, 10000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [cafeteriaId, usuario?.id]);

  if (!usuario || !usuario.id) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.pageBg,
          color: C.muted,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "inherit",
        }}
      >
        Cargando usuario...
      </div>
    );
  }

  if (!cafeteriaId) {
    return <EsperandoAsignacion usuario={usuario} onLogout={onLogout} />;
  }

  return (
    <PanelPedidos
      cafeteriaId={cafeteriaId}
      onLogout={onLogout}
      usuario={usuario}
    />
  );
}

/* ─────────────────── PANEL DE PEDIDOS ─────────────────── */
function PanelPedidos({ cafeteriaId, onLogout, usuario }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafeteriaId]);

  async function cargar() {
    try {
      setError(null);
      const res = await fetch(`${BASE_URL}/pedidos-cafeteria/${cafeteriaId}`);
      if (!res.ok) {
        setPedidos([]);
        setError(`Error ${res.status} al cargar pedidos`);
      } else {
        const data = await res.json();
        setPedidos(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setPedidos([]);
      setError("Error de conexión al cargar pedidos");
    } finally {
      setCargando(false);
    }
  }

  async function cambiarEstado(id, estado) {
    try {
      await fetch(`${BASE_URL}/pedidos-cafeteria/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      });
      cargar();
    } catch {
      // silencioso
    }
  }

  const COLORES = {
    pendiente: { bg: "rgba(232,168,74,0.12)", color: C.gold, label: "Pendiente" },
    preparando: { bg: "rgba(77,200,232,0.12)", color: "#4dc8e8", label: "Preparando" },
    listo: { bg: "rgba(126,200,160,0.12)", color: "#7ec8a0", label: "Listo" },
    entregado: { bg: "rgba(255,255,255,0.05)", color: "rgba(240,248,255,0.3)", label: "Entregado" },
    cancelado: { bg: "rgba(224,92,92,0.12)", color: "#e05c5c", label: "Cancelado" },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.pageBg,
        fontFamily: "'Outfit','Segoe UI',sans-serif",
        color: C.cream,
      }}
    >
      {/* NAV */}
      <nav
        style={{
          background: "rgba(5,10,14,0.95)",
          borderBottom: `1px solid ${C.border}`,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 58,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <span style={{ fontWeight: 700, color: C.tealL }}>
          ☕ {BRAND.short} — Barista #{cafeteriaId}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: C.muted }}>{usuario?.nombre}</span>
          <button
            onClick={onLogout}
            style={{
              background: "transparent",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: "6px 14px",
              color: C.muted,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Salir
          </button>
        </div>
      </nav>

      {/* CONTENIDO */}
      <main style={{ padding: "32px 28px", maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Pedidos</div>
            <div style={{ fontSize: 12, color: C.muted }}>
              Se actualiza cada 15 segundos
            </div>
          </div>
          <Boton onClick={cargar} small outline>
            🔄 Actualizar
          </Boton>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(224,92,92,0.12)",
              border: `1px solid ${C.danger}`,
              color: C.danger,
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            ✕ {error}
          </div>
        )}

        {cargando ? (
          <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
            Cargando pedidos...
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: C.muted }}>
            No hay pedidos aún.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pedidos.map((p) => {
              const est = COLORES[p.estado] || COLORES.pendiente;

              const retrasado =
                p.estado === "pendiente" &&
                Date.now() - new Date(p.creado_en).getTime() > 10 * 60 * 1000;

              return (
                <div
                  key={p.id}
                  style={{
                    background: C.card,
                    border: `1px solid ${retrasado ? C.danger : C.border}`,
                    borderRadius: 12,
                    padding: "16px 20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    {/* Datos del pedido */}
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          marginBottom: 4,
                          color: C.cream,
                        }}
                      >
                        {p.cafe_nombre}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>
                        {p.cliente_nombre} · {p.tipo_preparacion || "Sin especificar"}
                        {p.observaciones && <span> · "{p.observaciones}"</span>}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                        {new Date(p.creado_en).toLocaleTimeString("es-CO")}
                        {retrasado && (
                          <span style={{ color: C.danger }}> · ⚠️ retrasado</span>
                        )}
                      </div>
                    </div>

                    {/* Estado + Acciones */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          background: est.bg,
                          color: est.color,
                          padding: "4px 12px",
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {est.label}
                      </span>

                      {p.estado === "pendiente" && (
                        <Boton
                          onClick={() => {
                            if (
                              window.confirm(
                                "¿Confirmas que vas a iniciar la preparación?"
                              )
                            ) {
                              cambiarEstado(p.id, "preparando");
                            }
                          }}
                          color={C.tealL}
                          small
                        >
                          Iniciar
                        </Boton>
                      )}

   {p.estado === 'preparando' && (
  <Boton onClick={() => cambiarEstado(p.id, 'listo')} color={C.green} small>Listo</Boton>
)}
{p.estado === 'listo' && (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
    <a
      href={p.qr_vaso_token ? `${appOrigin()}/taza/${encodeURIComponent(p.qr_vaso_token)}` : `${appOrigin()}/cafe/${p.cafe_id}`}
      target="_blank"
      rel="noreferrer"
      style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 8, padding: '6px 12px', color: 'C.gold', fontSize: 12, textDecoration: 'none', fontFamily: 'inherit' }}>
      {p.qr_vaso_token ? '🔗 Experiencia taza (QR)' : '🔗 Ver página del café'}
    </a>
    <Boton onClick={() => cambiarEstado(p.id, 'entregado')} small>Entregado</Boton>
  </div>
)}

                      {p.estado === "listo" && (
                        <Boton
                          onClick={() => cambiarEstado(p.id, "entregado")}
                          small
                        >
                          Entregado
                        </Boton>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}